# 7 août 2026, instrumenter le décrochage plutôt que le supposer

| Champ | Valeur |
|---|---|
| Ticket | SP-562, clos |
| Documents produits | `src/lib/billing/trial-engagement.ts`, `src/lib/billing/__tests__/trial-engagement.test.ts`, `src/lib/actions/__tests__/admin-trials.test.ts` |
| Documents modifiés | `admin-trials.ts`, `TrialsAtRiskWidget.tsx`, `__tests__/lib/actions/admin-trials.test.ts` |
| Contrôles | `npm run test` 3110 tests sur 181 fichiers, `npm run type-check` sans sortie, `npm run lint` 0 erreur, 2 mutations vérifiées |
| Jira | SP-562 créé et clos |
| Mémoire | `ou-en-est-le-projet` réécrite, `index-memoire-perime` créée |
| Branche | `feat/instrumentation-decrochage-essais`, commit `2f4f907`, non poussée |

Troisième session de la journée. Elle a commencé sur la relance après
expiration, s'est arrêtée avant la première ligne de code, et a livré autre
chose.

## La mesure a tué le sujet prévu

Le périmètre de la relance post-expiration a été mesuré en production avant
d'écrire quoi que ce soit : 5 entreprises en `EXPIRED`, aucune avec abonnement
Stripe.

| Entreprise | Fin d'essai | Jours écoulés | Employés | Plannings |
|---|---|---|---|---|
| Beynost Evasion | 23/07 | 15 | 10 | 513 |
| Bassin à Bloc | 06/07 | 32 | 4 | 43 |
| SAS ESTEREL GROUP | 30/04 | 99 | 2 | 6 |
| Samba | 24/07 | 14 | 1 | 0 |
| sofreba | 12/06 | 56 | 1 | 0 |

Ces cinq comptes ont vécu leur essai avec les défauts corrigés la veille : le
rappel J-1 qui ne partait pas, et le message « votre abonnement a expiré »
affiché à des directeurs n'ayant jamais souscrit. Christophe a tranché de ne pas
les relancer, la cohorte est abîmée et la mécanique réparée n'a encore jamais
tourné sur un essai complet.

Décision retenue : travailler sur la lecture des essais en cours plutôt que sur
le rattrapage des partis.

## Le widget mesurait le calendrier, pas l'usage

`getTrialsAtRisk` existait depuis SP-473 et classait l'urgence sur le seul
`daysRemaining`. Beynost, avec 513 plannings, et Samba, avec zéro, sortaient
tous deux `critical` s'ils expiraient le même jour. Le fichier s'appelait
« trials at risk » et ne disait rien du risque.

Les trois signaux nécessaires étaient déjà en base. `User.lastLoginAt` est
alimenté depuis `auth.ts:142`, le comptage des plannings passe par la relation
`Company.schedules`, les employés actifs étaient déjà comptés. Aucun champ
ajouté, aucune migration.

Trois états dérivés, et deux règles qui ne vont pas de soi :

Un compte **jamais démarré** ne monte jamais en `critical`, il plafonne à
`warning`. Le relancer sur la fin d'essai ne répond pas à son problème, qui est
l'activation. Un compte **décroché**, qui a produit puis cessé de se connecter,
remonte en `warning` même loin de l'échéance : sans cela il restait invisible
jusqu'à l'expiration, exactement le trou que cette session devait combler.

## Le piège du fichier `'use server'`

La logique de dérivation a d'abord été écrite dans `admin-trials.ts`, qui porte
`'use server'`. Trois exports non-async s'y sont retrouvés, dont une constante
et deux fonctions pures. C'est le défaut qui provoque un 503 en production sans
rien signaler au build.

Sorti dans `src/lib/billing/trial-engagement.ts`, sans dépendance à Prisma ni à
la session, donc testable sans base. Vérification faite après coup : le fichier
Server Action n'exporte plus qu'une interface, effacée à la compilation, et deux
fonctions async.

## Deux tests préexistants ont cassé, à raison

La suite complète a révélé 2 échecs dans `__tests__/lib/actions/admin-trials.test.ts`,
un fichier situé hors de `src/` et donc manqué à la première recherche.

Ses fixtures ne fournissaient ni `schedules` ni `lastLoginAt`. Les comptes
étaient donc lus comme jamais démarrés, et leur urgence plafonnée. Ces tests
exprimaient l'ancienne règle calendaire que le ticket remplace délibérément :
ce n'est pas une régression, c'est le changement de comportement qui se voit.

Deux corrections plutôt qu'une : les fixtures ont été complétées, et le code
durci contre un `_count` absent. Deux cas ont été ajoutés à ce fichier
historique pour qu'il porte la nouvelle règle.

## Les écarts

Le sujet annoncé en début de session, la relance post-expiration, n'a pas été
livré et ne le sera pas. C'est une décision produit, pas un abandon technique.

Le seuil de 7 jours sans connexion est un choix par défaut, sans donnée pour
l'étalonner. Sur un essai de 14 jours, il déclenche tôt. À réviser après
observation des deux essais en cours, qui se terminent les 26 et 27 août.

Aucun test E2E ajouté sur le widget. La whitelist `testMatch` de
`playwright.ci.config.ts` ne contient aucun spec admin dashboard, et l'élargir
allonge chaque exécution de CI. L'arbitrage n'a pas été pris seul.

`MEMORY.md` annonçait le Sprint 17 « jamais démarré » alors que la fiche
détaillée le donnait clos depuis le 9 juillet, 8 PRs mergées. Le sprint a été
proposé deux fois comme travail restant avant que Christophe demande de
vérifier. L'index a été corrigé et une fiche `index-memoire-perime` créée : un
statut d'avancement dans l'index périme silencieusement, il se confirme dans
`git log` ou dans le journal.

## Prochaine étape

La branche `feat/instrumentation-decrochage-essais` porte un commit non poussé.
Il reste à ouvrir la PR, attendre la CI et merger.

Sur la conversion, le levier suivant identifié est le SEO et le GEO, un
quatrième secteur ou un quatrième guide, pour alimenter les essais à venir.
