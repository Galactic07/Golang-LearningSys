package model

import (
	"time"

	"gorm.io/datatypes"
)

// InterviewAnswer 面试回答模型
type InterviewAnswer struct {
	ID           uint           `json:"id" gorm:"primaryKey"`
	InterviewID  uint           `json:"interview_id" gorm:"not null;index"`
	QuestionID   uint           `json:"question_id" gorm:"not null"`
	Domain       string         `json:"domain" gorm:"size:50;not null"`                  // 领域
	Level        string         `json:"level" gorm:"size:20;not null"`                   // 难度
	UserAnswer   string         `json:"user_answer" gorm:"type:text"`                    // 用户回答
	Score        float64        `json:"score" gorm:"default:0"`                          // 得分
	ScoreDetail  datatypes.JSON `json:"score_detail" gorm:"type:json"`                   // 评分详情 JSON
	FollowUps    datatypes.JSON `json:"follow_ups" gorm:"type:json"`                     // 追问 JSON
	CreatedAt    time.Time      `json:"created_at"`

	// 关联
	Interview Interview `json:"-" gorm:"foreignKey:InterviewID"`
	Question  Question  `json:"-" gorm:"foreignKey:QuestionID"`
}
