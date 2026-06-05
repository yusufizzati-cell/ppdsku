/**
 * IRT 2PL — Item Response Theory 2-Parameter Logistic Model
 * Core adaptive engine for PPDS Knowledge Mapper
 */

export interface QuestionItem {
  id: string;
  stem: string;
  options: Record<string, string>;
  answer: string | null;
  topic: string;
  subtopic?: string;
  difficulty: number; // b parameter
  discrimination: number; // a parameter
  source_session?: string;
  cognitive_level?: string;
  explanation?: string;
}

export interface TopicAbility {
  topic: string;
  theta: number;
  percent: number;
  answeredCount: number;
  correctCount: number;
}

/**
 * Calculate probability of correct response using 2PL IRT model
 * P(θ) = 1 / (1 + exp(-a(θ - b)))
 */
export function probability2PL(
  theta: number,
  difficulty: number,
  discrimination: number
): number {
  const exponent = -discrimination * (theta - difficulty);
  return 1 / (1 + Math.exp(exponent));
}

/**
 * Update ability estimate after a response using EAP (Expected A Posteriori)
 * Simplified Newton-Raphson single step update
 */
export function updateAbility(
  currentTheta: number,
  difficulty: number,
  discrimination: number,
  isCorrect: boolean
): number {
  const p = probability2PL(currentTheta, difficulty, discrimination);
  const residual = (isCorrect ? 1 : 0) - p;
  const info = discrimination * discrimination * p * (1 - p);

  // Newton-Raphson update with dampening
  const step = (discrimination * residual) / (info + 0.1);
  let newTheta = currentTheta + step;

  // Clamp theta between -4 and 4
  newTheta = Math.max(-4, Math.min(4, newTheta));

  return newTheta;
}

/**
 * Convert theta to percentage (0-100)
 * Maps [-4, 4] to [0, 100] with sigmoid
 */
export function thetaToPercent(theta: number): number {
  const p = 1 / (1 + Math.exp(-theta * 1.2));
  return Math.round(p * 100);
}

/**
 * Calculate overall readiness score from topic abilities
 */
export function calculateReadinessScore(abilities: TopicAbility[]): number {
  if (abilities.length === 0) return 0;
  const totalWeight = abilities.reduce((sum, a) => sum + a.answeredCount, 0);
  if (totalWeight === 0) return 0;
  const weightedSum = abilities.reduce(
    (sum, a) => sum + a.percent * a.answeredCount,
    0
  );
  return Math.round(weightedSum / totalWeight);
}
