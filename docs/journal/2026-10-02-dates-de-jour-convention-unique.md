# 2 octobre 2026, une seule convention pour les dates de jour, 33 lignes converties en production et les lectures alignées

| Champ              | Valeur                                                                                                                                                              |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ticket             | SP-609, trois étapes                                                                                                                                                |
| Documents produits | `src/lib/utils/__tests__/calendar-day.test.ts`, cette entrée                                                                                                        |
| Documents modifiés | `schedule-date.ts`, `recurrence.ts`, `leave-utils.ts`, `schedules.ts`, `leaves.ts`, `availabilities.ts`, quatre fichiers de tests, `.claude/rules/prisma-pieges.md` |
| Contrôles          | Vitest 3430/3430 sous `TZ=UTC` et `TZ=Europe/Paris`, type-check propre, lint sans erreur, couverture 53,24 % des lignes. CI et CD verts (PR #112)                   |
| Jira               | SP-609 créé et commenté à chaque étape                                                                                                                              |
| Mémoire            | fiche d'état du projet réécrite                                                                                                                                     |

## Ce qui a été fait

En production, 1013 créneaux : 985 à 00:00 UTC, 16 à 22:00 UTC, 12 à une heure
quelconque. Aucune écriture ne normalisait la date reçue du navigateur :
minuit Paris depuis un calendrier, heure courante depuis le bouton « Nouveau
créneau », instant réel depuis le glisser-déposer de Schedule-X. Six gardes de
nuit de SAS ESTEREL portent une date de fin au lendemain, qu'il fallait
préserver.

Le serveur tourne en UTC, et quatre calculs se trompaient de jour : une
récurrence partant d'un jour cliqué démarrait la veille (`startOfDay` de
date-fns), un congé lundi-vendredi saisi au calendrier comptait 4 jours
ouvrés (`setHours` puis `getDay`), un congé du 1er janvier était débité sur le
solde de l'année précédente (`getFullYear`), et la détection de conflits
bornait la journée sur la veille.

Convention retenue : 00:00 UTC du jour calendaire à Paris, déjà la forme de
97 % des lignes. `toCalendarDay()` s'applique juste après la validation Zod
de chaque écriture de créneau, de congé et d'indisponibilité. Récurrence,
jours ouvrés, année du solde et bornes des quatre détections de conflits
raisonnent ensuite en UTC pur.

Les tests de dates tournent sous les deux fuseaux de processus. Ceux de la
récurrence et des jours ouvrés échouaient sur l'ancien code sous `TZ=UTC` et
passaient en heure de Paris : c'est ce qui rendait ces défauts invisibles en
développement. Ceux des actions sont prouvés par mutation.

Conversion des données le jour même, après déploiement : mesure en lecture
seule, essai à blanc dans une transaction annulée, sauvegarde et restauration
vérifiée, export des 33 anciennes valeurs dans
`/home/deploy/sp609-valeurs-avant-conversion.csv`, puis `UPDATE` dans un bloc
qui annulait tout si les compteurs différaient de 28, 5 et 0. Ils étaient
exacts. Le créneau du dimanche 4 octobre de SARL PROMO SERVICE DIFFUSION est
bien sur le dimanche.

Étape 3, les lectures. Le service de base des tableaux de bord calculait
semaine, mois et année avec les méthodes locales de `Date` : justes en
production par coïncidence, fausses entre minuit et 2 heures à Paris, et
fausses en développement. « Absents aujourd'hui » du manager montrait la
veille dans ce créneau. Côté employé, « à venir » et « prochain créneau »
comparaient `startDate` à l'instant présent : stocké à 00:00 UTC, le créneau
du jour disparaissait dès minuit même s'il commençait à 18:00. Il compte
désormais jusqu'à son heure de début, comparée à l'heure de Paris.

Les exports PDF et Excel recevaient la semaine en heure de Paris (lundi
minuit, soit 22:00 UTC le dimanche) : le PDF commençait ses colonnes un
dimanche. Et un repos déplacé par glisser-déposer, rendu par Schedule-X en
date sans heure, prenait 01:00 ou 02:00 comme heure de début. La conversion
d'événement est sortie dans `schedule-x-event.ts` pour être testable.

Chaque correctif a son test sous les deux fuseaux, prouvé par mutation. Les
tests du service de base lisaient leurs résultats avec `getHours` et
`getDate` : ils figeaient l'ancien comportement, et lisent désormais en UTC.

## Les écarts

La carte du code a élargi le périmètre aux congés et aux indisponibilités : ne
convertir que les créneaux aurait aggravé la détection de conflits avec les
congés, dont le dernier jour n'aurait plus été vu.

Les soldes de congés n'avaient pas besoin d'être corrigés. Les 15 congés en
base appartiennent à Distri Shop, dont les lignes, colonne `days` comprise,
viennent du script `seed-distrishop-v2.sql`.

En local, le lot E2E plannings et congés échoue à chaque exécution sur un spec
différent, sur `main` comme sur la branche, alors que chaque spec passe seul.
Instabilité de l'environnement local, laissée de côté. La CI était verte.

## Prochaine étape

- Un glisser-déposer d'une garde de nuit renvoie une date de fin égale à la
  date de début : Schedule-X affiche ces gardes sur un seul jour. Défaut
  antérieur à SP-609, non traité
- L'heure de génération imprimée sur le PDF est celle du serveur (UTC)
- Le lot E2E local instable, à diagnostiquer par `error-context.md`
