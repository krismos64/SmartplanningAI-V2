# 31 août 2026, analyse d'un onboarding réel et deux défauts qui le tuent

| Champ | Valeur |
|---|---|
| Ticket | SP-578 |
| Documents produits | ce journal |
| Documents modifiés | `SchedulesFilters.tsx`, `ExportDropdown.tsx`, routes export PDF et Excel, `employees.ts` (actions), `employee.ts` (validations), `columns.tsx`, `EmployeesDataTable.tsx`, deux fichiers de tests |
| Contrôles | type-check vert, 3209 tests Vitest verts sur 191 fichiers, E2E `crud/employees.spec.ts` 18/18 sur deux passages |
| Jira | SP-578 créé |
| Mémoire | fiches sur l'acquisition ChatGPT, sur les bounces invisibles dans les logs applicatifs, sur le fuseau des logs face à la base |

## Ce qui a été fait

Session ouverte sur une question simple : « une entreprise Sunlight s'est
inscrite cette nuit en prod, peux-tu analyser son expérience ». L'analyse a
produit deux correctifs et une découverte qui ne concerne pas le code.

### Le parcours mesuré

Inscription le 31 août à 00h32 UTC, session unique de 14 minutes, aucun retour
depuis. 542 requêtes HTTP, aucune erreur 5xx, aucune erreur visible par
l'utilisateur, aucune lenteur serveur. Le dirigeant a vérifié son email en 28
secondes, créé une équipe, trois collaborateurs, quatre créneaux, et exporté
trois PDF. La plateforme a tenu, le parcours a échoué quand même.

Chronologie reconstituée depuis `audit_logs` et
`/var/log/nginx/smartplanning-access.log`, recoupée avec la base.

### L'acquisition vient de ChatGPT

La première requête de la session est
`/solutions/planning-restaurant?utm_source=chatgpt.com`, suivie de `/register`
sept secondes plus tard. Un assistant a recommandé SmartPlanning, la personne a
cliqué et s'est inscrite dans la foulée. C'est la première conversion traçable
de ce canal depuis le sprint 18, et elle valide le pari GEO autrement que par
des impressions Search Console.

### Défaut 1, les brouillons invisibles

`SchedulesFilters` appliquait `status: 'CONFIRMED'` au montage de la vue, et
`ExportDropdown` reprend les filtres actifs pour construire ses paramètres
d'export. Un dirigeant qui choisit « Brouillon » dans le formulaire de création,
option que le select propose, ne voyait donc ses créneaux nulle part.

Les traces le montrent sans ambiguïté : quatre créneaux créés à 00:44:15, tous
en `DRAFT`, même `scheduleGroupId`. Export PDF à 00:45:18, relancé à 00:45:27,
neuf secondes plus tard, avec `status=CONFIRMED` en query. Réponse de 3535
octets les deux fois, la taille d'un PDF sans aucune ligne. Session terminée à
00:46:32, sans déconnexion.

La notification « Nouveau planning » est bien partie aux quatre employés à
00:44:16, ce qui prouve que les créneaux existaient. Seul l'écran était vide.

Le défaut de filtre passe à « tous les statuts ». Ce filtre n'a jamais été un
contrôle d'accès : pour un `EMPLOYEE`, la restriction aux créneaux confirmés est
imposée côté serveur dans les deux routes d'export.

En complément, les routes PDF et Excel renvoient désormais `X-Schedule-Count`,
et le client avertit quand l'export ne contient aucun créneau. Le téléchargement
reste servi, un export vide pouvant être légitime.

### Défaut 2, les invitations sans retour

Les trois collaborateurs n'ont jamais activé leur compte, et leurs tokens
`activate:` expiraient le 2 septembre. Rien ne le signalait : la liste des
employés n'affichait aucun état d'activation, et `resendInvitation` part du
token, que seul l'invité possède. Un responsable dont le collaborateur n'a rien
reçu n'avait donc aucun recours.

La liste distingue maintenant un compte activé d'une invitation en attente, et
`resendInvitationByEmployee` permet la relance depuis la fiche. Elle part de
l'`employeeId` et passe par `canAccessEmployee`, qui porte déjà l'isolation
multi-tenant et le contrôle d'équipe du manager.

### Ce que les logs applicatifs ne disaient pas

Christophe a reçu deux bounces sur `contact@smartplanning.fr` : l'adresse
`cassybouson@gmail.com` n'existe pas, refus 550-5.1.1 de Gmail, pour
l'invitation puis pour la notification de planning. Or le log applicatif
affichait « Envoi réussi » pour cette adresse, avec un `messageId`.

Le succès renvoyé par le relais SMTP ne dit rien de la livraison finale. C'est
une typo de saisie du dirigeant que ni lui ni l'application ne pouvaient voir.
Le badge « invitation en attente » la rend au moins visible, mais le traitement
des bounces reste entier.

## Les écarts

**Une mutation choisie au mauvais endroit.** Premier essai de preuve par
mutation : retirer `hasAccess` de la garde `if (!hasAccess || !employee)`. Les
49 tests sont restés verts, ce qui semblait dire que le contrôle était faux. Il
ne l'était pas : `canAccessEmployee` omet `employee` sur tout refus, donc
`!employee` rattrapait le cas. La garde est redondante, pas absente. La mutation
utile était d'inverser le filtre `companyId` dans `canAccessEmployee` : sept
tests rougissent alors, dont deux des miens. Une mutation qui ne casse rien
n'apprend rien tant qu'on n'a pas vérifié qu'elle était observable.

**Un premier run E2E interprété trop vite.** Le premier passage de
`crud/employees.spec.ts` a donné 12 échecs en 9,5 minutes. J'y ai d'abord vu une
régression et je l'ai annoncée comme telle. Vérification faite en remisant les
modifications : 18/18 sur le code d'origine, puis 18/18 avec les modifications,
deux fois de suite, en une minute. Le premier run compilait les pages à froid et
les tests dépassaient leur timeout. Un run à froid ne se compare pas à un run à
chaud.

**Fuseaux horaires.** Les timestamps de la base sont en UTC, comme le VPS. J'ai
d'abord cherché la session dans les logs autour de 22h30 UTC en supposant une
base en heure de Paris, et trouvé une plage vide. L'impersonation de 06:05
tracée dans `audit_logs`, qui correspondait à l'heure réelle de la session en
cours, a donné le repère.

**Nginx a deux journaux.** `/var/log/nginx/access.log` ne contient que des 301 et
des 400, c'est-à-dire le bruit de scan sur le port 80. Le trafic HTTPS réel vit
dans `/var/log/nginx/smartplanning-access.log`, déclaré ligne 164 du site.
Chercher dans le premier donne l'impression qu'il n'y a pas de trafic.

## Prochaine étape

Ouvrir la PR pour SP-578 et laisser la CI se prononcer.

Deux sujets restent ouverts, non traités ici :

- **Le traitement des bounces.** Une adresse invalide reste invisible côté
  application. Les bounces arrivent sur `contact@smartplanning.fr` et personne
  ne les relie au compte concerné. Un `EmailLog` en statut `BOUNCED` alimenté
  par un webhook du relais rendrait la typo visible dans l'écran admin emails
  bâti en SP-545
- **La relance automatique avant expiration.** Le token vit 48 heures et personne
  n'est prévenu qu'il va expirer. Un rappel au dirigeant sur les invitations
  restées en attente prolongerait l'effet du correctif de cette session

Sunlight garde son essai jusqu'au 21 septembre. Rien ne dit que ces correctifs
la feront revenir, mais ils retirent les deux obstacles qu'elle a rencontrés.
