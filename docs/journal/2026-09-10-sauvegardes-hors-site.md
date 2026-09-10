# 10 septembre 2026, sortir les sauvegardes du VPS, et deux connecteurs morts

| Champ | Valeur |
|---|---|
| Ticket | SP-594, le point le plus urgent laissé ouvert par SP-593 |
| Documents produits | `scripts/ops/sync-backups-offsite.sh`, deux unités systemd |
| Documents modifiés | `CLAUDE.md`, `README.md`, `scripts/ops/README.md`, `docs/deployment.md`, `docs/database-architecture.md`, `docs/runbooks/restauration-base-production.md`, `.claude/agents/docker-devops.md`, `.claude/agents/security-auditor.md` |
| Contrôles | 6 gardes éprouvées hors ligne, envoi réel vérifié taille et SHA-1, restauration prouvée sur une machine autre que le VPS, exécution systemd `Result: success` |
| Jira | SP-594 commenté et clos |
| Mémoire | fiche sur la copie hors site, fiche sur les connecteurs MCP |

## Ce qui a été fait

SP-593 sauvegardait la base sur le disque qui la porte. Photocopier un document
et ranger la photocopie dans le même tiroir ne protège pas de l'incendie du
tiroir : une panne matérielle, un incident OVH ou un rançongiciel emportait la
base, ses archives et la clé qui les déchiffre.

Une copie part désormais chaque nuit à 04:10 UTC vers Backblaze B2, chez un
fournisseur **volontairement distinct d'OVH**. Un stockage objet OVH aurait
couvert le disque mort, pas la panne du fournisseur. La volumétrie rendait le
choix facile : 125 Ko par archive, moins de 4 Mo pour 30 jours de rétention,
soit 0,04 % des 10 Go gratuits.

Trois décisions techniques valent d'être retenues. **L'API native B2 plutôt que
S3**, qui aurait imposé une signature AWS v4 en shell, du code fragile pour rien ;
`curl`, `jq` et `sha1sum` étaient déjà sur le VPS, rien n'a été installé. **La
vérification porte sur ce que B2 a reçu**, taille et SHA-1 relus depuis le
bucket, parce qu'un code 200 dit que la requête a abouti, pas que le fichier est
intact. **Le chiffrement côté serveur du bucket reste désactivé** : les fichiers
partent déjà chiffrés avec notre passphrase, activer celui de Backblaze
ajouterait une couche dont ils détiendraient la clé.

Le script refuse aussi une archive de plus de 48 h. Si la sauvegarde locale
cessait, le hors-site recopierait un vieux fichier en paraissant sain, ce qui
est exactement le défaut que SP-588 a corrigé sur le CD.

## Les écarts

**Trois de mes propres contrôles ont menti, et c'est le fil de la journée.**

Mon premier contrôle du fichier d'identifiants affichait « défini » pour trois
variables dont deux étaient vides : mon masquage remplaçait tout ce qui suit le
`=`, y compris le vide. `od -c` a montré la vérité. Un contrôle qui ne peut pas
distinguer « présent » de « absent » ne contrôle rien.

Le compteur de rotation annonçait « environ 2 conservées » sur un bucket qui
n'en contenait qu'une : il calculait au lieu de relire. Sur un dispositif de
sauvegarde, c'est le chiffre sur lequel on décide si une restauration est
possible. Il relit désormais la liste distante.

Enfin, en vérifiant la restauration, un `grep -c` a affiché « 0 objets » là où
`pg_restore` refusait l'archive avec « unsupported version (1.15) » : le client
15 du Mac ne lit pas une archive PostgreSQL 16. Mon grep avalait l'erreur et
faisait passer un problème de version pour une archive vide.

**La clé d'application est arrivée corrompue par un copier-coller.** `K003`
était devenu `ЧKOO`, un Tché cyrillique suivi de deux lettres O à la place des
zéros, 32 caractères au lieu de 31. Invisible à l'œil. J'ai corrigé le préfixe
par déduction, ce qui a fait passer l'erreur de `bad_auth_token` à
`unauthorized` sans résoudre le problème : d'autres sosies subsistaient plus
loin. Seul un collage direct par `pbpaste`, sans affichage intermédiaire, a
fonctionné. La leçon est que la retranscription était la cause, et que j'ai
insisté dessus deux fois avant de l'éliminer.

**Une commande que j'avais donnée était du bash sur un shell zsh.** Le
`read -s -p` n'affectait pas la variable, et le fichier est parti avec deux
valeurs vides sans que rien ne le signale.

## Ce qui est prouvé

Restauration réelle depuis B2, sur le MacBook, machine autre que le VPS, en
n'utilisant que ce dont on disposerait après un sinistre : la clé
d'application et la passphrase.

```
23 tables, 200 objets restaures

audit_logs   1519 = 1519      schedules       999 = 999
users          71 = 71        notifications   235 = 235
employees      85 = 85        email_logs       51 = 51
companies      12 = 12        subscriptions    12 = 12
teams          16 = 16        leave_requests   15 = 15
```

Dix comptages identiques à la production. Le conteneur de test et le dump en
clair ont été supprimés, ils portaient les données personnelles des salariés de
douze entreprises.

Les deux timers sont armés et l'exécution par systemd est vérifiée
(`Result: success`), pas seulement l'exécution en ligne de commande.

## Hors ticket, deux connecteurs MCP morts

Le connecteur `jira` local ne voyait plus aucun projet et rendait
« 事务不存在或者您没有查看的权限 » sur un ticket clos la veille. Test direct
contre l'API : HTTP 401 sur Jira, 403 sur Confluence. Les deux jetons, créés en
novembre 2025, étaient expirés ou révoqués. Les serveurs ont été supprimés, le
connecteur OAuth `claude_ai_Atlassian` couvrant déjà Jira et les quatre espaces
Confluence.

À retenir : le serveur ne remontait pas le 401 comme tel, il laissait passer un
message d'Atlassian dans une locale arbitraire. Un connecteur qui répond « ce
ticket n'existe pas » quand il veut dire « je ne suis pas authentifié » fait
conclure à un backlog vide.

Le serveur MCP GitHub échoue lui pour une autre raison : le plugin officiel
attend `GITHUB_PERSONAL_ACCESS_TOKEN`, non définie, donc l'en-tête part
littéralement en `Bearer ${GITHUB_PERSONAL_ACCESS_TOKEN}`. Il n'a pas été
supprimé, `gh` étant déjà authentifié et suffisant.

## Ce qui reste ouvert

- **Le cycle de vie du bucket B2** est sur « Keep all versions ». Sans
  incidence, les noms étant horodatés, mais une règle de suppression
  définitive éviterait des versions cachées facturées
- **Le chiffrement au repos n'existe toujours pas.** Disque `ext4` nu, aucune
  extension `pgcrypto`. Un accès fichier sur le VPS donne accès à la clé locale.
  Décision d'architecture, sans ticket
- **SP-595**, l'E2E `UNVERIFIED_USER` qui échoue en local et passe en CI
- **SP-591 attend toujours sa vérification terrain** : un parcours complet en
  production, puis confirmer les neuf étapes dans Umami
