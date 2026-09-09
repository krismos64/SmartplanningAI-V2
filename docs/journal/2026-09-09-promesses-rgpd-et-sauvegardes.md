# 9 septembre 2026, une phrase à vérifier qui découvre une base non sauvegardée

| Champ | Valeur |
|---|---|
| Ticket | SP-593, dernier des six tickets issus de l'audit |
| Documents produits | `scripts/ops/backup-database.sh`, `scripts/ops/test-backup-restore.sh`, deux unités systemd |
| Documents modifiés | `src/app/(landing)/data/index.ts`, `src/app/(legal)/confidentialite/page.tsx` |
| Contrôles | type-check vert, 3327 tests verts, 26 E2E landing verts axe-core compris, sauvegarde et restauration réelles vérifiées sur le VPS |
| Jira | SP-593 commenté |
| Mémoire | fiche sur la base non sauvegardée |

## Ce qui a été fait

Le ticket demandait de vérifier cinq formulations signalées par l'analyse
externe, puis de les rendre démontrables. L'analyse avait raison sur les cinq.

Trois vivaient dans les données de la landing : « Données cryptées », «
Confidentialité garantie », « conformité totale avec le RGPD », et une
promesse de plannings qui « se construisent automatiquement, sans saisie
manuelle ». Cette dernière était simplement fausse, aucun moteur de génération
n'existe dans le dépôt, `generateScheduleExcel` étant un export.

Les deux autres étaient dans la politique de confidentialité, document
opposable : « Chiffrement des données sensibles au repos » et « Sauvegardes
régulières et chiffrées ».

## Les écarts

**La vérification a découvert bien pire que le problème de rédaction.** En
contrôlant les deux affirmations de la politique de confidentialité sur le VPS,
constat : la base de production **n'était sauvegardée nulle part**. Aucune tâche
cron, aucun timer systemd, aucun fichier de dump. Le second projet de la machine,
Lune & Soleil, avait dix sauvegardes quotidiennes. SmartPlanning aucune.

Douze entreprises clientes et soixante-et-onze utilisateurs, sans filet. Le
disque n'est pas chiffré non plus, `ext4` nu, aucun volume LUKS.

Christophe a choisi de traiter les deux dans le même ticket. Les sauvegardes
sont donc en place, chiffrées en AES256, et la phrase de la politique de
confidentialité est devenue vraie plutôt que d'être supprimée.

**Trois pièges à l'exécution, aucun visible à la lecture.** `docker cp` est
refusé sur un conteneur `read_only: true`, durcissement OWASP de SP-157 : il
fallait le contourner sans l'affaiblir, en écrivant par `docker exec`.
`gpg --decrypt | head -c 5` fait sortir gpg en code 2 par SIGPIPE, et mon
contrôle rejetait une sauvegarde parfaitement saine. `pg_restore --list -` ne
lit pas l'entrée standard, piège déjà documenté par le script voisin.

Le deuxième mérite d'être retenu : un garde-fou qui échoue sur du bon travail
est pire qu'absent, il aurait fait échouer toutes les sauvegardes en annonçant
une corruption inexistante.

**Le serveur de vérification était mort.** Mon premier `curl` sur l'accueil
retournait HTTP 000 : `next start` ne fonctionne pas avec `output: standalone`,
piège documenté dans le CLAUDE.md. Je testais un serveur qui n'existait pas, ce
qui aurait pu me faire conclure à tort que mes corrections étaient en place.
Reprise avec `node .next/standalone/server.js`.

## Ce qui est prouvé

La sauvegarde et la restauration ont réellement tourné, pas seulement été
écrites :

```
Sauvegarde verifiee : 200 objets, 127 731 octets chiffres
Restauration        : 23 tables, 12 entreprises, 71 utilisateurs
```

La base de test a été supprimée, aucun dump en clair ne subsiste, et le timer
systemd déclenche bien le service. Preuve par mutation : clé de chiffrement
rendue illisible, le service échoue en `Result=exit-code` et non en silence.

## Prochaine étape

Les six tickets de l'audit sont traités. La branche complète reste à pousser,
avec une PR par ticket ou une PR groupée, selon ce que Christophe préfère.

Deux points restent ouverts, nés de cette session :

- **le chiffrement au repos n'existe pas** et n'est plus annoncé. Le mettre en
  place demanderait `pgcrypto` sur les colonnes sensibles ou un volume chiffré,
  ce qui est une décision d'architecture à part entière
- la clé de sauvegarde vit dans `/etc/smartplanning/backup.key` sur la même
  machine que les sauvegardes. Une sauvegarde hors site, avec la clé conservée
  ailleurs, est le complément logique : en l'état, la perte du VPS emporte les
  sauvegardes avec la base
