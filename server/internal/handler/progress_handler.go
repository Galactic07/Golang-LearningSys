package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/gomaster/server/internal/model"
	"github.com/gomaster/server/internal/service"
)

// ProgressHandler 进度处理器
type ProgressHandler struct {
	svc *service.ProgressService
}

// NewProgressHandler 创建进度处理器实例
func NewProgressHandler(svc *service.ProgressService) *ProgressHandler {
	return &ProgressHandler{svc: svc}
}

// GetProgress 获取用户对某题目的进度
// GET /api/progress?user_id=1&question_id=1
func (h *ProgressHandler) GetProgress(c *gin.Context) {
	userID, _ := strconv.ParseUint(c.Query("user_id"), 10, 64)
	questionID, _ := strconv.ParseUint(c.Query("question_id"), 10, 64)

	if userID == 0 || questionID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "缺少 user_id 或 question_id"})
		return
	}

	progress, err := h.svc.GetProgress(uint(userID), uint(questionID))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "进度记录不存在"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": progress})
}

// GetUserProgress 获取用户所有进度
// GET /api/progress/user/:user_id
func (h *ProgressHandler) GetUserProgress(c *gin.Context) {
	userID, err := strconv.ParseUint(c.Param("user_id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的用户 ID"})
		return
	}

	progresses, err := h.svc.GetUserProgress(uint(userID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "查询失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": progresses})
}

// GetDueReviews 获取到期需要复习的题目
// GET /api/progress/due/:user_id
func (h *ProgressHandler) GetDueReviews(c *gin.Context) {
	userID, err := strconv.ParseUint(c.Param("user_id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的用户 ID"})
		return
	}

	progresses, err := h.svc.GetDueReviews(uint(userID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "查询失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": progresses})
}

// UpdateProgress 更新学习进度
// POST /api/progress
func (h *ProgressHandler) UpdateProgress(c *gin.Context) {
	var progress model.Progress
	if err := c.ShouldBindJSON(&progress); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "请求参数无效"})
		return
	}

	if err := h.svc.UpdateProgress(&progress); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "更新失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": progress})
}
