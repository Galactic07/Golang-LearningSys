package model

import (
	"time"

	"gorm.io/datatypes"
)

// User 用户模型
type User struct {
	ID           uint           `json:"id" gorm:"primaryKey"`
	Email        string         `json:"email" gorm:"uniqueIndex;size:255;not null"`
	PasswordHash string         `json:"-" gorm:"size:255;not null"`
	Nickname     string         `json:"nickname" gorm:"size:100"`
	AvatarURL    string         `json:"avatar_url" gorm:"size:500"`
	Settings     datatypes.JSON `json:"settings" gorm:"type:json"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
}
