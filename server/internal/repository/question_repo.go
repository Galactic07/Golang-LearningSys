package repository

import (
	"github.com/gomaster/server/internal/model"
	"gorm.io/gorm"
)

// QuestionRepository 题目数据访问层
type QuestionRepository struct {
	db *gorm.DB
}

// NewQuestionRepository 创建题目仓库实例
func NewQuestionRepository(db *gorm.DB) *QuestionRepository {
	return &QuestionRepository{db: db}
}

// Create 创建题目
func (r *QuestionRepository) Create(question *model.Question) error {
	return r.db.Create(question).Error
}

// GetByID 根据 ID 获取题目
func (r *QuestionRepository) GetByID(id uint) (*model.Question, error) {
	var question model.Question
	if err := r.db.First(&question, id).Error; err != nil {
		return nil, err
	}
	return &question, nil
}

// QuestionFilter 题目筛选条件
type QuestionFilter struct {
	Domain string `form:"domain"`
	Level  string `form:"level"`
	Topic  string `form:"topic"`
	Page   int    `form:"page"`
	Size   int    `form:"size"`
}

// List 按条件筛选题目（支持分页）
func (r *QuestionRepository) List(filter QuestionFilter) ([]model.Question, int64, error) {
	var questions []model.Question
	var total int64

	query := r.db.Model(&model.Question{})

	// 按领域筛选
	if filter.Domain != "" {
		query = query.Where("domain = ?", filter.Domain)
	}
	// 按难度筛选
	if filter.Level != "" {
		query = query.Where("level = ?", filter.Level)
	}
	// 按主题筛选
	if filter.Topic != "" {
		query = query.Where("topic LIKE ?", "%"+filter.Topic+"%")
	}

	// 计算总数
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// 分页参数
	if filter.Page < 1 {
		filter.Page = 1
	}
	if filter.Size < 1 {
		filter.Size = 20
	}
	offset := (filter.Page - 1) * filter.Size

	if err := query.Offset(offset).Limit(filter.Size).Find(&questions).Error; err != nil {
		return nil, 0, err
	}

	return questions, total, nil
}

// Update 更新题目
func (r *QuestionRepository) Update(question *model.Question) error {
	return r.db.Save(question).Error
}

// Delete 删除题目
func (r *QuestionRepository) Delete(id uint) error {
	return r.db.Delete(&model.Question{}, id).Error
}
