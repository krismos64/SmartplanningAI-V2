# 11 août 2026, mode clair unique sur les pages publiques

| Champ | Valeur |
|---|---|
| Ticket | SP-573, créé en cours de refonte, inséré entre SP-567 et SP-568 |
| Documents modifiés | `brand-public.ts`, `globals.css`, `tailwind.config.ts`, `styles.ts`, `LandingHeader.tsx`, `LandingFooter.tsx`, les 8 conteneurs racine publics, 16 fichiers pour les `dark:`, `brand-public.test.ts` |
| Contrôles | `type-check` vert, `npm run test` 3151 tests verts sur 184 fichiers, `npm run build` réussi, rendu identique sur 417 éléments avec et sans la classe `dark` |
| Jira | SP-573 créé et commenté |
| Mémoire | fiche sur le scope public réécrite, fiche sur les tokens constants corrigée |

## La décision

Christophe a demandé si le mode sombre était utile sur le site. Après mesure,
la réponse s'est révélée différente selon le périmètre.

Sur les pages publiques, le double mode ne sert à rien : une landing est un
support de communication, pas un outil de travail. Il avait en revanche déjà
coûté deux défauts pendant SP-567, le hero qui virait au crème et le bouton
lime à 1,06:1 de contraste.

Sur l'application, c'est l'inverse : 330 occurrences `dark:` dans les composants
partagés, une page de réglages d'apparence, une préférence persistée en base, et
un usage réel pour un manager qui passe sa journée dans l'outil. Le supprimer
aurait touché `src/app/app/`, donc hors du périmètre annoncé.

Périmètre retenu et validé : **public uniquement, application inchangée**.

## Ce qui a été fait

97 occurrences `dark:` retirées sur 16 fichiers publics, `ThemeToggle` retiré de
`LandingHeader`. Les tokens perdent leur déclinaison sombre :
`publicSemanticLight` et `publicSemanticDark` fusionnent en `publicSemantic`, et
le bloc `.dark` de `globals.css` perd ses variables `--public-*`.

Conséquence heureuse : la distinction entre tokens thématiques et constants,
introduite en catastrophe pendant SP-567, n'a plus lieu d'être.
`surfaceInverted` et `contentInverted` disparaissent au profit de `surfaceDark`
et `contentOnDark`.

## L'écart, et pourquoi il compte

**Retirer les `dark:` ne suffisait pas.** Le contrôle d'équivalence l'a montré :
le footer et plusieurs textes changeaient encore de couleur selon le thème,
alors qu'ils ne portaient aucun `dark:`.

La cause : ils utilisent les tokens globaux `bg-background`, `text-foreground`,
`text-muted-foreground`, `bg-card` et `border-border`, qui basculent avec le
thème par construction. **264 usages répartis sur 20 fichiers.**

Les remplacer un à un aurait été long, aurait empiété sur SP-568 à SP-571 qui
refondent ces mêmes fichiers, et surtout n'aurait rien réglé pour l'avenir :
chaque nouvelle page publique aurait réintroduit le problème.

Solution retenue : une classe `.public-scope` posée sur le conteneur racine des
huit pages publiques, qui réancre ces tokens sur leurs valeurs claires. Un seul
point de vérité.

Piège évité au passage : j'avais d'abord recopié des valeurs Shadcn génériques
dans cette classe. Six tokens sur dix différaient de ceux du projet, `accent`
notamment, violet chez SmartPlanning contre gris chez Shadcn. Les valeurs sont
maintenant extraites de `:root` et vérifiées une à une.

**`HIGHLIGHT_TEXT_CLASSES` a dû être scindée.** Cette constante de `styles.ts`
portait un `dark:` et est partagée avec les six formulaires
d'authentification, qui gardent leur mode sombre. Une variante
`HIGHLIGHT_TEXT_CLASSES_PUBLIC` a été ajoutée. À noter : ma première passe de
nettoyage ne couvrait que les `.tsx`, ce `.ts` était passé au travers.

## Ce qui a été mesuré

- **417 éléments** comparés sur la page secteur, avec et sans la classe `dark` :
  **zéro différence**
- Aucun défaut de contraste sur les pages publiques
- First Load JS de la page d'accueil : **169 kB**, contre 173 après SP-567 et
  176 en baseline
- Application privée intacte : 271 occurrences `dark:` conservées,
  `ThemeProvider`, `ThemeToggle` et `ThemeSelector` en place, aucun fichier de
  `src/app/app/` ni de `src/app/(auth)` modifié

## Prochaine étape

SP-568, les sections basses de la landing, désormais sans mode sombre à gérer.
Les tickets SP-569 à SP-571 s'allègent d'autant, et SP-569 n'a plus de
`ThemeToggle` à conserver dans le header refondu.

Sept commits en attente de push, une seule PR groupée prévue en fin de sprint.
