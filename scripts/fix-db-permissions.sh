#!/usr/bin/env bash
# =============================================================================
#  fix-db-permissions.sh — Grant the app DB user access to all tables
#
#  Run this any time after schema changes or a fresh schema load to ensure
#  the app database user has full access to all tables and sequences.
#
#  Usage:
#    bash scripts/fix-db-permissions.sh
#
#  Or with explicit values:
#    DB_NAME=certxa_db DB_USER=certxa_toby bash scripts/fix-db-permissions.sh
# =============================================================================

DB_NAME="${DB_NAME:-certxa_db}"
DB_USER="${DB_USER:-certxa_toby}"

echo "Granting permissions on '$DB_NAME' to '$DB_USER'..."

sudo -u postgres psql -d "$DB_NAME" -c "
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO \"$DB_USER\";
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO \"$DB_USER\";
GRANT USAGE ON SCHEMA public TO \"$DB_USER\";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO \"$DB_USER\";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO \"$DB_USER\";
"

echo "Done. All tables and sequences are now accessible to '$DB_USER'."
