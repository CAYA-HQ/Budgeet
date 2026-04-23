package migrations

import (
	"database/sql"
	"fmt"
	"time"
)

type migration struct {
	version     string
	description string
	run         func(*sql.Tx) error
}

var all = []migration{
	{
		version:     "0001_legacy_user_ids_to_uuid",
		description: "Upgrade legacy string-based user identifiers to UUID columns",
		run:         runLegacyUserIDCompatibilityMigration,
	},
	{
		version:     "0002_baseline_uuid_schema",
		description: "Create the UUID-native baseline schema and indexes",
		run:         runBaselineSchemaMigration,
	},
}

// Run applies all pending schema migrations in version order.
func Run(db *sql.DB) error {
	if err := ensureMigrationsTable(db); err != nil {
		return err
	}

	applied, err := loadAppliedVersions(db)
	if err != nil {
		return err
	}

	for _, m := range all {
		if applied[m.version] {
			continue
		}

		tx, err := db.Begin()
		if err != nil {
			return fmt.Errorf("begin migration %s: %w", m.version, err)
		}

		if err := m.run(tx); err != nil {
			_ = tx.Rollback()
			return fmt.Errorf("run migration %s: %w", m.version, err)
		}

		if _, err := tx.Exec(
			`INSERT INTO schema_migrations (version, description, applied_at) VALUES ($1, $2, $3)`,
			m.version,
			m.description,
			time.Now().UTC(),
		); err != nil {
			_ = tx.Rollback()
			return fmt.Errorf("record migration %s: %w", m.version, err)
		}

		if err := tx.Commit(); err != nil {
			return fmt.Errorf("commit migration %s: %w", m.version, err)
		}
	}

	return nil
}

func ensureMigrationsTable(db *sql.DB) error {
	_, err := db.Exec(`
		CREATE TABLE IF NOT EXISTS schema_migrations (
			version VARCHAR(255) PRIMARY KEY,
			description TEXT NOT NULL,
			applied_at TIMESTAMPTZ NOT NULL
		)
	`)
	if err != nil {
		return fmt.Errorf("ensure schema_migrations table: %w", err)
	}

	return nil
}

func loadAppliedVersions(db *sql.DB) (map[string]bool, error) {
	rows, err := db.Query(`SELECT version FROM schema_migrations`)
	if err != nil {
		return nil, fmt.Errorf("load applied migrations: %w", err)
	}
	defer rows.Close()

	applied := make(map[string]bool)
	for rows.Next() {
		var version string
		if err := rows.Scan(&version); err != nil {
			return nil, fmt.Errorf("scan applied migration version: %w", err)
		}
		applied[version] = true
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate applied migrations: %w", err)
	}

	return applied, nil
}
