# 19 septembre 2026, la grille de plannings ne montrait pas l'equipe, et un critere valide a tort

| Champ | Valeur |
|---|---|
| Ticket | SP-601 |
| Documents produits | `__tests__/components/schedules/weekly-grid-employees.test.tsx`, `e2e/specs/schedules/grille-affiche-tous-les-employes.spec.ts`, cette entree |
| Documents modifies | `WeeklyGridView.tsx`, `ScheduleCalendar.tsx`, `ShiftModal.tsx`, `SchedulesPageContent.tsx`, `lib/actions/employees.ts`, `playwright.ci.config.ts` |
| Controles | type-check vert, 203 fichiers et 3346 tests verts, 14 specs E2E plannings vertes, preuve par mutation sur les unitaires et les E2E |
| Jira | SP-601 cree et commente |
| Memoire | `grille-deduite-des-donnees-au-lieu-du-referentiel.md` |

## Le defaut, et pourquoi il etait circulaire

Troisieme et dernier defaut issu de l'inscription « bureau vallee vichy ».

`WeeklyGridView` construisait ses lignes depuis les creneaux et les conges de
la semaine, jamais depuis les employes de l'entreprise. Sans creneau, aucune
ligne ; sans ligne, aucune case ou cliquer pour en creer un. Le seul repli
etait une cellule de texte gris, « Aucun planning cette semaine », sans
action.

Mesure : entreprise de 4 employes actifs, zero creneau, **1 seule ligne de
tableau**. Apres correctif, 4 lignes et 28 cases cliquables.

Le defaut depassait le compte neuf. Pour une entreprise etablie, tout employe
sans creneau sur la semaine consultee etait absent de la grille : impossible
de voir qu'il n'etait pas planifie, impossible de lui en affecter un.

## Ce que le correctif n'a pas coute

Le parent chargeait **deja** les employes au montage, pour le filtre et le
panneau d'heures. Il suffisait de les transmettre : aucun appel reseau
ajoute, donc aucun risque de rejouer SP-582 ou SP-584, qui avaient tous deux
porte sur des appels dupliques de cet ecran.

La deduction historique reste en repli, pour deux cas reels : un employe
devenu inactif qui garde un creneau sur la semaine, et le premier rendu avant
que la liste du parent ne soit chargee.

## Le critere que j'ai failli declarer a tort

Le point de methode de la session, et il vaut d'etre retenu.

Le critere 5 demandait que le filtre par equipe s'applique aux lignes. Premier
test : filtre sur « Core Team », 4 lignes affichees, rien d'anormal a l'oeil.
J'allais le declarer rempli.

Verification en base avant de conclure : **les 4 employes du seed etaient tous
dans « Core Team »**. Le test ne pouvait donc rien distinguer, un filtre
correct et un filtre inexistant donnant le meme resultat.

Apres creation d'une seconde equipe et repartition deux a deux, la mesure a
montre le vrai comportement : 4 lignes affichees pour un filtre de 2
employes. Ma liste ignorait completement les filtres. Corrige en filtrant sur
`teamId`, `employeeId` et la recherche, ce qui a demande d'ajouter `teamId`
au retour de `getEmployeesForSelect`.

C'est la meme famille que `une-mutation-qui-ne-reproduit-pas-le-defaut` : un
controle dont les donnees ne peuvent pas faire echouer le cas teste ne
controle rien. Le jeu de donnees fait partie du test.

## Deux defauts d'accessibilite trouves en chemin

Le harnais m'a fait lire le markup du `ShiftModal`, ou j'ai trouve deux
choses :

- le bouton de retrait d'un employe selectionne n'avait **aucun libelle
  accessible**, il etait muet pour un lecteur d'ecran. Corrige, un
  `aria-label` et un `data-testid`.
- la liste de selection d'employes n'expose **aucun role `checkbox`** : ses
  lignes sont des `div` cliquables dont la case est `aria-hidden="true"`.
  Difficilement utilisable au clavier. Prealable a ce ticket, signale dans
  SP-601, non corrige : cela merite son propre ticket.

Le second a ete decouvert parce qu'une assertion de test echouait sur
`getByRole('checkbox')`. Un test qui rougit pour la mauvaise raison reste une
information.

## Ce qui reste ouvert

- **Le role `checkbox` manquant** dans la liste du `ShiftModal`, decrit
  ci-dessus. Sans ticket a ce jour.
- **Le critere 3 de SP-601** est tenu par construction et par un test negatif
  existant, mais je n'ai pas ajoute de test cross-tenant dedie :
  `getEmployeesForSelect` n'a pas vu sa logique d'isolation modifiee.
- **Le critere 5 de SP-600**, les autres ecrans denses, toujours non mesure.
- Les cases « + » n'apparaissent qu'au survol. C'est discret pour un premier
  usage, a revoir si la mesure montre que la creation reste rare.
- Trois branches non poussees : SP-599, SP-600, SP-601, cette derniere basee
  sur SP-600.

## Le bilan des deux sessions

Une inscription de production analysee a livre trois defauts, tous mesures,
aucun visible depuis le code seul ni attrape par un test existant :

1. **SP-599**, fil d'Ariane vers des routes inexistantes, 29 erreurs 404
2. **SP-600**, consentement recouvrant 89 pour cent de la grille et absorbant
   les clics
3. **SP-601**, grille ne montrant jamais l'equipe

Les trois se sont empiles sur le meme ecran, pour le meme utilisateur, qui
est reparti sans creer un seul creneau.
