# 13 septembre 2026, audit documentaire de fin de session

| Champ | Valeur |
|---|---|
| Ticket | aucun, audit demandé avant de quitter la session |
| Documents produits | ce journal |
| Documents modifiés | `docs/runbooks/verification-tunnel-sp591.md` |
| Contrôles | compteurs remesurés, chemins vérifiés, hooks testés en exécution, scripts du VPS comparés par empreinte |
| Jira | SP-596 vérifié, seul ticket ouvert du projet |
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

## Les écarts

Un seul document a dû être modifié, le runbook du tunnel, et il ne portait pas
une erreur mais une date qui vieillissait mal. Les deux alertes de compteur
levées en cours d'audit étaient des erreurs de ma commande de mesure, pas de la
documentation.

## Prochaine étape

Rien d'ouvert côté documentation. Reste le parcours humain de SP-591, le
chiffrement au repos sans ticket, et SP-596 sur les dépendances.
