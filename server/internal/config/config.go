package config

import (
	"os"
	"strconv"
)

// Config 应用配置
type Config struct {
	// 数据库
	DBDSN string

	// JWT
	JWTSecret string

	// 服务
	Port string

	// LLM
	LLMProvider string
	LLMAPIKey   string
	LLMBaseURL  string
	LLMModel    string
}

// Load 从环境变量加载配置
func Load() *Config {
	return &Config{
		DBDSN:       getEnv("DB_DSN", ""),
		JWTSecret:   getEnv("JWT_SECRET", "default-secret"),
		Port:        getEnv("PORT", "8080"),
		LLMProvider: getEnv("LLM_PROVIDER", "openai"),
		LLMAPIKey:   getEnv("LLM_API_KEY", ""),
		LLMBaseURL:  getEnv("LLM_BASE_URL", ""),
		LLMModel:    getEnv("LLM_MODEL", ""),
	}
}

// getEnv 获取环境变量，支持默认值
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// getEnvInt 获取环境变量整数，支持默认值
func getEnvInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intVal, err := strconv.Atoi(value); err == nil {
			return intVal
		}
	}
	return defaultValue
}
