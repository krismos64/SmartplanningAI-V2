# 13 novembre 2026, défauts mobiles du parcours d'essai et liens morts de la palette de commandes

| Champ              | Valeur                                                                                                                                                                                                                                                                                                              |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ticket             | SP-627, ouvert le 12 novembre à partir de l'inscription JULIENNE                                                                                                                                                                                                                                                    |
| Documents produits | `src/lib/navigation/__tests__/help-links.test.ts`                                                                                                                                                                                                                                                                   |
| Documents modifiés | `DashboardLayout.tsx`, `Footer.tsx`, `Sidebar.tsx`, `command-palette.tsx`, `menu-items.ts`, `SchedulesPageContent.tsx`, `import/page.tsx`, `DirectorWelcome.tsx`, `DirectorTeamsChart.tsx`, `DirectorTrendsChart.tsx`, `AreaChartWidget.tsx`, `InfoRow.tsx`, `ProfileHeader.tsx`, trois écrans de `components/auth` |
| Contrôles          | type-check vert, lint 0 erreur, 222 fichiers et 3531 tests verts, couverture 53,87 % de lignes et 76,15 % de branches. E2E locales sur les écrans touchés : 93 vertes, 8 rouges dans `middleware-rbac.spec.ts`, redirigées vers le port 3000 occupé par Lune & Soleil                                               |
| Jira               | SP-627 commenté                                                                                                                                                                                                                                                                                                     |
| Mémoire            | `inscription-julienne-11-novembre.md` et `ou-en-est-le-projet.md` mises à jour                                                                                                                                                                                                                                      |

## Ce qui a été fait

**Le 404 ne venait pas du pied de page.** Le ticket désignait `Footer.tsx:87`.
Ce lien vivait dans une variante « publique » du composant que plus rien
n'affichait : la landing utilise `LandingFooter`, l'app la variante réduite. Le
clic de JULIENNE vient de la palette de commandes, dont deux entrées
pointaient vers des routes inexistantes, `/docs` et `/help`. Elles deviennent
« Guides pratiques » vers `/guides` et « Contacter le support » vers
`/contact`. La variante morte du pied de page est supprimée.

**Un garde-fou pour ces liens.** Les cibles sont regroupées dans `HELP_LINKS`,
et un test parcourt `src/app`, groupes de routes compris, pour vérifier que
chaque cible a son `page.tsx`. Prouvé par mutation : il rougit quand on remet
`/docs`.

**Le double défilement sur mobile.** La zone de contenu avait une hauteur
calculée, `100vh` moins l'en-tête et le pied de page. Le calcul ignorait les
bandeaux d'essai et de vérification d'email, que tout compte en essai affiche.
Mesuré en Pixel 5 avec le seul bandeau d'essai : document de 782 px pour un
écran de 727, la page défilait donc de 55 px en plus de sa zone de contenu. La
colonne est désormais bornée à l'écran (`h-dvh`) et la zone de contenu prend
ce qui reste. Après : 727 pour 727.

**Le pied de page de l'app sur mobile.** Masqué sous `md`. Ses trois liens
légaux sont repris en bas du menu latéral, en cibles de 44 px, pour ne pas
retirer l'accès à la politique de confidentialité depuis un téléphone.

**Les autres défauts du ticket.**

- Import : le bouton « Télécharger le modèle » sortait de 6 px de sa carte, il
  passe sous le texte en dessous de `sm`.
- Plannings : les filtres étaient un `<details open>`, donc dépliés partout.
  Remplacé par un bouton à `aria-expanded`, replié par défaut sur mobile, le
  panneau restant monté pour ne pas perdre les filtres choisis.
- Tableau de bord : la répartition annonçait « au total » la somme des
  employés rattachés à une équipe, soit 0 à côté d'un compteur à 1. Elle
  affiche le total réel et le nombre sans équipe. Le badge « Excellent »
  (taux de présence de 100 % d'un dirigeant seul) ne s'affiche plus tant qu'il
  n'y a pas d'autre employé. L'axe des effectifs n'accepte plus de décimales.
- Vérification d'email : le sous-titre disait « en cours » après le succès, et
  le compte à rebours écrivait « 1 secondes », aussi sur l'activation de
  compte et la réinitialisation du mot de passe.
- Profil : une adresse longue peut se couper au lieu d'élargir la carte.

## Les écarts

Le débordement de 7 px du Profil n'a pas été reproduit à 393 px avec une
adresse de 40 caractères. Le correctif est posé sans preuve avant et après.

Les graduations de l'axe n'ont pas été lues sur le graphique rendu.

Les deux entrées de la palette n'ont pas été cliquées au navigateur, le script
de capture n'y est pas parvenu. La preuve repose sur le test et sur les
réponses 200 de `/guides` et `/contact`.

L'état vide de `EmployeesDataTable` est laissé tel quel : un manager dont
l'équipe est vide peut le voir, il n'est donc pas mort à coup sûr.

Les 8 échecs E2E locaux n'ont pas été rejoués sans le diff. La capture d'erreur
montre la boutique Lune & Soleil : `AUTH_URL` renvoie vers le port 3000.

## Prochaine étape

- Deux balises `<main>` imbriquées dans l'app (`#main-content` et celle du
  layout), vu en écrivant le script de capture. Défaut d'accessibilité, sans
  ticket.
- `/guides` porte des guides métier, pas une documentation du produit. Une
  vraie page d'aide reste à écrire si les essais la cherchent.
- Vérifier que la suite de nuit du 13 novembre repasse au vert.
- Relire la prochaine session de JULIENNE, essai jusqu'au 2 décembre.
