package llm

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"time"
)

// 最大重试次数
const maxRetries = 1

// LLMClient LLM 统一调用客户端
type LLMClient struct {
	apiKey     string
	baseURL    string
	model      string
	httpClient *http.Client
}

// Config LLM 客户端配置
type Config struct {
	APIKey  string
	BaseURL string
	Model   string
}

// NewLLMClient 创建 LLM 客户端
func NewLLMClient(cfg Config) *LLMClient {
	// 根据提供商设置默认 base URL
	baseURL := cfg.BaseURL
	model := cfg.Model

	if baseURL == "" {
		provider := os.Getenv("LLM_PROVIDER")
		switch strings.ToLower(provider) {
		case "openai":
			baseURL = "https://api.openai.com/v1"
			if model == "" {
				model = "gpt-4o"
			}
		case "deepseek":
			baseURL = "https://api.deepseek.com/v1"
			if model == "" {
				model = "deepseek-chat"
			}
		default:
			// 自定义提供商，从环境变量读取
			baseURL = os.Getenv("LLM_BASE_URL")
			if model == "" {
				model = os.Getenv("LLM_MODEL")
			}
		}
	}

	if cfg.APIKey == "" {
		cfg.APIKey = os.Getenv("LLM_API_KEY")
	}

	return &LLMClient{
		apiKey:  cfg.APIKey,
		baseURL: baseURL,
		model:   model,
		httpClient: &http.Client{
			Timeout: 60 * time.Second,
		},
	}
}

// chatMessage 聊天消息
type chatMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

// chatRequest 聊天请求
type chatRequest struct {
	Model    string        `json:"model"`
	Messages []chatMessage `json:"messages"`
}

// chatResponse 聊天响应
type chatResponse struct {
	Choices []struct {
		Message struct {
			Content string `json:"content"`
		} `json:"message"`
	} `json:"choices"`
}

// chat 调用 LLM 聊天接口（带 context 和重试）
func (c *LLMClient) chat(ctx context.Context, systemPrompt, userPrompt string) (string, error) {
	var lastErr error
	for attempt := 0; attempt <= maxRetries; attempt++ {
		result, err := c.doChat(ctx, systemPrompt, userPrompt)
		if err == nil {
			return result, nil
		}
		lastErr = err
		// 如果是 context 取消，不重试
		if ctx.Err() != nil {
			return "", ctx.Err()
		}
	}
	return "", fmt.Errorf("LLM 调用失败（已重试 %d 次）: %w", maxRetries, lastErr)
}

// doChat 执行单次 LLM 聊天调用
func (c *LLMClient) doChat(ctx context.Context, systemPrompt, userPrompt string) (string, error) {
	reqBody := chatRequest{
		Model: c.model,
		Messages: []chatMessage{
			{Role: "system", Content: systemPrompt},
			{Role: "user", Content: userPrompt},
		},
	}

	jsonData, err := json.Marshal(reqBody)
	if err != nil {
		return "", fmt.Errorf("序列化请求失败: %w", err)
	}

	url := strings.TrimRight(c.baseURL, "/") + "/chat/completions"
	req, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return "", fmt.Errorf("创建请求失败: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+c.apiKey)

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("请求失败: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("读取响应失败: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("LLM 返回错误 (%d): %s", resp.StatusCode, string(body))
	}

	var chatResp chatResponse
	if err := json.Unmarshal(body, &chatResp); err != nil {
		return "", fmt.Errorf("解析响应失败: %w", err)
	}

	if len(chatResp.Choices) == 0 {
		return "", fmt.Errorf("LLM 未返回内容")
	}

	return chatResp.Choices[0].Message.Content, nil
}

// extractJSON 从 LLM 响应中提取 JSON（处理 markdown 代码块包裹的情况）
func extractJSON(input string) string {
	// 尝试提取 ```json ... ``` 包裹的内容
	if idx := strings.Index(input, "```json"); idx != -1 {
		start := idx + 7
		if end := strings.Index(input[start:], "```"); end != -1 {
			return strings.TrimSpace(input[start : start+end])
		}
	}
	// 尝试提取 ``` ... ``` 包裹的内容
	if idx := strings.Index(input, "```"); idx != -1 {
		start := idx + 3
		// 跳过可能的语言标识行
		for start < len(input) && input[start] != '\n' && input[start] != '{' {
			start++
		}
		if end := strings.Index(input[start:], "```"); end != -1 {
			return strings.TrimSpace(input[start : start+end])
		}
	}
	// 尝试提取第一个 { 到最后一个 } 之间的内容
	start := strings.Index(input, "{")
	end := strings.LastIndex(input, "}")
	if start != -1 && end > start {
		return input[start : end+1]
	}
	return input
}

// TestConnection 测试 LLM 连接是否正常
func (c *LLMClient) TestConnection(ctx context.Context) error {
	reqBody := chatRequest{
		Model: c.model,
		Messages: []chatMessage{
			{Role: "user", Content: "Hello, respond with 'ok' if you can read this."},
		},
	}

	jsonData, err := json.Marshal(reqBody)
	if err != nil {
		return fmt.Errorf("序列化请求失败: %w", err)
	}

	url := strings.TrimRight(c.baseURL, "/") + "/chat/completions"
	req, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("创建请求失败: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+c.apiKey)

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("连接失败: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("读取响应失败: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("LLM 返回错误 (%d): %s", resp.StatusCode, string(body))
	}

	var chatResp chatResponse
	if err := json.Unmarshal(body, &chatResp); err != nil {
		return fmt.Errorf("解析响应失败: %w", err)
	}

	if len(chatResp.Choices) == 0 {
		return fmt.Errorf("LLM 未返回内容")
	}

	return nil
}

// ScoreResult 评分结果
type ScoreResult struct {
	Accuracy    float64 `json:"accuracy"`     // 准确性 0-5
	Completeness float64 `json:"completeness"` // 完整性 0-5
	Depth       float64 `json:"depth"`        // 深度 0-5
	Engineering float64 `json:"engineering"`  // 工程性 0-5
	Expression  float64 `json:"expression"`   // 表达力 0-5
	TotalScore  float64 `json:"total_score"`  // 总分 0-5
	Feedback    string  `json:"feedback"`     // 综合评语
	Improvement string  `json:"improvement"`  // 改进建议
}

// ScoreAnswer 调用 LLM 对用户回答进行评分
func (c *LLMClient) ScoreAnswer(ctx context.Context, question, referenceAnswer, userAnswer string) (*ScoreResult, error) {
	userPrompt := fmt.Sprintf(ScoreUserPrompt, question, referenceAnswer, userAnswer)

	result, err := c.chat(ctx, ScorePrompt, userPrompt)
	if err != nil {
		return nil, fmt.Errorf("评分调用失败: %w", err)
	}

	jsonStr := extractJSON(result)
	var scoreResult ScoreResult
	if err := json.Unmarshal([]byte(jsonStr), &scoreResult); err != nil {
		return nil, fmt.Errorf("解析评分结果失败: %w, 原始响应: %s", err, result)
	}

	return &scoreResult, nil
}

// GeneratedQuestion 生成题目结果
type GeneratedQuestion struct {
	Question        string   `json:"question"`         // 题目
	ReferenceAnswer string   `json:"reference_answer"` // 参考答案
	Keywords        []string `json:"keywords"`         // 关键词
	Hints           []string `json:"hints"`            // 提示
}

// GenerateQuestion 调用 LLM 生成面试题目
func (c *LLMClient) GenerateQuestion(ctx context.Context, domain, level, topic, jdKeywords string) (*GeneratedQuestion, error) {
	userPrompt := fmt.Sprintf(GenerateQuestionUserPrompt, domain, level, topic, jdKeywords)

	result, err := c.chat(ctx, GenerateQuestionPrompt, userPrompt)
	if err != nil {
		return nil, fmt.Errorf("生成题目调用失败: %w", err)
	}

	jsonStr := extractJSON(result)
	var genResult GeneratedQuestion
	if err := json.Unmarshal([]byte(jsonStr), &genResult); err != nil {
		return nil, fmt.Errorf("解析生成题目结果失败: %w, 原始响应: %s", err, result)
	}

	return &genResult, nil
}

// FollowUpResult 追问结果
type FollowUpResult struct {
	FollowUp string `json:"follow_up"` // 追问问题
	Reason   string `json:"reason"`    // 追问理由
}

// FollowUp 调用 LLM 生成追问
// 当评分在 2.5-4 之间时生成追问，最多追问 2 次
func (c *LLMClient) FollowUp(ctx context.Context, question, userAnswer string, score float64) (*FollowUpResult, error) {
	// 评分不在 2.5-4 范围内，不生成追问
	if score < 2.5 || score > 4.0 {
		return nil, nil
	}

	userPrompt := fmt.Sprintf(FollowUpUserPrompt, question, userAnswer, score)

	result, err := c.chat(ctx, FollowUpPrompt, userPrompt)
	if err != nil {
		return nil, fmt.Errorf("追问调用失败: %w", err)
	}

	jsonStr := extractJSON(result)
	var followUpResult FollowUpResult
	if err := json.Unmarshal([]byte(jsonStr), &followUpResult); err != nil {
		return nil, fmt.Errorf("解析追问结果失败: %w, 原始响应: %s", err, result)
	}

	return &followUpResult, nil
}

// DomainResult 领域面试结果（用于生成总结的输入）
type DomainResult struct {
	Domain string  `json:"domain"` // 领域
	Level  string  `json:"level"`  // 难度级别
	Score  float64 `json:"score"`  // 得分
	Topics string  `json:"topics"` // 考察主题
}

// SummaryResult 面试总结结果
type SummaryResult struct {
	OverallLevel   string            `json:"overall_level"`    // 整体水平
	Strengths      []string          `json:"strengths"`        // 优势
	Weaknesses     []string          `json:"weaknesses"`       // 不足
	DomainAnalysis []DomainAnalysis  `json:"domain_analysis"`  // 各领域分析
	ImprovementPlan []string         `json:"improvement_plan"` // 改进计划
	Summary        string            `json:"summary"`          // 综合评价
}

// DomainAnalysis 领域分析
type DomainAnalysis struct {
	Domain  string `json:"domain"`  // 领域
	Level   string `json:"level"`   // 水平
	Comment string `json:"comment"` // 评价
}

// GenerateSummary 调用 LLM 生成面试总结
func (c *LLMClient) GenerateSummary(ctx context.Context, domainResults []DomainResult) (*SummaryResult, error) {
	// 将领域结果序列化为可读文本
	resultsJSON, err := json.MarshalIndent(domainResults, "", "  ")
	if err != nil {
		return nil, fmt.Errorf("序列化领域结果失败: %w", err)
	}

	userPrompt := fmt.Sprintf(SummaryUserPrompt, string(resultsJSON))

	result, err := c.chat(ctx, SummaryPrompt, userPrompt)
	if err != nil {
		return nil, fmt.Errorf("生成总结调用失败: %w", err)
	}

	jsonStr := extractJSON(result)
	var summaryResult SummaryResult
	if err := json.Unmarshal([]byte(jsonStr), &summaryResult); err != nil {
		return nil, fmt.Errorf("解析总结结果失败: %w, 原始响应: %s", err, result)
	}

	return &summaryResult, nil
}
