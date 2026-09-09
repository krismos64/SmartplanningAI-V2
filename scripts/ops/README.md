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
