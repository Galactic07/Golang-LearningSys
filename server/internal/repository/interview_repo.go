package repository

import (
	"github.com/gomaster/server/internal/model"
	"gorm.io/gorm"
)

// InterviewRepository 面试记录数据访问层
type InterviewRepository struct {
	db *gorm.DB
}

// NewInterviewRepository 创建面试记录仓库实例
func NewInterviewRepository(db *gorm.DB) *InterviewRepository {
	return &InterviewRepository{db: db}
}

// Create 创建面试记录
func (r *InterviewRepository) Create(interview *model.Interview) error {
	return r.db.Create(interview).Error
}

// GetByID 根据 ID 获取面试记录（含回答列表）
func (r *InterviewRepository) GetByID(id uint) (*model.Interview, error) {
	var interview model.Interview
	if err := r.db.Preload("Answers").First(&interview, id).Error; err != nil {
		return nil, err
	}
	return &interview, nil
}

// GetByUser 获取用户所有面试记录
func (r *InterviewRepository) GetByUser(userID uint) ([]model.Interview, error) {
	var interviews []model.Interview
	if err := r.db.Where("user_id = ?", userID).Order("created_at DESC").Find(&interviews).Error; err != nil {
		return nil, err
	}
	return interviews, nil
}

// Update 更新面试记录
func (r *InterviewRepository) Update(interview *model.Interview) error {
	return r.db.Save(interview).Error
}

// Delete 删除面试记录
func (r *InterviewRepository) Delete(id uint) error {
	return r.db.Delete(&model.Interview{}, id).Error
}

// CreateAnswer 创建面试回答
func (r *InterviewRepository) CreateAnswer(answer *model.InterviewAnswer) error {
	return r.db.Create(answer).Error
}

// GetAnswersByInterview 获取面试的所有回答
func (r *InterviewRepository) GetAnswersByInterview(interviewID uint) ([]model.InterviewAnswer, error) {
	var answers []model.InterviewAnswer
	if err := r.db.Where("interview_id = ?", interviewID).Find(&answers).Error; err != nil {
		return nil, err
	}
	return answers, nil
}
