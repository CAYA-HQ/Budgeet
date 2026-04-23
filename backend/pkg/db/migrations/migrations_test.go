package migrations

import (
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestRunAppliesPendingMigrations(t *testing.T) {
	db, mock, err := sqlmock.New()
	require.NoError(t, err)
	defer db.Close()

	mock.ExpectExec("CREATE TABLE IF NOT EXISTS schema_migrations").
		WillReturnResult(sqlmock.NewResult(0, 0))
	mock.ExpectQuery("SELECT version FROM schema_migrations").
		WillReturnRows(sqlmock.NewRows([]string{"version"}))

	mock.ExpectBegin()
	mock.ExpectQuery("SELECT data_type\\s+FROM information_schema.columns").
		WithArgs("users", "id").
		WillReturnError(sqlmock.ErrCancelled)
	mock.ExpectRollback()

	err = Run(db)
	require.Error(t, err)
	assert.Contains(t, err.Error(), "run migration 0001_legacy_user_ids_to_uuid")
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestRunSkipsAppliedMigrations(t *testing.T) {
	db, mock, err := sqlmock.New()
	require.NoError(t, err)
	defer db.Close()

	mock.ExpectExec("CREATE TABLE IF NOT EXISTS schema_migrations").
		WillReturnResult(sqlmock.NewResult(0, 0))
	mock.ExpectQuery("SELECT version FROM schema_migrations").
		WillReturnRows(sqlmock.NewRows([]string{"version"}).
			AddRow("0001_legacy_user_ids_to_uuid").
			AddRow("0002_baseline_uuid_schema"))

	require.NoError(t, Run(db))
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestLegacyMigrationRejectsUnsupportedUsersIDType(t *testing.T) {
	db, mock, err := sqlmock.New()
	require.NoError(t, err)
	defer db.Close()

	mock.ExpectBegin()
	tx, err := db.Begin()
	require.NoError(t, err)

	mock.ExpectQuery("SELECT data_type\\s+FROM information_schema.columns").
		WithArgs("users", "id").
		WillReturnRows(sqlmock.NewRows([]string{"data_type"}).AddRow("integer"))
	mock.ExpectRollback()

	err = runLegacyUserIDCompatibilityMigration(tx)
	require.Error(t, err)
	assert.Contains(t, err.Error(), `unsupported legacy users.id type "integer"`)

	require.NoError(t, tx.Rollback())
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestLegacyMigrationBuildsUUIDShadowColumnsForTextIDs(t *testing.T) {
	db, mock, err := sqlmock.New()
	require.NoError(t, err)
	defer db.Close()

	mock.ExpectBegin()
	tx, err := db.Begin()
	require.NoError(t, err)

	mock.ExpectQuery("SELECT data_type\\s+FROM information_schema.columns").
		WithArgs("users", "id").
		WillReturnRows(sqlmock.NewRows([]string{"data_type"}).AddRow("text"))
	mock.ExpectExec("CREATE EXTENSION IF NOT EXISTS pgcrypto").
		WillReturnResult(sqlmock.NewResult(0, 0))
	mock.ExpectExec("CREATE TEMP TABLE legacy_user_id_map").
		WillReturnResult(sqlmock.NewResult(0, 0))
	mock.ExpectExec("ALTER TABLE users ADD COLUMN IF NOT EXISTS id_uuid UUID").
		WillReturnResult(sqlmock.NewResult(0, 0))
	mock.ExpectExec("INSERT INTO legacy_user_id_map").
		WithArgs(uuidRegex).
		WillReturnResult(sqlmock.NewResult(0, 1))
	mock.ExpectExec("UPDATE users AS u").
		WillReturnResult(sqlmock.NewResult(0, 1))
	mock.ExpectQuery("SELECT COUNT\\(\\*\\) FROM users WHERE id_uuid IS NULL").
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(0))

	mock.ExpectQuery("SELECT data_type\\s+FROM information_schema.columns").
		WithArgs("refresh_tokens", "id").
		WillReturnRows(sqlmock.NewRows([]string{"data_type"}).AddRow("text"))
	mock.ExpectExec("ALTER TABLE refresh_tokens ADD COLUMN IF NOT EXISTS id_uuid UUID").
		WillReturnResult(sqlmock.NewResult(0, 0))
	mock.ExpectExec("UPDATE refresh_tokens").
		WithArgs(uuidRegex).
		WillReturnResult(sqlmock.NewResult(0, 1))
	mock.ExpectQuery("SELECT COUNT\\(\\*\\) FROM refresh_tokens WHERE id_uuid IS NULL").
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(0))

	mock.ExpectQuery("SELECT data_type\\s+FROM information_schema.columns").
		WithArgs("expenses", "id").
		WillReturnRows(sqlmock.NewRows([]string{"data_type"}).AddRow("text"))
	mock.ExpectExec("ALTER TABLE expenses ADD COLUMN IF NOT EXISTS id_uuid UUID").
		WillReturnResult(sqlmock.NewResult(0, 0))
	mock.ExpectExec("UPDATE expenses").
		WithArgs(uuidRegex).
		WillReturnResult(sqlmock.NewResult(0, 1))
	mock.ExpectQuery("SELECT COUNT\\(\\*\\) FROM expenses WHERE id_uuid IS NULL").
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(0))

	mock.ExpectQuery("SELECT data_type\\s+FROM information_schema.columns").
		WithArgs("refresh_tokens", "user_id").
		WillReturnRows(sqlmock.NewRows([]string{"data_type"}).AddRow("text"))
	mock.ExpectExec("ALTER TABLE refresh_tokens ADD COLUMN IF NOT EXISTS user_id_uuid UUID").
		WillReturnResult(sqlmock.NewResult(0, 0))
	mock.ExpectExec("UPDATE refresh_tokens AS child").
		WillReturnResult(sqlmock.NewResult(0, 1))
	mock.ExpectQuery("SELECT COUNT\\(\\*\\)\\s+FROM refresh_tokens\\s+WHERE user_id IS NOT NULL AND user_id_uuid IS NULL").
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(0))

	mock.ExpectQuery("SELECT data_type\\s+FROM information_schema.columns").
		WithArgs("expenses", "user_id").
		WillReturnRows(sqlmock.NewRows([]string{"data_type"}).AddRow("text"))
	mock.ExpectExec("ALTER TABLE expenses ADD COLUMN IF NOT EXISTS user_id_uuid UUID").
		WillReturnResult(sqlmock.NewResult(0, 0))
	mock.ExpectExec("UPDATE expenses AS child").
		WillReturnResult(sqlmock.NewResult(0, 1))
	mock.ExpectQuery("SELECT COUNT\\(\\*\\)\\s+FROM expenses\\s+WHERE user_id IS NOT NULL AND user_id_uuid IS NULL").
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(0))

	mock.ExpectQuery("SELECT EXISTS \\(").
		WithArgs("refresh_tokens").
		WillReturnRows(sqlmock.NewRows([]string{"exists"}).AddRow(true))
	mock.ExpectQuery("SELECT conname\\s+FROM pg_constraint\\s+WHERE contype = 'f'\\s+AND conrelid = \\$1::regclass\\s+AND confrelid = \\$2::regclass").
		WithArgs("refresh_tokens", "users").
		WillReturnRows(sqlmock.NewRows([]string{"conname"}).AddRow("refresh_tokens_user_id_fkey"))
	mock.ExpectExec("ALTER TABLE refresh_tokens DROP CONSTRAINT refresh_tokens_user_id_fkey").
		WillReturnResult(sqlmock.NewResult(0, 0))

	mock.ExpectQuery("SELECT EXISTS \\(").
		WithArgs("expenses").
		WillReturnRows(sqlmock.NewRows([]string{"exists"}).AddRow(true))
	mock.ExpectQuery("SELECT conname\\s+FROM pg_constraint\\s+WHERE contype = 'f'\\s+AND conrelid = \\$1::regclass\\s+AND confrelid = \\$2::regclass").
		WithArgs("expenses", "users").
		WillReturnRows(sqlmock.NewRows([]string{"conname"}).AddRow("expenses_user_id_fkey"))
	mock.ExpectExec("ALTER TABLE expenses DROP CONSTRAINT expenses_user_id_fkey").
		WillReturnResult(sqlmock.NewResult(0, 0))

	mock.ExpectQuery("SELECT data_type\\s+FROM information_schema.columns").
		WithArgs("refresh_tokens", "id").
		WillReturnRows(sqlmock.NewRows([]string{"data_type"}).AddRow("text"))
	mock.ExpectQuery("SELECT conname\\s+FROM pg_constraint\\s+WHERE contype = 'p' AND conrelid = \\$1::regclass").
		WithArgs("refresh_tokens").
		WillReturnRows(sqlmock.NewRows([]string{"conname"}).AddRow("refresh_tokens_pkey"))
	mock.ExpectExec("ALTER TABLE refresh_tokens DROP CONSTRAINT refresh_tokens_pkey").
		WillReturnResult(sqlmock.NewResult(0, 0))
	mock.ExpectExec("ALTER TABLE refresh_tokens DROP COLUMN id").
		WillReturnResult(sqlmock.NewResult(0, 0))
	mock.ExpectExec("ALTER TABLE refresh_tokens RENAME COLUMN id_uuid TO id").
		WillReturnResult(sqlmock.NewResult(0, 0))
	mock.ExpectExec("ALTER TABLE refresh_tokens ALTER COLUMN id SET NOT NULL").
		WillReturnResult(sqlmock.NewResult(0, 0))
	mock.ExpectExec("ALTER TABLE refresh_tokens ALTER COLUMN id SET DEFAULT gen_random_uuid\\(\\)").
		WillReturnResult(sqlmock.NewResult(0, 0))
	mock.ExpectExec("ALTER TABLE refresh_tokens ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY \\(id\\)").
		WillReturnResult(sqlmock.NewResult(0, 0))

	mock.ExpectQuery("SELECT data_type\\s+FROM information_schema.columns").
		WithArgs("expenses", "id").
		WillReturnRows(sqlmock.NewRows([]string{"data_type"}).AddRow("text"))
	mock.ExpectQuery("SELECT conname\\s+FROM pg_constraint\\s+WHERE contype = 'p' AND conrelid = \\$1::regclass").
		WithArgs("expenses").
		WillReturnRows(sqlmock.NewRows([]string{"conname"}).AddRow("expenses_pkey"))
	mock.ExpectExec("ALTER TABLE expenses DROP CONSTRAINT expenses_pkey").
		WillReturnResult(sqlmock.NewResult(0, 0))
	mock.ExpectExec("ALTER TABLE expenses DROP COLUMN id").
		WillReturnResult(sqlmock.NewResult(0, 0))
	mock.ExpectExec("ALTER TABLE expenses RENAME COLUMN id_uuid TO id").
		WillReturnResult(sqlmock.NewResult(0, 0))
	mock.ExpectExec("ALTER TABLE expenses ALTER COLUMN id SET NOT NULL").
		WillReturnResult(sqlmock.NewResult(0, 0))
	mock.ExpectExec("ALTER TABLE expenses ALTER COLUMN id SET DEFAULT gen_random_uuid\\(\\)").
		WillReturnResult(sqlmock.NewResult(0, 0))
	mock.ExpectExec("ALTER TABLE expenses ADD CONSTRAINT expenses_pkey PRIMARY KEY \\(id\\)").
		WillReturnResult(sqlmock.NewResult(0, 0))

	mock.ExpectQuery("SELECT data_type\\s+FROM information_schema.columns").
		WithArgs("refresh_tokens", "user_id").
		WillReturnRows(sqlmock.NewRows([]string{"data_type"}).AddRow("text"))
	mock.ExpectExec("ALTER TABLE refresh_tokens DROP COLUMN user_id").
		WillReturnResult(sqlmock.NewResult(0, 0))
	mock.ExpectExec("ALTER TABLE refresh_tokens RENAME COLUMN user_id_uuid TO user_id").
		WillReturnResult(sqlmock.NewResult(0, 0))
	mock.ExpectExec("ALTER TABLE refresh_tokens ALTER COLUMN user_id SET NOT NULL").
		WillReturnResult(sqlmock.NewResult(0, 0))

	mock.ExpectQuery("SELECT data_type\\s+FROM information_schema.columns").
		WithArgs("expenses", "user_id").
		WillReturnRows(sqlmock.NewRows([]string{"data_type"}).AddRow("text"))
	mock.ExpectExec("ALTER TABLE expenses DROP COLUMN user_id").
		WillReturnResult(sqlmock.NewResult(0, 0))
	mock.ExpectExec("ALTER TABLE expenses RENAME COLUMN user_id_uuid TO user_id").
		WillReturnResult(sqlmock.NewResult(0, 0))
	mock.ExpectExec("ALTER TABLE expenses ALTER COLUMN user_id SET NOT NULL").
		WillReturnResult(sqlmock.NewResult(0, 0))

	mock.ExpectQuery("SELECT conname\\s+FROM pg_constraint\\s+WHERE contype = 'p' AND conrelid = \\$1::regclass").
		WithArgs("users").
		WillReturnRows(sqlmock.NewRows([]string{"conname"}).AddRow("users_pkey"))
	mock.ExpectExec("ALTER TABLE users DROP CONSTRAINT users_pkey").
		WillReturnResult(sqlmock.NewResult(0, 0))
	mock.ExpectExec("ALTER TABLE users DROP COLUMN id").
		WillReturnResult(sqlmock.NewResult(0, 0))
	mock.ExpectExec("ALTER TABLE users RENAME COLUMN id_uuid TO id").
		WillReturnResult(sqlmock.NewResult(0, 0))
	mock.ExpectExec("ALTER TABLE users ALTER COLUMN id SET NOT NULL").
		WillReturnResult(sqlmock.NewResult(0, 0))
	mock.ExpectExec("ALTER TABLE users ALTER COLUMN id SET DEFAULT gen_random_uuid\\(\\)").
		WillReturnResult(sqlmock.NewResult(0, 0))
	mock.ExpectExec("ALTER TABLE users ADD CONSTRAINT users_pkey PRIMARY KEY \\(id\\)").
		WillReturnResult(sqlmock.NewResult(0, 0))

	mock.ExpectQuery("SELECT EXISTS \\(").
		WithArgs("refresh_tokens").
		WillReturnRows(sqlmock.NewRows([]string{"exists"}).AddRow(true))
	mock.ExpectExec("ALTER TABLE refresh_tokens ADD CONSTRAINT refresh_tokens_user_id_fkey FOREIGN KEY \\(user_id\\) REFERENCES users\\(id\\) ON DELETE CASCADE").
		WillReturnResult(sqlmock.NewResult(0, 0))
	mock.ExpectQuery("SELECT EXISTS \\(").
		WithArgs("expenses").
		WillReturnRows(sqlmock.NewRows([]string{"exists"}).AddRow(true))
	mock.ExpectExec("ALTER TABLE expenses ADD CONSTRAINT expenses_user_id_fkey FOREIGN KEY \\(user_id\\) REFERENCES users\\(id\\) ON DELETE CASCADE").
		WillReturnResult(sqlmock.NewResult(0, 0))
	mock.ExpectRollback()

	require.NoError(t, runLegacyUserIDCompatibilityMigration(tx))
	require.NoError(t, tx.Rollback())
	assert.NoError(t, mock.ExpectationsWereMet())
}
