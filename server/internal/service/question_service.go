package service

import (
	"github.com/gomaster/server/internal/model"
	"github.com/gomaster/server/internal/repository"
)

// QuestionService 题目服务
type QuestionService struct {
	repo *repository.QuestionRepository
}

// NewQuestionService 创建题目服务实例
func NewQuestionService(repo *repository.QuestionRepository) *QuestionService {
	return &QuestionService{repo: repo}
}

// GetQuestion 获取单个题目
func (s *QuestionService) GetQuestion(id uint) (*model.Question, error) {
	return s.repo.GetByID(id)
}

// ListQuestions 按条件筛选题目（支持分页）
func (s *QuestionService) ListQuestions(filter repository.QuestionFilter) ([]model.Question, int64, error) {
	return s.repo.List(filter)
}

// CreateQuestion 创建题目
func (s *QuestionService) CreateQuestion(question *model.Question) error {
	return s.repo.Create(question)
}

// UpdateQuestion 更新题目
func (s *QuestionService) UpdateQuestion(question *model.Question) error {
	return s.repo.Update(question)
}

// DeleteQuestion 删除题目
func (s *QuestionService) DeleteQuestion(id uint) error {
	return s.repo.Delete(id)
}
