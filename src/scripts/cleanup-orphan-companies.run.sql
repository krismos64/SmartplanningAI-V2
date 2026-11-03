-- Exécution gardée du nettoyage SP-624 (3 novembre 2026)
--
-- Ne supprime que les deux entreprises mesurées, et seulement si elles sont
-- toujours sans utilisateur, sans paiement et sans abonnement Stripe. Si le
-- nombre de lignes supprimées n'est pas exactement 2, l'exception annule tout.
--
-- Test à blanc du 3 novembre 2026 (BEGIN, DELETE, ROLLBACK) : DELETE 2,
-- 0 orpheline restante, 2 de nouveau après ROLLBACK.

DO $$
DECLARE
  n integer;
BEGIN
  DELETE FROM companies c
  WHERE c.id IN ('cmtrg35mr0010pl015vslq8gp', 'cmw0kaufj0005qu015e47y6vz')
    AND NOT EXISTS (SELECT 1 FROM users u WHERE u."companyId" = c.id)
    AND NOT EXISTS (SELECT 1 FROM payments p WHERE p."companyId" = c.id)
    AND NOT EXISTS (
      SELECT 1 FROM subscriptions s
      WHERE s."companyId" = c.id AND s."stripeSubscriptionId" IS NOT NULL
    );
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 2 THEN
    RAISE EXCEPTION 'Attendu 2 entreprises, obtenu %. Rien n''est supprimé.', n;
  END IF;
  RAISE NOTICE 'Entreprises orphelines supprimées : %', n;
END $$;

SELECT count(*) AS orphelines_restantes
FROM companies c
WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u."companyId" = c.id);
