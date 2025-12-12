# Rapport d'Analyse Forensique - VPS SmartPlanning

**Date de l'incident** : 5 décembre 2025, 17:00:45 CET
**Date de l'analyse** : 12 décembre 2025
**Analyste** : Christophe
**Serveur** : vps-5418469b.vps.ovh.net (141.94.78.0)

---

## 1. Résumé Exécutif

Le VPS hébergeant SmartPlanning a été compromis et utilisé pour lancer une attaque UDP flood (187Kpps/5Mbps) contre l'IP 185.211.78.1:80 le 5 décembre 2025 à 17:00:45 CET.

**Vecteur d'attaque probable** : Clé SSH de déploiement (`smartplanning-deploy`) compromise ou pipeline CI/CD GitHub Actions piraté.

**Malware identifié** : Binaire ELF packé avec UPX trouvé dans `/tmp/a` d'un conteneur Docker.

**Données exposées** : Token GitHub PAT stocké en clair dans `/home/deploy/.docker/config.json`.

---

## 2. Timeline de l'Attaque

| Heure (CET) | Événement |
|-------------|-----------|
| 2025-12-02 19:33 | Création de l'utilisateur `deploy` |
| 2025-12-02 19:35 | Installation de Docker et containerd |
| 2025-12-03 13:57-14:04 | Connexions SSH légitimes depuis 82.67.13.234 (IP de Christophe) |
| 2025-12-03 14:03-14:04 | Premières connexions depuis IPs Azure (52.161.82.117, 64.236.137.131) |
| 2025-12-04 14:45-14:47 | Connexions depuis IPs Azure/Microsoft |
| 2025-12-05 10:04-11:04 | **Nombreuses connexions SSH** depuis IPs différentes (Azure, Microsoft) |
| 2025-12-05 11:03 | Création des conteneurs Docker SmartPlanning |
| 2025-12-05 15:31 | **Création du fichier malveillant `/tmp/a`** |
| 2025-12-05 15:46 | Modification du malware (probable exécution) |
| 2025-12-05 16:03 | Derniers logs applicatifs avant blocage |
| 2025-12-05 17:00:45 | **Attaque UDP flood détectée par OVH** |
| 2025-12-05 17:00+ | VPS bloqué par OVH |

---

## 3. Preuves Collectées

### 3.1 Connexions SSH Suspectes

Toutes les connexions utilisent la **même clé SSH ED25519** (`SHA256:iW6fTrwID/wbGc8njDw9Xp/BQ3UGdqE35wsVNNACcEQ`) étiquetée `smartplanning-deploy` :

```
2025-12-05T10:04:43 - Accepted publickey for deploy from 52.225.29.97
2025-12-05T10:06:59 - Accepted publickey for deploy from 135.232.193.37
2025-12-05T10:07:09 - Accepted publickey for deploy from 9.234.149.183
2025-12-05T10:08:01 - Accepted publickey for deploy from 40.76.238.176
2025-12-05T10:09:42 - Accepted publickey for deploy from 9.234.151.82
2025-12-05T10:10:42 - Accepted publickey for deploy from 135.232.232.68
2025-12-05T10:12:26 - Accepted publickey for deploy from 20.49.14.177
2025-12-05T10:13:34 - Accepted publickey for deploy from 135.232.193.34
2025-12-05T10:50:55 - Accepted publickey for deploy from 172.182.195.177
2025-12-05T10:52:07 - Accepted publickey for deploy from 172.184.210.54
```

**Observation** : Ces IPs appartiennent principalement à Microsoft Azure, ce qui suggère :
- Un pipeline GitHub Actions compromis
- Ou des serveurs cloud utilisés par l'attaquant pour masquer son origine

### 3.2 Malware Identifié

**Chemin** : `/var/lib/containerd/io.containerd.snapshotter.v1.overlayfs/snapshots/291/fs/tmp/a`

```
-rwxrwxrwx 1 1001 65533 50552 Dec  5 15:46 a
Type: ELF 32-bit LSB executable, Intel 80386, statically linked
Packer: UPX (détecté dans les headers)
```

**Caractéristiques du malware** :
- Binaire ELF 32-bit pour Linux
- Statiquement lié (aucune dépendance)
- Packé avec UPX (obfuscation)
- Sans en-têtes de section (anti-analyse)
- Permissions 777 (world-writable/executable)
- Taille : 50.5 KB

### 3.3 Token GitHub Exposé

**Fichier** : `/home/deploy/.docker/config.json`

```json
{
  "auths": {
    "ghcr.io": {
      "auth": "a3Jpc21vczY0OmdocF9YbVBvRlRBN2Via21wRTdDdXVQQXRod0VKTXdmc2Uycm9jZ1o="
    }
  }
}
```

**Décodé (Base64)** : `krismos64:ghp_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX` (token masqué)

**ACTION REQUISE** : Ce token GitHub PAT doit être **révoqué immédiatement** sur https://github.com/settings/tokens

### 3.4 Historique Bash Effacé

L'historique bash de root est **vide** - technique classique utilisée par les attaquants pour effacer leurs traces.

### 3.5 Propriétaire de Logs Suspect

Plusieurs fichiers de logs système appartiennent à l'utilisateur `iperf3` au lieu de `syslog` :

```
-rw-r----- 1 iperf3 adm auth.log
-rw-r----- 1 iperf3 adm cloud-init.log
-rw-r----- 1 iperf3 adm kern.log
-rw-r----- 1 iperf3 adm ufw.log
```

`iperf3` est un outil de test de bande passante réseau - sa présence comme propriétaire de logs est anormale.

---

## 4. Vecteur d'Attaque Probable

### Hypothèse Principale : Pipeline CI/CD Compromis

1. **La clé SSH `smartplanning-deploy`** est utilisée par GitHub Actions pour déployer sur le VPS
2. L'attaquant a obtenu accès soit :
   - Au repository GitHub (credentials volés, token exposé)
   - À la clé SSH privée (stockée dans les secrets GitHub Actions)
3. Les connexions depuis des IPs Azure/Microsoft correspondent aux runners GitHub Actions
4. L'attaquant a utilisé le pipeline pour déployer le malware dans un conteneur

### Hypothèse Alternative : Clé SSH Compromise Directement

- La clé privée SSH a été exposée (dans un commit, un fichier non protégé, etc.)
- L'attaquant l'a utilisée depuis plusieurs VPN/proxies pour masquer son origine

---

## 5. Impact

### 5.1 Impact Technique
- **Disponibilité** : VPS bloqué pendant 7 jours
- **Intégrité** : Malware déployé sur le serveur
- **Confidentialité** : Token GitHub potentiellement compromis

### 5.2 Impact Business
- SmartPlanning inaccessible du 5 au 12 décembre 2025
- Réputation potentiellement affectée (IP blacklistée)
- Temps de récupération et analyse

---

## 6. Recommandations

### 6.1 Actions Immédiates (URGENT)

1. **Révoquer le token GitHub PAT** exposé (voir section 3.3)
   - URL : https://github.com/settings/tokens

2. **Révoquer et régénérer la clé SSH de déploiement** :
   - Supprimer l'ancienne clé des secrets GitHub Actions
   - Générer une nouvelle paire de clés ED25519
   - Mettre à jour les secrets GitHub

3. **Réinstaller le VPS** avec Ubuntu 24.04 LTS (installation propre)

### 6.2 Sécurisation du Nouveau VPS

1. **SSH** :
   - Désactiver l'authentification par mot de passe
   - Utiliser uniquement des clés SSH ED25519
   - Configurer fail2ban avec des règles strictes
   - Changer le port SSH (ex: 2222)
   - Limiter les utilisateurs autorisés à se connecter

2. **Firewall (UFW)** :
   - Bloquer tout par défaut
   - Autoriser uniquement les ports nécessaires (SSH, HTTP, HTTPS)
   - **Configurer des règles de sortie** pour bloquer le trafic non autorisé

3. **Docker** :
   - Ne pas stocker de credentials en clair dans `config.json`
   - Utiliser des secrets Docker ou des variables d'environnement sécurisées
   - Scanner les images avec Trivy ou Snyk

4. **Monitoring** :
   - Installer un système de détection d'intrusion (OSSEC, Wazuh)
   - Configurer des alertes pour les connexions SSH inhabituelles
   - Monitorer le trafic réseau sortant

### 6.3 Sécurisation CI/CD

1. **GitHub Actions** :
   - Activer la rotation automatique des secrets
   - Utiliser des environnements avec approbation manuelle pour la production
   - Limiter les permissions des tokens (least privilege)
   - Auditer régulièrement les workflows

2. **Secrets** :
   - Ne jamais stocker de secrets dans le code
   - Utiliser GitHub Secrets ou un gestionnaire de secrets externe
   - Activer les alertes de fuite de secrets (secret scanning)

---

## 7. Indicateurs de Compromission (IOC)

### 7.1 Fichiers
| Type | Valeur | Description |
|------|--------|-------------|
| Fichier | `/tmp/a` | Binaire malveillant UDP flooder |
| Hash SHA256 | À calculer | Malware ELF packé UPX |

### 7.2 IPs Suspectes (connexions SSH)
- 52.225.29.97 (Azure)
- 135.232.193.37, 135.232.232.68, 135.232.193.34 (Azure)
- 9.234.149.183, 9.234.151.82 (IBM Cloud)
- 40.76.238.176 (Azure)
- 20.49.14.177, 20.161.69.39, 20.102.223.136 (Azure)
- 172.182.195.177, 172.184.210.54 (Azure)
- 64.236.169.4, 64.236.137.131, 64.236.140.210 (Azure)
- 52.161.82.117, 52.190.140.97 (Azure)

**Note** : Ces IPs appartiennent à Microsoft Azure et peuvent être des runners GitHub Actions légitimes ou des machines cloud louées par l'attaquant.

### 7.3 Cible de l'Attaque
- **IP cible** : 185.211.78.1:80
- **Protocole** : UDP
- **Débit** : 187Kpps / 5Mbps

---

## 8. Leçons Apprises

1. **Ne jamais stocker de credentials en clair** sur le serveur
2. **Configurer des règles de firewall sortant** pour limiter les attaques depuis le serveur
3. **Monitorer les connexions SSH** et alerter sur les patterns inhabituels
4. **Rotation régulière des secrets** et clés SSH
5. **Audit régulier de sécurité** du pipeline CI/CD

---

## 9. Annexes

### A. Détails du Rapport OVH

```
Attack detail : 187Kpps/5Mbps
dateTime srcIp:srcPort dstIp:dstPort protocol flags bytes reason
2025.12.05 17:00:45 CET 141.94.78.0:59173 185.211.78.1:80 UDP --- 28 ATTACK:UDP
```

### B. Configuration Système au Moment de l'Incident

- **OS** : Ubuntu 24.04 LTS
- **Kernel** : Linux vps-5418469b
- **Docker** : Installé
- **Services** : nginx, Docker, fail2ban, UFW

### C. Conteneurs Docker Actifs

1. `smartplanning-postgres` (PostgreSQL 16 Alpine)
2. `smartplanning-redis` (Redis 7 Alpine)
3. `smartplanning-app` (ghcr.io/krismos64/smartplanningai-v2:latest)

---

**Document préparé pour la soutenance CDA - Décembre 2025**

*Ce rapport démontre les compétences en analyse forensique, réponse aux incidents, et sécurisation d'infrastructure.*
