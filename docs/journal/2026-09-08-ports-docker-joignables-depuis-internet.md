# 8 septembre 2026, deux ports que le pare-feu croyait fermés

| Champ | Valeur |
|---|---|
| Ticket | SP-583 |
| Documents produits | ce journal |
| Documents modifiés | `docker/docker-compose.prod.yml`, `docker/docker-compose.umami.yml`, `.github/workflows/cd.yml`, `.claude/rules/prisma-pieges.md` |
| Contrôles | vérification depuis l'extérieur du VPS avant et après correctif, YAML des trois fichiers validé, healthcheck de production vert en 5 secondes |
| Jira | SP-583 créé (le ticket n'existait pas encore dans Jira) |
| Production | correctif appliqué à la main sur le VPS, les deux ports fermés |
| Pull request | #85 |

## Ce qui a été fait

Session ouverte sur un ticket rédigé hors Jira, trouvé en préparant
l'hébergement de Lune & Soleil sur le même VPS. Le constat était juste, la
cause aussi. Trois choses que l'analyse initiale n'avait pas vues sont
apparues en le vérifiant.

### Le défaut, reproduit avant d'y toucher

`smartplanning-app` et `smartplanning-umami` répondaient directement sur
l'adresse publique du VPS, sans passer par Nginx :

```
http://51.77.146.72:3000  ->  200, <title>SmartPlanning : plannings, congés et RH pour entreprises</title>
http://51.77.146.72:3001  ->  200
http://51.77.146.72:3000/api/auth/session  ->  200
```

Cinq appels consécutifs à `/api/auth/session` ont répondu 200 sans le moindre
ralentissement : la zone `auth` de Nginx, qui limite les tentatives de
connexion à 60 par minute et par IP depuis SP-157, ne s'appliquait pas.

`ufw` n'ouvrait pourtant ni 3000 ni 3001. Docker insère ses règles DNAT dans
`iptables` en amont de la chaîne d'`ufw`, donc `-p 3000:3000` publie sur toutes
les interfaces et le pare-feu de l'hôte ne s'y applique pas. L'écoute le
montrait sans ambiguïté :

```
0.0.0.0:3000 / [::]:3000   docker-proxy
0.0.0.0:3001 / [::]:3001   docker-proxy
```

Ce qui était réellement contourné : TLS, la limitation de débit et `limit_conn`.
Un mot de passe saisi via le port 3000 voyageait en clair.

### Le correctif

Publication sur la boucle locale, Nginx restant le seul point d'entrée.
`'3000:3000'` devient `'127.0.0.1:3000:3000'`, `'3001:3000'` devient
`'127.0.0.1:3001:3000'`.

## Les écarts

### Le tableau du ticket surestimait ce qui était contourné

Il donnait les en-têtes de sécurité et HSTS absents sur le port 3000. Mesure
faite, ils étaient présents : Next.js pose lui-même la CSP, `X-Frame-Options`
et `Strict-Transport-Security`, indépendamment de Nginx. Le contournement
portait sur TLS et la limitation de débit, ce qui reste sérieux, mais pas sur
les en-têtes.

### Nginx vise `localhost`, et non `127.0.0.1`

Le ticket annonçait que Nginx continuerait de fonctionner sans modification, en
s'appuyant sur un `proxy_pass http://127.0.0.1:3000`. La conf réelle ne dit pas
cela : elle passe par des blocs `upstream`, et ceux-ci visent `localhost:3000`
et `localhost:3001`.

L'écart comptait. `-p 127.0.0.1:3000:3000` n'écoute qu'en IPv4, et si
`localhost` avait résolu en `::1`, Nginx aurait servi un 502 permanent. Vérifié
avant d'agir : sur ce VPS `/etc/hosts` nomme la ligne `::1` `ip6-localhost`, et
`getent ahosts localhost` ne renvoie que `127.0.0.1`. Le risque était écarté,
mais il ne l'était pas par le raisonnement du ticket.

### Le CD ne synchronise pas le compose d'Umami

Le ticket demandait de passer par le dépôt plutôt que par le serveur, SP-580
ayant fait du dépôt l'autorité. C'est vrai pour l'application, pas pour Umami :
le job `deploy` ne copie que `docker-compose.prod.yml`.

Umami tourne depuis `/home/deploy/umami/docker-compose.yml`, hors du dépôt,
avec ses secrets en clair et sans `BASE_PATH`, alors que la version versionnée
en attend un et référence un service `postgres` absent de ce contexte.
Appliquer le fichier du dépôt aurait cassé Umami.

Sa correction a donc été appliquée à la main sur le VPS, sur la seule ligne de
ports, et le CD porte désormais un commentaire qui explique pourquoi ce fichier
n'y passe pas. C'est la dérive de SP-580 qui se répète sur un second fichier.

### Le reste de la surface était sain

Balayage depuis l'extérieur : PostgreSQL (5432), Redis (6379) et le port 3002
prévu pour Lune & Soleil ne répondaient pas. Seuls 3000 et 3001 étaient
exposés.

Nuance sur le 3002 : il ne répondait pas parce qu'aucun conteneur Lune & Soleil
ne tourne encore. Sa conf Nginx est en place et vise bien `127.0.0.1:3002`,
mais le dépôt de la boutique n'a pas de compose de production. C'est là que le
port devra être publié sur la boucle locale le jour du déploiement.

## Vérification

Depuis l'extérieur, après correctif :

```
51.77.146.72:3000                   -> injoignable
51.77.146.72:3001                   -> injoignable
51.77.146.72:3000/api/auth/session  -> injoignable
https://smartplanning.fr            -> 200
https://analytics.smartplanning.fr  -> 200
/login, /solutions, /guides         -> 200
```

Écoute du VPS réduite à 22, 80 et 443, plus `127.0.0.1:3000` et
`127.0.0.1:3001`. `smartplanning-app` healthy en 5 secondes, PostgreSQL et
Redis non redémarrés.

Umami a renvoyé un 502 pendant les premières secondes suivant sa recréation,
le temps de son démarrage, puis 200 de façon stable. Le compose du VPS est
identique à celui du dépôt hors commentaires, donc le prochain déploiement ne
réintroduira pas le défaut. Sauvegardes `docker-compose.yml.bak-sp583` des deux
côtés pour le retour arrière.

## Ce qui reste ouvert

Le durcissement plus large d'`iptables` face à Docker, par exemple une chaîne
`DOCKER-USER` restrictive, n'est pas traité. La publication sur la boucle
locale suffit tant qu'aucun conteneur n'a besoin d'être joignable de
l'extérieur.

Le compose de production de Lune & Soleil devra publier son port en
`127.0.0.1:3002`. Rien ne le garantit aujourd'hui, le fichier n'existant pas
encore dans ce dépôt.

Reste aussi, depuis SP-582, le doublon d'appels à `getTeamAbsences` entre
`SchedulesPageContent` et `WeeklyGridView`, et la navigation entre semaines qui
ne répond pas toujours au premier clic.
