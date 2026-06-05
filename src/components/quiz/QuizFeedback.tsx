"use client";

import { useQuizStore } from "@/store/quiz-store";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Check, X, ArrowRight } from "lucide-react";

export function QuizFeedback() {
  const { currentQuestion, selectedAnswer, isCorrect, nextQuestion, finishQuiz, totalAnswered, trialLimit, extended } =
    useQuizStore();

  if (!currentQuestion || !selectedAnswer) return null;

  const optionKeys = Object.keys(currentQuestion.options).sort();
  const isLastQuestion = totalAnswered >= trialLimit && extended;

  return (
    <div>
      {/* Feedback header */}
      <div
        className={`mb-6 rounded-2xl p-4 ${
          isCorrect ? "bg-success-50 border border-success-200" : "bg-danger-50 border border-danger-200"
        }`}
      >
        <div className="flex items-center gap-2">
          {isCorrect ? (
            <>
              <Check size={20} className="text-success-600" />
              <span className="font-semibold text-success-700">Benar!</span>
            </>
          ) : (
            <>
              <X size={20} className="text-danger-600" />
              <span className="font-semibold text-danger-700">
                Salah — Jawaban yang benar: {currentQuestion.answer?.toUpperCase()}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Question with answer states */}
      <Card padding="lg" className="mb-6">
        <p className="text-base font-medium leading-relaxed text-navy-900 sm:text-lg">
          {currentQuestion.stem}
        </p>
      </Card>

      {/* Options with states */}
      <div className="mb-6 space-y-3">
        {optionKeys.map((key) => {
          const isSelected = key === selectedAnswer;
          const isCorrectAnswer = key === currentQuestion.answer;

          let borderClass = "border-navy-200";
          let bgClass = "bg-white";
          let textClass = "text-navy-700";
          let circleClass = "border-navy-300 text-navy-600";

          if (isCorrectAnswer) {
            borderClass = "border-success-500";
            bgClass = "bg-success-50";
            textClass = "text-success-700";
            circleClass = "border-success-500 text-success-700 bg-success-100";
          } else if (isSelected && !isCorrect) {
            borderClass = "border-danger-500";
            bgClass = "bg-danger-50";
            textClass = "text-danger-700";
            circleClass = "border-danger-500 text-danger-700 bg-danger-100";
          }

          return (
            <div
              key={key}
              className={`flex w-full items-start gap-3 rounded-2xl border ${borderClass} ${bgClass} px-5 py-4`}
            >
              <span
                className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold ${circleClass}`}
              >
                {key.toUpperCase()}
              </span>
              <span className={`pt-0.5 text-sm sm:text-base ${textClass}`}>
                {currentQuestion.options[key]}
              </span>
              {isCorrectAnswer && <Check size={18} className="ml-auto mt-1 text-success-600" />}
              {isSelected && !isCorrect && <X size={18} className="ml-auto mt-1 text-danger-600" />}
            </div>
          );
        })}
      </div>

      {/* Next button */}
      <div className="flex justify-end">
        {isLastQuestion ? (
          <Button onClick={finishQuiz} className="gap-2">
            Lihat Hasil
            <ArrowRight size={16} />
          </Button>
        ) : (
          <Button onClick={nextQuestion} className="gap-2">
            Soal Berikutnya
            <ArrowRight size={16} />
          </Button>
        )}
      </div>
    </div>
  );
}
