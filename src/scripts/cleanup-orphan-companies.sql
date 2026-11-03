-- Nettoyage : entreprises restées sans aucun utilisateur (SP-624)
--
-- ## Le défaut
--
-- Jusqu'à SP-624, supprimer son compte ne supprimait que l'utilisateur. Quand
-- c'était le dernier de son entreprise, celle-ci restait en base avec ses
-- employés nommés, ses équipes, ses créneaux et son abonnement, sans plus
-- personne pour y accéder. L'email de confirmation annonçait pourtant une
-- suppression définitive (RGPD article 17).
--
-- Deux cas mesurés le 3 novembre 2026 :
--   - Serra Propreté, compte supprimé le 7 septembre 2026
--   - QUAI DES BRUMES, compte supprimé le 3 novembre 2026
--
-- Depuis SP-624, deleteAccount supprime l'entreprise avec son dernier
-- utilisateur. Ce script rattrape les cas antérieurs.
--
-- ## Pourquoi du SQL
--
-- L'image de production n'embarque ni `src/scripts/` ni `tsx`. Voir
-- `.claude/rules/prisma-pieges.md`.
--
-- ## Marche à suivre
--
--   docker exec -i smartplanning-postgres psql -U smartplanning -d smartplanning
--
-- Ne jamais lancer le DELETE sans avoir lu la mesure. Une entreprise qui porte
-- un paiement ou un abonnement Stripe est exclue : elle demande un examen à la
-- main, la cascade effacerait aussi ses lignes `payments`.

-- ── Étape 1 : mesurer le périmètre ──────────────────────────────────────────
-- La clause WHERE est EXACTEMENT celle du DELETE de l'étape 2.

SELECT c.id, c.name, c."createdAt"::date,
  (SELECT count(*) FROM employees e WHERE e."companyId" = c.id) AS employes,
  (SELECT count(*) FROM schedules s WHERE s."companyId" = c.id) AS creneaux,
  (SELECT count(*) FROM payments p WHERE p."companyId" = c.id) AS paiements
FROM companies c
WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u."companyId" = c.id)
  AND NOT EXISTS (SELECT 1 FROM payments p WHERE p."companyId" = c.id)
  AND NOT EXISTS (
    SELECT 1 FROM subscriptions s
    WHERE s."companyId" = c.id AND s."stripeSubscriptionId" IS NOT NULL
  );

-- ── Étape 2 : supprimer, en transaction ─────────────────────────────────────
-- Comparer le nombre de lignes rendu par le DELETE à celui de l'étape 1 avant
-- le COMMIT. S'ils diffèrent : ROLLBACK.

BEGIN;

DELETE FROM companies c
WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u."companyId" = c.id)
  AND NOT EXISTS (SELECT 1 FROM payments p WHERE p."companyId" = c.id)
  AND NOT EXISTS (
    SELECT 1 FROM subscriptions s
    WHERE s."companyId" = c.id AND s."stripeSubscriptionId" IS NOT NULL
  )
RETURNING c.id, c.name;

-- COMMIT;   -- ou ROLLBACK;

-- ── Étape 3 : vérifier ──────────────────────────────────────────────────────
-- Doit rendre 0.

SELECT count(*) FROM companies c
WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u."companyId" = c.id);

-- ## Résultat
--
-- Mesure du 3 novembre 2026 avant exécution : 2 entreprises, aucun paiement,
-- aucun abonnement Stripe. QUAI DES BRUMES (3 employés, 2 équipes,
-- 2 créneaux, 79 lignes d'audit), Serra Propreté (1 employé, 1 équipe,
-- 52 créneaux).
--
-- Exécution du 3 novembre 2026 par cleanup-orphan-companies.run.sql, après un
-- test à blanc en transaction annulée : « Entreprises orphelines supprimées :
-- 2 », puis 0 entreprise sans utilisateur restante.
