// 规则模式追问生成
// 在 LLM 不可用时，根据分数和题目类型生成固定追问

export function generateRuleFollowUp(
  _question: string,
  _userAnswer: string,
  score: number,
  followUpCount: number,
): string | null {
  if (followUpCount >= 2) return null;

  if (score >= 2.5 && score < 3.5) {
    return '能再举一个实际应用的例子吗？';
  }

  if (score >= 3.5 && score < 4) {
    return '能谈谈这种方案有什么局限性和优化空间吗？';
  }

  if (score >= 4) {
    return '能对比一下其他同类方案或技术的优劣吗？';
  }

  return null;
}

// 根据题目领域生成领域特定的追问
export function generateDomainFollowUp(
  domain: number,
  score: number,
  followUpCount: number,
): string | null {
  if (followUpCount >= 2) return null;

  if (score < 2.5) {
    const domainFollowUps: Record<number, string[]> = {
      1: ['能说说 Go 中其他类似的语法特性吗？', '这个特性在什么版本引入的？有什么前置知识需要了解？'],
      2: ['能画个简单的 goroutine 交互图吗？', '这个模式在高并发下有什么潜在问题？'],
      3: ['能说说这个机制的底层实现原理吗？', '如何通过工具观测这个行为？'],
      4: ['这种方案在大型项目中的实践效果如何？', '有没有遇到过与之相关的线上问题？'],
      5: ['这种方案在分布式环境下的挑战是什么？', '对比其他框架的实现有什么不同？'],
      6: ['这种方案在高并发场景下的表现如何？', '数据的一致性和可靠性如何保证？'],
      7: ['这种方案在资源限制下如何优化？', '有没有更轻量级的替代方案？'],
      8: ['这个设计在极端条件下会有什么问题？', '如何对这个设计进行压力测试？'],
    };
    const follows = domainFollowUps[domain] ?? ['能再详细解释一下吗？'];
    return follows[followUpCount] ?? null;
  }

  return null;
}

// 合并追问生成
export function generateFollowUp(
  question: string,
  userAnswer: string,
  score: number,
  followUpCount: number,
  domain?: number,
): string | null {
  if (followUpCount >= 2) return null;

  const ruleFollowUp = generateRuleFollowUp(question, userAnswer, score, followUpCount);
  if (ruleFollowUp && score >= 3) return ruleFollowUp;

  if (domain !== undefined) {
    return generateDomainFollowUp(domain, score, followUpCount);
  }

  return ruleFollowUp;
}
