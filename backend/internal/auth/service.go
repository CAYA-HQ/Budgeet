// Package auth contains authentication business logic and HTTP adapters.
// It handles token creation, credential checks, and route wiring.
package auth

import (
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"errors"
	"os"
	"time"

	"github.com/CAYA-HQ/Spendwise-backend/internal/models"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

var (
	// ErrEmailExists is returned when a registration email is already used.
	// Handlers map it to a conflict response for the client.
	ErrEmailExists = errors.New("EMAIL_ALREADY_EXISTS")
	// ErrInvalidCredentials is returned for failed login validation.
	// It prevents leaking whether the email or password was incorrect.
	ErrInvalidCredentials = errors.New("INVALID_CREDENTIALS")
)

// Claims defines the custom JWT payload used by the API.
// It embeds the standard registered claims with user identity data.
type Claims struct {
	UserID string `json:"userID"`
	Email  string `json:"email"`
	jwt.RegisteredClaims
}

// AuthService wraps authentication operations backed by the database.
// It coordinates registration, login, logout, and token persistence.
type AuthService struct {
	db *sql.DB
}

// NewAuthService creates a service with the provided database handle.
// The returned service is used by HTTP handlers for auth flows.
func NewAuthService(db *sql.DB) *AuthService {
	return &AuthService{db: db}
}

// Register creates a new user and issues their initial tokens.
// It rejects duplicate emails and stores the refresh token hash.
func (s *AuthService) Register(email, password string) (*models.User, string, string, error) {
	var exists bool
	err := s.db.QueryRow("SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)", email).Scan(&exists)
	if err != nil {
		return nil, "", "", err
	}
	if exists {
		return nil, "", "", ErrEmailExists
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), 12)
	if err != nil {
		return nil, "", "", err
	}

	var user models.User
	err = s.db.QueryRow(
		"INSERT INTO users (id, email, password_hash, created_at, updated_at) VALUES (gen_random_uuid(), $1, $2, NOW(), NOW()) RETURNING id, email, created_at, updated_at",
		email, string(hashedPassword),
	).Scan(&user.ID, &user.Email, &user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		return nil, "", "", err
	}

	accessToken, refreshToken, err := s.GenerateTokens(user.ID, user.Email)
	if err != nil {
		return nil, "", "", err
	}

	err = s.StoreRefreshToken(user.ID, refreshToken)
	if err != nil {
		return nil, "", "", err
	}

	return &user, accessToken, refreshToken, nil
}

// Login verifies the submitted credentials and returns fresh tokens.
// It loads the user record, checks the password hash, and persists refresh state.
func (s *AuthService) Login(email, password string) (*models.User, string, string, error) {
	var user models.User
	err := s.db.QueryRow(
		"SELECT id, email, password_hash, created_at, updated_at FROM users WHERE email = $1",
		email,
	).Scan(&user.ID, &user.Email, &user.PasswordHash, &user.CreatedAt, &user.UpdatedAt)

	if err == sql.ErrNoRows {
		return nil, "", "", ErrInvalidCredentials
	}
	if err != nil {
		return nil, "", "", err
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password))
	if err != nil {
		return nil, "", "", ErrInvalidCredentials
	}

	accessToken, refreshToken, err := s.GenerateTokens(user.ID, user.Email)
	if err != nil {
		return nil, "", "", err
	}

	err = s.StoreRefreshToken(user.ID, refreshToken)
	if err != nil {
		return nil, "", "", err
	}

	return &user, accessToken, refreshToken, nil
}

// Logout revokes a refresh token so it can no longer be reused.
// It marks the stored token hash as revoked in the database.
func (s *AuthService) Logout(token string) error {
	tokenHash := s.hashToken(token)

	result, err := s.db.Exec(
		"UPDATE refresh_tokens SET revoked = true WHERE token_hash = $1 AND revoked = false",
		tokenHash,
	)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return errors.New("UNAUTHORIZED")
	}

	return nil
}

// GenerateTokens creates signed access and refresh JWTs for a user.
// The access token is short-lived while the refresh token lasts longer.
func (s *AuthService) GenerateTokens(userID, email string) (string, string, error) {
	jwtSecret := []byte(os.Getenv("JWT_SECRET"))

	accessTokenClaims := &Claims{
		UserID: userID,
		Email:  email,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(15 * time.Minute)),
		},
	}
	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, accessTokenClaims)
	accessTokenString, err := accessToken.SignedString(jwtSecret)
	if err != nil {
		return "", "", err
	}

	refreshTokenClaims := &Claims{
		UserID: userID,
		Email:  email,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(7 * 24 * time.Hour)),
		},
	}
	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshTokenClaims)
	refreshTokenString, err := refreshToken.SignedString(jwtSecret)
	if err != nil {
		return "", "", err
	}

	return accessTokenString, refreshTokenString, nil
}

// StoreRefreshToken saves a hashed refresh token for later revocation checks.
// It records the token expiry alongside the owning user.
func (s *AuthService) StoreRefreshToken(userID, token string) error {
	tokenHash := s.hashToken(token)
	expiresAt := time.Now().Add(7 * 24 * time.Hour)

	_, err := s.db.Exec(
		"INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at, revoked, created_at) VALUES (gen_random_uuid(), $1, $2, $3, false, NOW())",
		userID, tokenHash, expiresAt,
	)
	return err
}

// hashToken hashes a raw token before it is written to storage.
// This avoids persisting refresh tokens in plain text.
func (s *AuthService) hashToken(token string) string {
	hash := sha256.Sum256([]byte(token))
	return hex.EncodeToString(hash[:])
}
