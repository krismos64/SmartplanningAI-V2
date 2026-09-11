# Vérification terrain du tunnel de conversion (SP-591)

> **Statut** : parcours jamais effectué au 11 septembre 2026
> **Préalables vérifiés le 11 septembre 2026**, détail en fin de document

L'instrumentation des neuf étapes est déployée depuis le 9 septembre 2026, et
n'a jamais rien enregistré : `website_event` comptait 3879 lignes et zéro
événement `funnel-`. Une feature close et testée peut ne rien produire, c'est
déjà arrivé sur le rappel d'essai J-1 (sprint 21). Ce document décrit le
parcours qui le prouve, ou l'infirme.

## Ce qui est déjà prouvé, à ne pas refaire

- La chaîne serveur fonctionne de bout en bout, mesurée depuis le conteneur
  applicatif de production : événement émis, réponse portant un `sessionId`,
  ligne écrite en base
- L'image déployée (`sha-8c9a4dc`) est bien le dernier commit de `main`
- `NODE_ENV=production` dans le conteneur, donc l'émission serveur est active
  sans avoir à poser `UMAMI_SERVER_TRACKING`
- Le `websiteId` du conteneur est celui du site Umami qui porte les événements
- Les neuf étapes sont branchées dans le code, vérifiées appelant par appelant

Ce qui reste à prouver est le seul maillon qu'aucune commande ne peut simuler :
qu'un parcours humain réel déclenche bien ces émissions.

## L'outil de lecture

```bash
./scripts/ops/read-funnel-steps.sh              # état complet
./scripts/ops/read-funnel-steps.sh --depuis 1h  # dernière heure
./scripts/ops/read-funnel-steps.sh --detail     # une ligne par événement
```

Il lit la base directement. Ne pas se fier au tableau de bord Umami pour cette
vérification : il classe les événements par volume et une étape à zéro y est
absente plutôt qu'affichée vide, exactement l'information qu'on cherche.

Lancer le script **entre chaque étape** plutôt qu'une fois à la fin : une étape
muette se diagnostique bien plus facilement quand on sait quelle action venait
d'être faite.

## Contrainte qui décide du compte à utiliser

Les étapes 4, 5 et 6 ne s'émettent que si c'est une **première fois pour
l'entreprise** :

| Étape | Condition exacte dans le code |
|---|---|
| 4, première équipe | `teamCount !== 1` sort sans rien émettre |
| 5, premiers collaborateurs | `employeeCount !== createdCount` sort |
| 6, premier planning | `scheduleCount !== createdCount` sort |

**Un compte existant ne produira donc jamais ces trois étapes.** Le parcours
demande une entreprise créée pour l'occasion. C'est volontaire : ces étapes
mesurent l'activation, pas l'usage courant.

Prévoir une adresse email réelle et recevable, le compte devant être vérifié
(`emailVerified` est un verrou de connexion depuis SP-526).

## Le parcours, étape par étape

### Étapes 1 à 3, le navigateur

**Accepter le consentement analytics** en arrivant sur le site, sinon le script
Umami n'est pas injecté et ces trois étapes ne partiront pas. C'est le
comportement normal, pas un défaut.

1. **`funnel-cta-click`** : depuis la page d'accueil, cliquer sur un CTA
   d'inscription (composant `TrackedCtaLink`)
2. **`funnel-signup-start`** : soumettre le formulaire d'inscription
3. **`funnel-signup-complete`** : le compte est créé

Puis vérifier l'email et se connecter.

### Étapes 4 à 6, le serveur, l'activation

4. **`funnel-first-team`** : créer la première équipe
5. **`funnel-first-employee`** : ajouter des collaborateurs. Le champ `method`
   distingue `import` (CSV) de `manual` : les deux chemins n'ont pas le même
   coût pour l'utilisateur, tester celui qu'un vrai dirigeant emprunterait
6. **`funnel-first-schedule`** : créer le premier planning. C'est le jalon
   d'activation le plus fort du produit

### Étape 7, l'embarquement d'un salarié

7. **`funnel-invitation-accepted`** : inviter un collaborateur, puis activer ce
   second compte depuis le lien reçu. Il faut donc une deuxième adresse email

C'est l'étape où l'onboarding avait échoué chez Sunlight (SP-578), et la seule
qui prouve que le dirigeant réussit à embarquer quelqu'un.

### Étapes 8 et 9, le paiement

8. **`funnel-checkout-opened`** : ouvrir le Checkout Stripe depuis l'écran de
   souscription
9. **`funnel-subscription-confirmed`** : aller au bout du paiement

L'étape 9 part du **webhook Stripe**, seul endroit où la confirmation est
certaine : le retour du navigateur sur `success_url` ne prouve pas qu'un
paiement a abouti. Elle peut donc arriver quelques secondes après la 8.

Si le paiement réel n'est pas souhaitable, l'étape 8 se vérifie seule et
l'étape 9 reste à confirmer sur la première conversion cliente réelle. Dans ce
cas, annuler l'abonnement de test côté Stripe après coup.

## Lire le résultat sans se tromper

**Ne jamais diviser une étape serveur par une étape navigateur.** Les deux ne
sont pas sur la même échelle : les étapes 1 à 3 dépendent du consentement,
refusé par la quasi-totalité des visiteurs (mesure du 10 septembre 2026, 401
requêtes Nginx et 86 visiteurs distincts pour zéro session Umami), alors que les
étapes 4 à 9 voient tout le monde. Le rapport donnerait un taux faussement
excellent.

Deux lectures valables : comparer les étapes 4 à 9 entre elles, ou suivre une
même étape dans le temps.

Sur ce parcours de vérification précis, le compte attendu est **1 par étape**,
et la question est binaire : chaque étape a-t-elle laissé une ligne.

## Si une étape reste muette

Regarder d'abord les journaux applicatifs, le service avale ses erreurs par
conception et les journalise sous `[FunnelMilestones]` :

```bash
ssh smartplanning "docker logs smartplanning-app --since 30m 2>&1 | grep -iE 'funnel|umami'"
```

Trois causes déjà connues, par ordre de fréquence :

1. **Étape 1 à 3 muette** : consentement analytics refusé, ou script non
   injecté. Vérifier la présence du script dans la page
2. **Étape 4, 5 ou 6 muette** : l'entreprise avait déjà une équipe, un
   collaborateur ou un planning, la condition de première fois n'est pas
   remplie. Vérifier le compte réel en base
3. **Aucune étape serveur** : Umami rejette silencieusement une requête dont le
   User-Agent ne ressemble pas à un navigateur, en répondant HTTP 200 et
   `{"beep":"boop"}`. La présence d'un `sessionId` dans la réponse est la seule
   marque d'un événement accepté

## Après le parcours

Consigner le résultat dans `docs/journal/`, mettre à jour `docs/analytics.md`
si une étape se révèle mal branchée, et clore SP-591 dans Jira. Retirer aussi
la fiche de rappel `sp591-parcours-tunnel-a-faire` de la mémoire, son objet
étant alors épuisé.
