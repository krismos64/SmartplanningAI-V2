# Scripts d'exploitation

Scripts qui tournent sur le VPS de production, versionnés ici pour ne pas
exister uniquement sur la machine.

## `check-tls-expiry.sh`

Surveille l'expiration des certificats TLS **tels qu'ils sont servis en HTTPS**,
sur `smartplanning.fr`, `www.smartplanning.fr` et `analytics.smartplanning.fr`.

### Pourquoi ce script existe

Dans la nuit du 17 au 18 août 2026, le DNS de `smartplanning.fr` a basculé vers
le CDN Hostinger, qui a présenté un vieux certificat expiré depuis le
23 février. Les journaux Nginx datent la coupure précisément : 2997 requêtes le
17 août, puis un effondrement dès minuit.

Certbot fonctionnait pourtant parfaitement. L'archive du VPS montre une
couverture continue, janvier à avril, mars à juin, mai à août, juillet à
octobre, sans le moindre trou. Le VPS n'a jamais servi de certificat expiré :
le certificat périmé appartenait à l'infrastructure Hostinger.

Un contrôle portant sur `/etc/letsencrypt/` ou sur `certbot certificates`
n'aurait rien détecté. C'est la raison pour laquelle ce script interroge le
port 443 par le nom public, résolution DNS comprise : c'est le seul point de vue
qui corresponde à celui du visiteur.

### Ce qu'il détecte

| Situation | Détecté |
| --- | --- |
| Certificat expiré ou proche de l'expiration (seuil 21 jours) | oui |
| Certificat valide mais ne couvrant pas le domaine (CDN ou proxy tiers) | oui |
| Port 443 injoignable, DNS cassé, service arrêté | oui |

### Installation sur le VPS

```bash
scp scripts/ops/check-tls-expiry.sh smartplanning:/tmp/
ssh smartplanning 'sudo mv /tmp/check-tls-expiry.sh /opt/smartplanning/ops/ \
  && sudo chown root:root /opt/smartplanning/ops/check-tls-expiry.sh \
  && sudo chmod 700 /opt/smartplanning/ops/check-tls-expiry.sh'

scp scripts/ops/smartplanning-tls-check.cron smartplanning:/tmp/
ssh smartplanning 'sudo mv /tmp/smartplanning-tls-check.cron \
  /etc/cron.d/smartplanning-tls-check && sudo chmod 644 /etc/cron.d/smartplanning-tls-check'
```

Le script tourne deux fois par jour, à 07:17 et 19:17.

### Alerte

L'email part vers `CONTACT_EMAIL` via les identifiants SMTP déjà présents dans
`/var/www/smartplanning/.env`. Aucun secret n'est dupliqué, et rien ne transite
par la ligne de commande. Une alerte identique n'est pas renvoyée avant 24 h ;
un retour à la normale efface la trace, donc une nouvelle dégradation réalerte
immédiatement.

### Vérifier qu'il fonctionne toujours

Un contrôle qui n'a jamais échoué sur le défaut qu'il prétend attraper ne prouve
rien. Pour le vérifier par mutation, sans rien casser :

```bash
# Doit lever une alerte et envoyer un email, le certificat courant étant à ~47 jours
ssh smartplanning 'sudo SEUIL_JOURS=400 /opt/smartplanning/ops/check-tls-expiry.sh'

# Doit signaler « alerte identique déjà envoyée »
ssh smartplanning 'sudo SEUIL_JOURS=400 /opt/smartplanning/ops/check-tls-expiry.sh'

# Doit repasser au vert et effacer la trace
ssh smartplanning 'sudo /opt/smartplanning/ops/check-tls-expiry.sh'
```

### Consulter le journal

```bash
ssh smartplanning 'sudo journalctl -t smartplanning-tls --since "7 days ago"'
```

---

## `check-public-ports.sh`

Vérifie qu'aucun port applicatif ne répond **depuis Internet**, et que 80 et 443
répondent toujours.

### Pourquoi ce script existe

Le 8 septembre 2026 (SP-583), `smartplanning-app` et `smartplanning-umami`
servaient l'application complète sur `http://51.77.146.72:3000` et `:3001`,
`/api/auth/session` compris, en contournant Nginx, TLS et la limitation de
débit. Un mot de passe saisi par le port 3000 voyageait en clair.

`ufw status` donnait pourtant ces ports fermés. Docker insère ses règles DNAT
dans `iptables` **en amont** de la chaîne d'ufw : un `-p 3000:3000` publie sur
toutes les interfaces, et le pare-feu de l'hôte ne s'y applique pas.

Le correctif tient à une convention d'écriture, `127.0.0.1:3000:3000` plutôt que
`3000:3000`. Rien ne l'impose mécaniquement, la chaîne `DOCKER-USER` étant vide
sur cette machine. Ce script ne prévient donc pas la réapparition du défaut, il
la détecte.

### Pourquoi il vise l'IP publique et non `localhost`

`curl localhost:3000` répond 200 sur le VPS même quand le port est correctement
restreint. C'est précisément la mesure qui ne prouve rien, et celle qui avait
laissé passer SP-583. Le script interroge donc l'adresse publique de la machine,
seul point de vue qui distingue un port restreint d'un port ouvert.

Vérifié par mutation le 9 septembre 2026 : un serveur ouvert sur `0.0.0.0:3009`
a bien été détecté, tandis que les ports correctement publiés répondent
« injoignable ».

### Ce qu'il détecte

| Situation | Détecté |
| --- | --- |
| Port applicatif (3000-3003, 5432, 6379, 8080) joignable depuis Internet | oui |
| Nginx arrêté, 80 ou 443 injoignable | oui |
| Adresse publique indéterminable ou privée | oui, sortie en erreur plutôt qu'un faux négatif |

Un nouveau service se déclare dans `PORTS_INTERDITS`, en tête du script.

### Installation sur le VPS

```bash
scp scripts/ops/check-public-ports.sh smartplanning:/tmp/
ssh smartplanning 'sudo mv /tmp/check-public-ports.sh /opt/smartplanning/ops/ \
  && sudo chown root:root /opt/smartplanning/ops/check-public-ports.sh \
  && sudo chmod 700 /opt/smartplanning/ops/check-public-ports.sh'

scp scripts/ops/smartplanning-ports-check.cron smartplanning:/tmp/
ssh smartplanning 'sudo mv /tmp/smartplanning-ports-check.cron \
  /etc/cron.d/smartplanning-ports-check && sudo chmod 644 /etc/cron.d/smartplanning-ports-check'
```

Le script tourne une fois par jour, à 06:43. Le défaut qu'il attrape ne survient
qu'au déploiement d'un service, jamais spontanément : une détection sous 24 h
suffit, là où le certificat TLS justifie deux passages quotidiens.

### Vérifier qu'il fonctionne toujours

Par mutation, en ouvrant un port temporaire sur toutes les interfaces :

```bash
# Ouvre un port exposé, lance le contrôle, referme
ssh smartplanning 'nohup python3 -m http.server 3003 --bind 0.0.0.0 >/dev/null 2>&1 &
  sleep 2
  sudo /opt/smartplanning/ops/check-public-ports.sh; echo "code retour: $?"
  pkill -f "http.server 3003"'

# Doit repasser au vert et effacer la trace
ssh smartplanning 'sudo /opt/smartplanning/ops/check-public-ports.sh'
```

Le premier appel doit sortir en 1 et envoyer un email nommant le port 3003. Le
second doit sortir en 0.

### Consulter le journal

```bash
ssh smartplanning 'sudo journalctl -t smartplanning-ports --since "7 days ago"'
```

---

## `backup-database.sh`

Sauvegarde quotidienne chiffrée de la base de production, déclenchée par
`smartplanning-backup.timer` à 03:20 UTC.

### Pourquoi ce script existe

Le 9 septembre 2026, en vérifiant l'affirmation « Sauvegardes régulières et
chiffrées » de la politique de confidentialité, constat : **la base de
production n'était sauvegardée nulle part**. Aucune tâche cron, aucun timer,
aucun fichier de dump. Le second projet de la machine, lui, avait dix
sauvegardes quotidiennes.

Douze entreprises clientes et soixante-et-onze utilisateurs étaient sans filet :
une panne disque, un `DROP` malheureux ou un rançongiciel emportait tout, sans
recours.

### Pourquoi il chiffre, alors que le script voisin de Lune & Soleil ne le fait pas

Un dump contient l'intégralité des données personnelles des salariés de toutes
les entreprises clientes. Le disque du VPS n'est **pas** chiffré (`ext4` nu,
aucun volume LUKS, vérifié le 9 septembre 2026) et la machine est partagée. Un
dump en clair y est une base de données personnelles lisible par quiconque
obtient un accès fichier.

### Ce qu'il vérifie avant de conclure

| Contrôle | Ce qu'il attrape |
|---|---|
| Conteneur `running` | Un `down` manuel laissé en place |
| Taille minimale | Un dump vide ou tronqué à la première ligne |
| Taille maximale (90 Mo) | Un dump trop gros pour le tmpfs de vérification |
| `pg_restore --list` | Une archive corrompue en cours d'écriture |
| Nombre d'objets ≥ 20 | Une base vide ou une restauration en cours |
| Déchiffrement + en-tête `PGDMP` | Une clé qui ne rouvre pas ce qu'elle a fermé |

Chaque étape qui ne peut pas conclure **arrête le script en erreur**. Une
sauvegarde qui échoue en silence est pire que pas de sauvegarde : le système
paraît protégé et ne l'est pas. C'est le défaut du healthcheck du CD corrigé par
SP-588.

### Deux pièges rencontrés à la première exécution

**`docker cp` est refusé** sur un conteneur `read_only: true` (durcissement
OWASP de SP-157), avec « container rootfs is marked read-only », même vers un
tmpfs inscriptible. On écrit donc par `docker exec` avec redirection.

**`gpg --decrypt | head -c 5` fait sortir gpg en code 2 par SIGPIPE**, alors que
le déchiffrement est parfaitement valide : `head` ferme le tuyau dès les cinq
octets lus. Le contrôle rejetait une sauvegarde saine dont l'en-tête était bien
« PGDMP ». Le déchiffrement va désormais dans un fichier témoin.

### Vérifier

```bash
ssh smartplanning 'systemctl list-timers smartplanning-backup.timer'
ssh smartplanning 'sudo journalctl -u smartplanning-backup.service -n 20'
ssh smartplanning 'sudo find /var/backups/smartplanning -name "*.dump.gpg" | wc -l'
```

**Ne pas utiliser `sudo ls /var/backups/smartplanning/*.gpg`** : le shell
développe le joker avant `sudo`, donc sans les droits sur un répertoire en
`0700`, et renvoie 0 à tort.

### Limite levée le 10 septembre 2026

Les archives et la clé vivaient sur le même disque que la base, donc la perte
du VPS emportait les trois. `sync-backups-offsite.sh` ci-dessous copie
désormais chaque archive hors de la machine, et la clé est conservée dans le
gestionnaire de mots de passe ainsi que sur le poste de développement.

Il reste que le disque du VPS n'est pas chiffré (`ext4` nu, aucun volume
LUKS) : un accès fichier sur la machine donne accès à la clé, donc aux
archives locales. Le chiffrement au repos reste une décision d'architecture
non tranchée, sans ticket à ce jour.

---

## `sync-backups-offsite.sh`

Copie la dernière archive chiffrée vers Backblaze B2, chez un fournisseur
**distinct d'OVH**.

### Pourquoi ce script existe

SP-593 sauvegardait la base sur le disque qui la porte. Photocopier un document
et ranger la photocopie dans le même tiroir ne protège pas de l'incendie du
tiroir : une panne matérielle, un incident OVH ou un chiffrement par
rançongiciel emportait la base et ses sauvegardes d'un seul coup.

Un stockage objet OVH aurait couvert le disque mort, pas la panne du
fournisseur. D'où le choix d'un tiers.

### Pourquoi l'API native B2 et non S3

L'API S3-compatible impose une signature AWS v4, soit plusieurs dizaines de
lignes de HMAC en shell pour rien. L'API native s'utilise en `curl` simple, et
n'exige **aucun outil supplémentaire** sur le VPS : `curl`, `jq` et `sha1sum`
y sont déjà.

### Ce qu'il vérifie avant de conclure

| Contrôle | Raison |
| --- | --- |
| `b2.conf` lisible, trois variables définies | sans identifiants, rien n'est possible |
| Archive présente et supérieure à 1 Ko | une archive vide ne protège de rien |
| **Archive datant de moins de 48 h** | si la sauvegarde locale a cessé, le hors-site paraîtrait sain |
| La clé donne accès au bucket attendu | une clé trop large ou mal restreinte se voit tout de suite |
| **Taille et SHA-1 relus depuis B2** | un code 200 dit que la requête a abouti, pas que le fichier est intact |

Le SHA-1 est calculé localement et **vérifié par B2 à la réception** : un
transfert tronqué est rejeté par le serveur, pas accepté en silence. Même
distinction qu'entre un email accepté par le relais et un email délivré
(SP-579).

### Le chiffrement côté serveur du bucket reste désactivé

Contre-intuitif, et délibéré. Les fichiers partent **déjà** chiffrés en AES256
avec notre passphrase, qui ne quitte jamais le VPS. Activer le chiffrement B2
ajouterait une couche dont Backblaze détiendrait la clé, sans rien apporter.
Backblaze ne stocke que des octets illisibles pour lui.

### Vérifier

```bash
ssh smartplanning 'systemctl list-timers "smartplanning-backup*"'
ssh smartplanning 'sudo journalctl -u smartplanning-backup-offsite.service -n 20'
```

Sortie de la première exécution réelle, le 10 septembre 2026 :

```
Archive : quotidienne-20260910-032029.dump.gpg, 127731 octets
Envoi vers b2://smartplanning-backups/quotidienne-20260910-032029.dump.gpg
Verifie hors site : 127731 octets, sha1 concordant
Rotation distante : 0 supprimee(s), 1 conservee(s) hors site
```

### Restauration depuis le hors-site

Prouvée le 10 septembre 2026 sur le MacBook, machine autre que le VPS :
23 tables, 200 objets, et dix comptages identiques à la production
(`audit_logs` 1519, `schedules` 999, `users` 71, `employees` 85).

**`pg_restore` doit être en version 16.** Un client 15 refuse l'archive avec
« unsupported version (1.15) in file header », et un `grep` sur sa sortie
compterait alors zéro objet, ce qui ressemble à une archive vide. Passer par
un conteneur `postgres:16-alpine`.

Procédure complète :
[`docs/runbooks/restauration-base-production.md`](../../docs/runbooks/restauration-base-production.md).

### Le piège de la mise en service

La clé d'application, collée depuis un rendu visuel, était arrivée corrompue :
`K003` était devenu `ЧKOO`, un Tché cyrillique suivi de deux lettres O à la
place des zéros. Invisible à l'œil, et un contrôle de longueur seul ne l'aurait
pas vu non plus.

Corriger le préfixe par déduction a fait passer l'erreur de `bad_auth_token` à
`unauthorized` sans résoudre le problème, d'autres sosies subsistant plus loin.
**Seul un collage direct, sans affichage intermédiaire, a fonctionné :**

```bash
pbpaste | tr -d '\n' | ssh smartplanning "sudo tee /etc/smartplanning/b2key.tmp >/dev/null"
```

Le script affiche désormais un indice de forme quand la clé fait autre chose
que 31 caractères base64 commençant par `K`.

---

## `test-backup-restore.sh`

Le pendant obligatoire du précédent : **une sauvegarde jamais restaurée ne
prouve rien.**

`backup-database.sh` vérifie que l'archive est lisible par `pg_restore --list`,
ce qui contrôle son en-tête et sa table des matières, pas qu'elle se **reverse**
dans une base vivante. Entre les deux se cachent les défauts qui ne se voient
que le jour de la panne : un dump tronqué après l'en-tête, une extension absente
de l'image, un propriétaire de table qui n'existe pas sur la cible.

Le script déchiffre la dernière archive, crée une base temporaire dans le
conteneur PostgreSQL, y restaure l'archive, compte les tables et les lignes de
quelques tables métier, puis supprime la base de test, y compris en cas d'échec.

Il **refuse de s'exécuter** si le nom de la base cible est celui de la
production.

```bash
ssh smartplanning 'sudo /opt/smartplanning/ops/test-backup-restore.sh'
```

Sortie de la première exécution réelle, le 9 septembre 2026 :

```
Tables restaurees   : 23
Entreprises         : 12
Utilisateurs        : 71
Restauration verifiee, base de test supprimee.
```

À lancer périodiquement, et systématiquement avant une migration risquée.
Procédure de restauration réelle :
[`docs/runbooks/restauration-base-production.md`](../../docs/runbooks/restauration-base-production.md).

---

## `test-cd-rollback.sh`

Teste le comportement du script de déploiement du CD **sans VPS et sans casser
la production**.

Il extrait le corps du heredoc `DEPLOY_SCRIPT` depuis `.github/workflows/cd.yml`
lui-même, donc le code réellement déployé et non une copie qui se périmerait,
puis le rejoue avec des `docker`, `curl` et `sleep` simulés.

Quatre scénarios :

| Scénario | Attendu |
|---|---|
| Healthcheck OK | sortie 0, une seule recréation, pas de rollback |
| Healthcheck en échec | sortie 1, rollback vers le tag précédent |
| Rollback en échec aussi | sortie 1, intervention manuelle demandée |
| Premier déploiement | sortie 1, aucune tentative de rollback |

Le scénario 2 vérifie le **tag exact** passé à `docker compose`, pas seulement
qu'un rollback a eu lieu : c'est la différence entre « le rollback a tourné » et
« le rollback a restauré la bonne version ».

Vérifié par mutation : rejoué avec l'ancien code, le scénario d'échec sort en 0
(le workflow serait vert sur une production morte) contre 1 avec le code
corrigé.

```bash
./scripts/ops/test-cd-rollback.sh
```

Il tourne en local, sans accès au VPS. Ce qu'il **ne** couvre **pas** : le
nommage des tags. Le premier déploiement réel après SP-588 a échoué sur un tag
inexistant (`github.sha` en 40 caractères contre un tag de 7) alors que ces
quatre scénarios étaient verts. Regarder aussi le déploiement réel.
