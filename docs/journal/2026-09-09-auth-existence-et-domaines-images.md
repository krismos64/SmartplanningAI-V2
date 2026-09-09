# 9 septembre 2026, un portier qui vérifiait la présence et non l'identité

| Champ | Valeur |
|---|---|
| Ticket | SP-589, deuxième des six tickets issus de l'audit |
| Documents produits | `src/lib/__tests__/auth.config.authorized.test.ts`, `src/lib/__tests__/next-config-images.test.ts` |
| Documents modifiés | `src/lib/auth.config.ts`, `next.config.ts`, `package.json`, `package-lock.json` |
| Contrôles | type-check vert, 3296 tests verts sur 199 fichiers, build de production réussi, E2E auth et RBAC 46 passés |
| Jira | SP-589 commenté |
| Mémoire | fiche à écrire sur le contrôle d'authentification par existence |

## Ce qui a été fait

Le callback `authorized()` d'`auth.config.ts` entrait sur `!!auth`, la seule
présence d'un objet. L'avis publié sur next-auth décrit ce motif ainsi :
« Configuration errors can cause existence-based auth checks to fail open (auth
object populated with an error) ». Auth.js peut peupler `auth` avec un objet
porteur d'une erreur, sans `user` exploitable, que le middleware lisait alors
comme une session valide.

`isLoggedIn` gouverne sept branches du callback, dont le refus final. Corriger
la ligne d'entrée en `!!auth?.user?.id` couvre donc l'ensemble.

La portée réelle mérite d'être dite sans l'exagérer : les Server Actions refont
leur propre `checkPermission()`, l'impact se limitait à la couche middleware.
C'est de la défense en profondeur qui était perdue, pas la seule barrière.

Côté images, `next.config.ts` déclarait `hostname: '**'` avec en commentaire
« à restreindre en prod ». Le relevé des URL du code donne `res.cloudinary.com`
comme seul hôte distant, le `/demo` rencontré n'apparaissant que dans les tests
unitaires. La liste est donc réduite à ce domaine, et AVIF retiré le temps de
la montée de version, le décodeur étant l'objet de l'avis critique.

Les montées de version suivent, sur la même branche mineure : Next 15.5.9 vers
15.5.25, next-auth beta.30 vers beta.32, `@auth/core` 0.41.0 vers 0.41.3.
Résultat mesuré, 3 alertes critiques avant, 0 après.

## Les écarts

**Un effet de bord que le ticket ne prévoyait pas.** Sous `!!auth`, un objet
auth vide sur `/login` déclenchait la branche « déjà connecté » et appelait
`getDefaultDashboardForRole` avec un rôle indéfini. Un visiteur touché par une
erreur de configuration était donc renvoyé hors de la page de connexion, sans
pouvoir se connecter. Le cas est couvert par un test dédié.

**Le total d'alertes npm ne bouge pas, seule leur gravité change.** 18 avant,
18 après, mais 0 critique. Le reliquat sort du périmètre : npm propose
`next-auth@1.12.1` comme correctif, c'est-à-dire un retour à la v4 et la
réécriture de la couche auth, toute version 5 beta tombant dans la plage de
l'avis. Il n'existe pas de sortie par le haut aujourd'hui. `next` en MODERATE
demande la 16.3.4, montée majeure. `xlsx` n'a aucun correctif, déjà consigné
dans SP-590.

**Un E2E en échec, qui préexiste.** `should block login for unverified email`
(SP-526) échoue sur la branche. Plutôt que de le contourner, je l'ai rejoué sur
`main` intact, après `npm ci` et rebuild en 15.5.9 et beta.30 : il échoue à
l'identique, 1 failed et 20 passed. La montée de version n'y est pour rien.
Cause probable, le compte seedé `UNVERIFIED_USER` absent de la base locale.
À traiter séparément.

**Un faux positif sur la détection de serveur de dev.** `ps aux | grep "next
dev"` retournait trois processus, ce qui interdisait le build selon la règle du
projet. Vérification faite, ces trois lignes étaient mes propres commandes de
recherche, et aucun port n'écoutait. La bonne mesure est
`lsof -nP -iTCP -sTCP:LISTEN`, pas un grep sur la table des processus.

## Prochaine étape

SP-590, la limite de taille avant lecture de fichier à l'import CSV/XLSX. Petit
ticket, quelques lignes, aligné sur ce que font déjà avatar et messagerie.

Deux points ouverts nés de cette session :

- l'E2E `UNVERIFIED_USER`, à réparer côté seed
- Auth.js v5 reste en bêta et sous avis, sans version corrigée disponible.
  À surveiller à chaque `npm audit`, la sortie viendra d'une beta.33 ou de la
  version stable

Restent SP-591 (tunnel de conversion, le levier commercial), SP-592 (couverture)
et SP-593 (promesses RGPD). Rien n'est poussé, le push et la PR sont groupés en
fin de sprint.
