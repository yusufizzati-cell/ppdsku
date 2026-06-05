/**
 * Quiz Scorer
 * Calculates session results and topic breakdown
 */

import { TopicAbility, calculateReadinessScore } from "./irt";

export interface QuizResponse {
  questionId: string;
  topic: string;
  isCorrect: boolean;
  selectedAnswer: string;
  correctAnswer: string;
  difficulty: number;
  discrimination: number;
  abilityBefore: number;
  abilityAfter: number;
}

export interface SessionResult {
  totalQuestions: number;
  correctCount: number;
  overallPercent: number;
  topicBreakdown: TopicBreakdown[];
  readinessScore: number;
  weakTopics: string[];
  strongTopics: string[];
}

export interface TopicBreakdown {
  topic: string;
  theta: number;
  percent: number;
  answeredCount: number;
  correctCount: number;
  status: "very-low" | "low" | "medium" | "high" | "very-high";
}

/**
 * Calculate session result from responses and abilities
 */
export function calculateSessionResult(
  responses: QuizResponse[],
  topicAbilities: Map<string, TopicAbility>
): SessionResult {
  const totalQuestions = responses.length;
  const correctCount = responses.filter((r) => r.isCorrect).length;
  const overallPercent =
    totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  const topicBreakdown: TopicBreakdown[] = [];

  for (const ability of Array.from(topicAbilities.values())) {
    if (ability.answeredCount > 0) {
      topicBreakdown.push({
        topic: ability.topic,
        theta: ability.theta,
        percent: ability.percent,
        answeredCount: ability.answeredCount,
        correctCount: ability.correctCount,
        status: getMasteryStatus(ability.percent),
      });
    }
  }

  // Sort by percent ascending (weakest first)
  topicBreakdown.sort((a, b) => a.percent - b.percent);

  const weakTopics = topicBreakdown
    .filter((t) => t.status === "very-low" || t.status === "low")
    .map((t) => t.topic);

  const strongTopics = topicBreakdown
    .filter((t) => t.status === "high" || t.status === "very-high")
    .map((t) => t.topic);

  const readinessScore = calculateReadinessScore(
    Array.from(topicAbilities.values())
  );

  return {
    totalQuestions,
    correctCount,
    overallPercent,
    topicBreakdown,
    readinessScore,
    weakTopics,
    strongTopics,
  };
}

/**
 * Get mastery status from percentage
 */
export function getMasteryStatus(
  percent: number
): "very-low" | "low" | "medium" | "high" | "very-high" {
  if (percent < 40) return "very-low";
  if (percent < 60) return "low";
  if (percent < 75) return "medium";
  if (percent < 90) return "high";
  return "very-high";
}
