# Guide de Déploiement SmartPlanning V2

**Version** : 2.0
**Dernière mise à jour** : 6 janvier 2026
**VPS** : OVH Ubuntu 24.04 LTS

---

## 📋 Table des matières

1. [Prérequis](#prérequis)
2. [Configuration initiale du VPS](#configuration-initiale-du-vps)
3. [Déploiement avec GitHub Actions](#déploiement-avec-github-actions)
4. [Résolution des problèmes courants](#résolution-des-problèmes-courants)
5. [Maintenance](#maintenance)

---

## 🔧 Prérequis

### Sur le VPS

- Ubuntu 24.04 LTS
- Docker + Docker Compose installés
- Nginx installé et configuré
- Certificat SSL Let's Encrypt
- Utilisateur `deploy` avec accès sudo
- UFW configuré correctement

### Secrets GitHub Actions

Les secrets suivants doivent être configurés dans le repository :

- `VPS_HOST` : Adresse IP du VPS
- `VPS_USER` : `deploy`
- `VPS_SSH_KEY` : Clé privée SSH (base64)
- `GHCR_TOKEN` : Token GitHub pour accéder au container registry

---

## ⚙️ Configuration initiale du VPS

### 1. Exécuter le script de sécurisation

```bash
# Sur votre machine locale, copier le script sur le VPS
scp scripts/secure-vps-part1.sh root@<VPS_IP>:/tmp/

# Se connecter au VPS en SSH
ssh root@<VPS_IP>

# Exécuter le script
sudo bash /tmp/secure-vps-part1.sh
```

⚠️ **IMPORTANT** : Le script configure UFW avec `allow outgoing` par défaut. Ne PAS utiliser `deny outgoing` car cela bloque le trafic Docker interne et empêche Nginx de communiquer avec les conteneurs !

### 2. Vérifier la configuration UFW

Après exécution du script, vérifier que UFW est correctement configuré :

```bash
sudo ufw status verbose
```

La sortie doit montrer :

```
Default: deny (incoming), allow (outgoing), deny (routed)
```

✅ **Ports autorisés (incoming)** :

- 22/tcp : SSH
- 80/tcp : HTTP
- 443/tcp : HTTPS

### 3. Configurer les variables d'environnement

Créer le fichier `.env` dans `/var/www/smartplanning/` :

```bash
su - deploy
cd /var/www/smartplanning
nano .env
```

Variables essentielles :

```env
# Base de données PostgreSQL
DATABASE_URL=postgresql://smartplanning:<PASSWORD>@postgres:5432/smartplanning?schema=public
POSTGRES_USER=smartplanning
POSTGRES_PASSWORD=<STRONG_PASSWORD>
POSTGRES_DB=smartplanning

# NextAuth
NEXTAUTH_URL=https://smartplanning.fr
NEXTAUTH_SECRET=<GENERATE_WITH_openssl_rand_base64_32>
AUTH_TRUST_HOST=true

# Redis
REDIS_URL=redis://:<PASSWORD>@redis:6379
REDIS_PASSWORD=<STRONG_PASSWORD>

# Node
NODE_ENV=production

# Optionnel : Stripe, Resend, etc.
```

### 4. Installer et configurer Nginx

Le fichier de configuration Nginx complet se trouve dans `/etc/nginx/sites-available/smartplanning.conf`.

Activer la configuration :

```bash
sudo ln -s /etc/nginx/sites-available/smartplanning.conf /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # Si présent
sudo nginx -t
sudo systemctl reload nginx
```

### 5. Obtenir un certificat SSL

```bash
sudo certbot --nginx -d smartplanning.fr -d www.smartplanning.fr
```

---

## 🚀 Déploiement avec GitHub Actions

Le déploiement automatique se déclenche à chaque push sur la branche `main`.

### Workflow

1. **Build** : Création de l'image Docker
2. **Push** : Upload vers GitHub Container Registry (ghcr.io)
3. **Deploy** : SSH vers le VPS et redéploiement

### Vérifier le déploiement

```bash
# Sur le VPS
cd /var/www/smartplanning
sudo -u deploy docker compose ps

# Vérifier les logs
sudo -u deploy docker compose logs -f app
```

### Tester l'application

```bash
# Health check
curl https://smartplanning.fr/api/health

# Page d'accueil
curl -I https://smartplanning.fr/
```

---

## 🔍 Résolution des problèmes courants

### Problème : Application inaccessible après déploiement

**Symptôme** : Les conteneurs sont HEALTHY mais le site ne répond pas.

**Cause probable** : UFW bloque le trafic avec `deny outgoing`.

**Solution** :

```bash
# Vérifier la configuration UFW
sudo ufw status verbose

# Si "Default: deny (incoming), deny (outgoing)" :
sudo ufw default allow outgoing
sudo systemctl reload nginx

# Tester immédiatement
curl http://localhost:3000/api/health
```

**Explication** :

- UFW avec `deny outgoing` bloque le trafic Docker interne
- Nginx sur le host ne peut plus communiquer avec le conteneur app:3000
- Docker utilise iptables NAT, mais UFW peut bloquer les réponses

**Référence** : Voir `docs/security/incident-2026-01-06-ufw-docker.md`

### Problème : Redis unhealthy (Permission denied)

**Symptôme** : `find: ./appendonlydir: Permission denied`

**Cause** : Configuration `read_only: true` + `appendonly yes` + capabilities limitées

**Solution** :
Dans `docker-compose.yml`, désactiver la persistance AOF :

```yaml
redis:
  command: redis-server --requirepass ${REDIS_PASSWORD} --appendonly no
```

### Problème : Prisma metrics error

**Symptôme** : `PrismaClientValidationError: metrics preview feature must be enabled`

**Cause** : API `$metrics` supprimée dans Prisma 5+

**Solution** :
Retirer les appels à `prisma.$metrics.json()` du code (déjà corrigé dans `src/lib/prisma-utils.ts`).

---

## 🛠️ Maintenance

### Mettre à jour l'application

Les mises à jour se font automatiquement via GitHub Actions lors d'un push sur `main`.

Pour forcer un redéploiement manuel :

```bash
cd /var/www/smartplanning
sudo -u deploy docker compose pull
sudo -u deploy docker compose up -d --force-recreate
```

### Surveiller les logs

```bash
# Logs application
sudo -u deploy docker compose logs -f app

# Logs Nginx
sudo tail -f /var/log/nginx/smartplanning-error.log

# Logs UFW
sudo tail -f /var/log/ufw.log
```

### Sauvegarder la base de données

```bash
# Dump PostgreSQL
sudo -u deploy docker compose exec postgres pg_dump -U smartplanning smartplanning > backup.sql

# Restaurer
sudo -u deploy docker compose exec -T postgres psql -U smartplanning smartplanning < backup.sql
```

### Nettoyer Docker

```bash
# Supprimer les images inutilisées
sudo -u deploy docker image prune -a

# Supprimer les volumes orphelins
sudo -u deploy docker volume prune
```

---

## 📚 Références

- [Plan de sécurisation complet](../docs/security/security-hardening-plan.md)
- [Audit sécurité Docker](../docs/security/docker-hardening-2026-01-05.md)
- [Incident UFW + Docker](../docs/security/incident-2026-01-06-ufw-docker.md)
- [Configuration Nginx](../nginx/smartplanning.conf)

---

**Dernière vérification** : 6 janvier 2026
**Statut** : ✅ Application déployée et fonctionnelle sur https://smartplanning.fr
