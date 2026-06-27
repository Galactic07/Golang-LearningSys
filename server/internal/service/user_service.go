package service

import (
	"errors"

	"github.com/gomaster/server/internal/model"
	"github.com/gomaster/server/internal/repository"
)

// UserService 用户服务
type UserService struct {
	repo *repository.UserRepository
}

// NewUserService 创建用户服务实例
func NewUserService(repo *repository.UserRepository) *UserService {
	return &UserService{repo: repo}
}

// GetUser 获取用户信息
func (s *UserService) GetUser(id uint) (*model.User, error) {
	return s.repo.GetByID(id)
}

// GetUserByEmail 根据邮箱获取用户
func (s *UserService) GetUserByEmail(email string) (*model.User, error) {
	return s.repo.GetByEmail(email)
}

// CreateUser 创建用户
func (s *UserService) CreateUser(user *model.User) error {
	// 检查邮箱是否已存在
	existing, err := s.repo.GetByEmail(user.Email)
	if err == nil && existing != nil {
		return errors.New("邮箱已被注册")
	}
	return s.repo.Create(user)
}

// UpdateUser 更新用户信息
func (s *UserService) UpdateUser(user *model.User) error {
	_, err := s.repo.GetByID(user.ID)
	if err != nil {
		return errors.New("用户不存在")
	}
	return s.repo.Update(user)
}
