-- SP-350: Migration vers modèle per-seat
-- Changements:
--   1. SubscriptionPlan: FREE/STARTER/BUSINESS/ENTERPRISE → FREE/PER_SEAT
--   2. Company: suppression subscriptionPlan et subscriptionStatus (source de vérité = Subscription)
--   3. Subscription: ajout quantity, pricePerEmployee, stripeProductId, metadata ; planPrice Float→Int centimes
--   4. Payment: status String→PaymentStatus enum, amount Float→Int centimes, ajout failureReason/failureMessage/metadata
--   5. SubscriptionStatus: ajout INCOMPLETE

-- ============================================================================
-- 1. Créer le nouvel enum PaymentStatus
-- ============================================================================
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED', 'REFUNDED', 'REQUIRES_ACTION');

-- ============================================================================
-- 2. Ajouter INCOMPLETE à SubscriptionStatus
-- ============================================================================
ALTER TYPE "SubscriptionStatus" ADD VALUE IF NOT EXISTS 'INCOMPLETE';

-- ============================================================================
-- 3. Supprimer les colonnes Company qui dépendent des anciens enums
--    DOIT être fait AVANT de supprimer l'ancien type SubscriptionPlan
-- ============================================================================
DROP INDEX IF EXISTS "companies_subscriptionStatus_idx";
ALTER TABLE "companies" DROP COLUMN IF EXISTS "subscriptionPlan";
ALTER TABLE "companies" DROP COLUMN IF EXISTS "subscriptionStatus";

-- ============================================================================
-- 4. Migrer SubscriptionPlan: supprimer STARTER/BUSINESS/ENTERPRISE, ajouter PER_SEAT
-- PostgreSQL ne permet pas de supprimer des valeurs d'enum directement.
-- Stratégie: créer nouveau type → convertir colonnes → supprimer ancien → renommer
-- ============================================================================

-- 4a. Créer le nouveau type enum avec seulement FREE et PER_SEAT
CREATE TYPE "SubscriptionPlan_new" AS ENUM ('FREE', 'PER_SEAT');

-- 4b. Convertir la colonne Subscription.plan vers le nouveau type
-- STARTER/BUSINESS/ENTERPRISE → PER_SEAT ; FREE reste FREE
ALTER TABLE "subscriptions"
  ALTER COLUMN "plan" DROP DEFAULT,
  ALTER COLUMN "plan" TYPE "SubscriptionPlan_new"
    USING (CASE
      WHEN "plan"::text = 'FREE' THEN 'FREE'::"SubscriptionPlan_new"
      ELSE 'PER_SEAT'::"SubscriptionPlan_new"
    END),
  ALTER COLUMN "plan" SET DEFAULT 'FREE';

-- 4c. Supprimer l'ancien type et renommer le nouveau
DROP TYPE "SubscriptionPlan";
ALTER TYPE "SubscriptionPlan_new" RENAME TO "SubscriptionPlan";

-- ============================================================================
-- 5. Enrichir le modèle Subscription (per-seat)
-- ============================================================================

-- 5a. Convertir planPrice Float → Int (euros → centimes)
-- D'abord convertir les valeurs existantes (multiplier par 100)
UPDATE "subscriptions" SET "planPrice" = COALESCE("planPrice" * 100, 0);
ALTER TABLE "subscriptions"
  ALTER COLUMN "planPrice" SET NOT NULL,
  ALTER COLUMN "planPrice" SET DEFAULT 0,
  ALTER COLUMN "planPrice" TYPE INTEGER USING "planPrice"::INTEGER;

-- 5b. Ajouter les nouvelles colonnes
ALTER TABLE "subscriptions" ADD COLUMN "quantity" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "subscriptions" ADD COLUMN "pricePerEmployee" INTEGER NOT NULL DEFAULT 290;
ALTER TABLE "subscriptions" ADD COLUMN "stripeProductId" TEXT;
ALTER TABLE "subscriptions" ADD COLUMN "metadata" JSONB;

-- 5c. Mettre à jour quantity pour les subscriptions PER_SEAT existantes
-- Calculer quantity à partir du planPrice (en centimes maintenant) / pricePerEmployee
UPDATE "subscriptions"
  SET "quantity" = CASE
    WHEN "pricePerEmployee" > 0 THEN ("planPrice" / "pricePerEmployee")
    ELSE 0
  END
  WHERE "plan" = 'PER_SEAT';

-- ============================================================================
-- 6. Modifier le modèle Payment
-- ============================================================================

-- 6a. Convertir amount Float → Int (euros → centimes)
UPDATE "payments" SET "amount" = COALESCE("amount" * 100, 0);
ALTER TABLE "payments"
  ALTER COLUMN "amount" TYPE INTEGER USING "amount"::INTEGER;

-- 6b. Convertir status String → PaymentStatus enum
-- Mapper les valeurs existantes
ALTER TABLE "payments"
  ALTER COLUMN "status" DROP DEFAULT,
  ALTER COLUMN "status" TYPE "PaymentStatus"
    USING (CASE
      WHEN "status" = 'succeeded' THEN 'SUCCEEDED'::"PaymentStatus"
      WHEN "status" = 'pending' THEN 'PENDING'::"PaymentStatus"
      WHEN "status" = 'failed' THEN 'FAILED'::"PaymentStatus"
      WHEN "status" = 'refunded' THEN 'REFUNDED'::"PaymentStatus"
      WHEN "status" = 'requires_action' THEN 'REQUIRES_ACTION'::"PaymentStatus"
      ELSE 'PENDING'::"PaymentStatus"
    END),
  ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- 6c. Ajouter les nouvelles colonnes
ALTER TABLE "payments" ADD COLUMN "failureReason" TEXT;
ALTER TABLE "payments" ADD COLUMN "failureMessage" TEXT;
ALTER TABLE "payments" ADD COLUMN "metadata" JSONB;
