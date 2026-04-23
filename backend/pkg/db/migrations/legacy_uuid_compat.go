package migrations

import (
	"database/sql"
	"fmt"
)

const uuidRegex = "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$"

func runLegacyUserIDCompatibilityMigration(tx *sql.Tx) error {
	usersIDType, err := columnType(tx, "users", "id")
	if err != nil {
		return err
	}
	if usersIDType == "" {
		return nil
	}
	if isUUIDType(usersIDType) {
		return nil
	}
	if !isTextLikeType(usersIDType) {
		return fmt.Errorf("unsupported legacy users.id type %q", usersIDType)
	}

	if _, err := tx.Exec(`CREATE EXTENSION IF NOT EXISTS pgcrypto`); err != nil {
		return fmt.Errorf("ensure pgcrypto extension: %w", err)
	}
	if _, err := tx.Exec(`CREATE TEMP TABLE legacy_user_id_map (legacy_id TEXT PRIMARY KEY, new_id UUID NOT NULL) ON COMMIT DROP`); err != nil {
		return fmt.Errorf("create user id mapping table: %w", err)
	}

	if err := addUUIDShadowColumn(tx, "users", "id_uuid"); err != nil {
		return err
	}
	if _, err := tx.Exec(`
		INSERT INTO legacy_user_id_map (legacy_id, new_id)
		SELECT id::text,
			CASE
				WHEN id::text ~* $1 THEN id::text::uuid
				ELSE gen_random_uuid()
			END
		FROM users
	`, uuidRegex); err != nil {
		return fmt.Errorf("build user id mapping: %w", err)
	}
	if _, err := tx.Exec(`
		UPDATE users AS u
		SET id_uuid = m.new_id
		FROM legacy_user_id_map AS m
		WHERE u.id::text = m.legacy_id
	`); err != nil {
		return fmt.Errorf("backfill users.id_uuid: %w", err)
	}
	if err := ensureNoNullUUIDShadow(tx, "users", "id_uuid"); err != nil {
		return err
	}

	if err := migrateStandaloneIDColumn(tx, "refresh_tokens"); err != nil {
		return err
	}
	if err := migrateStandaloneIDColumn(tx, "expenses"); err != nil {
		return err
	}
	if err := migrateUserReference(tx, "refresh_tokens"); err != nil {
		return err
	}
	if err := migrateUserReference(tx, "expenses"); err != nil {
		return err
	}

	if err := dropForeignKeysReferencingUsers(tx, "refresh_tokens"); err != nil {
		return err
	}
	if err := dropForeignKeysReferencingUsers(tx, "expenses"); err != nil {
		return err
	}

	if err := swapStandaloneIDColumn(tx, "refresh_tokens"); err != nil {
		return err
	}
	if err := swapStandaloneIDColumn(tx, "expenses"); err != nil {
		return err
	}
	if err := swapUserReference(tx, "refresh_tokens"); err != nil {
		return err
	}
	if err := swapUserReference(tx, "expenses"); err != nil {
		return err
	}

	if err := dropPrimaryKey(tx, "users"); err != nil {
		return err
	}
	if _, err := tx.Exec(`ALTER TABLE users DROP COLUMN id`); err != nil {
		return fmt.Errorf("drop legacy users.id column: %w", err)
	}
	if _, err := tx.Exec(`ALTER TABLE users RENAME COLUMN id_uuid TO id`); err != nil {
		return fmt.Errorf("rename users.id_uuid column: %w", err)
	}
	if _, err := tx.Exec(`ALTER TABLE users ALTER COLUMN id SET NOT NULL`); err != nil {
		return fmt.Errorf("set users.id not null: %w", err)
	}
	if _, err := tx.Exec(`ALTER TABLE users ALTER COLUMN id SET DEFAULT gen_random_uuid()`); err != nil {
		return fmt.Errorf("set users.id default: %w", err)
	}
	if _, err := tx.Exec(`ALTER TABLE users ADD CONSTRAINT users_pkey PRIMARY KEY (id)`); err != nil {
		return fmt.Errorf("recreate users primary key: %w", err)
	}

	if err := addUsersForeignKey(tx, "refresh_tokens", "refresh_tokens_user_id_fkey"); err != nil {
		return err
	}
	if err := addUsersForeignKey(tx, "expenses", "expenses_user_id_fkey"); err != nil {
		return err
	}

	return nil
}

func migrateStandaloneIDColumn(tx *sql.Tx, table string) error {
	idType, err := columnType(tx, table, "id")
	if err != nil {
		return err
	}
	if idType == "" || isUUIDType(idType) {
		return nil
	}

	if err := addUUIDShadowColumn(tx, table, "id_uuid"); err != nil {
		return err
	}
	if _, err := tx.Exec(fmt.Sprintf(`
		UPDATE %s
		SET id_uuid = CASE
			WHEN id::text ~* $1 THEN id::text::uuid
			ELSE gen_random_uuid()
		END
		WHERE id_uuid IS NULL
	`, table), uuidRegex); err != nil {
		return fmt.Errorf("backfill %s.id_uuid: %w", table, err)
	}

	return ensureNoNullUUIDShadow(tx, table, "id_uuid")
}

func migrateUserReference(tx *sql.Tx, table string) error {
	userIDType, err := columnType(tx, table, "user_id")
	if err != nil {
		return err
	}
	if userIDType == "" {
		return nil
	}

	if err := addUUIDShadowColumn(tx, table, "user_id_uuid"); err != nil {
		return err
	}
	if _, err := tx.Exec(fmt.Sprintf(`
		UPDATE %s AS child
		SET user_id_uuid = mapping.new_id
		FROM legacy_user_id_map AS mapping
		WHERE child.user_id::text = mapping.legacy_id
	`, table)); err != nil {
		return fmt.Errorf("backfill %s.user_id_uuid: %w", table, err)
	}

	var unresolved int
	if err := tx.QueryRow(fmt.Sprintf(`
		SELECT COUNT(*)
		FROM %s
		WHERE user_id IS NOT NULL AND user_id_uuid IS NULL
	`, table)).Scan(&unresolved); err != nil {
		return fmt.Errorf("validate %s.user_id_uuid: %w", table, err)
	}
	if unresolved > 0 {
		return fmt.Errorf("%s contains %d rows with unresolved legacy user references", table, unresolved)
	}

	return nil
}

func swapStandaloneIDColumn(tx *sql.Tx, table string) error {
	idType, err := columnType(tx, table, "id")
	if err != nil {
		return err
	}
	if idType == "" || isUUIDType(idType) {
		return nil
	}

	if err := dropPrimaryKey(tx, table); err != nil {
		return err
	}
	if _, err := tx.Exec(fmt.Sprintf(`ALTER TABLE %s DROP COLUMN id`, table)); err != nil {
		return fmt.Errorf("drop legacy %s.id column: %w", table, err)
	}
	if _, err := tx.Exec(fmt.Sprintf(`ALTER TABLE %s RENAME COLUMN id_uuid TO id`, table)); err != nil {
		return fmt.Errorf("rename %s.id_uuid column: %w", table, err)
	}
	if _, err := tx.Exec(fmt.Sprintf(`ALTER TABLE %s ALTER COLUMN id SET NOT NULL`, table)); err != nil {
		return fmt.Errorf("set %s.id not null: %w", table, err)
	}
	if _, err := tx.Exec(fmt.Sprintf(`ALTER TABLE %s ALTER COLUMN id SET DEFAULT gen_random_uuid()`, table)); err != nil {
		return fmt.Errorf("set %s.id default: %w", table, err)
	}
	if _, err := tx.Exec(fmt.Sprintf(`ALTER TABLE %s ADD CONSTRAINT %s_pkey PRIMARY KEY (id)`, table, table)); err != nil {
		return fmt.Errorf("recreate %s primary key: %w", table, err)
	}

	return nil
}

func swapUserReference(tx *sql.Tx, table string) error {
	userIDType, err := columnType(tx, table, "user_id")
	if err != nil {
		return err
	}
	if userIDType == "" {
		return nil
	}

	if _, err := tx.Exec(fmt.Sprintf(`ALTER TABLE %s DROP COLUMN user_id`, table)); err != nil {
		return fmt.Errorf("drop legacy %s.user_id column: %w", table, err)
	}
	if _, err := tx.Exec(fmt.Sprintf(`ALTER TABLE %s RENAME COLUMN user_id_uuid TO user_id`, table)); err != nil {
		return fmt.Errorf("rename %s.user_id_uuid column: %w", table, err)
	}
	if _, err := tx.Exec(fmt.Sprintf(`ALTER TABLE %s ALTER COLUMN user_id SET NOT NULL`, table)); err != nil {
		return fmt.Errorf("set %s.user_id not null: %w", table, err)
	}

	return nil
}

func addUsersForeignKey(tx *sql.Tx, table, name string) error {
	exists, err := tableExists(tx, table)
	if err != nil {
		return err
	}
	if !exists {
		return nil
	}

	if _, err := tx.Exec(fmt.Sprintf(
		`ALTER TABLE %s ADD CONSTRAINT %s FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE`,
		table,
		name,
	)); err != nil {
		return fmt.Errorf("recreate %s foreign key: %w", table, err)
	}

	return nil
}

func addUUIDShadowColumn(tx *sql.Tx, table, column string) error {
	_, err := tx.Exec(fmt.Sprintf(`ALTER TABLE %s ADD COLUMN IF NOT EXISTS %s UUID`, table, column))
	if err != nil {
		return fmt.Errorf("add %s.%s shadow column: %w", table, column, err)
	}

	return nil
}

func ensureNoNullUUIDShadow(tx *sql.Tx, table, column string) error {
	var missing int
	if err := tx.QueryRow(fmt.Sprintf(`SELECT COUNT(*) FROM %s WHERE %s IS NULL`, table, column)).Scan(&missing); err != nil {
		return fmt.Errorf("validate %s.%s backfill: %w", table, column, err)
	}
	if missing > 0 {
		return fmt.Errorf("%s.%s contains %d unmigrated rows", table, column, missing)
	}

	return nil
}

func dropPrimaryKey(tx *sql.Tx, table string) error {
	name, err := primaryKeyConstraintName(tx, table)
	if err != nil {
		return err
	}
	if name == "" {
		return nil
	}

	if _, err := tx.Exec(fmt.Sprintf(`ALTER TABLE %s DROP CONSTRAINT %s`, table, name)); err != nil {
		return fmt.Errorf("drop %s primary key constraint: %w", table, err)
	}

	return nil
}

func dropForeignKeysReferencingUsers(tx *sql.Tx, table string) error {
	exists, err := tableExists(tx, table)
	if err != nil {
		return err
	}
	if !exists {
		return nil
	}

	names, err := foreignKeyConstraintNames(tx, table, "users")
	if err != nil {
		return err
	}
	for _, name := range names {
		if _, err := tx.Exec(fmt.Sprintf(`ALTER TABLE %s DROP CONSTRAINT %s`, table, name)); err != nil {
			return fmt.Errorf("drop %s foreign key %s: %w", table, name, err)
		}
	}

	return nil
}

func tableExists(tx *sql.Tx, table string) (bool, error) {
	var exists bool
	if err := tx.QueryRow(`
		SELECT EXISTS (
			SELECT 1
			FROM information_schema.tables
			WHERE table_schema = 'public' AND table_name = $1
		)
	`, table).Scan(&exists); err != nil {
		return false, fmt.Errorf("check table %s existence: %w", table, err)
	}

	return exists, nil
}

func columnType(tx *sql.Tx, table, column string) (string, error) {
	var dataType sql.NullString
	err := tx.QueryRow(`
		SELECT data_type
		FROM information_schema.columns
		WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2
	`, table, column).Scan(&dataType)
	if err == sql.ErrNoRows {
		return "", nil
	}
	if err != nil {
		return "", fmt.Errorf("load %s.%s column type: %w", table, column, err)
	}
	if !dataType.Valid {
		return "", nil
	}

	return dataType.String, nil
}

func primaryKeyConstraintName(tx *sql.Tx, table string) (string, error) {
	var name sql.NullString
	err := tx.QueryRow(`
		SELECT conname
		FROM pg_constraint
		WHERE contype = 'p' AND conrelid = $1::regclass
	`, table).Scan(&name)
	if err == sql.ErrNoRows {
		return "", nil
	}
	if err != nil {
		return "", fmt.Errorf("load %s primary key constraint: %w", table, err)
	}
	if !name.Valid {
		return "", nil
	}

	return name.String, nil
}

func foreignKeyConstraintNames(tx *sql.Tx, table, referencedTable string) ([]string, error) {
	rows, err := tx.Query(`
		SELECT conname
		FROM pg_constraint
		WHERE contype = 'f'
			AND conrelid = $1::regclass
			AND confrelid = $2::regclass
	`, table, referencedTable)
	if err != nil {
		return nil, fmt.Errorf("load %s foreign key constraints: %w", table, err)
	}
	defer rows.Close()

	var names []string
	for rows.Next() {
		var name string
		if err := rows.Scan(&name); err != nil {
			return nil, fmt.Errorf("scan %s foreign key constraint: %w", table, err)
		}
		names = append(names, name)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate %s foreign key constraints: %w", table, err)
	}

	return names, nil
}

func isUUIDType(dataType string) bool {
	return dataType == "uuid"
}

func isTextLikeType(dataType string) bool {
	return dataType == "text" || dataType == "character varying" || dataType == "varchar"
}
