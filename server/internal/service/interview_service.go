package service

import (
	"github.com/gomaster/server/internal/model"
	"github.com/gomaster/server/internal/repository"
)

// InterviewService 面试服务
type InterviewService struct {
	repo *repository.InterviewRepository
}

// NewInterviewService 创建面试服务实例
func NewInterviewService(repo *repository.InterviewRepository) *InterviewService {
	return &InterviewService{repo: repo}
}

// GetInterview 获取面试记录（含回答列表）
func (s *InterviewService) GetInterview(id uint) (*model.Interview, error) {
	return s.repo.GetByID(id)
}

// GetUserInterviews 获取用户所有面试记录
func (s *InterviewService) GetUserInterviews(userID uint) ([]model.Interview, error) {
	return s.repo.GetByUser(userID)
}

// CreateInterview 创建面试记录
func (s *InterviewService) CreateInterview(interview *model.Interview) error {
	return s.repo.Create(interview)
}

// UpdateInterview 更新面试记录
func (s *InterviewService) UpdateInterview(interview *model.Interview) error {
	return s.repo.Update(interview)
}

// DeleteInterview 删除面试记录
func (s *InterviewService) DeleteInterview(id uint) error {
	return s.repo.Delete(id)
}

// CreateAnswer 创建面试回答
func (s *InterviewService) CreateAnswer(answer *model.InterviewAnswer) error {
	return s.repo.CreateAnswer(answer)
}

// GetInterviewAnswers 获取面试的所有回答
func (s *InterviewService) GetInterviewAnswers(interviewID uint) ([]model.InterviewAnswer, error) {
	return s.repo.GetAnswersByInterview(interviewID)
}
