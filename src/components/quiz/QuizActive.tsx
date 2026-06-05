"use client";

import { useQuizStore } from "@/store/quiz-store";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export function QuizActive() {
  const { currentQuestion, totalAnswered, trialLimit, selectAnswer } = useQuizStore();

  if (!currentQuestion) return null;

  const optionKeys = Object.keys(currentQuestion.options).sort();
  const progress = Math.min((totalAnswered / trialLimit) * 100, 100);

  return (
    <div>
      {/* Progress */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm text-navy-500">
            Soal {totalAnswered + 1}
          </span>
          <Badge variant="info">{currentQuestion.topic}</Badge>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-navy-200">
          <div
            className="h-full rounded-full bg-primary-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <Card padding="lg" className="mb-6">
        <p className="text-base font-medium leading-relaxed text-navy-900 sm:text-lg">
          {currentQuestion.stem}
        </p>
      </Card>

      {/* Options */}
      <div className="space-y-3">
        {optionKeys.map((key) => (
          <button
            key={key}
            onClick={() => selectAnswer(key)}
            className="flex w-full items-start gap-3 rounded-2xl border border-navy-200 bg-white px-5 py-4 text-left transition-all hover:border-primary-300 hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border-2 border-navy-300 text-sm font-semibold text-navy-600">
              {key.toUpperCase()}
            </span>
            <span className="pt-0.5 text-sm text-navy-700 sm:text-base">
              {currentQuestion.options[key]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
