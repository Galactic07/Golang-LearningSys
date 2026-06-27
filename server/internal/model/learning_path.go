package model

import (
	"time"

	"gorm.io/datatypes"
)

// LearningPath 学习路径模型
type LearningPath struct {
	ID         uint           `json:"id" gorm:"primaryKey"`
	UserID     uint           `json:"user_id" gorm:"not null;index"`
	PathType   string         `json:"path_type" gorm:"size:50;not null"`               // 路径类型：domain/role/jd
	Name       string         `json:"name" gorm:"size:200;not null"`                   // 路径名称
	TargetRole string         `json:"target_role" gorm:"size:100"`                     // 目标角色
	Steps      datatypes.JSON `json:"steps" gorm:"type:json"`                          // 步骤 JSON
	Progress   int            `json:"progress" gorm:"default:0"`                       // 进度百分比
	CreatedAt  time.Time      `json:"created_at"`
	UpdatedAt  time.Time      `json:"updated_at"`

	// 关联
	User User `json:"-" gorm:"foreignKey:UserID"`
}
