package model

import "time"

// Progress 学习进度模型
type Progress struct {
	ID             uint           `json:"id" gorm:"primaryKey"`
	UserID         uint           `json:"user_id" gorm:"not null;uniqueIndex:idx_user_question"`
	QuestionID     uint           `json:"question_id" gorm:"not null;uniqueIndex:idx_user_question"`
	MasteryLevel   int            `json:"mastery_level" gorm:"default:0"`                  // 掌握程度 0-5
	CorrectCount   int            `json:"correct_count" gorm:"default:0"`                  // 正确次数
	NextReview     time.Time      `json:"next_review" gorm:"index"`                        // 下次复习时间
	ReviewInterval int            `json:"review_interval" gorm:"default:1"`                // 复习间隔（天）
	LastScore      float64        `json:"last_score" gorm:"default:0"`                     // 最近得分
	LastAnswerAt   *time.Time     `json:"last_answer_at"`                                  // 最近答题时间
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`

	// 关联
	User     User     `json:"-" gorm:"foreignKey:UserID"`
	Question Question `json:"-" gorm:"foreignKey:QuestionID"`
}
