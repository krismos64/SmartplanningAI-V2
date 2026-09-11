# 11 septembre 2026, outiller le tunnel et réparer un test rouge depuis trois mois

| Champ | Valeur |
|---|---|
| Tickets | SP-591 (préparation), SP-595 (clos), SP-596 (ouvert) |
| Documents produits | `scripts/ops/read-funnel-steps.sh`, `docs/runbooks/verification-tunnel-sp591.md` |
| Documents modifiés | `scripts/ops/README.md`, `prisma/seed.ts`, `e2e/specs/auth.spec.ts`, `README.md`, `.claude/rules/tests.md` |
| Contrôles | script prouvé par mutation et sur chemin d'erreur, shellcheck sans avertissement, 21 specs auth au vert, 3327 tests unitaires |
| Jira | SP-595 clos, SP-591 complété, SP-596 ouvert sur les vulnérabilités |
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

## L'audit de fin de session

Christophe a demandé un audit complet avant de quitter la session : README,
CLAUDE.md, agents, skills, hooks, journal, mémoire, `docs/` et Jira.

**Neuf écarts documentaires**, tous mineurs : trois compteurs périmés (six
scripts ops pour sept, 36 composants Shadcn pour 41, 360 lignes de règles pour
828), deux dates figées, le journal qui disait les branches non poussées, et
des accents manquants dans deux sections de `.claude/rules/tests.md` dont celle
écrite le matin même. Écrire à côté d'un texte fautif fait recopier sa faute.

**Un vrai sujet est sorti de l'audit**, et il ne relevait pas de la
documentation. `docs/security/vulnerability-fixes-2026-01-05.md` annonçait
« 0 vulnérabilité restante », vrai le 5 janvier et faux depuis :

```
npm audit              55 vulnérabilités,  3 critiques, 26 hautes
npm audit --omit=dev   18 vulnérabilités,  0 critique,  16 hautes
```

Les trois critiques sont dans `vitest` et sa couverture, absents de l'image de
production. La production porte 16 hautes, sur `next-auth`, `nodemailer`,
`postcss`, `prisma` et `xlsx`. Ouvert en **SP-596**. Rien dans la CI ne mesure
ce chiffre, ce qui lui a permis de dériver huit mois sans alerte.

**Deux alertes de l'audit ont été écartées après vérification.** Les trois
routes d'upload contrôlent bien la taille avant traitement, et la mention
« sauvegardes » d'un document de janvier est devenue vraie depuis SP-593.

Le reste est sain, et vérifié par exécution plutôt que par lecture : les six
hooks font ce que CLAUDE.md décrit (testés, dont un test négatif sur le blocage
des secrets), aucune entrée morte dans la whitelist E2E, tous les chemins de la
doc résolvent, les scripts ops du VPS et le compose de production sont
identiques au dépôt, sauvegardes et copie hors site exécutées le matin en
succès, ports fermés, certificats valides, et l'absence de chiffrement au repos
correctement décrite partout.

Deux pièges rencontrés dans l'audit lui-même. Une comparaison de hachages
portait sur un chemin faux : les deux valeurs étaient vides et le test
d'égalité affichait « identique ». Et `src/server/`, signalé comme chemin
absent, l'est volontairement, la phrase disant qu'il n'existe pas. Corriger
sans lire le contexte aurait introduit une erreur.

## Ce qui reste ouvert

- **SP-591 attend son parcours humain**, tout le reste est prêt
- **SP-596**, 16 vulnérabilités hautes sur les dépendances de production
- Le chiffrement au repos n'existe toujours pas, décision d'architecture sans
  ticket
- Le cycle de vie du bucket B2 reste sur « Keep all versions »
- Le connecteur MCP Atlassian tourne sur le transport HTTP+SSE, déprécié depuis
  le 30 juin 2026, à pointer sur `https://mcp.atlassian.com/v1/mcp`
- Le connecteur MCP GitHub échoue faute de `GITHUB_PERSONAL_ACCESS_TOKEN`, non
  bloquant, `gh` est authentifié
