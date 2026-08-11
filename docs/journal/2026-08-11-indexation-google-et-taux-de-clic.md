# 11 août 2026, la panne d'indexation n'existait pas

| Champ | Valeur |
|---|---|
| Ticket | SP-563, créé pendant la session |
| Documents produits | `(sectors)/solutions/page.tsx`, `(sectors)/solutions/StructuredData.tsx`, `(sectors)/solutions/components/SectorsHubContent.tsx` |
| Documents modifiés | `sitemap.ts`, `sitemap.test.ts`, `LandingHeader.tsx`, `LandingFooter.tsx`, `llms.txt`, `llms-full.txt`, les 3 fichiers secteur, 2 fichiers guide, `hook-rappel-regles.sh`, `seo-content.md`, `README.md` |
| Contrôles | `npm run test` 3111 tests sur 181 fichiers, `npm run type-check` sans sortie, `npm run lint` aucun avertissement sur les fichiers touchés, `npm run build` 78 pages statiques, 1 mutation vérifiée, 4 hooks exécutés |
| Jira | SP-563 créé et commenté avec la référence PR |
| Mémoire | `sp563-hub-solutions-et-ctr` et `umami-sous-compte-le-trafic-search` créées, `ou-en-est-le-projet` réécrite, index corrigé |
| Branche | `fix/hub-solutions-et-ctr-seo`, 4 commits, poussée, **PR #70 ouverte, non mergée** |

Session partie d'une question simple, ajouter une 4e page secteur
améliorerait-il le SEO. La mesure a répondu non, et déplacé le sujet deux fois.

## Umami sous-comptait d'un facteur 40

Première mesure, la base Umami en production : les 6 pages SEO cumulaient 40
pages vues, dont 3 venues d'un moteur de recherche. Conclusion tirée sur ce seul
chiffre, le format ne fonctionne pas.

La Search Console a contredit ça le lendemain matin : **2730 impressions et 71
clics sur 3 mois**. Umami ne voit que les visiteurs qui acceptent le tracking et
n'ont pas de bloqueur, la Search Console voit toutes les impressions Google.
L'écart n'est pas marginal, il inverse le diagnostic.

À retenir : sur une question de visibilité search, Umami ne suffit pas. Il
mesure ce qui arrive sur le site, pas ce que Google montre.

## Le diagnostic d'indexation s'est vidé à la vérification

Le sujet annoncé était la réparation de l'indexation : 13 pages non indexées
contre 11 dans l'index, 2 en 404, 1 bloquée par robots.txt, et une courbe
descendante depuis mai, 48 pages connues alors contre 24 aujourd'hui.

Vérification faite, il n'y a pas de panne :

| Point suspecté | État réel |
|---|---|
| `robots.txt` bloquant | Correct, le motif porte sur une URL privée (`/login`, `/app/`), voulu |
| URL du sitemap en 404 | Les 15 répondent 200 |
| Redirections cassées | www, HTTP et slash final propres, 301 et 308 |
| Désindexation | Conséquence des nettoyages de janvier à mars |

La chute de 48 à 24 pages vient des commits `dd1711e` (18 routes `(dashboard)`),
`1ee82fa` (`/test-datatable`), `8c34764` (`/super-admin`) et `e795e74` (9 routes
de test et dev). Google les a explorées, ne les trouve plus, les sort de
l'index. Des dashboards privés et des pages de test n'avaient rien à faire dans
l'index : leur disparition est saine, pas un incident.

## Les deux défauts réels

**`/solutions` renvoyait 404.** Trois pages secteur vivaient sous ce segment
sans page parente, alors que `/guides` a son hub depuis SP-555. Un 404 sur un
segment parent affaiblit les pages filles au crawl. Personne ne l'avait vu parce
que le sitemap ne déclare que les feuilles.

**Les titres ne donnaient aucune raison de cliquer.** Le chiffre le plus parlant
du lot : la page restauration sort **622 fois sans un seul clic**. Les requêtes
génériques que les pages secteur ciblent sont toutes à 0 clic, « logiciel
planning restauration » 112 impressions, « planning magasin » 79, « planning
restauration » 71. Les seuls clics viennent de la marque, « smart planning » 14
et « smartplanning » 13.

À position 21,4 en moyenne, soit page 2 ou 3, un titre descriptif ne suffit pas.
Les trois pages secteur portent désormais le prix dans le titre, seul élément
différenciant visible dans une SERP à cette position.

Le guide planning d'équipe garde son titre : 1,8 pour cent de CTR, meilleur du
site. Réécrire ce qui marche déjà n'avait pas de sens.

## Le piège du Client Component, déjà documenté et reproduit quand même

Premier jet du hub, `SectorsHubContent` importait `getAllGuides()` pour afficher
le maillage. Le build a montré **14,9 kB de bundle client** contre 4,37 kB pour
`/guides`.

Le commentaire de `LandingHeader.tsx:84` décrit exactement ce piège : importer
le registre depuis un Client Component embarque le texte intégral de chaque
guide. La règle existait, écrite, et a été reproduite malgré tout.

Corrigé en passant slug et titre depuis le Server Component : **4,34 kB**,
aligné sur `/guides`.

## Trois pistes écartées, et pourquoi

Une fois la PR ouverte, trois idées de contenu ont été posées et écartées. Elles
sont consignées ici parce qu'elles reviendront.

**Un article sur la grande distribution.** Il cannibaliserait
`/solutions/planning-commerce`, qui cible déjà « planning magasin », 79
impressions à 0 clic. Deux pages sur le même terrain se disputent les mêmes
requêtes, Google en choisit une et dilue l'autre. La cible ne correspond pas non
plus : un hypermarché emploie 200 à 500 personnes, hors du créneau 5 à 250
annoncé dans `llms.txt`, et l'achat y passe par un appel d'offres, pas par un
essai de 21 jours.

**Publier pour montrer à Google que le site est actif.** La fréquence de
publication n'est pas un facteur de classement hors requêtes d'actualité. Google
mesure la pertinence d'une page pour une requête, pas un score d'activité qui
remonterait les pages voisines. Le seul effet réel est la surface de requêtes
couvertes.

**Republier une date sans toucher au texte.** Détecté et ignoré, et cela dégrade
la confiance dans les `lastmod` du sitemap. La règle du projet impose déjà des
dates réelles de modification.

Ce qui reste après ces trois refus : les liens entrants. C'est le seul levier
qui remonte une position moyenne de 21,4.

## La vérification de config a trouvé un trou

Demandée pendant que la CI tournait, sur `CLAUDE.md`, les agents, le skill, les
hooks et le README.

`hook-rappel-regles.sh` restait **silencieux sur `src/app/robots.ts`**, alors
que son voisin `sitemap.ts` déclenchait un rappel et que ce fichier commande
l'indexation de tout le site. Le trou s'est vu en exécutant le hook sur les huit
chemins réels de la session, pas en le relisant. Ironie du calendrier : c'est le
fichier sur lequel a porté le diagnostic du matin, sans qu'aucun rappel ne se
déclenche.

`seo-content.md` ne citait pas non plus `robots.ts` dans sa liste de chargement.
Les deux sont corrigés, le hook et la règle.

Le reste de la config est sain. Les quatre hooks passent `bash -n`, le blocage
des secrets refuse la lecture d'un `.env` y compris écrit `.ENV`, autorise
l'écriture, et laisse passer `.env.example`. Les compteurs du README avaient
dérivé, 61 pages annoncées contre 63 réelles et 187 composants contre 205.

Un écart signalé sans le corriger : `CLAUDE.md` fait de la doc Confluence une
règle absolue par feature, et aucune entrée de journal n'en cite une. Soit la
règle est morte, soit il manque des pages. Arbitrage à prendre.

## Les écarts

Le sujet annoncé, réparer l'indexation, n'a produit aucune réparation
d'indexation. Ce qui a été livré, c'est un hub manquant et une réécriture de
métas. La mesure a redéfini le travail deux fois dans la même session.

Aucun test E2E ajouté sur le hub. La whitelist `testMatch` de
`playwright.ci.config.ts` ne couvre pas les pages publiques, et l'élargir
allonge chaque exécution. Arbitrage non pris seul, cohérent avec la session du
7 août.

La branche est poussée et la PR #70 ouverte, mais **le merge et le déploiement
ne sont pas faits** : la session s'est arrêtée avec la CI en cours.

## Le déploiement, et trois cycles de CI gâchés

PR #70 mergée en squash, commit `10e7723`, 18 fichiers, 669 insertions.

Vérification par le SHA du conteneur plutôt que par le statut du workflow :
`docker inspect` renvoie `10e7723d5ef8ab949a1c5cc65d0dff7852dd569d`, conteneur
`healthy`. `/solutions` répond 200 après avoir vécu en 404, son JSON-LD porte
bien `CollectionPage` et `ItemList`, et les trois nouveaux titres sont en ligne.
L'étape GHCR, qui avait échoué de façon transitoire le 7 août, est passée du
premier coup.

Le point de méthode de la session : **trois cycles de CI ont été annulés avant
d'aboutir**. GitHub tue le run en cours dès qu'un commit arrive sur la branche,
et trois commits de documentation ont été poussés coup sur coup pendant que la
CI tournait.

```
0bb239c4  in_progress        <- le seul allé au bout
57ea08f0  completed cancelled
60aeb8cb  completed cancelled
8bc1dc4b  completed cancelled
```

Le piège est que `gh pr checks` affiche des checks `pass` pendant que le run se
fait annuler. Ces résultats sont réels quand ils tombent, mais leur run n'ira
jamais au bout : ils ne valident rien. Trois cycles de minutes GitHub Actions
consommés pour rien, à rebours de la règle d'économie du projet.

À retenir : grouper les commits de documentation, et vérifier l'état par
`gh run list` sur le SHA de tête, pas par les checks de la PR.

## Prochaine étape

**Action manuelle à faire dans la Search Console** : resoumettre le sitemap et
demander l'indexation de `/solutions`, URL que Google n'a jamais vue. Ne pas
demander la réindexation des cinq pages aux titres modifiés, elles sont déjà
indexées et le quota quotidien est limité.

Mesure du CTR fin août, sur 28 jours. Les données ont 2 à 3 jours de latence et
un changement de titre met une à deux semaines à se voir. Premier chiffre,
`/solutions/planning-restaurant`, aujourd'hui 0 % sur 622 impressions. Si le
CTR reste nul avec un titre portant le prix, le problème n'est pas le titre.

Le plafond reste la position moyenne de 21,4. Un bon titre à cette position
plafonne autour de 1 à 2 pour cent. Le levier suivant est l'autorité de domaine,
donc des liens entrants, pas plus de contenu.

Deux sujets en attente depuis le 7 août : le seuil de décrochage de sept jours à
étalonner après les essais qui expirent les 26 et 27 août, et la whitelist E2E
qui ne couvre ni le billing ni le dashboard admin.

## Le GEO, vérifié et laissé en l'état

Question posée en fin de session : faut-il changer quelque chose côté GEO.
Vérification faite en production, l'infrastructure tient. `llms.txt` et
`llms-full.txt` répondent 200 et portent le nouveau hub, les sept crawlers LLM
sont autorisés dans `robots.txt`, chaque page publique porte 5 à 6 entrées de
FAQ et sa réponse directe citable.

Le signal mesurable est mince : **2 visites depuis `chatgpt.com`**, la dernière
le 6 août. Et il le restera. Quand un assistant cite une page dans sa réponse,
l'utilisateur lit la réponse sans cliquer : la citation ne laisse aucune trace.
Ces 2 visites comptent les clics, pas les citations. Le GEO ne se prouve donc ni
dans un sens ni dans l'autre avec les outils en place.

Décision : ne rien changer. Le hub `/solutions` livré aujourd'hui est déjà un
gain GEO, son `CollectionPage` plus `ItemList` donnant aux assistants une vue
structurée de la couverture sectorielle. Et la contrainte qui bride le SEO,
l'autorité de domaine, bride aussi le GEO, les assistants s'appuyant sur des
signaux de confiance voisins.

Une piste notée sans être retenue : `llms-full.txt` liste des URL alors que le
format complet embarque le contenu lui-même. Une heure de travail, sans risque
et sans moyen de mesurer l'effet. À faire après le déploiement, pas avant.

Le seul test direct du GEO reste manuel : poser à ChatGPT et Claude la question
du client type, « quel logiciel de planning pour un restaurant en France », et
regarder qui est cité.

## Une fausse alerte levée

Une remarque de la première version de cette entrée annonçait un risque de
contenu dupliqué :
`smartplanning-nouvelle-identite.krismos.chatgpt.site` avait envoyé des vues, la
dernière le 11 août.

Vérification faite, ce domaine répond **401 Sign in required**. C'est un
prototype protégé, pas une copie publique du site. Aucun risque SEO, le point
est clos.
