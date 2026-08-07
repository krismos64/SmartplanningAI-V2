# 7 août 2026, la configuration passe au chargement conditionnel et le journal repart

| Champ | Valeur |
|---|---|
| Ticket | Aucun, travail d'outillage rattaché à la clôture du sprint 20 |
| Documents produits | `.claude/` complet (règles, hooks, skill, README), `docs/journal/` |
| Documents modifiés | `CLAUDE.md`, `README.md`, `.gitignore`, mémoire projet |
| Contrôles | CI verte 4 jobs sur PR #66 puis sur `main`, CD vert, production en 200 |
| Jira | Aucun ticket créé, travail hors périmètre fonctionnel |
| Mémoire | 2 fiches créées, 3 réécrites, `MEMORY.md` réduit de 60 % |

Aucune ligne de code applicatif. La session portait sur l'outillage, après le
constat que la configuration du projet était en retard sur celle de lune-soleil.

## Le contexte chargé à chaque session était payé pour rien

`CLAUDE.md` portait 131 lignes lues intégralement à chaque démarrage, y compris
quand le travail ne touchait qu'un domaine. Le détail part dans `.claude/rules/`,
quatre fichiers d'environ 360 lignes chargés selon les chemins modifiés :
isolation multi-tenant, pièges Prisma et production, contenu public, tests.

Le découpage crée un trou : modifier une zone sensible sans avoir lu la règle.
Un hook `PostToolUse` le ferme en rappelant la règle applicable au fichier écrit,
et reste silencieux sur les chemins sans enjeu.

## Trois failles de sécurité trouvées après le premier commit

Une revue automatique a signalé trois défauts dans le hook de blocage des
secrets. Reproduits avant correction, ils étaient fondés : **sept chemins
passaient au travers**.

La cause tient à une erreur d'appréciation de l'environnement. Les motifs étaient
sensibles à la casse alors que macOS monte par défaut un système de fichiers qui
ne l'est pas : `.ENV` et `.env` désignent le même fichier, et le blocage se
contournait en changeant une lettre. La couverture était aussi incomplète, ni
`.crt`, ni `id_ecdsa`, ni `.npmrc`, ni `~/.aws/`.

Les neuf tests initiaux portaient tous sur des noms en minuscules. Ils validaient
un cas trop étroit, et la protection a été présentée comme vérifiée alors qu'elle
ne l'était pas. La correction est testée sur dix-huit cas, non-régression
comprise sur l'écriture dans un `.env` et sur `.env.example`.

## Le journal précédent avait cessé d'être tenu depuis trois mois

`development-log.md` s'arrêtait au 12 mai 2026. Les cent six commits suivants,
dont tout le travail SEO/GEO de juillet et les sprints 19 et 20, n'y figuraient
pas. Il portait aussi sept sections en double.

La cause est structurelle plutôt que personnelle : à 1316 lignes dans un fichier
unique, chaque ajout se fait au même endroit et la relecture coûte trop cher pour
être faite. Le fichier est archivé tel quel, `docs/journal/` le remplace à raison
d'une entrée par session.

Trois documents périmés supprimés, récupérables via git : le cahier de recettage
écrit pour le diplôme CDA validé en avril et pointant vers un dépôt inexistant,
les tests E2E mobile figés au 5 février, le rapport de seed du 28 février que
rien ne référençait.

## Le dépôt est public, contrairement à ce qui avait été affirmé

Une vérification tardive l'a établi. La décision de versionner la configuration
tient quand même, mais pour une autre raison que celle avancée d'abord : le
contenu a été scanné sans secret, sans identifiant, sans IP et sans concurrent
nommé. `.agents/product-marketing.md` reste ignoré, il porte la mention « interne
uniquement » et nomme six concurrents avec des prix non vérifiés.

## Ce qui ferme la boucle

Un quatrième hook vérifie en fin de session qu'une journée avec commits laisse
une entrée de journal, et rappelle les clés `SP-XXX` citées dans les commits. Il
ne consulte pas l'API Jira : cela exigerait un jeton en `.env`, donc un secret de
plus sur un dépôt public, lu par le hook qui bloque justement la lecture des
`.env`.

Cette entrée existe parce que ce hook l'a réclamée.

## Prochaine étape

Aucun travail en cours. Trois pistes, la conversion des essais en clients payants
qui reste l'objectif de la phase et n'a rien d'engagé, le backlog admin v2
(SP-539 à SP-546) jamais démarré, un quatrième secteur ou guide côté SEO.
