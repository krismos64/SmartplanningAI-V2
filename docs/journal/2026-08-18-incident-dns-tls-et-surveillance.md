# 18 août 2026, panne DNS, certificat TLS et surveillance

Session non planifiée, ouverte sur un constat brut : « le site ne fonctionne
plus ». Chrome affichait `ERR_CERT_DATE_INVALID` et l'avertissement pleine page
« Votre connexion n'est pas privée ». Le site était inaccessible à tout
visiteur.

## Le diagnostic, et une erreur d'interprétation en cours de route

Le certificat servi par `smartplanning.fr` avait expiré le 23 février 2026.
Première hypothèse, la plus naturelle : certbot ne renouvelait plus.

Elle était fausse. `certbot certificates` sur le VPS montrait un certificat
valide jusqu'au 4 octobre, et le timer systemd actif. Le VPS servait ce bon
certificat, vérifié en interrogeant `127.0.0.1:443` puis directement
`51.77.146.72`.

La cause réelle était ailleurs. Le DNS public de `smartplanning.fr` ne pointait
plus vers le VPS OVH :

| Nom | Pointait vers | Attendu |
| --- | --- | --- |
| `smartplanning.fr` | 147.79.119.208, 147.79.116.141 (Hostinger) | 51.77.146.72 |
| `www` | CNAME `www.smartplanning.fr.cdn.hstgr.net` | 51.77.146.72 |

Le domaine est délégué à `ns1/ns2.dns-parking.com`, les serveurs de noms de
Hostinger. La zone portait un `ALIAS @` et un `CNAME www` vers leur CDN, qui
présentait un vieux certificat périmé. Aucun visiteur n'atteignait plus le VPS.

`A analytics → 51.77.146.72` était resté correct, jamais passé par le CDN.
C'est pour cette raison qu'Umami a continué de servir un certificat valide, et
c'est ce contraste qui a orienté le diagnostic.

### La chronologie que j'avais d'abord écrite était fausse

J'ai d'abord conclu que la panne durait depuis février, par déduction depuis la
date d'expiration du certificat. Christophe a corrigé : le site fonctionnait
encore quelques jours plus tôt.

Les journaux Nginx tranchent, et lui donnent raison :

```
15/Aug/2026  2700 requêtes
16/Aug/2026  5749
17/Aug/2026  2997
18/Aug/2026   252     <- effondrement
```

Par heure, la bascule se situe à minuit dans la nuit du 17 au 18 : de 150 à 430
requêtes horaires le 17, à 15 ou 45 ensuite.

L'archive des certificats du VPS confirme qu'il n'a jamais rien servi
d'expiré :

| Certificat | Validité |
| --- | --- |
| cert1 | 6 janvier au 6 avril |
| cert2 | 7 mars au 5 juin |
| cert3 | 6 mai au 4 août |
| cert4 | 6 juillet au 4 octobre |

Couverture continue, sans le moindre trou. Le certificat expiré en février
appartenait à l'infrastructure Hostinger : un vieux certificat dormant sur leur
CDN, réactivé par la bascule DNS de cette nuit.

**La leçon** : la date d'expiration d'un certificat dit quand il a cessé d'être
valide, pas depuis quand il est servi. Déduire une durée de panne d'une date
d'expiration est un raccourci faux dès qu'un tiers entre en jeu. Les journaux
Nginx portaient la réponse depuis le début.

## La correction

Christophe a repris la zone DNS chez Hostinger : suppression de l'`ALIAS @` et
du `CNAME www` vers `cdn.hstgr.net`, création de `A @` et `A www` vers
`51.77.146.72`. TTL de 60 secondes sur les anciens enregistrements, propagation
donc immédiate.

Vérifié après correction :

| Contrôle | Résultat |
| --- | --- |
| Certificat servi | 6 juillet au 4 octobre 2026, Let's Encrypt |
| `https://smartplanning.fr` | 200, 268 ms, 125 Ko |
| `www` vers apex | 301 |
| HTTP vers HTTPS | 301 |
| `analytics.smartplanning.fr` | 200 |

Le CDN Hostinger n'a pas eu besoin d'être désactivé : il ne s'appliquait que
par les deux enregistrements supprimés.

## La surveillance (`70e7885`)

L'incident n'a été détecté que parce qu'un humain a ouvert le site. Aucune
alerte n'existait.

`scripts/ops/check-tls-expiry.sh` interroge le port 443 **par le nom public**,
résolution DNS comprise. C'est le point central de sa conception : un contrôle
lisant `/etc/letsencrypt/` ou appelant `certbot certificates` aurait affiché
« tout va bien » pendant toute la panne, puisque le certificat sur le disque
était valide. Seul le point de vue du visiteur voit ce défaut.

Il détecte trois situations : expiration sous 21 jours ou déjà dépassée,
certificat ne couvrant pas le domaine interrogé (cas d'un CDN ou proxy tiers),
et port 443 injoignable.

L'alerte part par email vers `CONTACT_EMAIL`, en réutilisant les identifiants
SMTP déjà présents dans `/var/www/smartplanning/.env`. Aucun secret dupliqué,
rien en argument de ligne de commande où `ps` le rendrait visible. Une alerte
identique n'est pas renvoyée avant 24 h, et un retour à la normale efface la
trace pour qu'une nouvelle dégradation réalerte aussitôt.

Cron dans `/etc/cron.d/smartplanning-tls-check`, à 07:17 et 19:17.

### Vérifié par mutation

Un contrôle qui n'a jamais rougi sur le défaut qu'il prétend attraper ne prouve
rien. Les six tests menés sur le VPS :

| Test | Résultat |
| --- | --- |
| État sain | code 0, aucun envoi |
| Seuil forcé à 400 jours | alerte levée, email réellement envoyé |
| Relance immédiate | doublon supprimé |
| Retour à la normale | code 0, trace effacée |
| `expired.badssl.com` injecté | expiration ET domaine non couvert détectés |
| Domaine inexistant | handshake impossible détecté |
| Exécution cron réelle | `09:20:01 CRON` puis `smartplanning-tls: OK` en journal |

Les deux avant-dernières lignes sont celles qui comptent : ce sont les deux
formes qu'a prises l'incident. Après les tests, liste des domaines et horaire
restaurés, intégrité confirmée par empreinte SHA-256 identique entre le VPS et
le fichier versionné.

## Ce qui n'a pas été fait, et pourquoi

**Redéléguer le DNS à OVH.** C'est la correction durable : la zone vivrait là
où vit le serveur, et une action côté Hostinger ne pourrait plus la réécrire.
Christophe a choisi de rester en l'état pour aujourd'hui. La surveillance
préviendra sous 12 h si la bascule se reproduit, sans l'empêcher.

**Un nouvel article SEO/GEO.** Question posée en fin de session, écartée sur
deux bases. La règle de `seo-content.md` veut qu'on mesure avant de produire, et
SP-563 a déjà établi que le plafond est le taux de clic en position 21,4, pas le
nombre de pages. S'y ajoute le fait que le site sort d'une panne : publier
maintenant reviendrait à mesurer l'effet d'un article sur une base dont l'état
de crawl est inconnu. L'ordre retenu : redéployer, laisser le crawl reprendre,
lire la Search Console, décider ensuite.

**La cause de la bascule DNS reste inconnue.** Aucune action de Christophe cette
nuit-là. Une modification côté Hostinger, peut-être liée au rattachement du
domaine à un plan d'hébergement mutualisé, reste l'hypothèse la plus
vraisemblable, non confirmée.

## Point de vigilance

Le hPanel Hostinger porte un bouton **« Réinitialiser les enregistrements
DNS »** juste sous la table des enregistrements. Il rétablirait la zone par
défaut, donc l'ALIAS et le CNAME vers le CDN, et reproduirait la panne à
l'identique. À ne jamais toucher.

## Livraison

| Commit | Objet |
| --- | --- |
| `70e7885` | script de surveillance, cron, README ops, note dans `deployment.md` |
| `ea55cdf` | correction de la chronologie de l'incident dans la doc |

Vérifications : `npm run type-check` au vert, `npm run test` à 3192 tests
passés sur 190 fichiers.

## Prochaine étape

Lire la Search Console dans quelques jours pour mesurer l'effet de la panne sur
l'indexation, et décider à ce moment-là si un contenu se justifie. Demander la
réindexation des pages principales pour accélérer le retour du crawl.
