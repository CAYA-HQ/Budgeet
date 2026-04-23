// Package models defines the persisted application data shapes.
// These structs are shared across database and API layers.
package models

import (
	"time"
)

// User represents an authenticated application account.
// It stores identity details and the hashed password record.
type User struct {
	ID           string    `db:"id"            json:"id"           gorm:"primaryKey"`
	Email        string    `db:"email"         json:"email"        gorm:"unique;not null"`
	PasswordHash string    `db:"password_hash" json:"-"            gorm:"not null"`
	CreatedAt    time.Time `db:"created_at"    json:"createdAt"    gorm:"autoCreateTime"`
	UpdatedAt    time.Time `db:"updated_at"    json:"updatedAt"    gorm:"autoUpdateTime"`
}
