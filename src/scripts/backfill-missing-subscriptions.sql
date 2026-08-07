-- Backfill : entreprises sans ligne Subscription (SP-559)
--
-- ## Le défaut
--
-- Jusqu'au correctif d'inscription de juillet 2026 (PR #47), la ligne
-- `Subscription` n'était pas créée à l'enregistrement d'une entreprise. Le
-- backfill SP-536 du 03/07/2026 a rattrapé les comptes concernés, mais son
-- filtre ne portait que sur les essais **en cours**.
--
-- Une entreprise inscrite avant le correctif et dont l'essai était déjà échu au
-- moment du backfill passait donc entre les deux filets. C'est le cas de
-- `sofreba`, inscrite le 22/05/2026, essai échu le 12/06/2026, restée sans
-- aucune ligne `Subscription` pendant plus de deux mois.
--
-- ## Pourquoi c'est un problème
--
-- Sans ligne `Subscription`, l'entreprise est invisible :
--   - du cron `/api/cron/trial-emails`, qui filtre sur `subscription.status`
--   - du widget « Trials à risque » du dashboard admin (SP-473)
--   - de la page Abonnements et Paiements cross-tenant (SP-540)
--
-- `sofreba` n'a effectivement reçu aucun email d'essai, ni rappel ni expiration.
--
-- ## Pourquoi du SQL et pas un script TypeScript
--
-- L'image Docker de production est un build Next.js standalone : pas de
-- `src/scripts/`, pas de `tsx`, pas de `node_modules/.bin`. Un
-- `docker exec smartplanning-app npx tsx …` échoue. Voir
-- `.claude/rules/prisma-pieges.md`.
--
-- ## Marche à suivre
--
-- Exécuter les trois étapes dans l'ordre. Ne jamais lancer l'INSERT sans avoir
-- lu le résultat de la mesure : un INSERT à l'aveugle « réussit » sur 0 ligne
-- sans jamais révéler que le périmètre était vide.
--
--   docker exec smartplanning-postgres psql -U smartplanning -d smartplanning

-- ── Étape 1 : mesurer le périmètre ──────────────────────────────────────────
-- La clause WHERE est EXACTEMENT celle de l'INSERT de l'étape 2.
-- Exécution du 07/08/2026 : 1 ligne, `sofreba`.

SELECT c.id,
       c.name,
       to_char(c."createdAt", 'YYYY-MM-DD')   AS inscrit,
       to_char(c."trialEndsAt", 'YYYY-MM-DD') AS fin_essai
FROM companies c
         LEFT JOIN subscriptions s ON s."companyId" = c.id
WHERE s.id IS NULL
ORDER BY c."createdAt";

-- ── Étape 2 : insérer, en transaction ───────────────────────────────────────
-- Statut EXPIRED : ces entreprises ont un essai échu de longue date. Le cron ne
-- traitant que les lignes TRIAL, aucun email de rattrapage ne partira, ce qui
-- est le comportement voulu pour un essai terminé depuis des semaines.
--
-- `createdAt` reprend celui de l'entreprise pour que l'historique reste lisible.
-- Les valeurs FREE / 0 / 0 / 290 suivent la convention des lignes EXPIRED
-- existantes.
--
-- Comparer le nombre de lignes retourné à celui de l'étape 1 avant de valider.
-- Exécution du 07/08/2026 : INSERT 0 1, conforme.

BEGIN;

INSERT INTO subscriptions (id, "companyId", plan, "planPrice", currency, status,
                           quantity, "pricePerEmployee", "cancelAtPeriodEnd",
                           "createdAt", "updatedAt")
SELECT gen_random_uuid()::text,
       c.id,
       'FREE',
       0,
       'EUR',
       'EXPIRED',
       0,
       290,
       false,
       c."createdAt",
       CURRENT_TIMESTAMP
FROM companies c
         LEFT JOIN subscriptions s ON s."companyId" = c.id
WHERE s.id IS NULL;

COMMIT;

-- ── Étape 3 : contrôler ─────────────────────────────────────────────────────
-- `sans_subscription` doit valoir 0.
-- Exécution du 07/08/2026 : 0, et EXPIRED passé de 4 à 5.

SELECT 'sans_subscription' AS controle, COUNT(*)::text AS valeur
FROM companies c
         LEFT JOIN subscriptions s ON s."companyId" = c.id
WHERE s.id IS NULL
UNION ALL
SELECT 'statut: ' || s.status, COUNT(*)::text
FROM subscriptions s
GROUP BY s.status;
