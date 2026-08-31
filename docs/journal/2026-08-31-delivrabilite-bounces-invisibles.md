# 31 août 2026, les bounces que personne ne voyait

| Champ | Valeur |
|---|---|
| Ticket | SP-579, lots 1 et 2 sur 3 |
| Documents produits | ce journal, `src/lib/email/bounce/` |
| Documents modifiés | `send.ts`, `types.ts`, `log-auth-email.ts`, `invitation.ts`, `welcome.ts`, `verification-email.ts`, `send-billing.ts`, `employees.ts`, `docs/deployment.md` |
| Contrôles | type-check vert, lint sans erreur, 3258 tests Vitest verts sur 195 fichiers, CI verte sur les deux PR |
| Jira | SP-579 créé, commenté trois fois, en cours |
| Mémoire | fiche sur les bounces réécrite |

## Ce qui a été fait

Suite directe de SP-578. Les deux bounces reçus sur `contact@smartplanning.fr`
pour un collaborateur de Sunlight ont révélé un angle mort plus large que la
seule invitation.

### Trois défauts, tous mesurés

Le statut `BOUNCED` existait dans le schéma, les validations, le filtre et le
badge de l'écran admin depuis SP-545, sans qu'aucune ligne de code ne l'écrive.
Mesure avant correctif : 41 lignes `email_logs` en production, **toutes en
SENT**. Le widget « échecs sur 7 jours » affichait donc zéro par construction,
et un taux de délivrabilité de 100 pour cent qui ne mesurait rien.

`send.ts` castait le retour de `sendMail` en `as { messageId: string }`, ce qui
jetait `accepted`, `rejected` et `response`. Un destinataire refusé ressortait
comme un envoi réussi.

`sendInvitationEmail` n'appelait pas `logAuthEmail`. Les trois invitations de
Sunlight, dont celle qui a rebondi, étaient absentes du journal censé servir au
diagnostic de délivrabilité.

### Le lot 1

Le résultat d'envoi porte désormais un `outcome` à trois valeurs, `SENT`,
`BOUNCED` ou `FAILED`. La distinction n'est pas cosmétique : une adresse
invalide ne se retente pas, une panne réseau si.

Point décisif trouvé via Context7 : quand **tous** les destinataires sont
refusés, Nodemailer lève une erreur `EENVELOPE` au lieu de renseigner
`rejected`. Nos envois étant mono-destinataire, c'est le chemin réellement
emprunté. Sans ce traitement, le correctif aurait raté le cas Sunlight tout en
paraissant complet, et aurait en plus retenté trois fois une adresse
définitivement invalide.

Le type `INVITATION` complète `logAuthEmail`, et les trois appelants
transmettent le `companyId`, la colonne étant NOT NULL. Deux corrections de
bord : le même repli `success ? SENT : FAILED` dans `send-billing.ts`, et deux
templates dont le type de retour restreint bloquait la remontée de l'`outcome`.

### Le lot 2

Un bounce asynchrone arrive après l'acceptation par le relais : le lot 1 ne peut
pas le voir, `sendMail` ayant déjà rendu la main. C'est le cas Gmail.

La description du ticket évoquait un webhook. Vérification faite en production,
c'était une fausse piste : le SMTP est `smtp.hostinger.com`, un service
mutualisé sans API d'événements. MailChannels n'apparaît dans les bounces que
comme son relais sortant, sans compte de notre côté. Le relevé IMAP de la boîte
est le seul chemin.

Le parseur suit la RFC 3464 et lit `Final-Recipient`, `Status` et
`Diagnostic-Code` par champ. Il dédoublonne, un même message portant l'adresse
trois fois. Le rapprochement se fait uniquement sur `recipientEmail`, jamais sur
un identifiant porté par le message : la boîte est commune à toutes les
entreprises, c'est donc un point d'isolation.

## Les écarts

**INBOX ne suffisait pas, et je l'ai su par hasard.** En configurant le VPS, j'ai
testé la connexion IMAP et regardé où étaient réellement les bounces. Les neuf
reçus depuis le 5 août étaient **tous en corbeille, aucun en INBOX**. La relève
telle qu'écrite n'aurait rien vu, et aurait été déployée en paraissant
fonctionner, ce qui est le pire des cas.

Le détail qui a tranché le diagnostic : le bounce du 24 août est en corbeille
**sans porter le drapeau `\Seen`**. Personne ne l'a ouvert, c'est donc un tri
automatique et non un geste humain, donc un problème structurel.

Deux conséquences. La relève couvre maintenant INBOX, la corbeille et les
indésirables. Et le filtre d'idempotence ne pouvait plus reposer sur l'état lu,
puisqu'un bounce peut arriver déjà lu : il passe à un mot-clé applicatif,
`SmartPlanningBounceSynced`. Ce choix a un second mérite, l'état « lu »
appartient à la personne qui relève la boîte et l'application n'a pas à le
modifier.

**Un second cas réel, invisible depuis 26 jours.** L'inventaire de la boîte a
montré que `krismos64@gmail.com`, MANAGER chez Super U Bordeaux, avait vu son
invitation rebondir trois fois le 5 août. Compte jamais activé, exactement le
même défaut que Sunlight. Un rejet antispam en 5.7.1 frappe aussi
`upb_pignon_sas_les_bords_du_lac@antispam2.xefi.fr`, sur une entreprise cliente
réelle.

**Une prédiction corrigée en cours de route.** J'avais annoncé que les bounces de
Sunlight ne seraient pas rattrapés, la fenêtre de relève étant de sept jours.
Vérification faite, ils y sont : trois bounces tombent dans la fenêtre. Ils
seront lus et parsés, mais sans effet, faute de ligne `EmailLog` à raccrocher.

**Le premier passage ne mettra rien à jour, et c'est normal.** Aucune ligne
n'existe pour ces adresses : le journal ne contenait que du billing et deux
types d'auth, jamais d'invitations. Le lot 2 rapproche des lignes que seul le
lot 1 sait créer, et le lot 1 ne journalise que les envois postérieurs à son
déploiement. Le dispositif devient effectif pour toute invitation envoyée
désormais.

## La boucle validée en production

Le déploiement seul ne prouvait rien : les deux bounces de Sunlight sortaient en
`unmatched`, faute de ligne `EmailLog` à raccrocher, le journal ne contenant
avant le lot 1 que du billing et deux types d'auth.

Test de bout en bout mené le 31 août, sans aucune écriture manuelle en base.
Christophe a renvoyé l'email de validation à l'adresse fautive depuis son compte
admin, `assertNotImpersonating` bloquant l'action en mode support.

| Heure | Événement | Preuve |
|---|---|---|
| 08:24:58 | La ligne `EmailLog` est créée | `SENT`, `smtpResponse: "250 2.0.0 Ok: queued"` |
| 08:24:58 | Le log applicatif dit « Envoi réussi » | le relais a accepté |
| 08:25:01 | Gmail refuse, le bounce revient | classé **directement en corbeille** |
| 08:26:53 | Passage du cron | `bounces: 1, updated: 1, errors: []` |
| 08:27:05 | Second passage | `bounces: 0`, pas de retraitement |

La ligne porte désormais `status: BOUNCED` et un `metadata.bounce` complet, avec
`kind: PERMANENT`, `status: 5.1.1` et le diagnostic SMTP. La base passe de 42
lignes toutes en `SENT` à 42 `SENT` et **1 `BOUNCED`, la première du projet**.

Trois enseignements de ce test. Le bounce est allé directement en corbeille,
donc la correction multi-dossiers du matin n'était pas théorique : sans elle le
test aurait échoué et le dispositif serait resté silencieux. Le délai entre
l'envoi accepté et le refus est de **trois secondes**, ce que le lot 1 ne peut
structurellement pas voir. Et l'idempotence tient sur données réelles.

Nuance à conserver : la ligne testée est de type `EMAIL_VERIFICATION`, pas
`INVITATION`, le renvoi ayant été fait depuis l'écran admin. Le rapprochement se
faisant sur l'adresse, la chaîne est prouvée à l'identique, mais le chemin
`INVITATION` lui-même n'a pas été exercé en production.

## Prochaine étape

**Lot 3**, le critère 4 du ticket : afficher dans la fiche employé qu'une adresse
a rebondi, pour que le dirigeant voie sa typo sans passer par l'écran admin
cross-tenant. C'est le lot qui ferme la boucle ouverte par Sunlight.

Les deux vérifications prévues sont faites, résultats ci-dessus.

Le compte de Cassy Bouson reste bloqué : son adresse est fausse, il faut la
corriger dans la fiche employé avant toute relance. C'est précisément ce que le
lot 3 rendra visible au dirigeant.

Reste ouvert sans ticket : la relance automatique avant expiration du token à
48 heures, héritée de SP-578.
