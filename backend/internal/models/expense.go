// Package models defines the persisted application data shapes.
// These structs are shared across database and API layers.
package models

import "time"

// Expense represents a single user expense transaction.
type Expense struct {
	ID        string    `db:"id"         json:"id"`
	UserID    string    `db:"user_id"    json:"userId"`
	Amount    float64   `db:"amount"     json:"amount"`
	Category  string    `db:"category"   json:"category"`
	Note      *string   `db:"note"       json:"note,omitempty"`
	Date      time.Time `db:"date"       json:"date"`
	CreatedAt time.Time `db:"created_at" json:"createdAt"`
	UpdatedAt time.Time `db:"updated_at" json:"updatedAt"`
}
