# 19 septembre 2026, le consentement cookies bloquait l'ecran central du produit

| Champ | Valeur |
|---|---|
| Ticket | SP-600 |
| Documents produits | `src/components/cookies/CookieConsentDialog.tsx`, `src/app/app/settings/privacy/` (page et contenu), `__tests__/components/cookies/cookie-consent-dialog.test.tsx`, `e2e/specs/schedules/consentement-ne-recouvre-pas-la-grille.spec.ts`, cette entree |
| Documents modifies | `CookieConsentProvider.tsx`, `cookies/index.ts`, `ui/dialog.tsx`, `ui/dynamic-breadcrumbs.tsx`, `SettingsPageContent.tsx` et son test, `playwright.ci.config.ts` |
| Controles | type-check vert, 202 fichiers et 3339 tests verts, 5 E2E vertes sur trois executions, preuve par mutation faite sur les unitaires et les E2E |
| Jira | SP-600 commente en detail |
| Memoire | `banniere-cookies-bloque-le-back-office.md` mise a jour |

## Le defaut, et pourquoi il comptait

Suite de l'analyse d'hier. `CookieBanner` etait rendue par son provider sur
toutes les routes, sans aucun filtre de pathname, en `fixed bottom-0 z-50`.
Dans le back-office elle occupait 235,5 px en bas d'ecran et recouvrait
158,5 px des 179 px de la grille de plannings, soit 89 pour cent. Elle
absorbait les clics : `elementFromPoint` renvoyait la banniere sur les quatre
points mesures.

Le defaut frappait systematiquement les nouveaux comptes, qui n'ont par
construction encore rien tranche, sur l'ecran central du produit.

## Le choix de conception, et ce qui l'a impose

Premiere idee : masquer la banniere dans `/app/*`. Verification faite,
**Umami n'exclut aucune route** et se charge aussi dans l'application privee
des que l'analytics est accepte. Le consentement y reste donc juridiquement
du, et le masquer aurait echange un defaut produit contre un defaut de
conformite.

D'ou la modale centree, qui demande le choix une fois puis libere l'ecran.
Elle ne se ferme ni au clic exterieur, ni a Echap, ni par une croix : un
choix implicite ne vaut pas consentement, et la refermer sans repondre la
ferait revenir au rechargement suivant. `DialogContent` a recu une prop
`showCloseButton`, vraie par defaut, donc aucun usage existant ne bouge.

Seconde decouverte en chemin : le consentement n'etait reglable que depuis le
footer public. **Un utilisateur connecte n'avait aucun moyen de revenir sur
son choix**, alors que le RGPD impose un consentement revocable a tout moment.
D'ou la page `/app/settings/privacy`, ouverte a tous les roles, et une
assertion dans le test des sections qui le verifie pour un EMPLOYEE.

## Mesure, avant et apres

Meme viewport, meme ecran :

```
AVANT  banniere : y=484,5  hauteur 235,5px   recouvrement 158,5/179px = 89%
APRES  modale   : y=238    hauteur 244px     recouvrement  18/179px = 10%
```

Les 10 pour cent restants n'interceptent aucun des points mesures, et un seul
clic libere tout.

## Le test qui ne prouvait rien

Le point de methode de la session. La premiere version du test E2E central
mesurait l'interception **apres** avoir clique sur « Tout refuser ». Sous
mutation, elle restait verte : le bouton existe dans les deux versions, donc
le test passait avec la banniere comme avec la modale.

Reecrite pour mesurer a l'arrivee, dans l'etat exact ou se trouvait le
dirigeant de bureau vallee vichy, elle rougit avec le message attendu :
« un clic en (640, 500) est intercepte par la banniere de consentement ».

Sans la preuve par mutation, ce test serait parti en CI en paraissant garder
le defaut, sans rien garder du tout. Meme famille que
`tests-qui-survivent-a-leur-objet` et
`une-mutation-qui-ne-reproduit-pas-le-defaut`.

## Un piege evite

`pathname.startsWith('/app')` attraperait une future route publique nommee
`/applications`, qui basculerait alors en silence sur la modale. La condition
teste donc `/app` exactement ou `/app/`. Aucune collision aujourd'hui, verifie
par `find`, mais le cout de la precaution est d'une ligne.

## Ce qui reste ouvert

- **Le critere 5 de SP-600 n'est pas fait** : les autres ecrans denses
  (collaborateurs, conges) n'ont pas ete mesures. Le risque est faible, la
  modale etant centree et plus petite, mais ce n'est pas mesure.
- **L'etat vide de l'ecran plannings** reste entier : grille vierge et
  « Aucun planning cette semaine », sans invitation a creer le premier.
- **Defaut preexistant, hors perimetre** :
  `src/app/app/settings/appearance/page.tsx` redirige vers `/auth/login`, une
  route qui n'existe pas. Les autres pages utilisent `/login`.
- SP-599 et SP-600 vivent sur deux branches separees, aucune poussee.
