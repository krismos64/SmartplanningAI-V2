# ==============================================
# SMARTPLANNING V2 - DOCKERFILE PRODUCTION
# ==============================================
# Image multi-stage optimisée pour la production
# Usage : docker build -f docker/Dockerfile -t smartplanning:latest .
# ==============================================

FROM node:20-alpine AS base

# Installer les dépendances système nécessaires
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# ----------------------------------------------
# ÉTAPE 1 : Installation des dépendances
# ----------------------------------------------
FROM base AS deps

# Copier les fichiers de dépendances
COPY package.json package-lock.json* ./

# Installer UNIQUEMENT les dépendances de production
RUN npm ci --only=production && npm cache clean --force

# Installer aussi les devDependencies pour le build
RUN npm ci

# ----------------------------------------------
# ÉTAPE 2 : Build de l'application
# ----------------------------------------------
FROM base AS builder

WORKDIR /app

# Copier les dépendances
COPY --from=deps /app/node_modules ./node_modules

# Copier le code source
COPY . .

# Générer le Prisma Client
RUN npx prisma generate

# Variables d'environnement pour le build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build de l'application Next.js
RUN npm run build

# ----------------------------------------------
# ÉTAPE 3 : Runner (image finale légère)
# ----------------------------------------------
FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Créer un utilisateur non-root pour la sécurité
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copier les fichiers nécessaires depuis le builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copier le Prisma Client généré
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

# Changer les permissions
RUN chown -R nextjs:nodejs /app

# Passer à l'utilisateur non-root
USER nextjs

# Exposer le port
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Commande de démarrage
CMD ["node", "server.js"]
