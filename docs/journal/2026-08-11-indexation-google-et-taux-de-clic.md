# 11 août 2026, la panne d'indexation n'existait pas

| Champ | Valeur |
|---|---|
| Ticket | SP-563, créé pendant la session |
| Documents produits | `(sectors)/solutions/page.tsx`, `(sectors)/solutions/StructuredData.tsx`, `(sectors)/solutions/components/SectorsHubContent.tsx` |
| Documents modifiés | `sitemap.ts`, `sitemap.test.ts`, `LandingHeader.tsx`, `LandingFooter.tsx`, `llms.txt`, `llms-full.txt`, les 3 fichiers secteur, 2 fichiers guide |
| Contrôles | `npm run test` 3111 tests sur 181 fichiers, `npm run type-check` sans sortie, `npm run lint` aucun avertissement sur les fichiers touchés, `npm run build` 78 pages statiques, 1 mutation vérifiée |
| Jira | SP-563 créé |
| Mémoire | `ou-en-est-le-projet` à réécrire en fin de session |
| Branche | `fix/hub-solutions-et-ctr-seo`, commits `7f701e6` et `5139847`, non poussée |

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

## Les écarts

Le sujet annoncé, réparer l'indexation, n'a produit aucune réparation
d'indexation. Ce qui a été livré, c'est un hub manquant et une réécriture de
métas. La mesure a redéfini le travail deux fois dans la même session.

Aucun test E2E ajouté sur le hub. La whitelist `testMatch` de
`playwright.ci.config.ts` ne couvre pas les pages publiques, et l'élargir
allonge chaque exécution. Arbitrage non pris seul, cohérent avec la session du
7 août.

Le déploiement n'est pas fait, la branche n'est pas poussée.

## Prochaine étape

Pousser, ouvrir la PR, attendre la CI, merger et déployer. L'effet sur le CTR se
mesure ensuite dans 2 à 3 semaines en Search Console, sur les mêmes requêtes.

Le plafond reste la position moyenne de 21,4. Un bon titre à cette position
plafonne autour de 1 à 2 pour cent. Le levier suivant est l'autorité de domaine,
donc des liens entrants, pas plus de contenu.

Deux sujets en attente depuis le 7 août : le seuil de décrochage de sept jours à
étalonner après les essais qui expirent les 26 et 27 août, et la whitelist E2E
qui ne couvre ni le billing ni le dashboard admin.

Point à vérifier au passage, repéré dans les données Umami :
`smartplanning-nouvelle-identite.krismos.chatgpt.site` a envoyé 4 vues. Si ce
domaine expose une copie du site, c'est du contenu dupliqué.
