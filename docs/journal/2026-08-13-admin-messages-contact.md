# 13 août 2026, l'écran qui rend les demandes de contact visibles

| Champ | Valeur |
|---|---|
| Ticket | SP-577, suite directe de SP-576 |
| Documents produits | `src/app/app/admin/messages-contact/` (page + 3 composants + barrel), `src/lib/actions/admin-contact-messages.ts`, `src/lib/validations/contact-messages.ts`, `__tests__/lib/actions/admin-contact-messages.test.ts`, `e2e/specs/admin-messages-contact.spec.ts` |
| Documents modifiés | `src/lib/navigation/menu-items.ts` |
| Contrôles | type-check vert, 3189 tests unitaires (190 fichiers), 8 specs E2E, lint propre, page vue au navigateur, deux preuves par mutation |
| Jira | SP-577 |

## Pourquoi cet écran

SP-576 a fait persister les demandes du formulaire public, mais rien ne lisait
la table. Le vrai motif n'est pas le confort de lecture : c'est le cas
`emailStatus FAILED`. Une demande arrivée pendant une panne SMTP ne déclenche
aucune notification. Sans écran pour la voir, elle reste invisible, ce qui
reproduit exactement le défaut que SP-576 venait de corriger, un cran plus loin.

Le compteur « non notifiées » passe donc en rouge dès qu'il est non nul, avec
la phrase explicite « aucun email n'est parti pour ces demandes ».

## Périmètre tenu volontairement court

Liste triée par date, filtre de recherche, filtre à traiter / déjà traitées,
filtre sur l'état de notification, lecture du message complet en modale,
marquage traité. Pas de graphique, pas d'export, pas de réponse depuis
l'interface.

La structure reprend celle de `/app/admin/emails` (SP-545) : Server Component,
filtres poussés dans l'URL, table desktop et cartes mobile, `ServerPagination`
partagé.

## La sécurité est le seul rempart ici

`contact_messages` ne porte pas de `companyId`, l'expéditeur étant un visiteur
anonyme. Il n'y a donc aucune clause d'isolation à poser, et toute la
protection repose sur le rôle. `checkPermission('SYSTEM_ADMIN')` ouvre chacune
des trois Server Actions, et la page refait le contrôle après le middleware.

Dix tests négatifs couvrent les refus, DIRECTOR, MANAGER, EMPLOYEE et visiteur
non connecté, sur les trois actions. Prouvés par mutation : abaisser le rôle
requis à DIRECTOR fait rougir trois tests, restauré ensuite.

## `emailError` ne sort jamais de la base

Le champ stocke le message brut de Nodemailer, qui porte l'hôte, le port et
l'utilisateur d'authentification. Seule sa présence est exposée, via un booléen
`hasEmailError`. Même raisonnement que la whitelist de metadata du journal
EmailLog.

Vérifié sur le HTML réellement servi avec un message en base contenant
`535 auth failed for user contact@smartplanning.fr on smtp.hostinger.com:587` :
aucune de ces chaînes n'apparaît dans la page. Prouvé par mutation également.

## Deux défauts vus au navigateur, invisibles dans le code

Les accents manquaient dans toute l'interface, « Recue le », « Expediteur »,
« Non notifiee ». Écrire sans accents est une habitude d'identifiant technique
qui a débordé sur du texte visible. Le type-check, le lint et les tests étaient
tous verts avec ces libellés.

La barre latérale semblait tronquer l'entrée de menu sur la première capture.
Vérification faite sur le texte rendu, elle est bien présente entre « Emails »
et « Monitoring » : c'était une animation d'entrée saisie en cours.

Confirme la leçon de la refonte publique : parcourir les pages rendues, la
liste des fichiers modifiés ne montre pas ce genre de défaut.

## Whitelist E2E

Le spec n'est pas ajouté à `playwright.ci.config.ts`, par cohérence avec
`admin-emails.spec.ts` qui n'y est pas non plus. La whitelist CI reste courte,
auth, RBAC, CRUD et congés. Le nightly prend `**/*.spec.ts`, donc le spec y est
capté sans configuration.
