# 13 août 2026, le formulaire de contact n'envoyait rien

| Champ | Valeur |
|---|---|
| Ticket | SP-576, ouvert après un test de Christophe resté sans réponse dans la boîte contact |
| Documents produits | `prisma/migrations/20260813152748_add_contact_message/migration.sql`, `src/components/public/__tests__/contact-form-envoi.test.tsx` |
| Documents modifiés | `prisma/schema.prisma`, `src/app/api/contact/route.ts`, `src/components/public/ContactForm.tsx`, `src/hooks/use-contact-form.ts`, `__tests__/app/api/contact/route.test.ts` |
| Contrôles | type-check vert, 3171 tests unitaires (189 fichiers), build de production, bout en bout contre un SMTP injoignable, deux preuves par mutation |
| Jira | SP-576 |
| PR | [#74](https://github.com/krismos64/SmartplanningAI-V2/pull/74), mergee, CI verte |
| Deploiement | production le 13 aout 2026 a 16:09 UTC, migration appliquee puis app redemarree, verifie de bout en bout |
| Mémoire | `formulaire-contact-jamais-branche` écrite |

## Le symptôme

Christophe a rempli le formulaire de `/contact`. La page a affiché son accusé
de réception. Rien n'est arrivé sur `contact@smartplanning.fr`.

## La cause, entièrement côté client

`ContactPageContent` montait `<ContactForm />` sans prop `onSubmit`. Le hook
`use-contact-form` portait une branche « mode démo » qui, en l'absence de
handler, attendait 1,5 seconde puis basculait à l'état `success` :

```ts
} else {
  // Mode démo / mock
  await new Promise((resolve) => setTimeout(resolve, 1500))
  setSubmittedName(data.name)
  setState('success')
}
```

Aucune requête réseau, aucun email, et un accusé de réception affiché au
visiteur. La route `POST /api/contact` et le SMTP Hostinger fonctionnaient
parfaitement, vérifié en production avant toute modification : les deux emails
partent et sont journalisés par `[Email] Envoi réussi`.

`git log -S "api/contact"` ne remonte que le commit de création de la route,
SP-288. **Le client n'a jamais été branché**, ce n'est pas une régression de
SP-574 malgré la reprise récente de la page.

## Pourquoi 3163 tests n'ont rien vu

Chaque test existant injecte un `onSubmit` mocké, y compris les onze cas
d'intégration de `ContactForm.integration.test.tsx`. Aucun ne montait le
composant comme la page l'utilise, c'est-à-dire sans la prop. La suite validait
un chemin que personne n'emprunte.

C'est la même famille que le rappel d'essai J-1 du sprint 21 : une feature
close, testée, qui ne produit rien en vrai.

## Les correctifs

`ContactForm` porte un envoi par défaut vers `/api/contact`. La prop `onSubmit`
reste disponible pour les tests, mais son absence ne peut plus produire un faux
succès. Le mode démo du hook est supprimé : sans handler, le formulaire échoue
bruyamment.

## La persistance, décidée dans la foulée

La route ne dépendait que du SMTP. Une panne, des credentials expirés ou une
boîte pleine faisaient disparaître une demande commerciale sans laisser de
trace, exactement le scénario qu'on venait de vivre pour une autre raison.

Le modèle `ContactMessage` est écrit **avant** toute tentative d'envoi.
L'écriture est bloquante, contrairement aux emails : si elle échoue, mieux vaut
demander au visiteur de réessayer que perdre son message en silence. Le sort de
la notification est ensuite consigné sur la ligne, en fire-and-forget.

Pas de `companyId` sur ce modèle, contrairement à presque toutes les autres
tables : l'expéditeur est un visiteur anonyme qui n'appartient à aucune
entreprise. La conséquence côté sécurité est que la lecture de ces messages
sera réservée au `SYSTEM_ADMIN`, seul rôle non borné à une company.

## Les preuves

Bout en bout contre un SMTP réellement injoignable, `SMTP_HOST=127.0.0.1
SMTP_PORT=9` sur un build de production :

```
HTTP 500 côté visiteur
emailStatus FAILED, emailError « connect ECONNREFUSED 127.0.0.1:9 »
```

La demande est conservée intégralement. Avant ce correctif elle disparaissait.

Deux mutations, conformément à la règle du projet. Retirer l'envoi par défaut
de `ContactForm` fait rougir les deux tests du nouveau fichier. Inverser
l'ordre écriture / envoi dans la route fait rougir les deux tests qui gardent
cette garantie. Restauré dans les deux cas.

## Deux pièges rencontrés en chemin

Le premier test de panne SMTP a répondu `emailStatus SENT` alors que le serveur
était censé être injoignable. Le `kill %1` avait échoué, le premier serveur
tenait toujours le port 3100 et le second n'avait jamais démarré : le test
frappait l'ancien processus, avec le SMTP valide. C'est le piège que le
CLAUDE.md décrit, un audit contre un serveur démarré avant la modification.
Lu le log du serveur plutôt que cru le résultat.

Les tests de la route écrivaient dans la vraie base de développement, faute de
mock Prisma. Huit lignes `jean@example.com` mesurées puis supprimées, mock
manuel ajouté via `vi.hoisted()`. Le fichier est passé de 487 ms à 59 ms.

## Ce qui reste

Les messages perdus sont irrécupérables : ils n'ont jamais quitté le navigateur
des visiteurs, il n'y a rien en base ni chez Hostinger. Si le formulaire tourne
depuis SP-287, tous les envois de la période ont été perdus de la même façon.

Aucune interface d'administration ne lit encore `contact_messages`. Les
messages sont conservés, la notification email reste le canal de lecture. Une
page admin réservée au SYSTEM_ADMIN reste à faire, hors périmètre de ce ticket.

## Deploiement

Merge le 13 aout a 16:05, CD reussi sur ses trois jobs. La migration
`20260813152748_add_contact_message` s'applique a 16:09:39, l'app redemarre a
16:09:57, donc apres la migration : aucune fenetre ou le nouveau code aurait
tourne sur l'ancien schema.

Verifie sur la production, pas seulement au vert du pipeline :

```
POST https://smartplanning.fr/api/contact -> HTTP 200
contact_messages : 1 ligne, emailStatus SENT, IP et horodatage captures
[Email] Envoi reussi a contact@smartplanning.fr
[Email] Envoi reussi a l'expediteur
```

La chaine complete fonctionne, du formulaire a la boite de reception, avec le
message conserve en base.
