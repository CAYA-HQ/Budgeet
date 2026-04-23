// Package models defines the persisted application data shapes.
// These structs are shared across database and API layers.
package models

import (
	"time"
)

// RefreshToken represents a stored refresh token record.
// It keeps only a SHA-256 hash, never the raw token value.
type RefreshToken struct {
	ID        string    `db:"id"         json:"id"        gorm:"primaryKey"`
	UserID    string    `db:"user_id"    json:"userId"    gorm:"not null;index"`
	TokenHash string    `db:"token_hash" json:"-"         gorm:"not null;unique"`
	ExpiresAt time.Time `db:"expires_at" json:"expiresAt" gorm:"not null"`
	Revoked   bool      `db:"revoked"    json:"revoked"   gorm:"default:false"`
	CreatedAt time.Time `db:"created_at" json:"createdAt" gorm:"autoCreateTime"`
}
