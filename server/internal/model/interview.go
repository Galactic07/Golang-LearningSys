package model

import (
	"time"

	"gorm.io/datatypes"
)

// Interview 面试记录模型
type Interview struct {
	ID            uint           `json:"id" gorm:"primaryKey"`
	UserID        uint           `json:"user_id" gorm:"not null;index"`
	Type          string         `json:"type" gorm:"size:50;not null"`                    // 面试类型：mock/jd
	JDID          *uint          `json:"jd_id" gorm:"index"`                              // 关联的职位描述 ID
	OverallScore  float64        `json:"overall_score" gorm:"default:0"`                  // 综合得分
	DomainResults datatypes.JSON `json:"domain_results" gorm:"type:json"`                 // 各领域得分 JSON
	Summary       string         `json:"summary" gorm:"type:text"`                        // 总结
	Improvements  datatypes.JSON `json:"improvements" gorm:"type:json"`                   // 改进建议 JSON
	StartedAt     *time.Time     `json:"started_at"`                                      // 开始时间
	FinishedAt    *time.Time     `json:"finished_at"`                                     // 结束时间
	CreatedAt     time.Time      `json:"created_at"`

	// 关联
	User User `json:"-" gorm:"foreignKey:UserID"`
}
