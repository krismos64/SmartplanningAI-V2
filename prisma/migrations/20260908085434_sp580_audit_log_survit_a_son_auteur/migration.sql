-- SP-580 : un audit doit survivre a la suppression de son auteur.
--
-- audit_logs.userId etait NOT NULL avec ON DELETE CASCADE : supprimer un
-- compte effacait donc les lignes d'audit qui le concernaient, y compris
-- l'audit DELETE ecrit juste avant. Mesure avant migration en production :
-- 1517 lignes dans audit_logs, dont zero action DELETE sur entityType USER.
-- La suppression de compte, l'evenement qui justifie le plus une trace, etait
-- le seul du produit a n'en laisser aucune, alors que le code revendiquait une
-- tracabilite RGPD Article 30.
--
-- La colonne passe nullable et la contrainte a SET NULL. L'identite de
-- l'auteur reste lisible dans details, ou deleteAccount depose email, role et
-- entreprise avant la suppression. La cle etrangere ne pointe plus vers une
-- personne supprimee, ce qui sert aussi la minimisation RGPD.
--
-- Migration sans risque de perte : elle relache une contrainte et ne modifie
-- aucune ligne existante. Les 1517 lignes actuelles gardent leur userId.

-- DropForeignKey
ALTER TABLE "public"."audit_logs" DROP CONSTRAINT "audit_logs_userId_fkey";

-- AlterTable
ALTER TABLE "audit_logs" ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
