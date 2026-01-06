#!/bin/bash
# ==============================================
# SMARTPLANNING - SÉCURISATION VPS (PARTIE 1)
# ==============================================
#
# 📚 EXPLICATIONS CDA (Concepteur Développeur d'Applications) :
# --------------------------------------------------------------
# Ce script prépare un VPS Ubuntu 24.04 fraîchement installé pour héberger
# SmartPlanning V2 de manière sécurisée. Il met en place les fondations de
# sécurité AVANT le premier déploiement.
#
# 🎯 OBJECTIF :
# Créer un environnement sécurisé compatible avec le pipeline GitHub Actions (cd.yml)
# qui déploie automatiquement l'application via SSH.
#
# 🔒 CONTEXTE SÉCURITÉ :
# Ce script fait suite à 3 incidents de sécurité survenus en décembre 2025 :
# - 5 déc : UDP Flooder (DDoS)
# - 15 déc : Cryptominer injecté (via CVE Next.js CVSS 10.0)
# - 16 déc : DNS Amplification → VPS bloqué par OVH
#
# 📋 CE QUE FAIT CE SCRIPT :
# 1. Met à jour le système Ubuntu 24.04
# 2. Crée l'utilisateur "deploy" (utilisé par GitHub Actions)
# 3. Configure SSH de manière sécurisée
# 4. Installe Docker (requis pour l'application)
# 5. Configure UFW (firewall) avec règles strictes
# 6. Bloque les 5 IPs malveillantes identifiées
# 7. Installe fail2ban (protection brute-force)
# 8. Affiche les instructions manuelles finales
#
# ⚠️ PRÉREQUIS :
# - VPS Ubuntu 24.04 LTS fraîchement installé
# - Accès root (ce script doit être lancé avec sudo)
# - Connexion internet stable
#
# 🚀 USAGE :
# sudo bash scripts/secure-vps-part1.sh
#
# 📚 SOURCES :
# - Frank's Blog - Ubuntu 24.04 Hardening
# - GitHub chaifeng/ufw-docker (Docker + UFW compatibility)
# - OWASP Docker Security Best Practices
# - SP-157 Security Audit (5 janvier 2026)
#
# ==============================================

set -e  # Arrête le script en cas d'erreur
set -u  # Arrête si une variable non définie est utilisée

# ----------------------------------------------
# VARIABLES DE CONFIGURATION
# ----------------------------------------------

# Utilisateur de déploiement (utilisé par GitHub Actions)
# Doit correspondre au secret GitHub VPS_USER
DEPLOY_USER="deploy"

# Répertoire de déploiement (utilisé par cd.yml)
DEPLOY_DIR="/var/www/smartplanning"

# IPs malveillantes identifiées lors des incidents
# Ces IPs ont attaqué le VPS en décembre 2025
MALICIOUS_IPS=(
  "180.172.231.1"    # Attaquant RCE (POST avec exploit)
  "185.16.39.52"     # Brute force (POST répétés)
  "78.153.140.177"   # Scanner .env (30+ tentatives)
  "37.114.37.82"     # C2/Mining Pool #1
  "5.255.121.141"    # C2/Mining Pool #2
)

# Ports SSH (peut être modifié pour plus de sécurité)
SSH_PORT="22"

# ----------------------------------------------
# FONCTIONS UTILITAIRES
# ----------------------------------------------

# Affiche un message avec emoji
log_info() {
  echo "ℹ️  $1"
}

log_success() {
  echo "✅ $1"
}

log_warning() {
  echo "⚠️  $1"
}

log_error() {
  echo "❌ $1"
}

log_section() {
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📋 $1"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

# Vérifie que le script est lancé en tant que root
check_root() {
  if [ "$EUID" -ne 0 ]; then
    log_error "Ce script doit être exécuté en tant que root (sudo)"
    exit 1
  fi
}

# ----------------------------------------------
# DÉBUT DU SCRIPT
# ----------------------------------------------

log_section "SÉCURISATION VPS SMARTPLANNING - PARTIE 1"
log_info "Début de la configuration sécurisée du VPS..."
log_info "Ubuntu 24.04 LTS + Docker + GitHub Actions CD"

# Vérification root
check_root

# ----------------------------------------------
# 1. MISE À JOUR DU SYSTÈME
# ----------------------------------------------

log_section "1. Mise à jour du système Ubuntu 24.04"
log_info "Mise à jour de la liste des paquets..."
apt update -qq

log_info "Mise à niveau des paquets installés..."
DEBIAN_FRONTEND=noninteractive apt upgrade -y -qq

log_info "Installation des paquets de sécurité de base..."
DEBIAN_FRONTEND=noninteractive apt install -y -qq \
  fail2ban \
  ufw \
  unattended-upgrades \
  apt-listchanges \
  curl \
  git \
  htop \
  vim

log_success "Système mis à jour"

# ----------------------------------------------
# 2. CRÉATION DE L'UTILISATEUR DEPLOY
# ----------------------------------------------

log_section "2. Création de l'utilisateur de déploiement"

if id "$DEPLOY_USER" &>/dev/null; then
  log_warning "L'utilisateur $DEPLOY_USER existe déjà"
else
  log_info "Création de l'utilisateur $DEPLOY_USER..."
  useradd -m -s /bin/bash "$DEPLOY_USER"

  log_info "Ajout de $DEPLOY_USER au groupe sudo..."
  usermod -aG sudo "$DEPLOY_USER"

  log_info "Configuration sudo sans mot de passe pour $DEPLOY_USER..."
  echo "$DEPLOY_USER ALL=(ALL) NOPASSWD:ALL" > "/etc/sudoers.d/$DEPLOY_USER"
  chmod 0440 "/etc/sudoers.d/$DEPLOY_USER"

  log_success "Utilisateur $DEPLOY_USER créé"
fi

# Configuration SSH pour l'utilisateur deploy
log_info "Configuration du répertoire SSH pour $DEPLOY_USER..."
mkdir -p "/home/$DEPLOY_USER/.ssh"
chmod 700 "/home/$DEPLOY_USER/.ssh"
touch "/home/$DEPLOY_USER/.ssh/authorized_keys"
chmod 600 "/home/$DEPLOY_USER/.ssh/authorized_keys"
chown -R "$DEPLOY_USER:$DEPLOY_USER" "/home/$DEPLOY_USER/.ssh"

log_success "Répertoire SSH configuré"

# ----------------------------------------------
# 3. CRÉATION DU RÉPERTOIRE DE DÉPLOIEMENT
# ----------------------------------------------

log_section "3. Création du répertoire de déploiement"

if [ -d "$DEPLOY_DIR" ]; then
  log_warning "Le répertoire $DEPLOY_DIR existe déjà"
else
  log_info "Création de $DEPLOY_DIR..."
  mkdir -p "$DEPLOY_DIR"
fi

log_info "Attribution des permissions à $DEPLOY_USER..."
chown -R "$DEPLOY_USER:$DEPLOY_USER" "$DEPLOY_DIR"
chmod 755 "$DEPLOY_DIR"

log_success "Répertoire de déploiement configuré : $DEPLOY_DIR"

# ----------------------------------------------
# 4. SÉCURISATION SSH
# ----------------------------------------------

log_section "4. Sécurisation SSH"

log_info "Configuration SSH sécurisée dans /etc/ssh/sshd_config.d/hardening.conf..."

cat > /etc/ssh/sshd_config.d/hardening.conf <<EOF
# SmartPlanning SSH Hardening
# Généré par secure-vps-part1.sh

# Désactive l'authentification par mot de passe (clé SSH obligatoire)
PasswordAuthentication no

# Désactive l'authentification root directe
PermitRootLogin prohibit-password

# Désactive les connexions sans mot de passe vides
PermitEmptyPasswords no

# Désactive X11 forwarding (non utilisé)
X11Forwarding no

# Active la séparation des privilèges
UsePrivilegeSeparation yes

# Nombre maximum de tentatives d'authentification
MaxAuthTries 3

# Délai d'inactivité (30 minutes)
ClientAliveInterval 300
ClientAliveCountMax 2

# Protocole SSH 2 uniquement
Protocol 2
EOF

log_info "Test de la configuration SSH..."
sshd -t

log_info "Redémarrage du service SSH..."
systemctl restart sshd

log_success "SSH sécurisé"

# ----------------------------------------------
# 5. INSTALLATION DE DOCKER
# ----------------------------------------------

log_section "5. Installation de Docker"

if command -v docker &>/dev/null; then
  log_warning "Docker est déjà installé"
  docker --version
else
  log_info "Téléchargement et installation de Docker..."
  curl -fsSL https://get.docker.com -o /tmp/get-docker.sh
  sh /tmp/get-docker.sh
  rm /tmp/get-docker.sh

  log_success "Docker installé"
fi

log_info "Ajout de $DEPLOY_USER au groupe docker..."
usermod -aG docker "$DEPLOY_USER"

# Configuration du daemon Docker sécurisé
log_info "Configuration du daemon Docker..."
mkdir -p /etc/docker

cat > /etc/docker/daemon.json <<EOF
{
  "no-new-privileges": true,
  "live-restore": true,
  "userland-proxy": false,
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "default-ulimits": {
    "nofile": {
      "Name": "nofile",
      "Hard": 64000,
      "Soft": 64000
    }
  }
}
EOF

log_info "Redémarrage de Docker avec la nouvelle configuration..."
systemctl restart docker

log_success "Docker configuré de manière sécurisée"

# ----------------------------------------------
# 6. CONFIGURATION DU FIREWALL (UFW)
# ----------------------------------------------

log_section "6. Configuration du pare-feu (UFW)"

log_info "Désactivation temporaire d'UFW..."
ufw --force disable

log_info "Reset des règles UFW..."
ufw --force reset

log_info "Configuration des règles par défaut..."
# ENTRANT : Tout bloquer par défaut
ufw default deny incoming
# SORTANT : Tout autoriser (nécessaire pour Docker et connexions locales)
# ⚠️  IMPORTANT: "deny outgoing" bloque le trafic Docker interne et localhost
# Ce qui empêche Nginx de communiquer avec les conteneurs Docker !
ufw default allow outgoing

log_info "Autorisation du trafic entrant..."

# SSH (pour GitHub Actions et administration)
ufw allow in "$SSH_PORT"/tcp comment 'SSH (GitHub Actions)'

# HTTP/HTTPS (pour Nginx reverse proxy)
ufw allow in 80/tcp comment 'HTTP'
ufw allow in 443/tcp comment 'HTTPS'

# PostgreSQL (si accès externe nécessaire - À COMMENTER EN PRODUCTION)
# ufw allow in 5432/tcp comment 'PostgreSQL'

log_info "Autorisation du trafic loopback et Docker..."
# Interface loopback (localhost) - Bidirectionnel
ufw allow in on lo
ufw allow out on lo

# Note: Le trafic Docker fonctionne avec "allow outgoing" par défaut
# Docker gère ses propres règles iptables pour l'isolation réseau

log_warning "⚠️  IMPORTANT: UFW sera activé à la fin du script"
log_warning "⚠️  Assurez-vous d'avoir une session SSH active avant d'activer UFW"

# ----------------------------------------------
# 7. BLOCAGE DES IPS MALVEILLANTES
# ----------------------------------------------

log_section "7. Blocage des IPs malveillantes"

log_info "Blocage des 5 IPs identifiées lors des incidents de décembre 2025..."

for ip in "${MALICIOUS_IPS[@]}"; do
  log_info "Blocage de $ip..."
  ufw deny from "$ip" comment "Malicious IP (Dec 2025 incidents)"
done

log_success "IPs malveillantes bloquées"

# ----------------------------------------------
# 8. INSTALLATION ET CONFIGURATION DE FAIL2BAN
# ----------------------------------------------

log_section "8. Configuration de Fail2ban"

log_info "Création de la configuration Fail2ban personnalisée..."

cat > /etc/fail2ban/jail.local <<EOF
[DEFAULT]
# Ban pour 1 heure par défaut
bantime = 3600

# Fenêtre de détection de 10 minutes
findtime = 600

# 5 tentatives maximum avant ban
maxretry = 5

# Envoyer les notifications par email (à configurer)
# destemail = admin@smartplanning.fr
# sender = fail2ban@smartplanning.fr
# action = %(action_mwl)s

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 7200

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 5

[nginx-noscript]
enabled = true
filter = nginx-noscript
port = http,https
logpath = /var/log/nginx/access.log
maxretry = 10
findtime = 60
bantime = 7200

[nginx-badbots]
enabled = true
filter = nginx-badbots
port = http,https
logpath = /var/log/nginx/access.log
maxretry = 2
bantime = 86400
EOF

log_info "Activation et démarrage de Fail2ban..."
systemctl enable fail2ban
systemctl restart fail2ban

log_success "Fail2ban configuré et activé"

# ----------------------------------------------
# 9. ACTIVATION DU FIREWALL
# ----------------------------------------------

log_section "9. Activation du pare-feu"

log_warning "⚠️  Activation d'UFW dans 5 secondes..."
log_warning "⚠️  Si vous perdez la connexion SSH, reconnectez-vous immédiatement"
sleep 5

log_info "Activation d'UFW..."
ufw --force enable

log_info "Vérification du statut UFW..."
ufw status verbose

log_success "Pare-feu activé et configuré"

# ----------------------------------------------
# 10. VÉRIFICATION FINALE
# ----------------------------------------------

log_section "10. Vérification finale"

log_info "Vérification des services..."

# Docker
if systemctl is-active --quiet docker; then
  log_success "Docker : actif"
else
  log_error "Docker : inactif"
fi

# Fail2ban
if systemctl is-active --quiet fail2ban; then
  log_success "Fail2ban : actif"
else
  log_error "Fail2ban : inactif"
fi

# UFW
if ufw status | grep -q "Status: active"; then
  log_success "UFW : actif"
else
  log_error "UFW : inactif"
fi

# Utilisateur deploy
if id "$DEPLOY_USER" &>/dev/null; then
  log_success "Utilisateur $DEPLOY_USER : existe"
else
  log_error "Utilisateur $DEPLOY_USER : n'existe pas"
fi

# ----------------------------------------------
# 11. INSTRUCTIONS FINALES
# ----------------------------------------------

log_section "✅ CONFIGURATION TERMINÉE !"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 ÉTAPES MANUELLES RESTANTES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1️⃣  CONFIGURER LA CLÉ SSH POUR GITHUB ACTIONS"
echo "   Sur votre machine locale :"
echo "   ssh-keygen -t ed25519 -C 'github-actions-smartplanning' -f ~/.ssh/deploy_smartplanning"
echo "   cat ~/.ssh/deploy_smartplanning.pub"
echo ""
echo "   Sur le VPS (copier la clé publique) :"
echo "   echo 'COLLER_LA_CLÉ_PUBLIQUE_ICI' >> /home/$DEPLOY_USER/.ssh/authorized_keys"
echo ""
echo "2️⃣  METTRE À JOUR LES SECRETS GITHUB"
echo "   Aller sur : https://github.com/krismos64/SmartplanningAI-V2/settings/secrets/actions"
echo ""
echo "   Créer/Mettre à jour :"
echo "   - VPS_HOST : $(curl -s ifconfig.me 2>/dev/null || echo '<IP_DU_VPS>')"
echo "   - VPS_USER : $DEPLOY_USER"
echo "   - VPS_SSH_KEY : $(echo 'Contenu de ~/.ssh/deploy_smartplanning encodé en base64')"
echo "   - VPS_SSH_PORT : $SSH_PORT"
echo ""
echo "   Commande pour encoder la clé :"
echo "   base64 -w 0 < ~/.ssh/deploy_smartplanning"
echo ""
echo "3️⃣  CONFIGURER L'AUTHENTIFICATION GITHUB CONTAINER REGISTRY"
echo "   Sur le VPS, en tant qu'utilisateur $DEPLOY_USER :"
echo "   su - $DEPLOY_USER"
echo "   echo '<GITHUB_TOKEN>' | docker login ghcr.io -u krismos64 --password-stdin"
echo ""
echo "   Note : Créer un Personal Access Token sur GitHub avec le scope 'read:packages'"
echo "   https://github.com/settings/tokens"
echo ""
echo "4️⃣  CRÉER LE FICHIER .ENV DANS $DEPLOY_DIR"
echo "   su - $DEPLOY_USER"
echo "   cd $DEPLOY_DIR"
echo "   nano .env"
echo ""
echo "   Variables requises (voir .env.example dans le repo) :"
echo "   - DATABASE_URL=postgresql://..."
echo "   - NEXTAUTH_URL=https://smartplanning.fr"
echo "   - NEXTAUTH_SECRET=..."
echo "   - REDIS_PASSWORD=..."
echo "   - POSTGRES_PASSWORD=..."
echo "   - (+ autres variables selon besoins)"
echo ""
echo "5️⃣  INSTALLER NGINX (si pas encore fait)"
echo "   apt install nginx certbot python3-certbot-nginx"
echo "   # Configurer le reverse proxy vers localhost:3000"
echo "   # Obtenir un certificat SSL avec certbot"
echo ""
echo "6️⃣  TESTER LE DÉPLOIEMENT"
echo "   Faire un push sur la branche main pour déclencher le workflow CD"
echo "   Surveiller : https://github.com/krismos64/SmartplanningAI-V2/actions"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ VPS sécurisé et prêt pour le déploiement GitHub Actions"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
log_info "Relisez attentivement les instructions ci-dessus avant de continuer"
log_info "Script terminé avec succès !"
