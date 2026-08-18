# Scripts d'exploitation

Scripts qui tournent sur le VPS de production, versionnes ici pour ne pas
exister uniquement sur la machine.

## `check-tls-expiry.sh`

Surveille l'expiration des certificats TLS **tels qu'ils sont servis en HTTPS**,
sur `smartplanning.fr`, `www.smartplanning.fr` et `analytics.smartplanning.fr`.

### Pourquoi ce script existe

Dans la nuit du 17 au 18 aout 2026, le DNS de `smartplanning.fr` a bascule vers
le CDN Hostinger, qui a presente un vieux certificat expire depuis le
23 fevrier. Les journaux Nginx datent la coupure precisement : 2997 requetes le
17 aout, puis un effondrement des minuit.

Certbot fonctionnait pourtant parfaitement. L'archive du VPS montre une
couverture continue, janvier a avril, mars a juin, mai a aout, juillet a
octobre, sans le moindre trou. Le VPS n'a jamais servi de certificat expire :
le certificat perime appartenait a l'infrastructure Hostinger.

Un controle portant sur `/etc/letsencrypt/` ou sur `certbot certificates`
n'aurait rien detecte. C'est la raison pour laquelle ce script interroge le
port 443 par le nom public, resolution DNS comprise : c'est le seul point de vue
qui corresponde a celui du visiteur.

### Ce qu'il detecte

| Situation | Detecte |
| --- | --- |
| Certificat expire ou proche de l'expiration (seuil 21 jours) | oui |
| Certificat valide mais ne couvrant pas le domaine (CDN ou proxy tiers) | oui |
| Port 443 injoignable, DNS casse, service arrete | oui |

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

Le script tourne deux fois par jour, a 07:17 et 19:17.

### Alerte

L'email part vers `CONTACT_EMAIL` via les identifiants SMTP deja presents dans
`/var/www/smartplanning/.env`. Aucun secret n'est duplique, et rien ne transite
par la ligne de commande. Une alerte identique n'est pas renvoyee avant 24 h ;
un retour a la normale efface la trace, donc une nouvelle degradation realerte
immediatement.

### Verifier qu'il fonctionne toujours

Un controle qui n'a jamais echoue sur le defaut qu'il pretend attraper ne prouve
rien. Pour le verifier par mutation, sans rien casser :

```bash
# Doit lever une alerte et envoyer un email, le certificat courant etant a ~47 jours
ssh smartplanning 'sudo SEUIL_JOURS=400 /opt/smartplanning/ops/check-tls-expiry.sh'

# Doit signaler « alerte identique deja envoyee »
ssh smartplanning 'sudo SEUIL_JOURS=400 /opt/smartplanning/ops/check-tls-expiry.sh'

# Doit repasser au vert et effacer la trace
ssh smartplanning 'sudo /opt/smartplanning/ops/check-tls-expiry.sh'
```

### Consulter le journal

```bash
ssh smartplanning 'sudo journalctl -t smartplanning-tls --since "7 days ago"'
```
