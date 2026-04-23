package models

import (
	"time"
)

// RefreshToken maps to the `refresh_tokens` table.
// We store a SHA-256 hash of the token, never the raw value.
type RefreshToken struct {
	ID        string    `db:"id"         json:"id"        gorm:"primaryKey"`
	UserID    string    `db:"user_id"    json:"userId"    gorm:"not null;index"`
	TokenHash string    `db:"token_hash" json:"-"         gorm:"not null;unique"`
	ExpiresAt time.Time `db:"expires_at" json:"expiresAt" gorm:"not null"`
	Revoked   bool      `db:"revoked"    json:"revoked"   gorm:"default:false"`
	CreatedAt time.Time `db:"created_at" json:"createdAt" gorm:"autoCreateTime"`
}
