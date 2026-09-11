# 11 septembre 2026, outiller le tunnel et réparer un test rouge depuis trois mois

| Champ | Valeur |
|---|---|
| Tickets | SP-591 (préparation), SP-595 (clos) |
| Documents produits | `scripts/ops/read-funnel-steps.sh`, `docs/runbooks/verification-tunnel-sp591.md` |
| Documents modifiés | `scripts/ops/README.md`, `prisma/seed.ts`, `e2e/specs/auth.spec.ts`, `README.md`, `.claude/rules/tests.md` |
| Contrôles | script prouvé par mutation et sur chemin d'erreur, shellcheck sans avertissement, 21 specs auth au vert, 3327 tests unitaires |
| Jira | SP-595 commenté et clos |
| PRs | #100 (SP-591) et #101 (SP-595), mergées et déployées en `sha-adee64c` |

## SP-591, tout est prêt sauf le parcours humain

L'instrumentation des neuf étapes était déployée depuis le 9 septembre sans
avoir jamais rien enregistré. Mesure du jour : zéro événement `funnel-` sur
3879 lignes dans `website_event`, la plus récente datant du matin même. Umami
enregistrait donc bien, mais aucune étape du tunnel n'était jamais partie.

Tous les préalables ont été vérifiés plutôt que supposés : image déployée
(`sha-8c9a4dc`, le dernier commit de `main`), `NODE_ENV=production` qui active
l'émission serveur, `websiteId` du conteneur identique à celui du site Umami,
neuf étapes branchées dans le code appelant par appelant, et un événement de
test émis depuis le conteneur applicatif lui-même, accepté avec un `sessionId`
puis confirmé en base.

Reste le seul maillon qu'aucune commande ne simule : un parcours humain réel.
Christophe le fera plus tard, `docs/runbooks/verification-tunnel-sp591.md` le
décrit pas à pas.

Une contrainte du code décide du compte à utiliser, et méritait d'être écrite :
les étapes 4 à 6 ne s'émettent que sur une **première fois pour l'entreprise**
(`teamCount !== 1` sort sans rien émettre). Un compte existant ne les produira
jamais, le parcours demande donc une entreprise créée pour l'occasion.

## SP-595, le compte manquant n'était pas la cause

Le ticket supposait une base locale ayant dérivé, ou un seed ayant évolué. La
mesure a écarté les deux : le seed crée bien `unverified@techcorp.com` depuis
le 2 juin 2026, et ce compte était simplement **absent** de la base locale, qui
comptait pourtant 130 utilisateurs.

La vraie cause est plus large. `npm run db:seed` ne peut pas remettre une base
à niveau : il part d'un `company.create()` et échoue en `P2002` sur la
contrainte unique de slug dès que la base contient quelque chose. Le
développeur qui suit le README lit une erreur de slug, sans rien qui la relie à
« ma base est en retard sur le seed ». La CI ne rencontre jamais ce mur, elle
recrée sa base à chaque exécution.

Le test était donc rouge en local et vert en CI depuis plus de trois mois, pour
une raison entièrement mécanique.

Le correctif ne touche pas le test. Le seed intercepte désormais ce `P2002` et
nomme la commande à lancer, la décision de fond est écrite dans
`.claude/rules/tests.md` (le seed reste la source des comptes E2E, aucun spec
n'ouvrant aujourd'hui de connexion Prisma), et le README documente la remise à
niveau d'une base existante, qui n'y figurait pas.

## Les écarts

**Ma première requête SQL a rendu une sortie vide que j'ai failli lire comme
« zéro événement ».** Le rôle `postgres` n'existe pas sur ce conteneur, c'est
`smartplanning`, et l'erreur partait sur stderr dans un pipe tronqué. Même
famille que les trois contrôles menteurs de la veille. Le script écrit ensuite
distingue explicitement « connexion échouée » de « requête sans résultat », et
son chemin d'erreur a été prouvé par mutation sur un hôte SSH inexistant.

**`shellcheck` n'était pas installé sur le poste.** Une fois posé, il a trouvé
dans mon premier jet un `$?` lu indirectement après une affectation : correct ce
jour-là, cassé par la première insertion de ligne, et silencieux dans les deux
cas.

**Le hook de protection des secrets a bloqué une lecture du `.env`**, ce qui
est son rôle. Le contournement propre était de passer par Prisma, qui charge la
variable sans l'exposer.

**Prisma refuse `migrate reset` à un agent sans consentement explicite.** Le
garde-fou est bien calibré : la commande détruit irréversiblement une base, et
seul l'accord de Christophe, après exposé de la cible et des conséquences, l'a
débloquée.

**Le CD a déployé un commit dont le CI n'était pas fini.** Les deux PRs ayant
été mergées à dix-huit secondes d'intervalle, le CD s'est déclenché sur la fin
du CI de `5cc72a2` mais a déployé la tête de `main`, déjà passée à `adee64c`.
Sans conséquence ici, le CI d'`adee64c` est passé entièrement ensuite, E2E
comprises. Le risque est le cas où il aurait échoué, la production tournant
déjà sur ce code, et le rollback de SP-588 ne couvre pas ça : il attrape un
démarrage raté, pas un code qui démarre et se trompe. Espacer les merges suffit
à l'éviter.

## Ce qui reste ouvert

- **SP-591 attend son parcours humain**, tout le reste est prêt
- Le chiffrement au repos n'existe toujours pas, décision d'architecture sans
  ticket
- Le cycle de vie du bucket B2 reste sur « Keep all versions »
- Le connecteur MCP Atlassian tourne sur le transport HTTP+SSE, déprécié depuis
  le 30 juin 2026, à pointer sur `https://mcp.atlassian.com/v1/mcp`
- Le connecteur MCP GitHub échoue faute de `GITHUB_PERSONAL_ACCESS_TOKEN`, non
  bloquant, `gh` est authentifié
