# Plan de Sécurisation SmartPlanning V2

**Version** : 1.0
**Créé le** : 15 décembre 2025
**Dernière mise à jour** : 15 décembre 2025
**Statut global** : EN COURS

---

## Contexte

Suite à **deux incidents de sécurité** en 10 jours (5 et 15 décembre 2025), ce document détaille le plan complet de sécurisation de l'infrastructure SmartPlanning.

**Référence** : Basé sur les meilleures pratiques **OWASP**, **Docker Security** et **Next.js Security** (Context7).

---

## Tableau de Bord

| Phase | Description | Statut | Progression |
|-------|-------------|--------|-------------|
| 1 | Réponse immédiate | FAIT | 100% |
| 2 | Blocage IPs malveillantes | EN COURS | 0% |
| 3 | Hardening Docker | PLANIFIÉ | 0% |
| 4 | Security Headers Next.js | PLANIFIÉ | 0% |
| 5 | Rate Limiting Nginx | PLANIFIÉ | 0% |
| 6 | Monitoring & Alertes | PLANIFIÉ | 0% |

---

## Phase 1 : Réponse Immédiate

**Statut** : TERMINÉ
**Date** : 15 décembre 2025

### Actions Réalisées

- [x] Détection du cryptominer dans le conteneur
- [x] Arrêt et suppression du conteneur compromis
- [x] Identification des fichiers malveillants (`/app/1L1aFl`, `/app/VLvveomR2`, `/app/ju2J`)
- [x] Identification des connexions C2 (37.114.37.82, 5.255.121.141)
- [x] Redémarrage avec image Docker propre
- [x] Vérification du bon fonctionnement du site
- [x] Documentation de l'incident

### Preuves Collectées

Voir : `docs/security/incident-2025-12-15-cryptominer.md`

---

## Phase 2 : Blocage des IPs Malveillantes

**Statut** : EN COURS
**Priorité** : CRITIQUE

### 2.1 IPs à Bloquer

```bash
# IPs identifiées comme malveillantes
180.172.231.1    # Attaquant principal (exploit POST)
185.16.39.52     # Attaques répétées POST
78.153.140.177   # Scanner .env
37.114.37.82     # Serveur C2/Mining Pool
5.255.121.141    # Serveur C2/Mining Pool
```

### 2.2 Commandes iptables

```bash
# Bloquer les IPs attaquantes
sudo iptables -A INPUT -s 180.172.231.1 -j DROP
sudo iptables -A INPUT -s 185.16.39.52 -j DROP
sudo iptables -A INPUT -s 78.153.140.177 -j DROP

# Bloquer les IPs C2 (entrée ET sortie)
sudo iptables -A INPUT -s 37.114.37.82 -j DROP
sudo iptables -A OUTPUT -d 37.114.37.82 -j DROP
sudo iptables -A INPUT -s 5.255.121.141 -j DROP
sudo iptables -A OUTPUT -d 5.255.121.141 -j DROP

# Sauvegarder les règles
sudo iptables-save > /etc/iptables/rules.v4
```

### 2.3 Configuration Fail2ban

**Fichier** : `/etc/fail2ban/jail.local`

```ini
[DEFAULT]
bantime = 86400
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = ssh
logpath = /var/log/auth.log
maxretry = 3
bantime = 604800

[smartplanning-auth]
enabled = true
port = http,https
filter = smartplanning-auth
logpath = /var/log/nginx/access.log
maxretry = 5
findtime = 300
bantime = 3600

[smartplanning-scan]
enabled = true
port = http,https
filter = smartplanning-scan
logpath = /var/log/nginx/access.log
maxretry = 10
findtime = 60
bantime = 86400

[smartplanning-post-flood]
enabled = true
port = http,https
filter = smartplanning-post
logpath = /var/log/nginx/access.log
maxretry = 30
findtime = 60
bantime = 3600
```

**Fichier** : `/etc/fail2ban/filter.d/smartplanning-auth.conf`

```ini
[Definition]
failregex = ^<HOST> .* "POST /api/auth.* (401|403|500)
            ^<HOST> .* "POST /login.* (401|403|500)
ignoreregex =
```

**Fichier** : `/etc/fail2ban/filter.d/smartplanning-scan.conf`

```ini
[Definition]
failregex = ^<HOST> .* "GET /\.env.*
            ^<HOST> .* "GET /\.git.*
            ^<HOST> .* "GET /wp-.*
            ^<HOST> .* "GET /admin.*\.php
ignoreregex =
```

**Fichier** : `/etc/fail2ban/filter.d/smartplanning-post.conf`

```ini
[Definition]
failregex = ^<HOST> .* "POST / HTTP.* (499|500)
ignoreregex =
```

### 2.4 Checklist

- [ ] Exécuter les commandes iptables sur le VPS
- [ ] Installer fail2ban si non présent
- [ ] Créer les fichiers de configuration fail2ban
- [ ] Redémarrer fail2ban
- [ ] Vérifier que les règles sont actives

---

## Phase 3 : Hardening Docker

**Statut** : PLANIFIÉ
**Priorité** : HAUTE

### 3.1 docker-compose.yml Sécurisé

```yaml
version: "3.8"

services:
  app:
    image: ghcr.io/krismos64/smartplanningai-v2:latest
    container_name: smartplanning-app
    restart: unless-stopped

    # SÉCURITÉ : Filesystem read-only
    read_only: true
    tmpfs:
      - /tmp:mode=1777,size=100M

    # SÉCURITÉ : Pas de nouveaux privilèges
    security_opt:
      - no-new-privileges:true

    # SÉCURITÉ : Supprimer toutes les capabilities
    cap_drop:
      - ALL

    # SÉCURITÉ : Limites de ressources
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 256M

    # SÉCURITÉ : Pas d'accès au réseau host
    network_mode: bridge

    env_file:
      - .env

    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy

    networks:
      - smartplanning

    healthcheck:
      test: ["CMD-SHELL", "wget -q --spider http://127.0.0.1:3000/api/health || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s
```

### 3.2 Dockerfile Sécurisé (Améliorations)

```dockerfile
# Étape runner - Ajouts sécurité
FROM base AS runner

# ... (code existant) ...

# SÉCURITÉ : Supprimer les outils dangereux
RUN rm -rf /usr/bin/wget /usr/bin/curl /bin/sh 2>/dev/null || true

# SÉCURITÉ : Permissions restrictives
RUN chmod -R 500 /app && \
    chmod -R 400 /app/.next && \
    chown -R nextjs:nodejs /app

USER nextjs

# SÉCURITÉ : Variables d'environnement de sécurité
ENV NODE_OPTIONS="--max-old-space-size=512"
```

### 3.3 Checklist

- [ ] Mettre à jour docker-compose.yml avec les options de sécurité
- [ ] Tester le conteneur en mode read-only
- [ ] Vérifier que l'application fonctionne avec les capabilities réduites
- [ ] Documenter les limitations éventuelles

---

## Phase 4 : Security Headers Next.js

**Statut** : PLANIFIÉ
**Priorité** : HAUTE

### 4.1 Configuration next.config.ts

```typescript
// next.config.ts
import type { NextConfig } from 'next'

const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-XSS-Protection',
    value: '0', // Désactivé, CSP est plus efficace
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
]

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}

export default nextConfig
```

### 4.2 Middleware CSP

**Fichier** : `src/middleware.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Générer un nonce unique pour chaque requête
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')

  // Content Security Policy stricte
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic';
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https:;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, ' ').trim()

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set('Content-Security-Policy', cspHeader)

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  })

  response.headers.set('Content-Security-Policy', cspHeader)

  return response
}

export const config = {
  matcher: [
    // Appliquer à toutes les routes sauf assets statiques
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### 4.3 Checklist

- [ ] Ajouter les security headers dans next.config.ts
- [ ] Créer/modifier le middleware CSP
- [ ] Tester que le site fonctionne avec CSP
- [ ] Vérifier les headers avec SecurityHeaders.com
- [ ] Corriger les éventuelles violations CSP

---

## Phase 5 : Rate Limiting Nginx

**Statut** : PLANIFIÉ
**Priorité** : HAUTE

### 5.1 Configuration Nginx

**Fichier** : `/var/www/smartplanning/nginx/nginx.conf`

```nginx
worker_processes auto;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';
    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log warn;

    # Performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # SÉCURITÉ : Cacher la version nginx
    server_tokens off;

    # SÉCURITÉ : Rate limiting zones
    limit_req_zone $binary_remote_addr zone=general:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=api:10m rate=5r/s;
    limit_req_zone $binary_remote_addr zone=auth:10m rate=1r/s;
    limit_conn_zone $binary_remote_addr zone=conn:10m;

    # SÉCURITÉ : Blocage IPs malveillantes
    geo $blocked_ip {
        default 0;
        180.172.231.1 1;
        185.16.39.52 1;
        78.153.140.177 1;
        37.114.37.82 1;
        5.255.121.141 1;
    }

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json application/javascript
               application/rss+xml application/atom+xml image/svg+xml;

    # Upstream
    upstream app {
        server app:3000;
        keepalive 32;
    }

    # HTTP -> HTTPS redirect
    server {
        listen 80;
        server_name smartplanning.fr www.smartplanning.fr;

        # Certbot challenge
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }

        location / {
            return 301 https://$server_name$request_uri;
        }
    }

    # HTTPS Server
    server {
        listen 443 ssl http2;
        server_name smartplanning.fr www.smartplanning.fr;

        # SSL
        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_prefer_server_ciphers on;
        ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 1d;

        # SÉCURITÉ : Bloquer les IPs malveillantes
        if ($blocked_ip) {
            return 444;
        }

        # SÉCURITÉ : Bloquer les user-agents suspects
        if ($http_user_agent ~* (python-urllib|curl|wget|nikto|sqlmap)) {
            return 444;
        }

        # SÉCURITÉ : Rate limiting global
        limit_req zone=general burst=20 nodelay;
        limit_conn conn 20;

        # SÉCURITÉ : Headers de sécurité
        add_header X-Frame-Options "DENY" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "0" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;

        # SÉCURITÉ : Bloquer les fichiers sensibles
        location ~ /\. {
            deny all;
            return 404;
        }

        location ~* \.(env|git|svn|htaccess|htpasswd|ini|log|sh|sql|bak)$ {
            deny all;
            return 404;
        }

        # API avec rate limiting strict
        location /api/ {
            limit_req zone=api burst=10 nodelay;
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Auth avec rate limiting très strict
        location /api/auth/ {
            limit_req zone=auth burst=3 nodelay;
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Application principale
        location / {
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
        }

        # Static assets
        location /_next/static/ {
            proxy_pass http://app;
            proxy_cache_valid 200 365d;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

### 5.2 Checklist

- [ ] Sauvegarder la configuration nginx actuelle
- [ ] Déployer la nouvelle configuration
- [ ] Tester la configuration (`nginx -t`)
- [ ] Recharger nginx
- [ ] Vérifier le rate limiting fonctionne
- [ ] Vérifier que les IPs sont bien bloquées

---

## Phase 6 : Monitoring & Alertes

**Statut** : PLANIFIÉ
**Priorité** : MOYENNE

### 6.1 Script de Monitoring Docker

**Fichier** : `/opt/smartplanning/scripts/monitor-security.sh`

```bash
#!/bin/bash
# Script de monitoring sécurité SmartPlanning
# À exécuter via cron toutes les 5 minutes

CONTAINER="smartplanning-app"
LOG_FILE="/var/log/smartplanning/security.log"
ALERT_EMAIL="admin@smartplanning.fr"

# Créer le répertoire de logs si nécessaire
mkdir -p /var/log/smartplanning

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

alert() {
    log "ALERTE: $1"
    echo "$1" | mail -s "🚨 ALERTE SÉCURITÉ SmartPlanning" "$ALERT_EMAIL" 2>/dev/null
}

# Vérifier que le conteneur existe et tourne
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER}$"; then
    alert "Le conteneur $CONTAINER n'est pas en cours d'exécution!"
    exit 1
fi

# 1. Vérifier les processus suspects
PROCESS_COUNT=$(docker exec "$CONTAINER" ps aux 2>/dev/null | grep -vE "^(USER|nextjs)" | grep -vE "(next-server|ps|sh|node)" | wc -l)
if [ "$PROCESS_COUNT" -gt 0 ]; then
    PROCESSES=$(docker exec "$CONTAINER" ps aux 2>/dev/null)
    alert "Processus suspects détectés dans $CONTAINER:\n$PROCESSES"

    # Action automatique : arrêter le conteneur compromis
    docker stop "$CONTAINER"
    log "Conteneur arrêté automatiquement pour investigation"
fi

# 2. Vérifier les fichiers exécutables dans /app
EXEC_FILES=$(docker exec "$CONTAINER" find /app -maxdepth 1 -type f -executable 2>/dev/null | grep -v "node_modules")
if [ -n "$EXEC_FILES" ]; then
    alert "Fichiers exécutables suspects dans /app:\n$EXEC_FILES"
fi

# 3. Vérifier les connexions réseau suspectes
SUSPICIOUS_CONN=$(docker exec "$CONTAINER" netstat -an 2>/dev/null | grep ESTABLISHED | grep -vE ":(5432|6379|3000)" | grep -v "127.0.0.1")
if [ -n "$SUSPICIOUS_CONN" ]; then
    alert "Connexions réseau suspectes:\n$SUSPICIOUS_CONN"
fi

# 4. Vérifier l'utilisation CPU (>80% = suspect)
CPU_USAGE=$(docker stats "$CONTAINER" --no-stream --format "{{.CPUPerc}}" | tr -d '%')
if [ "${CPU_USAGE%.*}" -gt 80 ]; then
    alert "Utilisation CPU élevée: ${CPU_USAGE}%"
fi

# 5. Vérifier le health status
HEALTH=$(docker inspect --format='{{.State.Health.Status}}' "$CONTAINER" 2>/dev/null)
if [ "$HEALTH" != "healthy" ]; then
    log "WARN: Conteneur pas healthy: $HEALTH"
fi

log "Check de sécurité terminé - OK"
```

### 6.2 Crontab

```cron
# Monitoring sécurité toutes les 5 minutes
*/5 * * * * /opt/smartplanning/scripts/monitor-security.sh

# Rotation des logs quotidienne
0 0 * * * find /var/log/smartplanning -name "*.log" -mtime +30 -delete
```

### 6.3 Checklist

- [ ] Créer le script de monitoring
- [ ] Rendre le script exécutable
- [ ] Configurer le cron
- [ ] Configurer les alertes email (si disponible)
- [ ] Tester le script manuellement
- [ ] Vérifier les logs générés

---

## Historique des Mises à Jour

| Date | Version | Modification |
|------|---------|--------------|
| 15/12/2025 | 1.0 | Création initiale du document |

---

## Ressources

### Documentation Officielle (Context7)

- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [Docker Security](https://docs.docker.com/engine/security/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy)

### Outils Recommandés

- [SecurityHeaders.com](https://securityheaders.com/) - Tester les headers
- [OWASP ZAP](https://www.zaproxy.org/) - Scanner de vulnérabilités
- [Trivy](https://trivy.dev/) - Scanner d'images Docker
- [npm audit](https://docs.npmjs.com/cli/v8/commands/npm-audit) - Audit des dépendances

---

**Document maintenu par** : Équipe SmartPlanning
**Contact sécurité** : admin@smartplanning.fr
