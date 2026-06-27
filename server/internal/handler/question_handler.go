package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/gomaster/server/internal/model"
	"github.com/gomaster/server/internal/repository"
	"github.com/gomaster/server/internal/service"
)

// QuestionHandler 题目处理器
type QuestionHandler struct {
	svc *service.QuestionService
}

// NewQuestionHandler 创建题目处理器实例
func NewQuestionHandler(svc *service.QuestionService) *QuestionHandler {
	return &QuestionHandler{svc: svc}
}

// GetQuestion 获取单个题目
// GET /api/questions/:id
func (h *QuestionHandler) GetQuestion(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的题目 ID"})
		return
	}

	question, err := h.svc.GetQuestion(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "题目不存在"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": question})
}

// ListQuestions 按条件筛选题目（支持分页）
// GET /api/questions?domain=backend&level=mid&page=1&size=20
func (h *QuestionHandler) ListQuestions(c *gin.Context) {
	var filter repository.QuestionFilter
	if err := c.ShouldBindQuery(&filter); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "查询参数无效"})
		return
	}

	questions, total, err := h.svc.ListQuestions(filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "查询失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":  questions,
		"total": total,
		"page":  filter.Page,
		"size":  filter.Size,
	})
}

// CreateQuestion 创建题目
// POST /api/questions
func (h *QuestionHandler) CreateQuestion(c *gin.Context) {
	var question model.Question
	if err := c.ShouldBindJSON(&question); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "请求参数无效"})
		return
	}

	if err := h.svc.CreateQuestion(&question); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "创建失败"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": question})
}
