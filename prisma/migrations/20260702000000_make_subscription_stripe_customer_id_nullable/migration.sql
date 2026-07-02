-- Migration : rendre stripeCustomerId nullable sur subscriptions
--
-- Contexte (audit 02/07/2026) : registerUser ne crée pas de Subscription ni de
-- Customer Stripe à l'inscription. Pour pouvoir backfiller une ligne Subscription
-- sans appel Stripe (comportement identique à une inscription normale), le champ
-- doit accepter NULL. Le Customer Stripe est créé au premier checkout volontaire
-- via createCheckoutSession, qui teste déjà `if (!customerId)` avant de créer.
--
-- Opération non-destructive : ALTER COLUMN DROP NOT NULL ne touche aucune donnée
-- existante. Applicable sans downtime sous PostgreSQL.

-- AlterTable
ALTER TABLE "subscriptions" ALTER COLUMN "stripeCustomerId" DROP NOT NULL;
