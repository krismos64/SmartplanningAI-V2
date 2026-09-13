# 13 septembre 2026, audit documentaire de fin de session

| Champ | Valeur |
|---|---|
| Ticket | aucun, audit demandé avant de quitter la session |
| Documents produits | ce journal |
| Documents modifiés | `README.md`, `docs/database-architecture.md`, `docs/security/security-hardening-plan.md`, `docs/analytics.md`, `docs/runbooks/verification-tunnel-sp591.md` |
| Contrôles | compteurs remesurés, chemins vérifiés, hooks testés en exécution, scripts du VPS comparés par empreinte, affirmations de comportement confrontées au code |
| Jira | SP-596 vérifié, SP-598 créé sur la CSP |
| Mémoire | `ou-en-est-le-projet` réécrite, `audit-documentation-13-septembre` créée |

## Ce qui a été vérifié

Seconde partie de la session, après la clôture de SP-597. Demande de Christophe
avant de quitter : que toute la documentation soit vraie, pas seulement celle
qui touche le ticket du jour.

**Les compteurs, tous remesurés** plutôt que relus :

```
modeles Prisma 22   enums 16   index 65   migrations 24
pages 65   layouts 5   routes API 18
actions 32   services 22   scripts ops 9
specs E2E 23 au total, 9 dans la whitelist CI
```

Les dix chiffres du README et de `database-architecture.md` sont exacts.

**Un faux écart, et il vaut d'être noté.** `ls src/lib/services/*.ts` rend 8 là
où le README annonce 22, ce qui ressemble à un compteur périmé. Le README compte
l'arborescence entière hors tests, sous-dossiers compris, et il a raison. Un
`find` avant de conclure aurait évité l'alerte : c'est la commande de mesure qui
était fausse, pas la documentation.

**Les horaires de sauvegarde, même piège.** `systemctl list-timers` affiche
03:23 quand `CLAUDE.md` annonce 03:20. La définition du timer porte
`OnCalendar=03:20:00` et `RandomizedDelaySec=600` : la documentation est juste,
c'est la dernière exécution qui ne prouve rien.

## Les hooks testés en exécution

Le contrôle que la lecture de `settings.json` ne remplace pas. Les six sont
présents et exécutables, et les deux qui comptent ont été exercés :

```
hook-block-secret-files  sur .env        code 2, blocage avec alternatives
hook-block-secret-files  sur README.md   code 0, laisse passer
hook-verif-mecanique     'use server'    nomme la ligne fautive, renvoie a la regle
```

## Dépôt et VPS comparés par empreinte

**Le CD ne déploie pas `scripts/ops/`**, seulement `docker-compose.prod.yml` et
l'image. Les sept scripts déployés ont donc été comparés au dépôt par
`shasum -a 256` : les sept sont identiques. Les dates de fichier ne prouvaient
rien, elles portent celle du dépôt manuel.

C'est un angle mort structurel, pas un défaut du jour : une prochaine
modification mergée sans dépôt manuel laisserait le VPS en arrière sans aucun
signal. Consigné en mémoire.

## L'état du tunnel SP-591, revérifié

Le runbook annonçait « parcours jamais effectué au 11 septembre ». Contre-mesure
du jour : `website_event` compte 3908 lignes, l'événement le plus récent date du
matin même, et il y a **toujours zéro `funnel-`**.

Umami enregistre donc normalement, ce qui écarte une panne d'instrumentation :
c'est bien le parcours humain qui manque. Le runbook porte désormais cette
contre-mesure, pour qu'un lecteur ne prenne pas une date ancienne pour un
document périmé.

## Ce qui était périmé, et qui ne l'est plus

La fiche mémoire `ou-en-est-le-projet` annonçait `main` sur `bdff520` et listait
le cycle de vie du bucket B2 comme ouvert. Les deux étaient vrais au
11 septembre et faux depuis SP-597. Réécrite.

L'index mémoire a été vérifié dans les trois sens : aucune ligne d'index sans
fiche, aucune fiche non indexée, aucun lien `[[...]]` vers une cible absente.
75 fiches.

## Jira

**SP-596 est le seul ticket ouvert** du projet, et son contenu a été confronté à
la mesure :

```
npm audit --omit=dev   18 vulnerabilites, 0 critique, 16 hautes
npm audit              55 vulnerabilites, 3 critiques, 26 hautes
```

Les chiffres du ticket et de l'avertissement de
`docs/security/vulnerability-fixes-2026-01-05.md` sont exacts au 13 septembre.

## Quatre affirmations fausses, trouvées en second passage

Mes propres contrôles portaient sur les compteurs, les chemins et les commandes,
c'est-à-dire sur ce qui se vérifie mécaniquement. Un second passage, confiant
les affirmations de **comportement** à un agent, en a trouvé quatre que ma
méthode ne pouvait pas voir. Toutes vérifiées ensuite dans le code avant
correction.

**La plus grave, `security-hardening-plan.md` §4.2.** Le document décrit un
middleware CSP à nonce, sous un statut « TERMINÉ ». Mesure : `src/middleware.ts`
fait 46 lignes, ne contient aucun nonce, et la CSP réellement servie vient de
`next.config.ts` avec `'unsafe-eval' 'unsafe-inline'`. Le code l'admet en
commentaire. Une CSP à nonce et une CSP à `unsafe-inline` n'arrêtent pas les
mêmes attaques : le document laissait croire que la première était en place.

**La §2.4 du même fichier** présentait `ufw default deny incoming` comme la
protection réseau, soit exactement la fausse assurance démontée par SP-583. La
§3.1 omettait le binding `127.0.0.1`, et la §5.1 donnait `api 5r/s` et
`limit_conn 20` là où Nginx sert 30r/s et 100.

Le tableau de bord des phases, lui, était exact. C'est ce qui rend le document
piégeux : ses preuves sont à jour, ses blocs de configuration sont restés à la
proposition de décembre 2025.

**`database-architecture.md` donnait `Notification.companyId` obligatoire**,
alors qu'il est `String?`. Sur un champ d'isolation, l'écart n'est pas
documentaire : un `undefined` dans un `where` Prisma y retire le filtre au lieu
de ne rien rendre, ce qui est la fuite d'août 2026. Un encadré le dit désormais.
Même fichier, `stripeCustomerId` est nullable, et `ContactMessage` n'est pas le
seul modèle sans `companyId` mais l'un de sept, pour quatre raisons différentes.

**Le README ne mentionnait pas SP-597**, mergé après sa dernière mise à jour. Il
décrivait donc encore une clé B2 capable de détruire l'historique distant.

## Les écarts

Les deux alertes de compteur levées par mes propres contrôles étaient des
erreurs de ma commande de mesure, pas de la documentation.

L'enseignement de méthode est ailleurs : **vérifier des compteurs et des chemins
ne vérifie pas une documentation.** Ce qui était faux ici, ce sont des
affirmations de comportement sous un statut « TERMINÉ », que seule une lecture
du code concerné pouvait démentir. Un document dont les preuves sont à jour peut
porter des blocs entiers périmés.

## Prochaine étape

Rien d'ouvert côté documentation. Reste le parcours humain de SP-591, le
chiffrement au repos sans ticket, et SP-596 sur les dépendances.

Un sujet est apparu pendant l'audit et n'a pas de ticket : **la CSP de
production porte `unsafe-inline` sur `script-src`**, ce qui n'arrête pas une
injection de script inline. Le passage à un middleware à nonce est une vraie
tâche, pas une correction documentaire.
