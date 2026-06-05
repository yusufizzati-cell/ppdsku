/**
 * Adaptive Question Selector
 * Selects next question based on IRT ability estimation
 *
 * Strategy:
 * - 70% chance: pick from weakest topic
 * - 30% chance: pick from random topic
 * - From pool, select questions with P(correct) closest to 0.6
 * - Random from top 5 candidates to avoid predictability
 * - Never repeat answered questions
 */

import { QuestionItem, TopicAbility, probability2PL } from "./irt";

export interface SelectionConfig {
  weakTopicWeight: number; // 0.7 default
  targetProbability: number; // 0.6 default
  candidatePoolSize: number; // 5 default
}

const DEFAULT_CONFIG: SelectionConfig = {
  weakTopicWeight: 0.7,
  targetProbability: 0.6,
  candidatePoolSize: 5,
};

/**
 * Select next question adaptively
 */
export function selectNextQuestion(
  questions: QuestionItem[],
  answeredIds: Set<string>,
  topicAbilities: Map<string, TopicAbility>,
  config: SelectionConfig = DEFAULT_CONFIG
): QuestionItem | null {
  // Filter: only scoreable questions (have answer key) that haven't been answered
  const available = questions.filter(
    (q) => q.answer !== null && q.answer !== "" && !answeredIds.has(q.id)
  );

  if (available.length === 0) return null;

  // Determine target topic
  const targetTopic = chooseTargetTopic(topicAbilities, config.weakTopicWeight);

  // Get candidates from target topic, fallback to all if none available
  let candidates = targetTopic
    ? available.filter((q) => q.topic === targetTopic)
    : available;

  if (candidates.length === 0) {
    candidates = available;
  }

  // Get theta for the target topic
  const currentTheta = targetTopic
    ? topicAbilities.get(targetTopic)?.theta ?? 0
    : 0;

  // Score candidates by how close their P(correct) is to target
  const scored = candidates.map((q) => {
    const p = probability2PL(currentTheta, q.difficulty, q.discrimination);
    const distance = Math.abs(p - config.targetProbability);
    return { question: q, distance };
  });

  // Sort by distance (closest to target probability first)
  scored.sort((a, b) => a.distance - b.distance);

  // Pick random from top N candidates
  const poolSize = Math.min(config.candidatePoolSize, scored.length);
  const randomIndex = Math.floor(Math.random() * poolSize);

  return scored[randomIndex].question;
}

/**
 * Choose which topic to focus on
 */
function chooseTargetTopic(
  topicAbilities: Map<string, TopicAbility>,
  weakTopicWeight: number
): string | null {
  if (topicAbilities.size === 0) return null;

  const roll = Math.random();

  if (roll < weakTopicWeight) {
    // Pick weakest topic
    let weakest: TopicAbility | null = null;
    for (const ability of Array.from(topicAbilities.values())) {
      if (!weakest || ability.theta < weakest.theta) {
        weakest = ability;
      }
    }
    return weakest?.topic ?? null;
  } else {
    // Pick random topic
    const topics = Array.from(topicAbilities.keys());
    return topics[Math.floor(Math.random() * topics.length)];
  }
}

/**
 * Get initial topic abilities from question pool
 */
export function initializeTopicAbilities(
  questions: QuestionItem[]
): Map<string, TopicAbility> {
  const topics = new Map<string, TopicAbility>();
  const uniqueTopics = Array.from(new Set(questions.map((q) => q.topic)));

  for (const topic of uniqueTopics) {
    topics.set(topic, {
      topic,
      theta: 0,
      percent: 50,
      answeredCount: 0,
      correctCount: 0,
    });
  }

  return topics;
}
