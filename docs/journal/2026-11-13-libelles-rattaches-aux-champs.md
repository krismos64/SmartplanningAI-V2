# 13 novembre 2026, les libellés des formulaires rattachés à leurs champs

| Champ              | Valeur                                                                                                                                                                                                     |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ticket             | SP-620, ouvert le 26 octobre                                                                                                                                                                               |
| Documents produits | `src/components/ui/__tests__/form-control-placement.test.ts`                                                                                                                                               |
| Documents modifiés | 13 formulaires (connexion, inscription, mot de passe oublié, activation, réinitialisation, profil, mot de passe, suppression de compte, employé, équipe, entreprise, congé, gestion de congé), spec SP-613 |
| Contrôles          | type-check vert, lint 0 erreur, 226 fichiers et 3605 tests verts. Mesure au navigateur sur 9 pages, avant et après. E2E locales : 139 verts, 1 rouge et 2 instables en lot, verts seuls (22 sur 22)        |
| Jira               | SP-620 commenté puis clos                                                                                                                                                                                            |
| Mémoire            | `ou-en-est-le-projet.md` mise à jour                                                                                                                                                                       |

## Ce qui a été fait

**La cause.** `FormControl` de Shadcn est un `Slot` Radix : il pose `id`,
`aria-describedby` et `aria-invalid` sur son enfant direct, et `FormLabel`
vise cet `id`. Quand l'enfant est un `<Select>`, qui ne rend aucun élément,
ou la `<div>` qui place une icône à côté du champ, le libellé et le message
d'erreur ne sont rattachés à rien.

**Le ticket ne voyait qu'un champ, il y en avait 34.** Relevé dans le code :
7 `FormControl` enveloppaient un `<Select>`, 27 une `<div>` contenant un
champ. Mesuré au navigateur par l'arbre d'accessibilité réel, ce qu'un lecteur
d'écran annonce :

- sans aucun nom : le combobox Équipe, la date d'embauche et les heures
  hebdomadaires de la fiche employé, le manager d'une équipe, les trois
  listes de la fiche entreprise
- nommés par leur placeholder : « •••••••• » pour le mot de passe de la
  connexion et les deux de l'inscription, « Mon Entreprise SAS »,
  « 0612345678 », « vous@entreprise.com » au mot de passe oublié,
  « Développeur Full-Stack » pour le poste

Les pages d'entrée du tunnel de conversion étaient donc touchées.

**Le correctif.** `FormControl` enveloppe le `SelectTrigger` ou l'`Input`,
forme de la documentation Shadcn. Transformation faite par script sur les
13 fichiers, puis Prettier. Après correctif, la même mesure donne à chaque
champ son libellé. Les messages d'erreur, rattachés par `aria-describedby`,
sont désormais annoncés avec le champ, ce qui n'était pas le cas.

**Le garde-fou.** `form-control-placement.test.ts` lit les sources de
`src/` et rougit sur un `FormControl` dont l'enfant est un `<Select>` ou une
`<div>` portant un champ. Remis sur l'ancien code, il signale les 34 champs.
Le spec SP-613 trouve le combobox par son nom, critère 3 du ticket.

## Les écarts

La palette de couleurs de `TeamForm` reste dans une `<div>` sous
`FormControl` : des boutons nommés par leur `title`, sans champ à rattacher,
ni état sélectionné annoncé (`aria-pressed` absent). Non touché.

Les E2E locales en lot ont rougi sur `brouillons-publication` après deux
expirations de `page.goto` (serveur de dev chargé), et deux tests de
`companies` ont dû être rejoués, l'un sur un `ERR_CONNECTION_REFUSED` de
redirection. Joués seuls, tous verts. Aucun ne touche un champ modifié, la
CI tranchera.

Aucun audit axe-core lancé : les pages publiques touchées sont la connexion
et l'inscription, hors des specs `e2e/specs/landing/`.

## Prochaine étape

- Fait le jour même : PR #126 mergée (`cd8d304`), image `sha-cd8d304` en
  production, healthy, aucune erreur dans journald. Mesuré en production :
  la connexion annonce « Mot de passe », l'inscription « Mot de passe » et
  « Confirmer le mot de passe ». SP-620 clos.
- Tickets ouverts : SP-602, SP-598, SP-596.
