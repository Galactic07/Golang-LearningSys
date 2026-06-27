package service

import (
	"time"

	"github.com/gomaster/server/internal/model"
	"github.com/gomaster/server/internal/repository"
)

// ProgressService 进度服务
type ProgressService struct {
	repo *repository.ProgressRepository
}

// NewProgressService 创建进度服务实例
func NewProgressService(repo *repository.ProgressRepository) *ProgressService {
	return &ProgressService{repo: repo}
}

// GetProgress 获取用户对某题目的进度
func (s *ProgressService) GetProgress(userID, questionID uint) (*model.Progress, error) {
	return s.repo.GetByUserAndQuestion(userID, questionID)
}

// GetUserProgress 获取用户所有进度
func (s *ProgressService) GetUserProgress(userID uint) ([]model.Progress, error) {
	return s.repo.GetByUser(userID)
}

// GetDueReviews 获取到期需要复习的题目
func (s *ProgressService) GetDueReviews(userID uint) ([]model.Progress, error) {
	return s.repo.GetDueReviews(userID, time.Now())
}

// UpdateProgress 更新学习进度（含间隔重复算法）
func (s *ProgressService) UpdateProgress(progress *model.Progress) error {
	now := time.Now()
	progress.LastAnswerAt = &now

	// 简单的间隔重复算法：根据得分调整复习间隔
	if progress.LastScore >= 80 {
		progress.ReviewInterval = progress.ReviewInterval * 2
		if progress.ReviewInterval > 30 {
			progress.ReviewInterval = 30
		}
		progress.CorrectCount++
		if progress.CorrectCount >= 3 && progress.MasteryLevel < 5 {
			progress.MasteryLevel++
		}
	} else if progress.LastScore < 50 {
		progress.ReviewInterval = 1
		if progress.MasteryLevel > 0 {
			progress.MasteryLevel--
		}
	}

	// 计算下次复习时间
	progress.NextReview = now.AddDate(0, 0, progress.ReviewInterval)

	return s.repo.Upsert(progress)
}
