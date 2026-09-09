# 9 septembre 2026, un tunnel qui ne mesurait rien

| Champ | Valeur |
|---|---|
| Ticket | SP-591, quatrième des six tickets issus de l'audit |
| Documents produits | `funnel-analytics.service.ts`, `funnel-analytics.config.ts`, `funnel-milestones.service.ts`, `TrackedCtaLink.tsx`, `funnel-analytics.test.ts` |
| Documents modifiés | `teams.ts`, `employees.ts`, `schedules.ts`, `csv-import.ts`, `stripe.service.ts`, `RegisterForm.tsx`, 3 sections de la landing, `docs/analytics.md` |
| Contrôles | type-check vert, lint sans erreur, 3321 tests verts sur 201 fichiers, chaîne vérifiée contre l'instance de production |
| Jira | SP-591 commenté |
| Mémoire | fiche sur le rejet silencieux d'Umami |

## Ce qui a été fait

Le hook `useUmamiTrack` existait depuis SP-345, documenté, avec ses événements
définis dans `docs/analytics.md`. Aucun composant ne l'appelait. La
fonctionnalité paraissait livrée et ne mesurait rien.

Les neuf étapes sont maintenant émises, par deux chemins distincts que la
nature du tunnel impose. Les étapes 1 à 3 (CTA, inscription) partent du
navigateur et restent conditionnées au consentement analytics. Les étapes 4 à 9
vivent dans des Server Actions et dans le webhook Stripe, où il n'y a ni
`window`, ni hook React, ni cookie de consentement : le webhook n'a même pas de
navigateur à l'autre bout.

Christophe a tranché sur le chemin serveur : émission par l'API `/api/send`
d'Umami, sans aucune donnée personnelle. Nom de l'étape, rang, ancienneté du
compte en jours, tranche d'effectif, méthode. Jamais de `companyId`, d'email ni
d'identifiant utilisateur. L'appel partant du serveur, l'IP vue par Umami est
celle du VPS. C'est ce qui rend ce chemin licite sans consentement, et un test
le vérifie.

## Les écarts

**Umami rejette silencieusement, et j'ai failli livrer une instrumentation
morte.** Le premier envoi de vérification, avec
`User-Agent: SmartPlanning-Server/1.0`, a reçu HTTP 200 et `{"beep":"boop"}`.
Ni erreur, ni trace, ni événement enregistré. Seule une chaîne de navigateur
obtient une réponse porteuse de `sessionId` et `visitId`, qui est la marque
d'un événement accepté.

Le pire est que mon test unitaire passait : il vérifiait qu'un `User-Agent`
existe, pas qu'Umami l'accepte. Un test vert sur une production qui aurait tout
perdu, c'est-à-dire exactement le défaut que ce ticket corrigeait au départ. Le
test porte désormais sur la forme de la chaîne, et la vérification a été refaite
avec la valeur exacte du service.

**Les jalons devaient compter les lots, pas les unités.** Un import de douze
collaborateurs sur une entreprise vide donne un total de douze, pas de un. Une
comparaison naïve à 1 aurait raté la première fois précisément dans le cas le
plus courant, l'import CSV étant le chemin d'onboarding recommandé. Le
détecteur compare donc le total au nombre créé par l'opération. Même correction
pour `createSchedule`, qui crée plusieurs plannings en une transaction.

**`Schedule` ne porte pas de `companyId`.** Ma première requête de comptage
aurait échoué au type-check. L'isolation passe par la relation `employee`.

**Les sections de la landing sont des Server Components.** Y appeler un hook
aurait imposé de les passer en `'use client'`, alourdissant le bundle de pages
dont le référencement est l'enjeu principal. D'où `TrackedCtaLink`, qui isole
la partie cliente au seul lien.

**Le lint a failli passer inaperçu.** `JSON.parse` renvoie `any`, refusé par la
règle stricte du projet, et les cinq erreurs étaient noyées en fin de sortie
derrière des avertissements préexistants. Filtrer sur « Error: » les fait
ressortir, comme le veut la fiche mémoire sur le sujet.

## Ce qui n'est pas vérifiable ici

Le ticket demande « les neuf événements visibles dans Umami après un parcours
complet en conditions réelles, preuve par capture ». Cela n'est pas atteignable
depuis une machine de développement : il faut le code déployé en production, un
parcours d'inscription réel, et un paiement Stripe abouti pour l'étape 9.

Ce qui est prouvé aujourd'hui : la chaîne technique fonctionne de bout en bout,
la chaîne exacte du service obtenant un `sessionId` de l'instance de
production. Ce qui reste à faire après déploiement : le parcours réel, et la
capture.

## Prochaine étape

SP-592, la couverture de tests qui exclut `src/lib/` et `src/app/`.

Après déploiement de celui-ci, refaire le parcours complet et vérifier les neuf
étapes dans Umami, onglet Events, filtre `funnel-`. C'est la seule preuve qui
close vraiment le critère 1.

Reste ensuite SP-593 (promesses RGPD). Rien n'est poussé.
