# 12 novembre 2026, inscription JULIENNE sur mobile et checklist qui cochait l'étape employés d'office

| Champ              | Valeur                                                                                                            |
| ------------------ | ----------------------------------------------------------------------------------------------------------------- |
| Ticket             | SP-625, ouvert à partir de l'analyse de l'inscription JULIENNE du 11 novembre                                     |
| Documents produits | `src/lib/services/dashboard/onboarding.service.ts`, `__tests__/lib/services/dashboard/onboarding.service.test.ts` |
| Documents modifiés | `src/app/app/director/dashboard/page.tsx`, `OnboardingChecklist.tsx`, `src/lib/services/dashboard/index.ts`       |
| Contrôles          | type-check vert, lint 0 erreur, 220 fichiers et 3524 tests verts, couverture 53,67 % lignes et 76,14 % branches   |
| Jira               | SP-625 créé et commenté                                                                                           |
| Mémoire            | `inscription-julienne-11-novembre.md` créée puis complétée                                                        |

## Ce qui a été fait

**L'inscription.** JULIENNE s'est inscrite le 11 novembre à 22:11 UTC, sur un
téléphone Android, arrivée par Google. 1 min 15 sur `/tarifs`, inscription en
une minute, email vérifié depuis Gmail en 14 secondes. Dans l'app : 1 min 50,
Import 14 s, Équipes 5 s, Plannings 10 s, Profil, retour au tableau de bord.
Aucun employé, aucune équipe, aucun créneau, aucune erreur dans journald. Retour
le 12 à 10:49 UTC, même navigateur, 2 min 30 sur le tableau de bord sans rien
ouvrir.

**Le parcours rejoué en mobile.** Playwright en Pixel 5 (393 px, tactile) sur la
base locale, cookies refusés. Rien ne bloque : inscription, vérification,
connexion et formulaire « Nouveau planning » fonctionnent. La checklist du
tableau de bord affichait en revanche « Ajouter votre premier employé » cochée
dès la première connexion, et le formulaire de planning ne proposait que le
dirigeant lui-même.

**La cause.** `page.tsx` passait `hasEmployee={stats.totalEmployees > 0}`, et
l'inscription crée la fiche employé du dirigeant. Toutes les entreprises sont
concernées, sur ordinateur comme sur mobile.

**Le correctif.** Christophe a choisi de garder le dirigeant compté, puisqu'il
occupe un siège facturé (`subscription-sync.service.ts` compte toutes les fiches
actives). L'étape devient « Ajouter vos employés », avec la mention « Vous
comptez déjà comme premier employé », et ne se coche qu'avec une fiche active
autre que celle du dirigeant, par `countEmployeesBesidesUser`.

**Le piège évité, mesuré.** Un `NOT: { userId }` exclut en SQL les employés sans
compte, précisément ceux que le dirigeant saisit. Sur la base locale, après
ajout d'une employée sans email : 1 avec le `OR` retenu, 0 avec le `NOT`.
L'étape ne se serait jamais cochée. Le test unitaire rougit quand on remet le
`NOT` (preuve par mutation), et le parcours au navigateur passe de 0/4 à 1/4
après l'ajout, étape barrée.

## Les écarts

Le test unitaire vérifie la forme de la requête, pas sa traduction SQL. La
sémantique du `NULL` a donc été prouvée à part, sur la base locale, plutôt que
par un test d'intégration qui aurait introduit une connexion Prisma réelle dans
la suite unitaire.

## Prochaine étape

- **Le prix du dirigeant n'est écrit nulle part.** Ni la FAQ de `/tarifs`, ni le
  simulateur, ni l'écran Facturation ne disent qu'il occupe un siège. Une
  entreprise de 5 employés paie 6 sièges. À trancher par Christophe avant
  d'écrire le texte public.
- Défauts d'affichage mobile relevés, sans ticket : bouton « Télécharger le
  modèle » hors de sa carte sur l'Import, pied de page public fixé dans l'app,
  filtres des Plannings dépliés sur un écran entier, cartes du Profil qui
  débordent de 7 px, compteurs contradictoires sur le tableau de bord (1
  employé actif, 0 au total), « 1 secondes » sur la vérification d'email.
- `EmployeesDataTable` porte un état vide « Ajoutez votre premier employé » qui
  ne s'affiche sans doute jamais, la liste contenant toujours le dirigeant. Non
  vérifié.
- SP-625 non poussé, à grouper en fin de sprint.
