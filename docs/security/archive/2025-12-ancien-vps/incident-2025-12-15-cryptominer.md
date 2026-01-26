# Rapport d'Incident Sécurité - Cryptominer dans Container Docker

**Date de l'incident** : 15 décembre 2025, 09:31 UTC
**Date de détection** : 15 décembre 2025, 11:40 UTC
**Analyste** : Claude Code + Christophe
**Serveur** : vps-5418469b.vps.ovh.net (141.94.78.0)
**Sévérité** : CRITIQUE

---

## 1. Résumé Exécutif

Un cryptominer a été injecté dans le conteneur `smartplanning-app` le 15 décembre 2025 à 09:31 UTC, soit **environ 2 heures après le déploiement**. L'attaque a été détectée lors d'une vérification de routine des processus Docker.

**Type d'attaque** : Injection de cryptominer (compromission runtime)
**Durée du minage** : ~8h17 de temps CPU
**Impact** : Ressources CPU détournées, connexions C2 établies
**Statut** : Conteneur stoppé et remplacé, IPs C2 identifiées

---

## 2. Timeline de l'Incident

| Heure (UTC)  | Événement                                                    |
| ------------ | ------------------------------------------------------------ |
| 07:00        | Déploiement CD réussi (image propre)                         |
| 09:00        | Container `smartplanning-app` redémarré avec AUTH_TRUST_HOST |
| **09:31:00** | **POST HTTP 500 depuis 180.172.231.1** (possible exploit)    |
| **09:31**    | **Création des fichiers malveillants** dans /app             |
| 09:32-09:33  | Scan massif des fichiers .env depuis 78.153.140.177          |
| 09:38:41     | POST depuis 180.172.231.1 avec python-urllib3                |
| 11:40        | **Détection des processus suspects** lors du diagnostic      |
| 11:41        | Arrêt et suppression du conteneur compromis                  |
| 11:42        | Redémarrage avec image propre                                |
| 11:47        | Conteneur healthy, site opérationnel                         |

---

## 3. Preuves Collectées

### 3.1 Fichiers Malveillants Identifiés

Trois fichiers exécutables trouvés dans `/app` du conteneur :

```
-rwxr-xr-x 1 nextjs nogroup 2854208 Dec 15 09:31 /app/1L1aFl    # Miner principal
-rwxr-xr-x 1 nextjs nogroup 3874856 Dec 15 09:31 /app/VLvveomR2 # Loader/dropper
-rwxr-xr-x 1 nextjs nogroup   10564 Dec 15 09:31 /app/ju2J      # Config miner
```

**Caractéristiques** :

- Noms aléatoires (technique d'obfuscation)
- Propriétaire : `nextjs` (utilisateur du conteneur)
- Permissions : exécutable
- Créés exactement à 09:31

### 3.2 Processus Malveillants

```
PID   USER     TIME     COMMAND
340   nextjs   3:41     /app/VLvveomR2
354   nextjs   8h17     /app/1L1aFl -c /app/ju2J -B
```

**Observations** :

- `/app/1L1aFl` : **8h17 de temps CPU** - cryptominer actif
- Option `-c /app/ju2J` : fichier de configuration
- Option `-B` : probablement mode "background" ou "benchmark"
- Nombreux processus zombies `[lrt]`, `[Kacba1Tt]`, etc.

### 3.3 Connexions Réseau C2

```
Proto  Local Address        Foreign Address      State
tcp    172.18.0.4:34110    37.114.37.82:80      ESTABLISHED  # C2/Pool
tcp    172.18.0.4:39016    5.255.121.141:80     ESTABLISHED  # C2/Pool (255KB queue)
tcp    172.18.0.4:39764    37.114.37.82:80      ESTABLISHED  # C2/Pool
```

**IPs de Command & Control / Mining Pool** :

- `37.114.37.82:80` - 2 connexions actives
- `5.255.121.141:80` - 255KB de données en attente d'envoi

### 3.4 Socket Unix Suspect

```
unix  2  [ ACC ]  STREAM  LISTENING  @therespoopomg
```

Socket avec nom aléatoire - probable mécanisme de persistence.

### 3.5 Logs Nginx Autour de l'Incident

```nginx
# POST suspect avec erreur 500 - POSSIBLE VECTEUR D'ATTAQUE
180.172.231.1 - [15/Dec/2025:09:31:00] "POST / HTTP/1.1" 500 110

# POST automatisé avec python-urllib3
180.172.231.1 - [15/Dec/2025:09:38:41] "POST / HTTP/1.1" 303 11757 "python-urllib3/1.26.4"

# Scan massif des fichiers .env
78.153.140.177 - [15/Dec/2025:09:32:19] "GET /.env HTTP/1.1" 404
78.153.140.177 - [15/Dec/2025:09:32:19] "GET /api/.env HTTP/1.1" 404
78.153.140.177 - [15/Dec/2025:09:32:20] "GET /admin/.env HTTP/1.1" 404
# ... 30+ tentatives

# Attaques POST répétées
185.16.39.52 - [15/Dec/2025:09:31:38] "POST / HTTP/1.1" 499
185.16.39.52 - [15/Dec/2025:09:31:58] "POST / HTTP/1.1" 499
# ... pattern répété toutes les 20 secondes
```

---

## 4. Analyse du Vecteur d'Attaque

### 4.1 Hypothèse Principale : RCE via POST Request

1. **09:31:00** - POST depuis `180.172.231.1` retourne HTTP 500
2. Ce code 500 suggère une erreur serveur exploitée (crash = injection réussie)
3. Les fichiers malveillants sont créés à **exactement 09:31**
4. Corrélation temporelle parfaite

### 4.2 Hypothèse Alternative : Vulnérabilité Next.js/Dépendance

- Next.js 15.5.6 pourrait avoir une CVE non patchée
- Une dépendance npm pourrait être compromise
- Server Actions ou API Routes vulnérables

### 4.3 Points d'Entrée Possibles

| Endpoint       | Risque   | Action                                   |
| -------------- | -------- | ---------------------------------------- |
| POST /         | CRITIQUE | Vérifier le handler de la page d'accueil |
| /api/\*        | HAUT     | Auditer toutes les routes API            |
| Server Actions | MOYEN    | Vérifier la validation des inputs        |

---

## 5. Indicateurs de Compromission (IOC)

### 5.1 Fichiers

| Type    | Valeur           | Description                    |
| ------- | ---------------- | ------------------------------ |
| Fichier | `/app/1L1aFl`    | Cryptominer principal (2.8 MB) |
| Fichier | `/app/VLvveomR2` | Loader/dropper (3.8 MB)        |
| Fichier | `/app/ju2J`      | Config miner (10 KB)           |

### 5.2 IPs Malveillantes

| IP               | Type                    | Action  |
| ---------------- | ----------------------- | ------- |
| `180.172.231.1`  | Attaquant (exploit)     | BLOQUER |
| `185.16.39.52`   | Attaquant (brute force) | BLOQUER |
| `78.153.140.177` | Scanner (.env)          | BLOQUER |
| `37.114.37.82`   | C2/Mining Pool          | BLOQUER |
| `5.255.121.141`  | C2/Mining Pool          | BLOQUER |

### 5.3 User Agents Suspects

```
python-urllib3/1.26.4  # Outil automatisé
```

---

## 6. Actions de Remédiation

### 6.1 Actions Immédiates (FAIT)

- [x] Arrêt du conteneur compromis
- [x] Suppression du conteneur
- [x] Redémarrage avec image propre
- [x] Vérification que le nouveau conteneur est clean
- [x] Site remis en ligne

### 6.2 Actions Court Terme (EN COURS)

- [ ] Bloquer les IPs malveillantes (iptables/fail2ban)
- [ ] Implémenter rate limiting nginx
- [ ] Ajouter security headers Next.js
- [ ] Configurer CSP middleware
- [ ] Audit des routes API

### 6.3 Actions Moyen Terme (PLANIFIÉ)

- [ ] Hardening Docker (read-only, capabilities)
- [ ] Monitoring des processus conteneur
- [ ] Scan de vulnérabilités npm
- [ ] Tests de pénétration
- [ ] Fail2ban avec règles personnalisées

---

## 7. Relation avec l'Incident du 5 Décembre 2025

**IMPORTANT** : C'est le **DEUXIÈME incident de sécurité** en 10 jours.

| Critère      | Incident 05/12     | Incident 15/12          |
| ------------ | ------------------ | ----------------------- |
| Type         | UDP Flooder        | Cryptominer             |
| Vecteur      | Clé SSH compromise | RCE via POST (probable) |
| Cible        | DDoS externe       | Mining crypto           |
| Localisation | /tmp/a (conteneur) | /app/\* (conteneur)     |
| Durée        | Non déterminée     | ~8h17                   |

**Conclusion** : Les mesures de sécurisation post-incident du 5 décembre étaient **insuffisantes**. Une refonte complète de la sécurité est nécessaire.

---

## 8. Recommandations Prioritaires

### PRIORITÉ 1 - CRITIQUE (Immédiat)

1. **Bloquer les IPs attaquantes** au niveau firewall
2. **Rate limiting** sur nginx (10 req/s général, 1 req/s login)
3. **Audit de la page d'accueil** et du handler POST

### PRIORITÉ 2 - HAUTE (Cette semaine)

1. **Security headers** Next.js (CSP, X-Frame-Options, etc.)
2. **Middleware de validation** des requêtes
3. **Hardening Docker** (read-only filesystem, drop capabilities)

### PRIORITÉ 3 - MOYENNE (Ce mois)

1. **npm audit** et mise à jour des dépendances
2. **Monitoring** des processus Docker en temps réel
3. **Tests de pénétration** professionnels
4. **WAF** (Web Application Firewall)

---

## 9. Conclusion

Ce deuxième incident en 10 jours démontre que :

1. **Le VPS reste une cible active** pour les attaquants
2. **Les conteneurs Docker ne sont pas isolés** de manière sécurisée
3. **L'application a probablement une vulnérabilité** exploitable via POST
4. **Un plan de sécurité complet** est urgent

Le plan de remédiation détaillé est disponible dans :
`docs/security/security-hardening-plan.md`

---

**Document créé le** : 15 décembre 2025
**Dernière mise à jour** : 15 décembre 2025
**Statut** : Incident résolu, remédiation en cours
