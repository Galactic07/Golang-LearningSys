package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/gomaster/server/internal/model"
	"github.com/gomaster/server/internal/service"
)

// InterviewHandler 面试处理器
type InterviewHandler struct {
	svc *service.InterviewService
}

// NewInterviewHandler 创建面试处理器实例
func NewInterviewHandler(svc *service.InterviewService) *InterviewHandler {
	return &InterviewHandler{svc: svc}
}

// GetInterview 获取面试记录
// GET /api/interviews/:id
func (h *InterviewHandler) GetInterview(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的面试 ID"})
		return
	}

	interview, err := h.svc.GetInterview(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "面试记录不存在"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": interview})
}

// GetUserInterviews 获取用户所有面试记录
// GET /api/interviews/user/:user_id
func (h *InterviewHandler) GetUserInterviews(c *gin.Context) {
	userID, err := strconv.ParseUint(c.Param("user_id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的用户 ID"})
		return
	}

	interviews, err := h.svc.GetUserInterviews(uint(userID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "查询失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": interviews})
}

// CreateInterview 创建面试记录
// POST /api/interviews
func (h *InterviewHandler) CreateInterview(c *gin.Context) {
	var interview model.Interview
	if err := c.ShouldBindJSON(&interview); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "请求参数无效"})
		return
	}

	if err := h.svc.CreateInterview(&interview); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "创建失败"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": interview})
}

// CreateAnswer 创建面试回答
// POST /api/interviews/:id/answers
func (h *InterviewHandler) CreateAnswer(c *gin.Context) {
	interviewID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的面试 ID"})
		return
	}

	var answer model.InterviewAnswer
	if err := c.ShouldBindJSON(&answer); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "请求参数无效"})
		return
	}
	answer.InterviewID = uint(interviewID)

	if err := h.svc.CreateAnswer(&answer); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "创建失败"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": answer})
}

// GetInterviewAnswers 获取面试的所有回答
// GET /api/interviews/:id/answers
func (h *InterviewHandler) GetInterviewAnswers(c *gin.Context) {
	interviewID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的面试 ID"})
		return
	}

	answers, err := h.svc.GetInterviewAnswers(uint(interviewID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "查询失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": answers})
}
