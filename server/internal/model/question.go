package model

import "gorm.io/datatypes"

// Question 题目模型
type Question struct {
	ID               uint           `json:"id" gorm:"primaryKey"`
	Domain           string         `json:"domain" gorm:"size:50;not null;index"`           // 领域：frontend/backend/ai/infra
	Level            string         `json:"level" gorm:"size:20;not null;index"`            // 难度：junior/mid/senior
	Topic            string         `json:"topic" gorm:"size:100;not null"`                 // 主题
	Question         string         `json:"question" gorm:"type:text;not null"`             // 题目内容
	ReferenceAnswer  string         `json:"reference_answer" gorm:"type:text"`              // 参考答案
	Keywords         datatypes.JSON `json:"keywords" gorm:"type:json"`                      // 关键词 JSON
	Hints            datatypes.JSON `json:"hints" gorm:"type:json"`                         // 提示 JSON
	Tags             datatypes.JSON `json:"tags" gorm:"type:json"`                          // 标签 JSON
	Source           string         `json:"source" gorm:"size:100"`                         // 来源
}
