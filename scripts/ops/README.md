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
