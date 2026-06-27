package repository

import (
	"fmt"
	"os"

	"github.com/gomaster/server/internal/model"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

// InitDB 初始化数据库连接并执行自动迁移
func InitDB() (*gorm.DB, error) {
	dsn := os.Getenv("DB_DSN")
	if dsn == "" {
		return nil, fmt.Errorf("环境变量 DB_DSN 未设置")
	}

	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, fmt.Errorf("连接数据库失败: %w", err)
	}

	// 自动迁移所有模型
	if err := db.AutoMigrate(
		&model.User{},
		&model.Question{},
		&model.Progress{},
		&model.Interview{},
		&model.InterviewAnswer{},
		&model.JobDescription{},
		&model.LearningPath{},
	); err != nil {
		return nil, fmt.Errorf("自动迁移失败: %w", err)
	}

	return db, nil
}
