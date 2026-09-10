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

| Fichier                          | Charger avant de toucher                                               |
| -------------------------------- | ---------------------------------------------------------------------- |
| `.claude/rules/multi-tenant.md`  | Server Action, route API, requête Prisma, auth, choix de destinataires |
| `.claude/rules/prisma-pieges.md` | `'use server'`, backfill, SQL de diagnostic, cache dashboard, envoi d'emails, Nginx, workflow CD, script de `scripts/ops/`, manipulation de fichier vers un conteneur |
| `.claude/rules/seo-content.md`   | pages secteur, guides, landing, sitemap, `llms.txt` et la route `llms-full.txt`, texte public |
| `.claude/rules/tests.md`         | écriture de tests, et avant de conclure un travail                     |

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
- Fire-and-forget (`.catch(console.error)`) pour Stripe, emails, notifications, cache Redis.
  **Exception** : il devient un défaut dès que l'appel écrit sur une ligne que la
  transaction qui suit va modifier ou supprimer, les deux écritures entrant en
  conflit. C'est ce qui faisait échouer `deleteAccount` en `P2034` (SP-580) :
  dans ce cas, awaiter avant d'ouvrir la transaction
- Emails : `canSendEmailToUser(userId, category)` avant tout envoi métier. Un envoi
  accepté par le relais n'est pas délivré pour autant : `EmailResult.outcome`
  distingue `SENT`, `BOUNCED` et `FAILED`, et le cron `/api/cron/bounce-sync`
  relève la boîte pour capter les refus asynchrones. Pièges dans `prisma-pieges.md`.
  Les emails sécurité, RGPD et billing partent toujours. Idempotence billing via
  `EmailLog`, contrainte unique `(subscriptionId, emailType)`
- Redis : `withCache()` en cache-aside, rate limiting `INCR` + `EXPIRE` avec repli
  mémoire si Redis est indisponible. `/api/health` renvoie alors « degraded », pas
  « unhealthy »
- Analytics : le tunnel de conversion (SP-591) a deux chemins. Les étapes du
  navigateur passent par `useUmamiTrack`, conditionné au consentement. Les
  étapes serveur, en Server Action ou webhook, passent par
  `funnel-analytics.service.ts` et n'émettent **aucune donnée personnelle**,
  ce qui les rend licites sans consentement. Ajouter un champ à
  `FunnelEventData` demande de vérifier qu'il n'identifie ni une personne ni
  une entreprise. Piège du User-Agent dans `prisma-pieges.md`.
  **Les deux chemins ne sont pas sur la même échelle** : mesure du 10 septembre
  2026, Nginx comptait 401 requêtes et 86 visiteurs quand Umami enregistrait
  zéro session, la quasi-totalité des visiteurs refusant le consentement.
  Diviser une étape serveur par une étape navigateur donne donc un taux
  faussement excellent. Comparer les étapes 4 à 9 entre elles, ou suivre une
  étape dans le temps. Détail dans `docs/analytics.md`

## DevOps

Docker + Docker Compose · CI/CD GitHub Actions · VPS OVH (Ubuntu 24.04, Nginx,
Let's Encrypt, Fail2ban, UFW) · Cloudinary (avatars, pièces jointes) · Umami
(analytics RGPD)

Accès VPS par alias SSH : `ssh smartplanning`, clé `~/.ssh/id_ed25519`. Ne jamais
écrire un mot de passe en clair dans la configuration.

**Le VPS héberge un second projet depuis septembre 2026**, la boutique Lune &
Soleil, avec son propre bloc Nginx et son port. Ne plus supposer que tout ce qui
tourne sur cette machine appartient à SmartPlanning.

**UFW ne filtre pas les ports publiés par Docker**, qui écrit ses règles en amont
de sa chaîne : un port peut répondre depuis Internet alors qu'`ufw status` le dit
fermé. Tout port qui n'a pas à être joignable de l'extérieur se publie en
`127.0.0.1:` et se vérifie depuis une autre machine, jamais depuis le VPS. C'est
SP-583, règle dans `prisma-pieges.md`. Rien ne l'impose mécaniquement, la chaîne
`DOCKER-USER` étant vide : `scripts/ops/check-public-ports.sh` le surveille en
cron quotidien depuis SP-587.

`scripts/ops/` porte six scripts de production, tous décrits dans son README :
surveillance TLS et ports, sauvegarde de la base, sa copie hors site et son
test de restauration, et le test hors ligne du script de déploiement.

Le CD ne synchronise que `docker-compose.prod.yml`. **Umami tourne depuis
`/home/deploy/umami/docker-compose.yml`, hors du dépôt** : toute correction le
concernant s'applique à la main sur le VPS.

Le CD ne se déclenche que si le CI passe entièrement, E2E comprises. Un push sur
une branche sans PR ne déclenche aucun workflow : ouvrir une PR, même en draft,
pour obtenir le retour de la CI.

**Un déploiement en échec est désormais rouge, et la production restaurée**
(SP-588). Le healthcheck sort en code 1 après 150 secondes sans réponse, après
avoir remis l'image précédente et vérifié qu'elle répond. Avant, le script
écrivait « Déploiement terminé (avec warnings) » et le job réussissait. Le
déploiement vise `sha-<commit court>`, exposé en sortie du job `build` plutôt
que reconstruit, et une clause `concurrency` sérialise les déploiements.
**Le rollback restaure le code, jamais le schéma** : une migration destructive
se découpe en expand puis contract. Comportement couvert hors ligne par
`scripts/ops/test-cd-rollback.sh`.

**La base est sauvegardée depuis SP-593, elle ne l'était pas avant.**
`scripts/ops/backup-database.sh` tourne chaque nuit à 03:20 UTC par
`smartplanning-backup.timer`, chiffre en AES256 et conserve 30 jours.
`test-backup-restore.sh` est son pendant obligatoire, une sauvegarde jamais
restaurée ne prouvant rien : le lancer avant toute migration risquée. Procédure
complète dans `docs/deployment.md`.

**Depuis SP-594, une copie part hors du VPS chaque nuit à 04:10 UTC**, vers
Backblaze B2, par `sync-backups-offsite.sh` et `smartplanning-backup-offsite.timer`.
Fournisseur volontairement distinct d'OVH : un stockage objet OVH aurait couvert
le disque mort, pas la panne du fournisseur. L'envoi est vérifié taille et SHA-1
relus depuis B2, et le script refuse une archive de plus de 48 h, sinon un
hors-site paraîtrait sain alors que la sauvegarde locale a cessé. Restauration
prouvée sur une machine autre que le VPS le 10 septembre 2026.

La clé de chiffrement vit dans le gestionnaire de mots de passe et sur le poste
de développement, jamais uniquement sur le VPS : une clé rangée à côté de ce
qu'elle protège ne protège rien. Sans elle, les archives sont illisibles, y
compris pour nous.

Il n'y a en revanche **aucun chiffrement des données au repos** sur le disque du
VPS (`ext4` nu, aucun volume LUKS), l'affirmation a été retirée de la politique
de confidentialité, et le sujet reste une décision d'architecture sans ticket.

**Le DNS du domaine vit chez Hostinger, le serveur chez OVH.** Devant une erreur
de certificat, comparer les deux points de vue avant de toucher à certbot :
`certbot certificates` lit le disque du VPS, `openssl s_client` interroge ce qui
est réellement servi. S'ils divergent, le trafic n'atteint pas le VPS et le
problème est dans la zone DNS. `dig +short smartplanning.fr A` doit renvoyer
`51.77.146.72`. C'est la panne du 18 août 2026, détaillée dans
`docs/deployment.md`. Surveillance : `scripts/ops/check-tls-expiry.sh`.

Pour dater une panne, lire `/var/log/nginx/access.log*`. La date d'expiration
d'un certificat dit quand il a cessé d'être valide, jamais depuis quand il est
servi.

## Agents projet

- `test-writer` : tests Vitest et Playwright aux conventions du dépôt
- `security-auditor` : revue OWASP, isolation multi-tenant, NextAuth
- `nextjs-architect` : architecture Next.js 15 / React 19 / Prisma
- `docker-devops` : conteneurisation, CI/CD, déploiement VPS
- `public-content-reviewer` : relecture d'une page publique rendue, contraste
  mesuré, structure GEO

Ces cinq agents sont calibrés sur cette stack précise. Ne pas les invoquer
depuis un autre projet.

## Conduite du travail

Le skill `sprint` porte le cycle complet, du ticket à la clôture. L'utiliser pour
tout travail significatif, ticket SP-XXX ou exploration. Le skill `revue-pre-pr`
s'intercale entre la vérification et le push : il balaie ce que type-check, lint
et les tests ne voient pas, sans les remplacer.

Travailler sans demander de validation à chaque commande, enchaîner librement les
outils à l'intérieur d'une étape. Faire un point à la fin de chaque étape
significative, et proposer la suite plutôt que de l'enchaîner d'office.

Six hooks appuient ce cycle. `SessionStart` pose l'état de départ, branche,
working tree, derniers commits et dernière entrée de journal, sans qu'il soit
besoin de le demander. `PreToolUse` bloque la lecture des secrets. Deux
`PostToolUse` se partagent l'écriture : l'un rappelle la règle applicable au
chemin modifié, l'autre vérifie mécaniquement deux pièges que rien d'autre ne
voit, un spec absent de la whitelist E2E et un export non-async dans un fichier
`'use server'`. Deux `Stop` avertissent s'il reste du travail non poussé ou de
la traçabilité à clore.

## Vérification avant de conclure

Types, lint et tests concernés au vert, critères d'acceptation vérifiés. **Montrer
la preuve**, sortie de commande à l'appui, ne jamais affirmer que ça marche sans
l'avoir exécuté. Si un test échoue, le dire avec sa sortie.

Pour une zone critique, isolation, autorisation ou paiement, s'ajoute un test
négatif : prouver le refus, pas seulement le chemin nominal.

Sur une page publique, l'accessibilité se vérifie avec axe-core, jamais avec un
calcul de contraste écrit pour l'occasion : celui-ci ignore les opacités et ne
voit aucun défaut de structure. `npx playwright test e2e/specs/landing/`, ces
specs ne sont pas dans la whitelist CI.

Ne jamais lancer `npm run build` pendant qu'un serveur de dev tourne : les deux
se disputent `.next` et la page servie part en 500, ce qui ressemble à s'y
méprendre à une régression du code. Et un audit lancé contre un serveur de
production démarré avant la dernière modification teste l'ancien build : couper,
rebâtir, relancer, sinon le verdict porte sur autre chose que ce qu'on croit.
