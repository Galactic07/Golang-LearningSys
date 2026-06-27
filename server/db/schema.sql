-- GoMaster 数据库 DDL
-- 包含 7 张核心表、索引和外键约束

CREATE DATABASE IF NOT EXISTS gomaster
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_unicode_ci;

USE gomaster;

-- 用户表
CREATE TABLE IF NOT EXISTS `users` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(255) NOT NULL,
    `nickname` VARCHAR(100) DEFAULT '',
    `avatar_url` VARCHAR(500) DEFAULT '',
    `settings` JSON DEFAULT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    UNIQUE INDEX `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 题目表
CREATE TABLE IF NOT EXISTS `questions` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `domain` VARCHAR(50) NOT NULL COMMENT '领域：frontend/backend/ai/infra',
    `level` VARCHAR(20) NOT NULL COMMENT '难度：junior/mid/senior',
    `topic` VARCHAR(100) NOT NULL COMMENT '主题',
    `question` TEXT NOT NULL COMMENT '题目内容',
    `reference_answer` TEXT COMMENT '参考答案',
    `keywords` JSON DEFAULT NULL COMMENT '关键词',
    `hints` JSON DEFAULT NULL COMMENT '提示',
    `tags` JSON DEFAULT NULL COMMENT '标签',
    `source` VARCHAR(100) DEFAULT '' COMMENT '来源',
    PRIMARY KEY (`id`),
    INDEX `idx_questions_domain` (`domain`),
    INDEX `idx_questions_level` (`level`),
    INDEX `idx_questions_domain_level` (`domain`, `level`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 学习进度表
CREATE TABLE IF NOT EXISTS `progresses` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `question_id` BIGINT UNSIGNED NOT NULL,
    `mastery_level` INT NOT NULL DEFAULT 0 COMMENT '掌握程度 0-5',
    `correct_count` INT NOT NULL DEFAULT 0 COMMENT '正确次数',
    `next_review` DATETIME(3) NOT NULL COMMENT '下次复习时间',
    `review_interval` INT NOT NULL DEFAULT 1 COMMENT '复习间隔（天）',
    `last_score` DOUBLE NOT NULL DEFAULT 0 COMMENT '最近得分',
    `last_answer_at` DATETIME(3) DEFAULT NULL COMMENT '最近答题时间',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    UNIQUE INDEX `idx_user_question` (`user_id`, `question_id`),
    INDEX `idx_progresses_next_review` (`next_review`),
    INDEX `idx_progresses_user_id` (`user_id`),
    CONSTRAINT `fk_progresses_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_progresses_question` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 面试记录表
CREATE TABLE IF NOT EXISTS `interviews` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `type` VARCHAR(50) NOT NULL COMMENT '面试类型：mock/jd',
    `jd_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '关联的职位描述 ID',
    `overall_score` DOUBLE NOT NULL DEFAULT 0 COMMENT '综合得分',
    `domain_results` JSON DEFAULT NULL COMMENT '各领域得分',
    `summary` TEXT COMMENT '总结',
    `improvements` JSON DEFAULT NULL COMMENT '改进建议',
    `started_at` DATETIME(3) DEFAULT NULL COMMENT '开始时间',
    `finished_at` DATETIME(3) DEFAULT NULL COMMENT '结束时间',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    INDEX `idx_interviews_user_id` (`user_id`),
    INDEX `idx_interviews_jd_id` (`jd_id`),
    CONSTRAINT `fk_interviews_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 面试回答表
CREATE TABLE IF NOT EXISTS `interview_answers` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `interview_id` BIGINT UNSIGNED NOT NULL,
    `question_id` BIGINT UNSIGNED NOT NULL,
    `domain` VARCHAR(50) NOT NULL COMMENT '领域',
    `level` VARCHAR(20) NOT NULL COMMENT '难度',
    `user_answer` TEXT COMMENT '用户回答',
    `score` DOUBLE NOT NULL DEFAULT 0 COMMENT '得分',
    `score_detail` JSON DEFAULT NULL COMMENT '评分详情',
    `follow_ups` JSON DEFAULT NULL COMMENT '追问',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    INDEX `idx_interview_answers_interview_id` (`interview_id`),
    CONSTRAINT `fk_interview_answers_interview` FOREIGN KEY (`interview_id`) REFERENCES `interviews` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_interview_answers_question` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 职位描述表
CREATE TABLE IF NOT EXISTS `job_descriptions` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `source` VARCHAR(50) DEFAULT '' COMMENT '来源：manual/upload/url',
    `company` VARCHAR(200) DEFAULT '' COMMENT '公司',
    `position` VARCHAR(200) DEFAULT '' COMMENT '职位',
    `raw_text` TEXT COMMENT '原始文本',
    `tech_stack` JSON DEFAULT NULL COMMENT '技术栈',
    `requirements` JSON DEFAULT NULL COMMENT '要求',
    `match_score` DOUBLE NOT NULL DEFAULT 0 COMMENT '匹配分数',
    `salary_min` INT DEFAULT NULL COMMENT '最低薪资（K）',
    `salary_max` INT DEFAULT NULL COMMENT '最高薪资（K）',
    `experience` VARCHAR(100) DEFAULT '' COMMENT '经验要求',
    `source_url` VARCHAR(500) DEFAULT '' COMMENT '来源 URL',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    INDEX `idx_job_descriptions_user_id` (`user_id`),
    CONSTRAINT `fk_job_descriptions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 学习路径表
CREATE TABLE IF NOT EXISTS `learning_paths` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `path_type` VARCHAR(50) NOT NULL COMMENT '路径类型：domain/role/jd',
    `name` VARCHAR(200) NOT NULL COMMENT '路径名称',
    `target_role` VARCHAR(100) DEFAULT '' COMMENT '目标角色',
    `steps` JSON DEFAULT NULL COMMENT '步骤',
    `progress` INT NOT NULL DEFAULT 0 COMMENT '进度百分比',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    INDEX `idx_learning_paths_user_id` (`user_id`),
    CONSTRAINT `fk_learning_paths_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
