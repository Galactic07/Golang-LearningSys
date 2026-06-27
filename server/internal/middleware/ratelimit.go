package middleware

import (
	"fmt"
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

// 滑动窗口限流参数
const (
	// 每用户每分钟最多 LLM 调用次数
	rateLimitPerMinute = 20
	// 滑动窗口大小
	windowSize = time.Minute
)

// userWindow 用户滑动窗口记录
type userWindow struct {
	timestamps []time.Time // 请求时间戳列表
}

// RateLimiter 内存滑动窗口限流器
type RateLimiter struct {
	mu      sync.Mutex
	windows map[string]*userWindow
}

// NewRateLimiter 创建限流器
func NewRateLimiter() *RateLimiter {
	limiter := &RateLimiter{
		windows: make(map[string]*userWindow),
	}
	// 启动定期清理过期记录的协程
	go limiter.cleanup()
	return limiter
}

// Allow 检查是否允许请求
func (rl *RateLimiter) Allow(userID string) bool {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	now := time.Now()
	windowStart := now.Add(-windowSize)

	w, exists := rl.windows[userID]
	if !exists {
		w = &userWindow{timestamps: make([]time.Time, 0)}
		rl.windows[userID] = w
	}

	// 移除窗口外的过期时间戳
	validIdx := 0
	for i, ts := range w.timestamps {
		if ts.After(windowStart) {
			validIdx = i
			break
		}
		// 如果所有时间戳都过期了，validIdx 会停留在最后一个
		if i == len(w.timestamps)-1 {
			validIdx = len(w.timestamps)
		}
	}
	if validIdx > 0 {
		w.timestamps = w.timestamps[validIdx:]
	}

	// 检查是否超过限制
	if len(w.timestamps) >= rateLimitPerMinute {
		return false
	}

	// 记录本次请求时间
	w.timestamps = append(w.timestamps, now)
	return true
}

// cleanup 定期清理过期的用户窗口记录
func (rl *RateLimiter) cleanup() {
	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()

	for range ticker.C {
		rl.mu.Lock()
		now := time.Now()
		windowStart := now.Add(-windowSize)

		for userID, w := range rl.windows {
			// 移除过期时间戳
			validIdx := 0
			for i, ts := range w.timestamps {
				if ts.After(windowStart) {
					validIdx = i
					break
				}
				if i == len(w.timestamps)-1 {
					validIdx = len(w.timestamps)
				}
			}
			if validIdx > 0 {
				w.timestamps = w.timestamps[validIdx:]
			}
			// 如果没有有效记录，删除该用户的窗口
			if len(w.timestamps) == 0 {
				delete(rl.windows, userID)
			}
		}
		rl.mu.Unlock()
	}
}

// LLMRateLimit LLM 接口限流中间件
// 基于 JWT 中的 user_id 进行限流
func LLMRateLimit() gin.HandlerFunc {
	limiter := NewRateLimiter()

	return func(c *gin.Context) {
		// 从 JWT 认证中间件设置的上下文中获取 user_id
		userID, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "未获取到用户信息"})
			c.Abort()
			return
		}

		userIDStr, ok := userID.(string)
		if !ok {
			// JWT 数值类型会被解析为 float64，转为字符串
			userIDStr = fmt.Sprintf("%v", userID)
		}

		if !limiter.Allow(userIDStr) {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error": "请求过于频繁，每分钟最多 20 次 LLM 调用",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}
