package handler

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/gomaster/server/internal/service"
)

// DataHandler 数据导出处理器
type DataHandler struct {
	userSvc      *service.UserService
	progressSvc  *service.ProgressService
	interviewSvc *service.InterviewService
}

// NewDataHandler 创建数据导出处理器实例
func NewDataHandler(userSvc *service.UserService, progressSvc *service.ProgressService, interviewSvc *service.InterviewService) *DataHandler {
	return &DataHandler{
		userSvc:      userSvc,
		progressSvc:  progressSvc,
		interviewSvc: interviewSvc,
	}
}

// Export 导出用户数据
// GET /api/data/export/:user_id
func (h *DataHandler) Export(c *gin.Context) {
	userID, err := strconv.ParseUint(c.Param("user_id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的用户 ID"})
		return
	}

	user, err := h.userSvc.GetUser(uint(userID))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "用户不存在"})
		return
	}

	progress, _ := h.progressSvc.GetUserProgress(uint(userID))
	interviews, _ := h.interviewSvc.GetUserInterviews(uint(userID))

	exportData := gin.H{
		"user":       user,
		"progress":   progress,
		"interviews": interviews,
		"exportedAt": "now",
	}

	jsonData, _ := json.MarshalIndent(exportData, "", "  ")

	c.Header("Content-Disposition", "attachment; filename=gomaster-export.json")
	c.Header("Content-Type", "application/json")
	c.String(http.StatusOK, string(jsonData))
}
