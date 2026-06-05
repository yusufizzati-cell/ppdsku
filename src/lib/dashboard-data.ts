import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getMasteryStatus } from "@/engine/scorer";

export interface DashboardKpis {
  readinessScore: number;
  questionsCompleted: number;
  studyStreak: number;
  accuracy: number;
}

export interface PriorityTopic {
  topic: string;
  percent: number;
  status: "very-low" | "low" | "medium" | "high" | "very-high";
  answeredCount: number;
}

export interface RecentSession {
  id: string;
  date: string;
  overallPercent: number;
  totalQuestions: number;
  correctCount: number;
  mode: string;
}

export interface DashboardData {
  hasData: boolean;
  profileName: string | null;
  kpis: DashboardKpis;
  priorityTopics: PriorityTopic[];
  recentSessions: RecentSession[];
}

/**
 * Loads real dashboard data for the current user from Supabase.
 * Returns hasData: false when the user hasn't completed any quiz yet.
 */
export async function getDashboardData(
  specialty = "onkrad"
): Promise<DashboardData | null> {
  const supabase = createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const empty: DashboardData = {
    hasData: false,
    profileName: null,
    kpis: { readinessScore: 0, questionsCompleted: 0, studyStreak: 0, accuracy: 0 },
    priorityTopics: [],
    recentSessions: [],
  };

  // Profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", user.id)
    .single();
  empty.profileName = profile?.name ?? null;

  // Topic abilities
  const { data: abilities } = await supabase
    .from("topic_abilities")
    .select("*")
    .eq("user_id", user.id)
    .eq("specialty", specialty);

  // Sessions
  const { data: sessions } = await supabase
    .from("quiz_sessions")
    .select("*")
    .eq("user_id", user.id)
    .eq("specialty", specialty)
    .order("created_at", { ascending: false });

  if ((!abilities || abilities.length === 0) && (!sessions || sessions.length === 0)) {
    return empty;
  }

  // KPIs
  const questionsCompleted = (abilities ?? []).reduce(
    (sum, a) => sum + (a.answered_count ?? 0),
    0
  );
  const totalCorrect = (abilities ?? []).reduce(
    (sum, a) => sum + (a.correct_count ?? 0),
    0
  );
  const accuracy =
    questionsCompleted > 0
      ? Math.round((totalCorrect / questionsCompleted) * 100)
      : 0;

  // Readiness = weighted avg of topic percent by answered count
  const totalWeight = (abilities ?? []).reduce(
    (s, a) => s + (a.answered_count ?? 0),
    0
  );
  const readinessScore =
    totalWeight > 0
      ? Math.round(
          (abilities ?? []).reduce(
            (s, a) => s + (a.percent ?? 0) * (a.answered_count ?? 0),
            0
          ) / totalWeight
        )
      : 0;

  const studyStreak = calculateStreak(
    (sessions ?? []).map((s) => s.created_at as string)
  );

  // Priority topics (weakest first)
  const priorityTopics: PriorityTopic[] = (abilities ?? [])
    .map((a) => ({
      topic: a.topic as string,
      percent: a.percent as number,
      status: getMasteryStatus(a.percent as number),
      answeredCount: a.answered_count as number,
    }))
    .sort((x, y) => x.percent - y.percent)
    .slice(0, 6);

  const recentSessions: RecentSession[] = (sessions ?? [])
    .slice(0, 5)
    .map((s) => ({
      id: s.id as string,
      date: s.created_at as string,
      overallPercent: (s.overall_percent as number) ?? 0,
      totalQuestions: (s.total_questions as number) ?? 0,
      correctCount: (s.correct_count as number) ?? 0,
      mode: (s.mode as string) ?? "adaptive",
    }));

  return {
    hasData: true,
    profileName: profile?.name ?? null,
    kpis: { readinessScore, questionsCompleted, studyStreak, accuracy },
    priorityTopics,
    recentSessions,
  };
}

/**
 * Calculates consecutive-day study streak from session timestamps.
 */
function calculateStreak(timestamps: string[]): number {
  if (timestamps.length === 0) return 0;

  const days = new Set(
    timestamps.map((t) => new Date(t).toISOString().slice(0, 10))
  );

  let streak = 0;
  const cursor = new Date();

  // Allow today or yesterday as the streak anchor
  const todayStr = cursor.toISOString().slice(0, 10);
  if (!days.has(todayStr)) {
    cursor.setDate(cursor.getDate() - 1);
    const yStr = cursor.toISOString().slice(0, 10);
    if (!days.has(yStr)) return 0;
  }

  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}
