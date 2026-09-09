# 9 septembre 2026, un fichier lu en entier avant d'être refusé

| Champ | Valeur |
|---|---|
| Ticket | SP-590, troisième des six tickets issus de l'audit |
| Documents produits | `src/hooks/__tests__/use-csv-import-file-size.test.ts` |
| Documents modifiés | `src/hooks/use-csv-import.ts`, `src/components/import/csv-import.utils.ts` |
| Contrôles | type-check vert, lint sans erreur, 3304 tests verts sur 200 fichiers |
| Jira | SP-590 commenté |
| Mémoire | rien à écrire, le défaut et sa correction se lisent dans le code |

## Ce qui a été fait

`processFile` lisait le fichier en entier, puis le parsait, avant que la limite
de 1000 lignes n'intervienne. L'ordre était donc inversé : plusieurs centaines
de mégaoctets chargés en mémoire pour être refusés ensuite sur le nombre de
lignes.

L'import était le seul chemin d'upload du projet sans garde de taille. L'avatar
(`AvatarUpload.tsx:73`), la messagerie (`MessageInput.tsx:46`) et les deux
routes API correspondantes vérifient toutes `file.size` en amont depuis
toujours.

`MAX_IMPORT_FILE_SIZE` est fixé à 5 Mo, dimensionné sur la limite réelle plutôt
que choisi au hasard : une ligne de collaborateur pèse 100 à 150 octets, donc
environ 150 Ko pour 1000 lignes, et la marge couvre la structure XML d'un XLSX.
C'est aussi le plafond déjà retenu pour les avatars.

La garde est placée hors du `try` et avant tout accès au contenu. Elle couvre
les deux points d'entrée de la page, l'input et le glisser-déposer, qui passent
tous deux par `processFile`. Le dépôt échappe de toute façon à l'attribut
`accept`.

## Les écarts

**Le chemin CSV était concerné autant que le XLSX.** Le ticket ne citait que
`file.arrayBuffer()`, mais `readAsText` sur un CSV charge tout autant. La garde
étant en amont de l'aiguillage par extension, les deux sont couverts.

**Un fichier vide méritait son propre message.** Il passait la garde de taille
et échouait plus loin sur « Impossible de détecter les colonnes du fichier »,
message trompeur pour un fichier de 0 octet.

**Les tests vérifient la non-lecture, pas seulement le refus.** C'est la lecture
qui coûte, un refus tardif n'aurait rien réglé. D'où l'espion sur `arrayBuffer`
et le compteur d'instanciations de `FileReader`. La mesure le confirme : sans la
garde, le cas XLSX de 300 Mo prend 75 ms contre 4 ms avec.

**Accents corrigés avant commit.** J'avais rédigé les commentaires et le message
d'erreur sans accents. Le message est lu par un dirigeant, l'écart était
visible en production. Le reste du fichier `csv-import.utils.ts` est écrit sans
accents depuis SP-496 : je ne l'ai pas repris, la règle étant prospective.

## Prochaine étape

SP-591, l'instrumentation du tunnel de conversion. C'est le ticket qui sert
directement l'objectif commercial : sans ces événements, l'endroit où les essais
décrochent reste inconnu.

Point à décider séparément, hors périmètre de ce ticket : `xlsx@0.18.5` n'a
aucun correctif publié sur npm (pollution de prototype et ReDoS). La garde de
taille réduit la surface, elle ne résout pas le fond. Les options sont le
remplacement de la bibliothèque ou le repli sur CSV seul, l'une et l'autre étant
des décisions produit.

Restent SP-592 (couverture de tests) et SP-593 (promesses RGPD). Rien n'est
poussé.
