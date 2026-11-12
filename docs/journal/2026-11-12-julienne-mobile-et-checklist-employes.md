# 12 novembre 2026, inscription JULIENNE sur mobile et checklist qui cochait l'étape employés d'office

| Champ              | Valeur                                                                                                                                                                                                                                  |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ticket             | SP-625 et SP-626, ouverts à partir de l'analyse de l'inscription JULIENNE du 11 novembre                                                                                                                                                |
| Documents produits | `src/lib/services/dashboard/onboarding.service.ts`, `__tests__/lib/services/dashboard/onboarding.service.test.ts`, `src/app/(about)/tarifs/__tests__/pricing-faqs.test.ts`                                                              |
| Documents modifiés | `src/app/app/director/dashboard/page.tsx`, `OnboardingChecklist.tsx`, `src/lib/services/dashboard/index.ts`, `tarifs/StructuredData.tsx`, `PricingSimulator.tsx`, `llms-full.content.ts`, `UsageIndicator.tsx`, `page-last-modified.ts` |
| Contrôles          | Après SP-626 : type-check vert, lint 0 erreur, 221 fichiers et 3527 tests verts, couverture 53,86 % lignes et 76,15 % branches, 26 specs `e2e/specs/landing/` vertes dont axe-core sur `/tarifs`                                        |
| Jira               | SP-625 et SP-626 créés, commentés et clos, SP-627 créé (défauts mobiles et lien `/docs`)                                                                                                                                                |
| Mémoire            | `inscription-julienne-11-novembre.md` créée puis complétée                                                                                                                                                                              |

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

**Le siège du dirigeant, SP-626.** Ni `/tarifs`, ni le simulateur, ni l'écran
Facturation ne disaient que le dirigeant occupe un siège : une équipe de 5
salariés simulée à 5 en paie 6. Christophe a choisi de garder ce modèle et de
l'écrire. La règle figure désormais dans une question de FAQ (reprise par le
JSON-LD `FAQPage`, vérifié dans le HTML servi), sous le curseur du simulateur
(page tarifs et accueil), dans `llms-full.txt` et sur l'indicateur
d'utilisation de la Facturation. Deux garde-fous de test, la FAQ et
`llms-full`, puisqu'une phrase supprimée ne casserait rien d'autre.

**La CI rouge sans rapport avec le diff.** La PR #119 a échoué sur les E2E
avant le premier test : `ubuntu-latest` est passé à Ubuntu 26.04 (image
`ubuntu26/20261101`), où Playwright 1.57 refuse d'installer Chromium. La
suite de nuit sur `main` était rouge pour la même raison depuis le
6 novembre, verte le 5, sans que personne le voie. Les trois workflows (CI,
nuit, CD) sont épinglés sur `ubuntu-24.04` par `4084f7a`. Le run suivant est
passé au vert sur ses quatre jobs.

**Déploiement.** PR #119 mergée (`ddd37e3`), CI de `main` verte (run
43275146334), CD vert (run 43276816276). Image `sha-ddd37e3` démarrée à
18:19 UTC. En production : la question de FAQ et la ligne du simulateur sont
servies sur `/tarifs`, la règle figure dans `llms-full.txt`, aucune erreur
dans journald sur les dix minutes suivantes. La checklist n'a pas été revue
sur un vrai compte de production.

**JULIENNE revient après le déploiement.** Reconnexion à 19:30 UTC, sur un
ordinateur Windows cette fois, 8 minutes. Le lien « Ajouter » de la checklist
vers `/app/dashboard/employees/new` est préchargé : l'étape s'affiche bien
ouverte en production. Il ouvre la liste des employés et sa propre fiche,
Paramètres > Entreprise trois fois sans rien enregistrer (`updatedAt`
inchangé, aucun audit), Plannings trois fois. Toujours aucun employé, équipe
ni créneau. À 19:33:52, un clic depuis le tableau de bord mène à `/docs`, qui
répond 404 : le lien « Documentation » du pied de page de l'app
(`Footer.tsx:87`) et la palette de commandes pointent vers une route qui
n'existe pas. Ajouté à SP-627.

**Audit de fin de session.** Compteurs remesurés : 22 modèles, 16 enums,
65 index, 24 migrations, 66 pages, 18 routes API, 32 actions, **23 services**
(22 annoncés, `onboarding.service.ts` en plus), 9 scripts ops, 221 fichiers et
3527 tests unitaires, couverture 53,85 % de lignes et 76,15 % de branches,
28 specs et 275 tests E2E dont 14 et 143 en CI. Les six hooks testés en
exécution. README, `CLAUDE.md`, `deployment.md`, `database-architecture.md`
et l'agent `docker-devops` mis à jour sur la checklist, le siège du
dirigeant et les runners épinglés. Jira : 8 tickets ouverts (SP-627, SP-620,
SP-619, SP-618, SP-610, SP-602, SP-598, SP-596). L'essai de CARL se termine
ce jour sans activité depuis le 22 octobre (40 brouillons), chouphil est
passé en EXPIRED le 10.

## Les écarts

Le test unitaire vérifie la forme de la requête, pas sa traduction SQL. La
sémantique du `NULL` a donc été prouvée à part, sur la base locale, plutôt que
par un test d'intégration qui aurait introduit une connexion Prisma réelle dans
la suite unitaire.

## Prochaine étape

- Défauts d'affichage mobile relevés, sans ticket : bouton « Télécharger le
  modèle » hors de sa carte sur l'Import, pied de page public fixé dans l'app,
  filtres des Plannings dépliés sur un écran entier, cartes du Profil qui
  débordent de 7 px, compteurs contradictoires sur le tableau de bord (1
  employé actif, 0 au total), « 1 secondes » sur la vérification d'email.
- `EmployeesDataTable` porte un état vide « Ajoutez votre premier employé » qui
  ne s'affiche sans doute jamais, la liste contenant toujours le dirigeant. Non
  vérifié.
- Vérifier le 13 novembre que la suite de nuit repasse au vert.
- Relever `ubuntu-24.04` quand Playwright supportera Ubuntu 26.04.
