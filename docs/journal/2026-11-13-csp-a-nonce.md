# 13 novembre 2026, une CSP à nonce, sans unsafe-inline ni unsafe-eval

| Champ              | Valeur                                                                                                                                                                                                   |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ticket             | SP-598, ouvert le 13 septembre                                                                                                                                                                           |
| Documents produits | `src/lib/security/csp.ts`, `src/lib/security/csp-response.ts`, `src/lib/security/__tests__/csp.test.ts`                                                                                                  |
| Documents modifiés | `src/middleware.ts`, `src/app/layout.tsx`, `next.config.ts`, `vitest.config.ts`, `public/animations/planning-animation.json`, `security-hardening-plan.md`, `prisma-pieges.md`                           |
| Contrôles          | type-check vert, lint 0 erreur, 229 fichiers et 3621 tests verts, couverture 54,24 % de lignes. Navigateur sur build de production : 24 pages, zéro violation. Landing 26 sur 26, auth et RBAC 47 sur 47 |
| Jira               | SP-598 commenté                                                                                                                                                                                          |
| Mémoire            | `ou-en-est-le-projet.md` mise à jour                                                                                                                                                                     |

## Ce qui a été fait

**Mesurer avant de choisir.** Un nonce n'existe que sur une page rendue à la
demande. Or les 24 pages publiques, celles du SEO, étaient statiques. Deux
voies : nonce partout, ou nonce sur l'application seule. Mesure en local sur
un build de production, médiane de 60 requêtes : 1,0 à 1,8 ms en statique,
2,8 à 4,1 ms à la demande. En production, une page arrive en 105 ms réseau
compris. Le surcoût est négligeable : nonce partout, ce qui remplit le
ticket à la lettre.

**Le middleware NextAuth n'est pas remplacé.** Avec `auth(handler)`,
NextAuth exécute le handler au lieu de rediriger quand `authorized` rend
`false`, lu dans `next-auth/lib/index.js`. Notre callback finit par
`return isLoggedIn` : un handler aurait pu laisser passer un visiteur non
connecté. Le middleware est appelé tel quel, puis `applyCsp` ajoute la CSP
et passe le nonce à la requête. Un test traverse le vrai middleware : `/app`
sans session redirige vers `/login`.

**Deux défauts trouvés au navigateur, invisibles autrement.**

- Avec `'strict-dynamic'`, 14 violations sur l'accueil : Next.js 15 émet
  pour `next/dynamic` des `<link rel="preload" as="script">` sans nonce, et
  `'strict-dynamic'` fait ignorer `'self'`. Retiré : la politique est
  `'self'` + nonce + l'hôte d'Umami. Un script inline injecté reste bloqué,
  ce qui est l'objet du ticket.
- Sans `'unsafe-eval'`, une violation sur chaque page de l'application :
  `lottie-web` évaluait par `eval` six expressions After Effects de
  l'animation de l'en-tête. Elles lisaient un calque « Controller » absent du
  fichier et retombaient toujours sur la couleur fixe. Retirées, rendu
  identique, et un test refuse toute expression dans `public/animations/`.

**Après correctif, sur le build de production** : 24 pages publiques et
privées, trois rôles, zéro violation, Umami chargé après consentement.
`unsafe-eval` n'est plus accordé qu'en développement.

**Trois mutations détectées** : la redirection de NextAuth avalée (deux
tests rouges), `unsafe-inline` remis, une expression réintroduite.

**Le test du middleware complet** a demandé `server.deps.inline:
['next-auth']` dans `vitest.config.ts` : `next-auth` importe `next/server`
sans extension, ce que le chargeur ESM de Node refuse hors de Next.

## Les écarts

`style-src` garde `'unsafe-inline'` : les attributs `style` de React et de
Framer Motion ne peuvent pas porter de nonce, et une injection de style
n'exécute pas de code.

Le critère 4 (une session Umami réelle en base) se vérifie en production,
après déploiement.

## Prochaine étape

- Pousser, PR, CI, merge, vérifier l'en-tête servi par `curl -sI`, une
  session Umami réelle en base, puis clore SP-598.
- Ticket ouvert : SP-602.
