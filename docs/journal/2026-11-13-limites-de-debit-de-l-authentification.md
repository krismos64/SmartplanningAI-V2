# 13 novembre 2026, limites de débit sur la connexion, l'inscription et le mot de passe oublié

| Champ              | Valeur                                                                                                                                                                                                                                                             |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Ticket             | SP-610, ouvert le 2 octobre                                                                                                                                                                                                                                        |
| Documents produits | `src/lib/auth-rate-limit.ts`, `src/lib/actions/__tests__/auth-rate-limit.test.ts`                                                                                                                                                                                  |
| Documents modifiés | `rate-limit.ts`, `auth.ts`, `verification-actions.ts`, `password-actions.ts`, `auth-actions.ts`, `LoginForm.tsx`, `__tests__/setup.ts`, trois fichiers de tests, `CLAUDE.md`, `README.md`, `prisma-pieges.md`, l'agent `security-auditor`                          |
| Contrôles          | type-check vert, lint 0 erreur, 223 fichiers et 3567 tests verts, couverture 53,96 % de lignes et 76,18 % de branches. 22 mutations, toutes détectées. E2E locales (connexion, mot de passe oublié, employés) : 57 vertes. Preuve au navigateur sur le Redis local |
| Jira               | SP-610 commenté                                                                                                                                                                                                                                                    |
| Mémoire            | `ou-en-est-le-projet.md` mise à jour, `tests-unitaires-ecrivaient-dans-redis-local.md` créée                                                                                                                                                                       |

## Ce qui a été fait

**Quatre points d'entrée, pas trois.** Le ticket nommait la connexion,
l'inscription et le mot de passe oublié. La connexion en a deux : le
formulaire appelle d'abord `checkEmailVerificationStatus`, une Server Action
qui compare le mot de passe pour orienter l'affichage, puis `signIn()`, qui
aboutit à `authorizeCredentials`. Plafonner le second seul aurait laissé le
premier servir d'oracle. Les deux passent par le même garde, chacun avec son
compteur : une soumission les traverse tous les deux, un compteur commun
aurait compté chaque erreur de saisie deux fois.

**La connexion ne retient que les échecs.** Chaque tentative est réservée
avant la comparaison du mot de passe (`reserveLoginAttempt`), puis rendue si
elle réussit (`releaseLoginAttempt`). Retenir aussi les réussites aurait
bloqué un bureau entier derrière une même IP, et les E2E qui se connectent
des centaines de fois.

**Trois plafonds, sur un quart d'heure.**

- 10 échecs d'une même IP sur une même adresse. C'est le plafond serré, et il
  est lié à l'IP : un tiers qui s'acharne sur un compte se bloque lui-même
  sans empêcher le titulaire de se connecter depuis chez lui.
- 30 échecs par IP, toutes adresses confondues.
- 50 échecs par adresse, toutes IP confondues, contre une attaque répartie.

L'inscription est plafonnée à 5 par heure et par adresse, 10 par IP. Le mot de
passe oublié à 3 par heure et par adresse, 10 par IP, avec une réponse
identique au-delà.

**Deux corrections venues de la revue de sécurité du commit.** La première
version lisait le plafond puis comptait l'échec après coup : vingt requêtes
simultanées se lisaient toutes sous le plafond. La réservation avant
comparaison ferme cette fenêtre, un test lance 30 tentatives en parallèle et
vérifie que 10 mots de passe seulement sont comparés. La seconde version
faisait avancer les trois compteurs ensemble : une IP déjà bloquée continuait
à remplir le compteur de l'adresse, et suffisait à elle seule à verrouiller le
titulaire depuis partout. Le compteur de l'adresse n'avance plus que si la
paire et l'IP passent. Verrouiller un compte à distance demande désormais au
moins cinq IP.

**Troisième passage de la revue, trois constats.** Une IPv6 désigne un
abonné par son préfixe /64, soit 2^64 adresses : les compteurs par IP se
contournaient en changeant d'adresse. Ils comptent désormais par /64
(`rateLimitSource`). Sur le mot de passe oublié et l'inscription, l'IP est
comptée avant l'adresse : une IP refusée ne peut plus épuiser le quota d'une
adresse qui n'est pas la sienne. Le troisième constat porte sur Nginx et
reste ouvert, voir plus bas.

**L'IP vient de `x-real-ip` seulement.** Nginx écrit cet en-tête depuis
`$remote_addr` (vérifié par `nginx -T` sur le VPS). `x-forwarded-for` est
complété par `$proxy_add_x_forwarded_for`, sa première valeur est donc celle
que le client envoie. `getClientIp`, utilisé par le formulaire de contact,
lisait cette première valeur : n'importe qui changeait de quota à chaque
requête. Corrigé au passage. Sans `x-real-ip` (développement, E2E), la limite
par IP ne s'applique pas, celle par adresse si.

**La fenêtre Redis reculait.** `EXPIRE` était rejoué à chaque appel. Remplacé
par `SET clé 0 EX fenêtre NX` suivi de `INCR`. Mesuré au navigateur sur le
Redis local : TTL de 898 s à la première tentative, 822 s à la douzième.

**Preuve au navigateur.** Dix mots de passe faux donnent « Email ou mot de
passe incorrect », la onzième tentative donne « Trop de tentatives », la
douzième aussi alors qu'elle porte le bon mot de passe. Second passage : trois
échecs puis une réussite, le compteur de la paire est supprimé et celui de
l'adresse revient de 4 à 3.

**Les tests unitaires écrivaient dans le Redis local.** `REDIS_URL` arrive
dans `process.env` depuis `.env` dès qu'un module importe Prisma. Les tests
d'inscription sont passés, puis ont rougi dès que le compteur d'une heure a
atteint le plafond. `__tests__/setup.ts` vide désormais `REDIS_URL` pour toute
la suite. Après `npm run test`, `redis-cli --scan --pattern 'ratelimit:*'` ne
rend plus rien.

## Les écarts

Le ticket proposait une « fenêtre glissante » pour la connexion. La fenêtre
est fixe : elle s'ouvre au premier échec et se ferme un quart d'heure plus
tard. Un attaquant peut donc placer 10 essais en fin de fenêtre et 10 au début
de la suivante. Accepté : 20 essais en rafale restent sans commune mesure avec
les 10 par seconde d'avant.

Le script Lua de `releaseRateLimit` n'est pas couvert par un test unitaire, le
faux client Redis le simule. Il est prouvé au navigateur sur un vrai Redis.

Les plafonds par IP n'ont pas été éprouvés derrière Nginx : en local, aucune
requête ne porte `x-real-ip`. Les tests les couvrent avec des en-têtes forgés.

## Prochaine étape

- **Nginx laisse passer un `X-Real-IP` forgé sur trois blocs.**
  `/_next/static/`, `/_next/image` et le bloc des extensions statiques
  relaient vers l'application sans réécrire cet en-tête, là où les autres
  blocs posent `proxy_set_header X-Real-IP $remote_addr`. Une requête envoyée
  sur un chemin en `.png` porterait donc l'IP de son choix jusqu'à
  l'application. Exploitation non démontrée, correctif d'une ligne par bloc,
  à appliquer sur le VPS avec l'accord de Christophe. Tant qu'il n'est pas
  posé, les plafonds par IP se contournent, celui par adresse tient.
- Le plafond par adresse de la connexion (50 échecs, toutes IP confondues)
  reste un refus sec : un attaquant disposant de cinq sources peut verrouiller
  un compte un quart d'heure. Le lever demanderait un second facteur que seul
  le titulaire passe (lien par email, captcha). Sans ticket.
- Mot de passe oublié : trois demandes d'un tiers suffisent à atteindre le
  plafond d'une adresse pour une heure. Le titulaire a alors dans sa boîte un
  lien valide, le dernier envoyé. Accepté.

- Après déploiement, lire dans le Redis de production une clé
  `ratelimit:login-*:ip:*` pour confirmer que `x-real-ip` arrive bien jusqu'à
  l'application.
- `profile.ts` compare aussi un mot de passe (changement de mot de passe,
  suppression de compte), derrière une session. Non plafonné, sans ticket.
- Le message affiché quand `authorize()` refuse seul reste « Email ou mot de
  passe incorrect ». Le pré-contrôle bloque avant dans le parcours normal.
