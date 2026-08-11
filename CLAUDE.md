# CLAUDE.md – SmartPlanning V2

SaaS multi-tenant de gestion de plannings et RH. Production : https://smartplanning.fr
Repo : https://github.com/krismos64/SmartplanningAI-V2 · Jira : préfixe `SP-XXX`

Phase actuelle : post-soutenance CDA. Deux objectifs qui se cumulent, convertir
les essais en clients payants, et servir de vitrine technique. Prioriser ce qui
sert l'un des deux.

## Stack

Next.js 15 (App Router) + React 19 + TypeScript strict · Prisma + PostgreSQL 16 + Redis 7
NextAuth v5 · Tailwind + Shadcn/ui + Framer Motion · Stripe (per-seat 2,90 €/employé/mois)
React Email + Nodemailer · Schedule-X (+ patch-package) · Vitest + Playwright

Versions exactes : `package.json`. Modèles et enums : `prisma/schema.prisma`.

## Commandes

```bash
npm run test           # Vitest, single run, pas de flag --run à ajouter
npm run test:e2e:ci    # Playwright, whitelist CI
npm run type-check     # tsc --noEmit
npm run db:migrate     # migrations Prisma
```

Playwright en local : préfixer `PORT=3001` si le port 3000 est pris.

## Où lire le détail

Le détail applicable se charge selon ce que touche le travail. Lire la règle
correspondante **avant** de modifier ces chemins, plutôt que de reconstruire la
convention de mémoire.

| Fichier | Charger avant de toucher |
|---|---|
| `.claude/rules/multi-tenant.md` | Server Action, route API, requête Prisma, auth, choix de destinataires |
| `.claude/rules/prisma-pieges.md` | `'use server'`, backfill, SQL de diagnostic, cache dashboard, Nginx |
| `.claude/rules/seo-content.md` | pages secteur, guides, landing, sitemap, `llms.txt`, texte public |
| `.claude/rules/tests.md` | écriture de tests, et avant de conclure un travail |

Documentation longue : `docs/deployment.md` pour le déploiement,
`docs/database-architecture.md` pour la base.

`docs/journal/` porte l'avancement réel, une entrée par session. **Lire la plus
récente en début de session** donne l'état du projet plus vite que Jira.

## Règles absolues

1. **Git** : JAMAIS de `Co-Authored-By: Claude`. Commits conventionnels (`feat:`, `fix:`, `docs:`, `test:`)
2. **Isolation multi-tenant** : une clause d'isolation n'est jamais conditionnelle. `undefined` dans un `where` Prisma **retire** le filtre, il ne renvoie pas « aucun résultat ». Détail dans `multi-tenant.md`
3. **Tests obligatoires** pour chaque feature, unitaires, plus E2E si l'interface bouge
4. **TypeScript strict** : pas de `any`, validation Zod à toutes les frontières
5. **Accessibilité** : WCAG 2.1 AA, cibles tactiles de 44 px
6. **SEO** : Metadata API, JSON-LD Schema.org
7. **Sécurité** : OWASP, CSRF, sanitization, `.env` jamais commité ni lu
8. **Context7** : consulter pour toute API Next.js 15, React 19, Prisma ou Stripe, ces versions dépassant ma connaissance. Signaler « Via Context7 » quand c'est fait
9. **Jira** : chaque feature = ticket SP-XXX
10. **Rédaction** : jamais de tiret cadratin (—), accents français complets partout

## Patterns

- `CrudActionResult<T>`, `PaginatedResult<T>`, `ServiceResult<T>`
- React Hook Form + Zod pour tous les formulaires
- Barrel exports, imports absolus `@/`
- Optimistic UI avec rollback
- Fire-and-forget (`.catch(console.error)`) pour Stripe, emails, notifications, cache Redis
- Emails : `canSendEmailToUser(userId, category)` avant tout envoi métier. Les emails
  sécurité, RGPD et billing partent toujours. Idempotence billing via `EmailLog`,
  contrainte unique `(subscriptionId, emailType)`
- Redis : `withCache()` en cache-aside, rate limiting `INCR` + `EXPIRE` avec repli
  mémoire si Redis est indisponible. `/api/health` renvoie alors « degraded », pas
  « unhealthy »

## DevOps

Docker + Docker Compose · CI/CD GitHub Actions · VPS OVH (Ubuntu 24.04, Nginx,
Let's Encrypt, Fail2ban, UFW) · Cloudinary (avatars, pièces jointes) · Umami
(analytics RGPD)

Accès VPS par alias SSH : `ssh smartplanning`, clé `~/.ssh/id_ed25519`. Ne jamais
écrire un mot de passe en clair dans la configuration.

Le CD ne se déclenche que si le CI passe entièrement, E2E comprises. Un push sur
une branche sans PR ne déclenche aucun workflow : ouvrir une PR, même en draft,
pour obtenir le retour de la CI.

## Agents projet

- `test-writer` : tests Vitest et Playwright aux conventions du dépôt
- `security-auditor` : revue OWASP, isolation multi-tenant, NextAuth
- `nextjs-architect` : architecture Next.js 15 / React 19 / Prisma
- `docker-devops` : conteneurisation, CI/CD, déploiement VPS

Ces quatre agents sont calibrés sur cette stack précise. Ne pas les invoquer
depuis un autre projet.

## Conduite du travail

Le skill `sprint` porte le cycle complet, du ticket à la clôture. L'utiliser pour
tout travail significatif, ticket SP-XXX ou exploration.

Travailler sans demander de validation à chaque commande, enchaîner librement les
outils à l'intérieur d'une étape. Faire un point à la fin de chaque étape
significative, et proposer la suite plutôt que de l'enchaîner d'office.

Quatre hooks appuient ce cycle : `PreToolUse` bloque la lecture des secrets,
`PostToolUse` rappelle la règle applicable au chemin modifié, et deux hooks
`Stop` avertissent s'il reste du travail non poussé ou de la traçabilité à
clore.

## Vérification avant de conclure

Types, lint et tests concernés au vert, critères d'acceptation vérifiés. **Montrer
la preuve**, sortie de commande à l'appui, ne jamais affirmer que ça marche sans
l'avoir exécuté. Si un test échoue, le dire avec sa sortie.

Pour une zone critique, isolation, autorisation ou paiement, s'ajoute un test
négatif : prouver le refus, pas seulement le chemin nominal.
