"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  QuestionItem,
  TopicAbility,
  updateAbility,
  thetaToPercent,
} from "@/engine/irt";
// TopicAbility used for Map typing in state
import { selectNextQuestion, initializeTopicAbilities } from "@/engine/selector";
import {
  QuizResponse,
  SessionResult,
  calculateSessionResult,
} from "@/engine/scorer";

export type QuizPhase =
  | "idle"
  | "loading"
  | "active"
  | "feedback"
  | "extend-prompt"
  | "finished"
  | "error";

export interface QuizState {
  // State
  phase: QuizPhase;
  questions: QuestionItem[];
  currentQuestion: QuestionItem | null;
  answeredIds: Set<string>;
  responses: QuizResponse[];
  topicAbilities: Map<string, TopicAbility>;
  totalAnswered: number;
  correctCount: number;
  selectedAnswer: string | null;
  isCorrect: boolean | null;
  sessionResult: SessionResult | null;
  trialLimit: number;
  extended: boolean;
  error: string | null;
  persisted: boolean;

  // Actions
  loadQuestions: (questions: QuestionItem[]) => void;
  startQuiz: () => void;
  selectAnswer: (answer: string) => void;
  nextQuestion: () => void;
  extendQuiz: () => void;
  finishQuiz: () => void;
  resetQuiz: () => void;
  markPersisted: () => void;
}

export const useQuizStore = create<QuizState>()(
  persist(
    (set, get) => ({
      phase: "idle",
      questions: [],
      currentQuestion: null,
      answeredIds: new Set<string>(),
      responses: [],
      topicAbilities: new Map<string, TopicAbility>(),
      totalAnswered: 0,
      correctCount: 0,
      selectedAnswer: null,
      isCorrect: null,
      sessionResult: null,
      trialLimit: 10,
      extended: false,
      error: null,
      persisted: false,

      loadQuestions: (questions: QuestionItem[]) => {
        const scoreableQuestions = questions.filter(
          (q) => q.answer !== null && q.answer !== ""
        );
        const topicAbilities = initializeTopicAbilities(scoreableQuestions);
        set({
          questions: scoreableQuestions,
          topicAbilities,
          phase: "idle",
          error: null,
        });
      },

      startQuiz: () => {
        const { questions, answeredIds, topicAbilities } = get();
        const nextQ = selectNextQuestion(
          questions,
          answeredIds,
          topicAbilities
        );
        if (!nextQ) {
          set({ phase: "error", error: "Tidak ada soal tersedia." });
          return;
        }
        set({ phase: "active", currentQuestion: nextQ, selectedAnswer: null, isCorrect: null });
      },

      selectAnswer: (answer: string) => {
        const { currentQuestion, topicAbilities, responses, answeredIds } = get();
        if (!currentQuestion || !currentQuestion.answer) return;

        const isCorrect =
          answer.toLowerCase() === currentQuestion.answer.toLowerCase();
        const topic = currentQuestion.topic;
        const currentAbility = topicAbilities.get(topic);
        const thetaBefore = currentAbility?.theta ?? 0;

        // Update ability
        const thetaAfter = updateAbility(
          thetaBefore,
          currentQuestion.difficulty,
          currentQuestion.discrimination,
          isCorrect
        );

        // Update topic abilities map
        const newAbilities = new Map<string, TopicAbility>(topicAbilities);
        const existingAbility = newAbilities.get(topic);
        const prevAnswered = existingAbility ? existingAbility.answeredCount : 0;
        const prevCorrect = existingAbility ? existingAbility.correctCount : 0;
        newAbilities.set(topic, {
          topic,
          theta: thetaAfter,
          percent: thetaToPercent(thetaAfter),
          answeredCount: prevAnswered + 1,
          correctCount: prevCorrect + (isCorrect ? 1 : 0),
        });

        // Record response
        const response: QuizResponse = {
          questionId: currentQuestion.id,
          topic,
          isCorrect,
          selectedAnswer: answer,
          correctAnswer: currentQuestion.answer,
          difficulty: currentQuestion.difficulty,
          discrimination: currentQuestion.discrimination,
          abilityBefore: thetaBefore,
          abilityAfter: thetaAfter,
        };

        const newAnsweredIds = new Set(answeredIds);
        newAnsweredIds.add(currentQuestion.id);

        set({
          selectedAnswer: answer,
          isCorrect,
          phase: "feedback",
          topicAbilities: newAbilities,
          responses: [...responses, response],
          answeredIds: newAnsweredIds,
          totalAnswered: get().totalAnswered + 1,
          correctCount: get().correctCount + (isCorrect ? 1 : 0),
        });
      },

      nextQuestion: () => {
        const { totalAnswered, trialLimit, extended, questions, answeredIds, topicAbilities } =
          get();

        // Check if we should show extend prompt
        if (totalAnswered === trialLimit && !extended) {
          set({ phase: "extend-prompt" });
          return;
        }

        // Select next question
        const nextQ = selectNextQuestion(questions, answeredIds, topicAbilities);
        if (!nextQ) {
          // No more questions available
          get().finishQuiz();
          return;
        }

        set({ phase: "active", currentQuestion: nextQ, selectedAnswer: null, isCorrect: null });
      },

      extendQuiz: () => {
        set({ extended: true, trialLimit: 30 });
        get().nextQuestion();
      },

      finishQuiz: () => {
        const { responses, topicAbilities } = get();
        const result = calculateSessionResult(responses, topicAbilities);
        set({ phase: "finished", sessionResult: result });
      },

      resetQuiz: () => {
        set({
          phase: "idle",
          currentQuestion: null,
          answeredIds: new Set(),
          responses: [],
          totalAnswered: 0,
          correctCount: 0,
          selectedAnswer: null,
          isCorrect: null,
          sessionResult: null,
          extended: false,
          error: null,
          persisted: false,
        });
        // Re-initialize topic abilities
        const { questions } = get();
        const topicAbilities = initializeTopicAbilities(questions);
        set({ topicAbilities });
      },

      markPersisted: () => set({ persisted: true }),
    }),
    {
      name: "ppds-quiz-store",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      partialize: (state: any) => ({
        responses: state.responses,
        totalAnswered: state.totalAnswered,
        correctCount: state.correctCount,
        answeredIds: Array.from(state.answeredIds),
        topicAbilities: Array.from(state.topicAbilities.entries()),
        sessionResult: state.sessionResult,
        extended: state.extended,
      }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      merge: (persistedState: any, currentState: any) => {
        if (!persistedState) return currentState;
        return {
          ...currentState,
          ...persistedState,
          answeredIds: new Set(persistedState.answeredIds || []),
          topicAbilities: new Map(persistedState.topicAbilities || []),
        };
      },
    }
  )
);
