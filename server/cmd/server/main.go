package main

import (
	"fmt"
	"log"

	"github.com/gin-gonic/gin"
	"github.com/gomaster/server/internal/config"
	"github.com/gomaster/server/internal/handler"
	"github.com/gomaster/server/internal/middleware"
	"github.com/gomaster/server/internal/repository"
	"github.com/gomaster/server/internal/service"
	"github.com/gomaster/server/pkg/llm"
	"github.com/joho/godotenv"
)

func main() {
	// 加载 .env 文件
	if err := godotenv.Load(); err != nil {
		log.Println("未找到 .env 文件，将使用环境变量")
	}

	// 加载配置
	cfg := config.Load()

	// 初始化数据库连接
	db, err := repository.InitDB()
	if err != nil {
		log.Fatalf("初始化数据库失败: %v", err)
	}
	log.Println("数据库连接成功，AutoMigrate 完成")

	// 初始化仓库层
	userRepo := repository.NewUserRepository(db)
	questionRepo := repository.NewQuestionRepository(db)
	progressRepo := repository.NewProgressRepository(db)
	interviewRepo := repository.NewInterviewRepository(db)

	// 初始化服务层
	userSvc := service.NewUserService(userRepo)
	questionSvc := service.NewQuestionService(questionRepo)
	progressSvc := service.NewProgressService(progressRepo)
	interviewSvc := service.NewInterviewService(interviewRepo)

	// 初始化 LLM 客户端
	llmClient := llm.NewLLMClient(llm.Config{
		APIKey:  cfg.LLMAPIKey,
		BaseURL: cfg.LLMBaseURL,
		Model:   cfg.LLMModel,
	})

	// 初始化处理器层
	healthHandler := handler.NewHealthHandler()
	userHandler := handler.NewUserHandler(userSvc)
	questionHandler := handler.NewQuestionHandler(questionSvc)
	progressHandler := handler.NewProgressHandler(progressSvc)
	interviewHandler := handler.NewInterviewHandler(interviewSvc)
	llmHandler := handler.NewLLMHandler(llmClient)
	authSvc := service.NewAuthService(userRepo)
	authHandler := handler.NewAuthHandler(authSvc)
	dataHandler := handler.NewDataHandler(userSvc, progressSvc, interviewSvc)

	// 初始化 Gin 引擎
	r := gin.New()

	// 应用全局中间件
	r.Use(middleware.Logger())
	r.Use(middleware.CORS())
	r.Use(gin.Recovery())

	// 健康检查（无需认证）
	r.GET("/api/health", healthHandler.Health)

	// 编译接口（无需 JWT，供 Playground 使用）
	compileHandler := handler.NewCompileHandler()
	r.GET("/api/compile/health", compileHandler.Health)
	r.POST("/api/compile", compileHandler.Compile)

	// 认证路由（无需 JWT）
	auth := r.Group("/api/auth")
	{
		auth.POST("/register", authHandler.Register)
		auth.POST("/login", authHandler.Login)
	}

	// 需要认证的路由组
	api := r.Group("/api")
	api.Use(middleware.JWTAuth())
	{
		// 用户相关接口
		users := api.Group("/users")
		{
			users.GET("/:id", userHandler.GetUser)
			users.POST("", userHandler.CreateUser)
			users.PUT("/:id", userHandler.UpdateUser)
		}

		// 题目查询接口
		questions := api.Group("/questions")
		{
			questions.GET("", questionHandler.ListQuestions)
			questions.GET("/:id", questionHandler.GetQuestion)
			questions.POST("", questionHandler.CreateQuestion)
		}

		// 进度管理接口
		progress := api.Group("/progress")
		{
			progress.GET("", progressHandler.GetProgress)
			progress.GET("/user/:user_id", progressHandler.GetUserProgress)
			progress.GET("/due/:user_id", progressHandler.GetDueReviews)
			progress.POST("", progressHandler.UpdateProgress)
		}

		// 面试记录接口
		interviews := api.Group("/interviews")
		{
			interviews.GET("/:id", interviewHandler.GetInterview)
			interviews.GET("/user/:user_id", interviewHandler.GetUserInterviews)
			interviews.POST("", interviewHandler.CreateInterview)
			interviews.POST("/:id/answers", interviewHandler.CreateAnswer)
			interviews.GET("/:id/answers", interviewHandler.GetInterviewAnswers)
		}

		// LLM 代理接口（应用限流中间件）
		llmGroup := api.Group("/llm")
		llmGroup.Use(middleware.LLMRateLimit())
		{
			llmGroup.POST("/test", llmHandler.TestConnection) // 连接测试
			llmGroup.POST("/score", llmHandler.Score)         // 评分接口
			llmGroup.POST("/generate", llmHandler.Generate)   // 题目生成接口
			llmGroup.POST("/followup", llmHandler.FollowUp)   // 追问接口
			llmGroup.POST("/summary", llmHandler.Summary)     // 面试总结接口
		}

		// 数据导出接口
		api.GET("/data/export/:user_id", dataHandler.Export) // 数据导出
	}

	// 启动服务
	addr := fmt.Sprintf(":%s", cfg.Port)
	log.Printf("服务启动于 %s", addr)
	if err := r.Run(addr); err != nil {
		log.Fatalf("服务启动失败: %v", err)
	}
}
