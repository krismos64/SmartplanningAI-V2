# Rotation du CRON_SECRET (SP-560)

Procédure manuelle, à exécuter par Christophe sur le VPS. Le secret ne doit
transiter ni par une session d'assistant, ni par un commit, ni par un ticket.

## Pourquoi

Le `CRON_SECRET` de production était écrit en clair dans la crontab de
l'utilisateur `deploy` :

```
0 8 * * * curl -s -X POST -H "Authorization: Bearer <secret>" https://smartplanning.fr/api/cron/trial-emails >> ...
```

Il apparaissait donc dans toute sortie de `crontab -l`, dans les sauvegardes de
`/var/spool/cron/crontabs/`, et dans la liste des processus au moment de
l'exécution (`ps aux` montre la ligne de commande complète de `curl`, secret
compris, pour tout utilisateur de la machine).

Il s'est affiché en clair dans une session de diagnostic du 07/08/2026. Il est
à considérer comme compromis.

## Ce que protège ce secret

Le déclencheur de `/api/cron/trial-emails`. Qui le détient peut :

- envoyer à volonté les emails de rappel d'essai à tous les directeurs en essai
- faire basculer des abonnements de `TRIAL` à `EXPIRED` via
  `expireTrialSubscription()`, donc couper l'accès de clients en essai

## État actuel

| Élément | Valeur |
|---|---|
| Crontab | utilisateur `deploy`, pas root |
| Déploiement | `/var/www/smartplanning` |
| Fichier d'environnement | `/var/www/smartplanning/.env`, déjà en `600 deploy:deploy` |
| Conteneur applicatif | `smartplanning-app` |
| Horaire | 8h00 UTC quotidien |

Les permissions du `.env` sont déjà correctes. Le problème porte uniquement sur
la crontab.

## Procédure

Se connecter : `ssh smartplanning`

### 1. Générer le nouveau secret et le poser dans un fichier dédié

```bash
sudo install -d -m 700 -o deploy -g deploy /etc/smartplanning
openssl rand -hex 32 | sudo tee /etc/smartplanning/cron.env > /dev/null
sudo sed -i '1s/^/CRON_SECRET=/' /etc/smartplanning/cron.env
sudo chown deploy:deploy /etc/smartplanning/cron.env
sudo chmod 600 /etc/smartplanning/cron.env
```

Contrôler les permissions sans afficher le contenu :

```bash
ls -l /etc/smartplanning/cron.env    # attendu : -rw------- deploy deploy
```

### 2. Reporter la valeur dans le `.env` applicatif

Éditer `/var/www/smartplanning/.env` et remplacer la ligne `CRON_SECRET=…` par
la nouvelle valeur. Pour l'obtenir sans l'afficher à l'écran, la copier
directement :

```bash
cd /var/www/smartplanning
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
grep -v '^CRON_SECRET=' .env > .env.tmp
cat /etc/smartplanning/cron.env >> .env.tmp
mv .env.tmp .env
chmod 600 .env
```

Vérifier que la clé est présente une seule fois :

```bash
grep -c '^CRON_SECRET=' .env    # attendu : 1
```

### 3. Redémarrer l'application

Le conteneur lit `CRON_SECRET` au démarrage : sans redémarrage, l'ancienne
valeur reste active en mémoire.

```bash
cd /var/www/smartplanning
docker compose up -d --force-recreate smartplanning-app
```

Attendre que l'application réponde :

```bash
curl -s -o /dev/null -w '%{http_code}\n' https://smartplanning.fr/    # attendu : 200
```

### 4. Réécrire la crontab sans secret en clair

```bash
crontab -e
```

Remplacer la ligne existante par :

```
0 8 * * * . /etc/smartplanning/cron.env && curl -s -X POST -H "Authorization: Bearer $CRON_SECRET" https://smartplanning.fr/api/cron/trial-emails >> /var/log/smartplanning-cron.log 2>&1
```

Le secret est lu depuis le fichier au moment de l'exécution. Il n'apparaît plus
dans `crontab -l`.

Note : la ligne de commande de `curl` reste visible dans `ps` pendant l'appel,
qui dure environ deux secondes. Pour supprimer aussi cette exposition, utiliser
`--header @-` avec le secret sur l'entrée standard. Amélioration facultative,
la machine n'ayant qu'un utilisateur non privilégié.

### 5. Vérifier

L'ancien secret doit être rejeté :

```bash
curl -s -o /dev/null -w '%{http_code}\n' -X POST \
  -H "Authorization: Bearer <ancien secret>" \
  https://smartplanning.fr/api/cron/trial-emails
# attendu : 401
```

Le nouveau doit fonctionner :

```bash
. /etc/smartplanning/cron.env && curl -s -o /dev/null -w '%{http_code}\n' -X POST \
  -H "Authorization: Bearer $CRON_SECRET" \
  https://smartplanning.fr/api/cron/trial-emails
# attendu : 200
```

Ce second appel est sans effet de bord indésirable : l'idempotence par `EmailLog`
empêche tout doublon d'email, et les entreprises en essai en cours ne
franchissent aucun seuil de rappel hors de leurs jours J-14, J-7, J-3 et J-1.

Confirmer que la crontab est propre :

```bash
crontab -l | grep -c 'Bearer [0-9a-f]'    # attendu : 0
```

## Point annexe

`docs/analytics.credentials.md` documente l'endpoint en `GET` alors que la route
n'expose que `POST` (`src/app/api/cron/trial-emails/route.ts`). Sans conséquence
en production, la crontab utilisant bien `-X POST`, mais trompeur pour un test
manuel.

Ce fichier est bloqué en lecture par le hook `PreToolUse` à cause du `.credentials.`
dans son nom, protection volontaire. La correction d'une ligne est donc à faire
à la main.
