# 13 septembre 2026, durcir la clé Backblaze, et un contrôle qui a détruit ce qu'il vérifiait

| Champ | Valeur |
|---|---|
| Ticket | SP-597, créé et fermé dans la session |
| Documents produits | `scripts/ops/rotate-b2-key.sh`, `scripts/ops/check-b2-key-hardening.sh` |
| Documents modifiés | `scripts/ops/sync-backups-offsite.sh`, `scripts/ops/README.md`, `docs/deployment.md`, `docs/runbooks/restauration-base-production.md`, `CLAUDE.md` |
| Contrôles | shellcheck propre sur les trois scripts, contrôle de durcissement en code 0, restauration hors site conforme à la production sur cinq tables |
| Jira | SP-597 créé, à passer en Terminé |
| Mémoire | fiche à écrire sur le contrôle destructeur |

## Le risque, et ce qu'il restait ouvert de SP-594

SP-594 avait sorti les sauvegardes du VPS, chez un fournisseur distinct d'OVH.
La copie distante restait pourtant destructible **depuis le VPS lui-même** : la
clé applicative qui y vit portait `deleteFiles`. Le scénario est le rançongiciel,
qui chiffre la base puis se sert de la clé présente sur le serveur pour
supprimer les copies. Le dispositif hors site devenait inutile exactement au
moment où il servirait.

Le défaut avait été repéré la veille en traitant LS-223 sur Lune & Soleil, et
laissé hors périmètre de ce ticket-là. C'est celui-ci.

## Vérifier plutôt que recopier le contexte

Trois écarts entre ce qui était annoncé et ce que la mesure a montré.

**La clé portait dix-huit capacités, pas une.** Le préréglage « Read and Write »
de la console les accorde toutes. `deleteFiles` n'était donc pas la seule à
retirer :

| Capacité | Ce qu'elle permet |
|---|---|
| `writeBucketLifecycleRules` | poser une règle à un jour et faire effacer l'historique **par Backblaze**, sans jamais appeler de suppression |
| `writeBucketEncryption` | activer un chiffrement dont Backblaze détient la clé |
| `writeBuckets` | changer le compartiment sous le script |

Retirer `deleteFiles` en laissant la première n'aurait rien fermé.

**Aucune règle de cycle de vie n'existait.** `lifecycleRules: []`. Toute la
rétention distante reposait sur le script, c'est-à-dire sur la machine dont on
cherche précisément à se méfier.

**Deux défauts se couvraient l'un l'autre dans la rotation.** Aucun des six
appels `curl` ne portait `--fail`, et la suppression redirigeait son corps vers
`/dev/null`. Un refus 401 était donc compté comme un ménage réussi : le
durcissement serait resté invisible dans le journal, au moment précis où il
fallait le voir.

## Le contrôle a détruit ce qu'il servait à protéger

C'est l'enseignement de la session, et il a coûté deux archives.

Le test négatif vise un fichier **réel**, avec son vrai `fileId`. C'est correct,
et c'est la correction apportée à LS-223 le matin même : un `fileId` fabriqué
fait répondre « Bad file ID » en `bad_request`, Backblaze validant la forme
avant les droits, et la question de l'autorisation n'est jamais posée.

Je l'ai lancé contre la clé **non encore durcie**, pour prouver par mutation
qu'il rougissait bien sur le défaut. Il a rougi, à juste titre, en supprimant
réellement deux versions d'archives.

```
ECHEC GRAVE : la suppression a ABOUTI, l'archive quotidienne-20260910-032029
vient d'etre detruite.
```

Puis, en vérifiant si `bypassGovernance: false` pouvait servir de dry run,
l'archive du 13 septembre a été détruite à son tour. L'hypothèse était fausse,
et je l'ai éprouvée contre une vraie archive au lieu d'un fichier jetable.

**L'API B2 n'offre aucun dry run pour `b2_delete_file_version`.** Le test négatif
ne peut donc être que réel, et il n'est sans risque qu'**après** le durcissement.
C'est une contrainte d'ordonnancement, pas un détail d'implémentation, et elle
est désormais écrite en tête du script.

Les trois archives ont été renvoyées depuis les copies locales, SHA-1 vérifiés
un par un. Rien n'a été perdu : le contenu vivait aussi sur le VPS, et c'est la
seule raison pour laquelle cet incident n'en est pas un.

**Le raisonnement qui mène à ce défaut est celui d'un garde-fou consciencieux** :
prouver qu'un contrôle attrape bien ce qu'il prétend attraper. La preuve par
mutation reste juste, mais elle ne vaut que si l'échec est réversible.

## Une clé maîtresse ne se reconnaît pas à ses capacités déclarées

Second piège, rattrapé avant qu'il ne coûte du temps. Le script de rotation
vérifiait la présence littérale de `writeKeys` dans les capacités annoncées.

Or `b2_authorize_account` rend **`capabilities: null`** pour une clé maîtresse
valide, en v4 comme en v3 : elle les possède toutes implicitement et l'API ne
les énumère pas. Le garde aurait refusé une clé parfaitement bonne, avec un
message évoquant une clé mal collée, c'est-à-dire exactement le faux diagnostic
du 10 septembre.

Le garde exerce désormais `b2_list_keys`, une lecture qui exige `listKeys`.
Même principe que le test négatif : ce qu'un service **déclare** ne remplace pas
l'exercice de l'appel.

## Ce qui est en place

Ordre imposé, la règle avant la bascule : sans elle, le script masquerait sans
que rien n'efface, et le compartiment accumulerait sans fin.

```
regle de cycle de vie   masquage 30 jours, effacement 1 jour apres
nouvelle cle            00339bee54f9a9f0000000004
capacites               listBuckets, listFiles, readFiles, writeFiles
ancienne cle            00339bee54f9a9f0000000001, revoquee, rend 401
```

Le masquage prouvé sans `deleteFiles`, rétention forcée à 0 jour le temps du
contrôle :

```
Rotation distante : 4 masquee(s), 0 visible(s) hors site

hide    quotidienne-20260910-032029.dump.gpg  0
upload  quotidienne-20260910-032029.dump.gpg  127731
```

Les marqueurs coexistent avec les archives intactes, là où
`b2_delete_file_version` aurait détruit.

## Une conséquence non anticipée, mesurée plutôt que supposée

La clé durcie **ne peut pas retirer ses propres marqueurs de masquage**,
`deleteFiles` lui ayant été retiré. J'ai vérifié ce que cela coûte réellement
plutôt que de le supposer : une archive masquée reste **entièrement
téléchargeable par son `fileId`**, SHA-1 identique à la copie locale.

Le masquage la retire de la liste par nom, il ne la rend pas inaccessible. La
procédure de restauration passe donc par `b2_list_file_versions` puis
`b2_download_file_by_id`, jamais par le nom. C'est écrit dans le runbook.

## Vérifications finales

```
check-b2-key-hardening.sh   les trois sens passent, code 0
service hors-site           Result=success, sha1 concordant
restauration hors site      71 users, 12 companies, 85 employees,
                            1521 audit_logs, 999 schedules
production                  chiffres identiques sur les cinq tables
ancienne cle                401 unauthorized
```

La restauration part de l'archive **téléchargée depuis B2 avec la clé durcie**,
déchiffrée, restaurée dans une base jetable, et non de la copie locale : c'est
la chaîne complète qui est prouvée, pas seulement son dernier maillon.

## Nettoyage

`b2.conf.avant-sp597` et `b2.conf.save` effacés au `shred`. Le second traînait
depuis la mise en service du 10 septembre et portait un identifiant, il n'était
nommé nulle part. `/etc/smartplanning/` ne contient plus que `b2.conf`,
`backup.key` et `cron.env`.

## Les écarts

Le ticket prévoyait `--fail`. Les six appels portent `--fail-with-body` : `--fail`
masque le corps de la réponse, or c'est lui qui porte le diagnostic de Backblaze,
et c'est ce qui avait fait perdre du temps sur LS-223 devant un 400 muet.

Le ticket ne nommait pas la redirection vers `/dev/null` dans la rotation, qui
annulait l'effet de `--fail-with-body` sur l'appel le plus important. Corrigée.

## Prochaine étape

**SP-597 est fermé**, ses neuf critères vérifiés par la mesure.

Deux points relevés hors périmètre :

- côté Lune & Soleil, l'en-tête de `verifier-cle-b2-durcie.sh` décrit encore la
  cible comme « un fichier INEXISTANT » alors que le corps vise un fichier réel
  depuis la correction du matin. Le commentaire contredit le code
- le chiffrement au repos du disque du VPS reste une décision d'architecture
  sans ticket, inchangée depuis SP-593
