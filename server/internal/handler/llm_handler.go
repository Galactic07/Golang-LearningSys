package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gomaster/server/pkg/llm"
)

// LLMHandler LLM 代理处理器
type LLMHandler struct {
	client *llm.LLMClient
}

// NewLLMHandler 创建 LLM 处理器实例
func NewLLMHandler(client *llm.LLMClient) *LLMHandler {
	return &LLMHandler{client: client}
}

// ScoreRequest 评分请求体
type ScoreRequest struct {
	QuestionID   uint   `json:"question_id" binding:"required"` // 题目 ID
	UserAnswer   string `json:"user_answer" binding:"required"` // 用户回答
	Question     string `json:"question"`                       // 题目内容（可选，优先使用）
	RefAnswer    string `json:"reference_answer"`               // 参考答案（可选，优先使用）
}

// Score 评分接口
// POST /api/llm/score
func (h *LLMHandler) Score(c *gin.Context) {
	var req ScoreRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "请求参数无效"})
		return
	}

	// 如果没有直接传入题目和参考答案，使用占位符
	// 实际使用中可从数据库查询 question_id 对应的题目
	question := req.Question
	refAnswer := req.RefAnswer
	if question == "" {
		question = "请根据题目 ID 查询题目内容"
	}
	if refAnswer == "" {
		refAnswer = "请根据题目 ID 查询参考答案"
	}

	result, err := h.client.ScoreAnswer(c.Request.Context(), question, refAnswer, req.UserAnswer)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "评分失败: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": result})
}

// GenerateRequest 题目生成请求体
type GenerateRequest struct {
	Domain     string `json:"domain" binding:"required"`  // 领域
	Level      string `json:"level" binding:"required"`   // 难度级别
	Topic      string `json:"topic" binding:"required"`   // 主题
	JDKeywords string `json:"jd_keywords"`                // JD 关键词（可选）
}

// Generate 题目生成接口
// POST /api/llm/generate
func (h *LLMHandler) Generate(c *gin.Context) {
	var req GenerateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "请求参数无效"})
		return
	}

	result, err := h.client.GenerateQuestion(c.Request.Context(), req.Domain, req.Level, req.Topic, req.JDKeywords)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "生成题目失败: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": result})
}

// FollowUpRequest 追问请求体
type FollowUpRequest struct {
	Question   string  `json:"question" binding:"required"`   // 原题
	UserAnswer string  `json:"user_answer" binding:"required"` // 用户回答
	Score      float64 `json:"score" binding:"required"`      // 当前得分
}

// FollowUp 追问接口
// POST /api/llm/followup
func (h *LLMHandler) FollowUp(c *gin.Context) {
	var req FollowUpRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "请求参数无效"})
		return
	}

	result, err := h.client.FollowUp(c.Request.Context(), req.Question, req.UserAnswer, req.Score)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "追问生成失败: " + err.Error()})
		return
	}

	// 评分不在 2.5-4 范围内，不需要追问
	if result == nil {
		c.JSON(http.StatusOK, gin.H{
			"data": gin.H{
				"follow_up": nil,
				"reason":    "当前评分不在追问范围内（2.5-4），无需追问",
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": result})
}

// TestConnection 测试 LLM 连接
// POST /api/llm/test
func (h *LLMHandler) TestConnection(c *gin.Context) {
	err := h.client.TestConnection(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "连接失败: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "连接成功"})
}

// SummaryRequest 面试总结请求体
type SummaryRequest struct {
	DomainResults []llm.DomainResult `json:"domain_results" binding:"required"` // 各领域面试结果
}

// Summary 面试总结接口
// POST /api/llm/summary
func (h *LLMHandler) Summary(c *gin.Context) {
	var req SummaryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "请求参数无效"})
		return
	}

	result, err := h.client.GenerateSummary(c.Request.Context(), req.DomainResults)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "生成总结失败: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": result})
}
