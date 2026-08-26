# 26 août 2026, souscription bloquée en fin d'essai, et variante de marque

Session ouverte sur un signalement précis : « j'ai un compte test Super U
Bordeaux qui vient d'expirer en prod, je voulais cliquer sur s'abonner
maintenant pour tester l'abonnement payant et impossible, rien ne se passe ».

Deux défauts distincts se cumulaient, et tous deux ne frappent que la dernière
journée d'essai, c'est-à-dire le moment exact de la décision d'achat.

## Le diagnostic, et une fausse piste assumée

Le clic ne produisait aucun appel à Stripe : les événements du compte
s'arrêtaient au 8 août, et les seules sessions Checkout du customer dataient des
6 et 7 août, toutes deux expirées. Pourtant le serveur répondait bien. Dans
`/var/log/nginx/smartplanning-access.log`, les clics apparaissaient en
`POST /app/dashboard/billing?reason=trial_expired` répondant 200, sans aucune
exception applicative sur la fenêtre.

Premier détour utile : le fichier `/var/log/nginx/access.log` ne contient que le
vhost de redirection HTTP, uniquement des 301. Le trafic HTTPS vit dans
`smartplanning-access.log`, nommé dans le vhost. Chercher dans le mauvais
fichier donne l'impression qu'aucune requête n'arrive.

J'ai d'abord conclu à un bundle JavaScript périmé côté navigateur, sur la foi
d'erreurs `Failed to find Server Action` présentes dans les logs. Elles étaient
réelles mais antérieures de 43 minutes aux clics, et le rechargement forcé du
cache a effectivement débloqué l'affichage de l'erreur, sans être la cause du
blocage lui-même. C'est en voyant remonter le message rouge « Erreur Stripe :
The `trial_end` date has to be at least 2 days in the future » que la vraie
cause est apparue.

## Défaut 1, `trial_end` sous le minimum de Stripe

Stripe refuse une session Checkout dont `subscription_data.trial_end` est à
moins de 48 heures. Le service ne testait que « la date est dans le futur » :

```ts
trialEndsAt && trialEndsAt.getTime() > Date.now()
```

L'essai finissait à 17h05, le clic avait lieu à 14h43. Deux heures de marge, la
condition passait, Stripe rejetait toute la session.

Corrigé par `STRIPE_PRICING.MIN_TRIAL_END_MS` : sous le seuil, `trial_end` est
omis et la souscription démarre en facturation immédiate.

## Défaut 2, le cron expirait l'essai sept heures trop tôt

`differenceInDays` de date-fns tronque vers zéro. À 7 heures de la fin, il
renvoie `0`, donc `daysRemaining <= 0` basculait la subscription en `EXPIRED`
alors que l'essai courait encore. Le dirigeant était alors redirigé par le
subscription guard vers `/billing?reason=trial_expired`.

La preuve est dans `/var/log/smartplanning-cron.log` : la ligne du
`2026-08-26T08:00:05` porte `"expired":1`. C'est ce passage qui a basculé le
compte, avec 7 heures d'essai devant lui.

Remplacé par un arrondi vers le haut. Vérifié que les seuils de rappel J-14,
J-7, J-3 et J-1 restent atteints exactement une fois, pour quatre heures de fin
d'essai différentes : aucun seuil manqué, aucun doublon.

## Ce qu'il ne fallait pas corriger

La page affichait « 2 / 0 sièges utilisés » et « Total mensuel 0,00 € », ce qui
ressemblait à une désynchronisation de données.

`Subscription.quantity` compte les sièges **facturés chez Stripe**, pas les
employés en base. `subscription-sync.service.ts` sort en
`no_stripe_subscription_id` tant qu'aucun abonnement n'existe. Les 10
subscriptions de production sont toutes à 0 et aucune n'a de
`stripeSubscriptionId` : la valeur est correcte.

Un `UPDATE` aurait inventé des sièges que Stripe ne facture pas, et la première
synchronisation les aurait écrasés. Le défaut est d'affichage, pas de données.

Anomalie voisine repérée et laissée en l'état : **Distri Shop** est en
`status = ACTIVE` avec `plan = FREE`, un `stripeCustomerId` mais aucun
`stripeSubscriptionId`, inchangée depuis le 17 avril. Ressemble à un réglage
manuel plutôt qu'à un défaut du cron.

## Correction des données de production

Statut rétabli selon la méthode du dépôt : `SELECT` préalable portant la clause
exacte du futur `UPDATE`, qui a mesuré une seule ligne, puis `UPDATE` en
transaction renvoyant `UPDATE 1`, conforme à l'attendu. Vérification finale :
plus aucun essai expiré à tort.

Les autres comptes `EXPIRED` ont une date de fin réellement passée et n'ont pas
été touchés.

## La question SEO, et une recommandation retirée

Deuxième partie de session : « profitons-en pour écrire un nouvel article ».

La règle du dépôt impose de lire la Search Console avant de produire une page.
Les chiffres au 26 août, sur 3 mois : 4860 impressions, 83 clics, CTR 1,7 pour
cent, position moyenne 18,4. La progression depuis le 11 août est réelle (2730
impressions, position 21,4) mais reste au-dessus du seuil de 15.

Les colonnes CTR et Position sont décochées par défaut dans l'interface. Sans
elles, j'ai d'abord recommandé de réécrire les titres de la page restaurant, en
supposant qu'elle sortait en page 1 ou 2. Les données l'ont démentie : les
requêtes métier sortent toutes autour de la position 21, donc en page 3. Un CTR
nul y est la normale, et aucune réécriture n'y change rien. Recommandation
retirée.

Conclusion : ni 4e guide ni réécriture de titres. Le levier reste l'autorité de
domaine, conformément à SP-563.

## Une anomalie qui vaut du trafic de marque

`smart planning` en deux mots sortait en **position 41** sur 191 impressions,
quand `smartplanning` accolé sortait en **position 6,5**. Google traite les deux
formes comme des requêtes distinctes.

En ouvrant le code, `alternateName: 'Smart Planning'` existait déjà : mon
hypothèse initiale était fausse. Le vrai problème était ailleurs. Le HTML servi
contenait **56 occurrences accolées contre 2 espacées**, ces deux étant les
`alternateName` du JSON-LD eux-mêmes. La variante n'apparaissait nulle part dans
le contenu visible, or Google pondère faiblement `alternateName`.

Elle est désormais portée par la meta description de l'accueil (resserrée à 153
caractères pour ne pas faire tronquer l'essai gratuit), une réponse de la FAQ
qui alimente aussi le `FAQPage`, les `alternateName` de l'`Organization` et du
`WebSite` passés en tableau, et les deux `llms*.txt`.

Le `<title>` et le H1 n'ont pas été touchés : ils portent la forme qui se classe
déjà en position 6,5.

Effet non garanti et assumé comme tel : Google rapproche les variantes de marque
sur des signaux multiples, dont les liens entrants. Rendre la variante visible
est la condition minimale, pas une certitude.

## Vérifications

`npm run type-check` au vert. `npm run test` à 3195 tests sur 191 fichiers.
Lint sans nouvel avertissement sur les fichiers touchés.

Trois tests ajoutés sur `trial_end`, deux sur le cron, trois sur la variante de
marque. **Les trois cas négatifs ont été prouvés par mutation** : en restaurant
l'ancienne condition, le test correspondant rougit à chaque fois.

Les tests du cron mockaient `differenceInDays`, que le correctif n'utilise plus.
Ces mocks seraient devenus inopérants sans rien signaler, cas typique du test
qui survit à son objet. Remplacés par une horloge figée et de vraies dates de
fin, ce qui exerce le calcul au lieu de le court-circuiter.

## Livraison

| Commit | Contenu |
| --- | --- |
| `f9fd0e9` | `trial_end` omis sous le minimum Stripe de 48 heures |
| `d660a0e` | cron, arrondi vers le haut, tests sans mock date-fns |
| `8b2c4e5` | variante de marque « Smart Planning » rendue visible |

Deux branches : `fix/stripe-trial-end-minimum` porte les deux correctifs,
`seo/variante-marque-smart-planning` part de `main`.

## Prochaine étape

Après déploiement, demander la réindexation de l'accueil dans la Search Console.
Relire la position de `smart planning` dans deux à quatre semaines pour mesurer
l'effet réel.

Le levier SEO restant est l'autorité de domaine : liens entrants, annuaires SaaS
français, et le portfolio `christophe-dev-freelance.fr` qui pointe vers le site.
Un retour d'expérience technique sur les deux défauts de cette session, publié
hors du site, servirait ce levier plutôt que d'ajouter une page de plus en
page 3.
