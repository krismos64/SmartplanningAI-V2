-- ==============================================
-- SMARTPLANNING - INITIALISATION BASE UMAMI
-- ==============================================
-- Script SQL pour créer la base de données Umami
-- dans l'instance PostgreSQL existante.
--
-- USAGE :
-- -------
-- docker exec -it smartplanning-postgres psql -U smartplanning -f /scripts/init-umami-db.sql
--
-- OU manuellement :
-- docker exec -it smartplanning-postgres psql -U smartplanning -c "CREATE DATABASE umami;"
--
-- NOTE :
-- ------
-- Umami crée automatiquement ses tables au premier démarrage.
-- Ce script crée uniquement la base de données vide.
--
-- ==============================================

-- Crée la base de données umami si elle n'existe pas
-- Note: Cette commande doit être exécutée depuis la base postgres ou smartplanning
SELECT 'CREATE DATABASE umami'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'umami')\gexec

-- Message de confirmation
\echo 'Base de données umami créée (ou déjà existante).'
\echo 'Umami créera ses tables automatiquement au premier démarrage.'
