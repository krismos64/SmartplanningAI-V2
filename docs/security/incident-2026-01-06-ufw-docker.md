# Incident : UFW bloque le trafic Docker (6 janvier 2026)

**Date de l'incident** : 6 janvier 2026
**Durée** : ~3 heures (11h30 - 14h50 UTC)
**Sévérité** : HAUTE (application complètement inaccessible)
**Statut** : RÉSOLU ✅

---

## 📋 Résumé

Après un déploiement réussi sur un nouveau VPS OVH (SP-158), l'application SmartPlanning était inaccessible malgré que tous les conteneurs Docker soient en état HEALTHY. Le problème provenait d'une configuration UFW trop restrictive avec `deny outgoing` qui bloquait le trafic Docker interne et empêchait Nginx de communiquer avec les conteneurs.

---

## 🔍 Symptômes

### Ce qui fonctionnait

- ✅ Tous les conteneurs Docker : **HEALTHY**
- ✅ Next.js : "Ready in 186ms"
- ✅ PostgreSQL : 13 tables créées
- ✅ Redis : Connexion OK
- ✅ API `/api/health` répond **depuis l'intérieur du conteneur** (Status 200)

### Ce qui ne fonctionnait PAS

- ❌ Nginx ne peut pas atteindre `localhost:3000`
- ❌ Site web inaccessible depuis l'extérieur (timeout)
- ❌ `curl http://localhost:3000/api/health` depuis le VPS host : timeout après 2min
- ❌ `curl https://smartplanning.fr` : timeout

---

## 🔬 Investigation

### Étape 1 : Vérification des conteneurs

```bash
docker compose ps
# OUTPUT: Tous HEALTHY ✅

docker compose logs app
# OUTPUT: "Ready in 186ms" ✅

docker compose exec app ps aux
# OUTPUT: next-server PID 1 actif ✅
```

**Conclusion** : L'application fonctionne correctement.

### Étape 2 : Test depuis l'intérieur du conteneur

```bash
docker compose exec app node -e "require('http').get('http://localhost:3000/api/health', ...)"
# OUTPUT: Status 200, body JSON complet ✅
```

**Conclusion** : Next.js répond parfaitement en interne.

### Étape 3 : Test depuis le VPS host

```bash
curl http://127.0.0.1:3000/api/health
# OUTPUT: Timeout après 2min ❌

ss -tuln | grep :3000
# OUTPUT: 0.0.0.0:3000 LISTEN ✅

ps aux | grep docker-proxy
# OUTPUT: docker-proxy running pour port 3000 ✅
```

**Conclusion** : Le port est ouvert et docker-proxy tourne, mais pas de réponse HTTP.

### Étape 4 : Vérification iptables

```bash
sudo iptables -t nat -L -n -v | grep 3000
# OUTPUT: DNAT rule active, mais 0 packets ❌

sudo iptables -L DOCKER -n -v
# OUTPUT: ACCEPT rule pour 3000, mais 0 packets ❌
```

**Conclusion** : Les règles iptables existent mais aucun paquet ne les atteint.

### Étape 5 : Découverte du problème UFW

```bash
sudo ufw status verbose
# OUTPUT: Default: deny (incoming), deny (outgoing), deny (routed) ❌
```

**BINGO !** UFW avec `deny outgoing` bloque le trafic Docker interne.

---

## 💡 Analyse de la cause racine

### Comment fonctionne le routage Docker + Nginx + UFW

1. **Client externe** → Nginx (port 443) ✅
2. **Nginx** → `proxy_pass http://localhost:3000` ✅
3. **localhost:3000** → docker-proxy (process sur le host) ✅
4. **docker-proxy** → NAT vers `172.18.0.4:3000` (IP interne du conteneur) ❌ **BLOQUÉ PAR UFW**
5. **Réponse du conteneur** → docker-proxy ❌ **BLOQUÉE PAR UFW outgoing**
6. **docker-proxy** → Nginx ❌ **PAS DE RÉPONSE**

### Pourquoi UFW `deny outgoing` pose problème

#### Trafic bloqué :

- **Connexions localhost** : UFW bloque même `127.0.0.1 → 127.0.0.1:3000`
- **Trafic Docker NAT** : Le forwarding via docker-proxy est bloqué
- **Réponses des conteneurs** : Les paquets de retour sont filtrés par UFW OUTPUT

#### Ce qui a masqué le problème :

- Les conteneurs sont HEALTHY car le healthcheck s'exécute **depuis l'intérieur** du conteneur
- Docker-proxy écoute bien sur le port, donc la connexion TCP réussit
- Mais les **réponses HTTP** sont bloquées par UFW

---

## ✅ Solution appliquée

### Fix UFW : Passer de `deny outgoing` à `allow outgoing`

```bash
# Reset UFW
sudo ufw --force reset

# Configuration correcte
sudo ufw default deny incoming
sudo ufw default allow outgoing  # ← FIX CRITIQUE
sudo ufw default deny routed

# Règles essentielles
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS

# Réactiver
sudo ufw --force enable
```

### Vérification immédiate

```bash
curl http://localhost:3000/api/health
# OUTPUT: Status 200, latency 1ms ✅

curl https://smartplanning.fr/api/health
# OUTPUT: Status 200, latency 2ms ✅
```

**Résultat** : ✅ Application complètement fonctionnelle !

---

## 📝 Leçons apprises

### 1. UFW `deny outgoing` n'est PAS compatible avec Docker

**Pourquoi** :

- Docker utilise des réseaux bridge internes
- Le trafic entre le host et les conteneurs passe par NAT
- UFW avec `deny outgoing` bloque ces communications

**Alternative sécurisée** :

- Utiliser `allow outgoing` (politique par défaut recommandée)
- Bloquer spécifiquement des destinations si nécessaire avec `deny out to <IP>`
- Docker gère déjà l'isolation réseau via ses propres règles iptables

### 2. Le healthcheck Docker ne garantit pas l'accessibilité externe

**Observation** :

- Healthcheck OK = le conteneur répond en interne
- Mais cela ne teste PAS le routage réseau complet

**Recommandation** :

- Toujours tester l'accès externe après déploiement
- Inclure un test Nginx → app dans le monitoring

### 3. Méthode de diagnostic pour ce type de problème

**Workflow recommandé** :

1. Vérifier les conteneurs (status, logs, processus)
2. Tester depuis l'intérieur du conteneur
3. Tester depuis le host (localhost)
4. Vérifier docker-proxy et les ports
5. Vérifier iptables (NAT et FILTER)
6. **Vérifier UFW** ← Souvent oublié !

---

## 🔧 Correctifs appliqués au code

### 1. Script `scripts/secure-vps-part1.sh`

**Avant** :

```bash
ufw default deny outgoing  # ❌ PROBLÉMATIQUE
```

**Après** :

```bash
ufw default allow outgoing  # ✅ CORRIGÉ
# ⚠️  IMPORTANT: "deny outgoing" bloque le trafic Docker interne
```

### 2. Documentation `.github/DEPLOY.md`

- Ajout d'une section troubleshooting dédiée
- Documentation du problème UFW + Docker
- Instructions de vérification post-déploiement

### 3. Référence dans `security-hardening-plan.md`

- Note ajoutée dans la Phase 2 (Configuration Firewall)
- Lien vers ce document d'incident

---

## 📊 Impact

### Temps d'indisponibilité

- **Durée** : ~3 heures
- **Impact utilisateur** : Site complètement inaccessible
- **Impact métier** : Aucun (migration VPS, site n'était pas en production)

### Temps de résolution

- **Investigation** : ~2h30
- **Fix** : 2 minutes (une seule commande UFW)
- **Vérification** : 15 minutes

---

## ✅ Actions de prévention

### Court terme (Fait ✅)

- [x] Corriger le script `secure-vps-part1.sh`
- [x] Mettre à jour `DEPLOY.md` avec troubleshooting
- [x] Documenter l'incident (ce fichier)
- [x] Tester la configuration UFW sur le VPS de production

### Moyen terme (À faire)

- [ ] Créer un script de vérification post-déploiement
- [ ] Ajouter un test de connectivité Nginx → app au monitoring
- [ ] Documenter UFW dans la formation interne

### Long terme (À planifier)

- [ ] Envisager l'utilisation de Docker en mode `--iptables=false` si UFW strict requis
- [ ] Créer un playbook Ansible pour configuration VPS reproductible

---

## 🔗 Références

- **Issue GitHub** : N/A (résolu avant création d'issue)
- **Pull Request** : À créer pour merge des correctifs
- **Documents liés** :
  - `scripts/secure-vps-part1.sh` (corrigé)
  - `.github/DEPLOY.md` (mis à jour)
  - `docs/security/security-hardening-plan.md`

---

**Rédigé par** : Claude Code
**Validé par** : Christophe (krismos64)
**Date** : 6 janvier 2026
