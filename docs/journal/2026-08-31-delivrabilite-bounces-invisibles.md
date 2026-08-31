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

## Prochaine étape

**Lot 3**, le critère 4 du ticket : afficher dans la fiche employé qu'une adresse
a rebondi, pour que le dirigeant voie sa typo sans passer par l'écran admin
cross-tenant. C'est le lot qui ferme la boucle ouverte par Sunlight.

Deux vérifications à faire une fois le déploiement passé :

- Déclencher un passage manuel du cron et lire son compte rendu, plutôt que de
  supposer qu'il fonctionne
- Relancer l'invitation de Cassy Bouson depuis la fiche employé, ce qui doit
  produire une ligne `INVITATION` puis un `BOUNCED` au passage suivant. C'est le
  seul test de bout en bout qui prouve la chaîne complète

Reste ouvert sans ticket : la relance automatique avant expiration du token à
48 heures, héritée de SP-578.
