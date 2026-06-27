package handler

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"time"

	"github.com/gin-gonic/gin"
)

// CompileRequest 编译请求
type CompileRequest struct {
	Files []FileContent `json:"files" binding:"required"`
}

// FileContent 文件内容
type FileContent struct {
	Name    string `json:"name"`
	Content string `json:"content"`
}

// CompileResponse 编译响应
type CompileResponse struct {
	Success  bool   `json:"success"`
	Output   string `json:"output"`
	Errors   string `json:"errors"`
	Duration int64  `json:"duration"` // 毫秒
}

// CompileHandler 编译处理器
type CompileHandler struct{}

// NewCompileHandler 创建编译处理器
func NewCompileHandler() *CompileHandler {
	return &CompileHandler{}
}

// Compile 编译并运行 Go 代码
// POST /api/compile
func (h *CompileHandler) Compile(c *gin.Context) {
	var req CompileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, CompileResponse{
			Success: false,
			Errors:  fmt.Sprintf("请求格式错误: %v", err),
		})
		return
	}

	if len(req.Files) == 0 {
		c.JSON(http.StatusBadRequest, CompileResponse{
			Success: false,
			Errors:  "至少需要一个文件",
		})
		return
	}

	// 创建临时目录
	tmpDir, err := os.MkdirTemp("", "gomaster-compile-*")
	if err != nil {
		c.JSON(http.StatusInternalServerError, CompileResponse{
			Success: false,
			Errors:  fmt.Sprintf("创建临时目录失败: %v", err),
		})
		return
	}
	defer os.RemoveAll(tmpDir)

	// 初始化 Go module
	modInit := exec.Command("go", "mod", "init", "playground")
	modInit.Dir = tmpDir
	if out, err := modInit.CombinedOutput(); err != nil {
		c.JSON(http.StatusInternalServerError, CompileResponse{
			Success: false,
			Errors:  fmt.Sprintf("初始化模块失败: %s", string(out)),
		})
		return
	}

	// 写入所有文件
	for _, f := range req.Files {
		filePath := filepath.Join(tmpDir, f.Name)
		dir := filepath.Dir(filePath)
		if err := os.MkdirAll(dir, 0755); err != nil {
			c.JSON(http.StatusInternalServerError, CompileResponse{
				Success: false,
				Errors:  fmt.Sprintf("创建目录失败 %s: %v", dir, err),
			})
			return
		}
		if err := os.WriteFile(filePath, []byte(f.Content), 0644); err != nil {
			c.JSON(http.StatusInternalServerError, CompileResponse{
				Success: false,
				Errors:  fmt.Sprintf("写入文件失败 %s: %v", f.Name, err),
			})
			return
		}
	}

	start := time.Now()

	// 自动解析并下载外部依赖
	modTidy := exec.Command("go", "mod", "tidy")
	modTidy.Dir = tmpDir
	var tidyErr bytes.Buffer
	modTidy.Stderr = &tidyErr
	if err := modTidy.Run(); err != nil {
		duration := time.Since(start).Milliseconds()
		c.JSON(http.StatusOK, CompileResponse{
			Success:  false,
			Errors:   tidyErr.String(),
			Duration: duration,
			Output:   "依赖解析失败",
		})
		return
	}

	// 构建
	buildCmd := exec.Command("go", "build", "-o", "output.exe", ".")
	buildCmd.Dir = tmpDir
	var buildErr bytes.Buffer
	buildCmd.Stderr = &buildErr

	if err := buildCmd.Run(); err != nil {
		duration := time.Since(start).Milliseconds()
		c.JSON(http.StatusOK, CompileResponse{
			Success:  false,
			Errors:   buildErr.String(),
			Duration: duration,
			Output:   "编译失败",
		})
		return
	}

	// 运行
	outputPath := filepath.Join(tmpDir, "output.exe")
	runCmd := exec.Command(outputPath)
	runCmd.Dir = tmpDir
	var stdout, stderr bytes.Buffer
	runCmd.Stdout = &stdout
	runCmd.Stderr = &stderr

	// 设置运行超时 (5秒)
	runDone := make(chan bool, 1)
	go func() {
		runCmd.Run()
		runDone <- true
	}()

	var runOutput, runError string
	select {
	case <-runDone:
		runOutput = stdout.String()
		runError = stderr.String()
	case <-time.After(5 * time.Second):
		runCmd.Process.Kill()
		runError = "程序运行超时 (超过5秒)"
	}

	duration := time.Since(start).Milliseconds()

	// 清理编译产物
	os.Remove(outputPath)

	c.JSON(http.StatusOK, CompileResponse{
		Success:  runError == "",
		Output:   runOutput,
		Errors:   runError,
		Duration: duration,
	})
}

// Health 健康检查
func (h *CompileHandler) Health(c *gin.Context) {
	// 检查 go 命令是否可用
	_, err := exec.LookPath("go")
	goAvailable := err == nil

	c.JSON(http.StatusOK, gin.H{
		"status":      "ok",
		"goAvailable": goAvailable,
		"goVersion":   getGoVersion(),
	})
}

func getGoVersion() string {
	cmd := exec.Command("go", "version")
	out, err := cmd.Output()
	if err != nil {
		return "unknown"
	}
	return string(bytes.TrimSpace(out))
}

