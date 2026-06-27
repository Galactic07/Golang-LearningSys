package model

import (
	"time"

	"gorm.io/datatypes"
)

// JobDescription 职位描述模型
type JobDescription struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	UserID      uint           `json:"user_id" gorm:"not null;index"`
	Source      string         `json:"source" gorm:"size:50"`                           // 来源：manual/upload/url
	Company     string         `json:"company" gorm:"size:200"`                         // 公司
	Position    string         `json:"position" gorm:"size:200"`                        // 职位
	RawText     string         `json:"raw_text" gorm:"type:text"`                       // 原始文本
	TechStack   datatypes.JSON `json:"tech_stack" gorm:"type:json"`                     // 技术栈 JSON
	Requirements datatypes.JSON `json:"requirements" gorm:"type:json"`                   // 要求 JSON
	MatchScore  float64        `json:"match_score" gorm:"default:0"`                    // 匹配分数
	SalaryMin   int            `json:"salary_min"`                                      // 最低薪资（K）
	SalaryMax   int            `json:"salary_max"`                                      // 最高薪资（K）
	Experience  string         `json:"experience" gorm:"size:100"`                      // 经验要求
	SourceURL   string         `json:"source_url" gorm:"size:500"`                      // 来源 URL
	CreatedAt   time.Time      `json:"created_at"`

	// 关联
	User User `json:"-" gorm:"foreignKey:UserID"`
}
