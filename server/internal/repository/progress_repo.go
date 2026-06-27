package repository

import (
	"time"

	"github.com/gomaster/server/internal/model"
	"gorm.io/gorm"
)

// ProgressRepository 进度数据访问层
type ProgressRepository struct {
	db *gorm.DB
}

// NewProgressRepository 创建进度仓库实例
func NewProgressRepository(db *gorm.DB) *ProgressRepository {
	return &ProgressRepository{db: db}
}

// Create 创建进度记录
func (r *ProgressRepository) Create(progress *model.Progress) error {
	return r.db.Create(progress).Error
}

// GetByUserAndQuestion 根据用户ID和题目ID查询进度
func (r *ProgressRepository) GetByUserAndQuestion(userID, questionID uint) (*model.Progress, error) {
	var progress model.Progress
	if err := r.db.Where("user_id = ? AND question_id = ?", userID, questionID).First(&progress).Error; err != nil {
		return nil, err
	}
	return &progress, nil
}

// GetByUser 获取用户所有进度
func (r *ProgressRepository) GetByUser(userID uint) ([]model.Progress, error) {
	var progresses []model.Progress
	if err := r.db.Where("user_id = ?", userID).Find(&progresses).Error; err != nil {
		return nil, err
	}
	return progresses, nil
}

// GetDueReviews 获取到期需要复习的进度记录
func (r *ProgressRepository) GetDueReviews(userID uint, before time.Time) ([]model.Progress, error) {
	var progresses []model.Progress
	if err := r.db.Where("user_id = ? AND next_review <= ?", userID, before).Find(&progresses).Error; err != nil {
		return nil, err
	}
	return progresses, nil
}

// Update 更新进度
func (r *ProgressRepository) Update(progress *model.Progress) error {
	return r.db.Save(progress).Error
}

// Upsert 创建或更新进度（按 user_id + question_id 唯一索引）
func (r *ProgressRepository) Upsert(progress *model.Progress) error {
	return r.db.Save(progress).Error
}

// Delete 删除进度
func (r *ProgressRepository) Delete(id uint) error {
	return r.db.Delete(&model.Progress{}, id).Error
}
