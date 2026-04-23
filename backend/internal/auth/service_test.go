package auth

import (
	"database/sql"
	"os"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"golang.org/x/crypto/bcrypt"
)

func TestAuthService_Register(t *testing.T) {
	os.Setenv("JWT_SECRET", "test-secret")
	db, mock, err := sqlmock.New()
	require.NoError(t, err)
	defer db.Close()

	service := NewAuthService(db)

	email := "test@example.com"
	password := "password123"

	t.Run("success", func(t *testing.T) {
		mock.ExpectQuery("SELECT EXISTS").
			WithArgs(email).
			WillReturnRows(sqlmock.NewRows([]string{"exists"}).AddRow(false))

		now := time.Now()
		mock.ExpectQuery("INSERT INTO users").
			WithArgs(email, sqlmock.AnyArg()).
			WillReturnRows(sqlmock.NewRows([]string{"id", "email", "created_at", "updated_at"}).
				AddRow("user-id", email, now, now))

		mock.ExpectExec("INSERT INTO refresh_tokens").
			WithArgs("user-id", sqlmock.AnyArg(), sqlmock.AnyArg()).
			WillReturnResult(sqlmock.NewResult(1, 1))

		user, accessToken, refreshToken, err := service.Register(email, password)

		assert.NoError(t, err)
		assert.NotNil(t, user)
		assert.Equal(t, email, user.Email)
		assert.NotEmpty(t, accessToken)
		assert.NotEmpty(t, refreshToken)
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	t.Run("email exists", func(t *testing.T) {
		mock.ExpectQuery("SELECT EXISTS").
			WithArgs(email).
			WillReturnRows(sqlmock.NewRows([]string{"exists"}).AddRow(true))

		user, accessToken, refreshToken, err := service.Register(email, password)

		assert.ErrorIs(t, err, ErrEmailExists)
		assert.Nil(t, user)
		assert.Empty(t, accessToken)
		assert.Empty(t, refreshToken)
		assert.NoError(t, mock.ExpectationsWereMet())
	})
}

func TestAuthService_Login(t *testing.T) {
	os.Setenv("JWT_SECRET", "test-secret")
	db, mock, err := sqlmock.New()
	require.NoError(t, err)
	defer db.Close()

	service := NewAuthService(db)

	email := "test@example.com"
	password := "password123"
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(password), 12)

	t.Run("success", func(t *testing.T) {
		now := time.Now()
		mock.ExpectQuery("SELECT id, email, password_hash, created_at, updated_at FROM users").
			WithArgs(email).
			WillReturnRows(sqlmock.NewRows([]string{"id", "email", "password_hash", "created_at", "updated_at"}).
				AddRow("user-id", email, string(hashedPassword), now, now))

		mock.ExpectExec("INSERT INTO refresh_tokens").
			WithArgs("user-id", sqlmock.AnyArg(), sqlmock.AnyArg()).
			WillReturnResult(sqlmock.NewResult(1, 1))

		user, accessToken, refreshToken, err := service.Login(email, password)

		assert.NoError(t, err)
		assert.NotNil(t, user)
		assert.Equal(t, email, user.Email)
		assert.NotEmpty(t, accessToken)
		assert.NotEmpty(t, refreshToken)
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	t.Run("invalid credentials - user not found", func(t *testing.T) {
		mock.ExpectQuery("SELECT id, email, password_hash, created_at, updated_at FROM users").
			WithArgs(email).
			WillReturnError(sql.ErrNoRows)

		user, accessToken, refreshToken, err := service.Login(email, password)

		assert.ErrorIs(t, err, ErrInvalidCredentials)
		assert.Nil(t, user)
		assert.Empty(t, accessToken)
		assert.Empty(t, refreshToken)
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	t.Run("invalid credentials - wrong password", func(t *testing.T) {
		now := time.Now()
		mock.ExpectQuery("SELECT id, email, password_hash, created_at, updated_at FROM users").
			WithArgs(email).
			WillReturnRows(sqlmock.NewRows([]string{"id", "email", "password_hash", "created_at", "updated_at"}).
				AddRow("user-id", email, "wrong-hash", now, now))

		user, accessToken, refreshToken, err := service.Login(email, password)

		assert.ErrorIs(t, err, ErrInvalidCredentials)
		assert.Nil(t, user)
		assert.Empty(t, accessToken)
		assert.Empty(t, refreshToken)
		assert.NoError(t, mock.ExpectationsWereMet())
	})
}

func TestAuthService_Logout(t *testing.T) {
	db, mock, err := sqlmock.New()
	require.NoError(t, err)
	defer db.Close()

	service := NewAuthService(db)
	token := "some-refresh-token"

	t.Run("success", func(t *testing.T) {
		mock.ExpectExec("UPDATE refresh_tokens").
			WithArgs(sqlmock.AnyArg()).
			WillReturnResult(sqlmock.NewResult(1, 1))

		err := service.Logout(token)

		assert.NoError(t, err)
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	t.Run("token not found or already revoked", func(t *testing.T) {
		mock.ExpectExec("UPDATE refresh_tokens").
			WithArgs(sqlmock.AnyArg()).
			WillReturnResult(sqlmock.NewResult(0, 0))

		err := service.Logout(token)

		assert.Error(t, err)
		assert.Equal(t, "UNAUTHORIZED", err.Error())
		assert.NoError(t, mock.ExpectationsWereMet())
	})
}
