# 2 octobre 2026, l'email de vérification limité à trois envois par heure et par adresse

| Champ              | Valeur                                                                                                                       |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| Ticket             | SP-606, ouvert le 30 septembre en livrant SP-605                                                                             |
| Documents produits | `src/lib/actions/__tests__/verification-send-rate-limit.test.ts`, cette entrée                                               |
| Documents modifiés | `src/lib/actions/verification-actions.ts`                                                                                    |
| Contrôles          | type-check propre, lint sans erreur, Vitest 3379/3379 sur 207 fichiers, couverture 53,2 % des lignes et 75,75 % des branches |
| Jira               | SP-606 commenté critère par critère                                                                                          |
| Mémoire            | aucune fiche nouvelle                                                                                                        |

## Ce qui a été fait

`sendVerificationEmailAction` envoyait un email à chaque appel, sans limite. Le
bouton de renvoi ajouté par SP-605 rendait l'abus trivial : une IP pouvait
déclencher des milliers d'envois vers une adresse non vérifiée, au détriment du
destinataire et de la réputation d'envoi du domaine.

La limite passe par `checkRateLimit`, déjà en place pour le formulaire de
contact et le renvoi admin : trois envois par heure, Redis puis repli mémoire.
La clé hache en SHA-256 l'adresse normalisée, comme le service la normalise,
pour que la casse et les espaces ne contournent pas le quota et que Redis ne
stocke pas l'adresse en clair. Au-delà, rien ne part et l'action renvoie
`{ success: true }`, comme pour un envoi réel : un refus visible révélerait
l'existence du compte.

Sept tests tournent sur le vrai limiteur et non sur un mock, l'un sur le repli
mémoire, l'autre sur un faux client Redis qui enregistre les clés. Deux
mutations détectées : refus retiré, quatre tests rouges ; normalisation
retirée, un test rouge.

## Les écarts

L'inscription passe par la même action (`auth-actions.ts`). L'envoi initial
compte donc dans le quota, et un nouvel inscrit dispose de deux renvois dans
l'heure. Choix gardé : une limite posée sur le seul renvoi laisserait
l'inscription comme porte d'entrée.

Aucun E2E ne clique sur le renvoi, la CI ne peut donc pas buter sur le quota
avec son Redis partagé.

Le hook de sécurité a signalé un `exec()` dans le test : c'est celui de la
transaction Redis simulée, pas `child_process`.

## Prochaine étape

- `checkRateLimit` rejoue `EXPIRE` à chaque appel sur le chemin Redis : la
  fenêtre repart de zéro à chaque tentative. Plus strict que prévu, sans
  danger ici, mais le formulaire de contact a le même comportement
- Unifier le stockage des dates de créneau : trois conventions en base, et une
  détection de conflits qui calcule ses bornes de journée en UTC
- L'email SP-480 part aussi à l'auteur du créneau
- Contacter Trasco avant la fin de son essai, le 21 octobre
