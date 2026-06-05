"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { ExtractedQuestionRow } from "@/lib/extraction";

type Question = ExtractedQuestionRow;

interface ReviewQuestionCardProps {
  question: Question;
}

function statusVariant(status: string) {
  if (status === "approved") return "success";
  if (status === "rejected") return "danger";
  if (status === "edited") return "warning";
  return "default";
}

function confidenceVariant(confidence: number) {
  if (confidence >= 0.8) return "success";
  if (confidence >= 0.5) return "warning";
  return "danger";
}

export function ReviewQuestionCard({ question }: ReviewQuestionCardProps) {
  const [item, setItem] = useState<Question>(question);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    question_text: item.question_text,
    answer_key: item.answer_key ?? "",
    topic: item.topic ?? "",
    subtopic: item.subtopic ?? "",
    explanation: item.explanation ?? "",
    options: {
      A: item.options?.A ?? "",
      B: item.options?.B ?? "",
      C: item.options?.C ?? "",
      D: item.options?.D ?? "",
      E: item.options?.E ?? "",
    },
  });

  const saveEdit = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/extracted-questions/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question_text: form.question_text,
          answer_key: form.answer_key || null,
          topic: form.topic || null,
          subtopic: form.subtopic || null,
          explanation: form.explanation || null,
          options: form.options,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message ?? "Gagal menyimpan edit.");
      }
      setItem(data.data.question);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setIsSaving(false);
    }
  };

  const updateStatus = async (action: "approve" | "reject") => {
    setIsSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/extracted-questions/${item.id}/${action}`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message ?? "Gagal update status.");
      }
      setItem(data.data.question);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-soft">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Badge variant="info">No. {item.question_number ?? "-"}</Badge>
        <Badge variant={statusVariant(item.review_status)}>
          {item.review_status}
        </Badge>
        <Badge variant={confidenceVariant(item.confidence)}>
          confidence {Math.round(item.confidence * 100)}%
        </Badge>
        {item.answer_key ? (
          <Badge variant="success">jawaban {item.answer_key}</Badge>
        ) : (
          <Badge variant="warning">tanpa kunci</Badge>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <label className="block text-sm font-medium text-navy-700">
            Pertanyaan
            <textarea
              className="mt-1 w-full rounded-xl border border-navy-200 p-3 text-sm"
              rows={5}
              value={form.question_text}
              onChange={(e) =>
                setForm({ ...form, question_text: e.target.value })
              }
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            {(["A", "B", "C", "D", "E"] as const).map((key) => (
              <label key={key} className="block text-sm font-medium text-navy-700">
                Opsi {key}
                <input
                  className="mt-1 w-full rounded-xl border border-navy-200 p-2 text-sm"
                  value={form.options[key]}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      options: { ...form.options, [key]: e.target.value },
                    })
                  }
                />
              </label>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <label className="block text-sm font-medium text-navy-700">
              Jawaban
              <select
                className="mt-1 w-full rounded-xl border border-navy-200 p-2 text-sm"
                value={form.answer_key}
                onChange={(e) =>
                  setForm({ ...form, answer_key: e.target.value })
                }
              >
                <option value="">Tidak ada</option>
                {(["A", "B", "C", "D", "E"] as const).map((key) => (
                  <option key={key} value={key}>{key}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium text-navy-700">
              Topik
              <input
                className="mt-1 w-full rounded-xl border border-navy-200 p-2 text-sm"
                value={form.topic}
                onChange={(e) => setForm({ ...form, topic: e.target.value })}
              />
            </label>
            <label className="block text-sm font-medium text-navy-700">
              Subtopik
              <input
                className="mt-1 w-full rounded-xl border border-navy-200 p-2 text-sm"
                value={form.subtopic}
                onChange={(e) => setForm({ ...form, subtopic: e.target.value })}
              />
            </label>
          </div>

          <div className="flex gap-2">
            <Button onClick={saveEdit} disabled={isSaving}>Simpan</Button>
            <Button variant="secondary" onClick={() => setIsEditing(false)}>
              Batal
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="whitespace-pre-wrap text-sm leading-6 text-navy-800">
            {item.question_text}
          </p>
          <div className="space-y-2">
            {Object.entries(item.options ?? {}).map(([key, value]) => (
              <div key={key} className="rounded-xl bg-navy-50 p-3 text-sm">
                <span className="font-semibold text-navy-700">{key}. </span>
                <span className="text-navy-600">{value}</span>
              </div>
            ))}
          </div>
          {(item.topic || item.subtopic) && (
            <p className="text-xs text-navy-400">
              {item.topic ?? "Tanpa topik"} {item.subtopic ? `· ${item.subtopic}` : ""}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => updateStatus("approve")} disabled={isSaving}>
              Approve
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
            <Button size="sm" variant="danger" onClick={() => updateStatus("reject")} disabled={isSaving}>
              Reject
            </Button>
          </div>
        </div>
      )}

      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
    </div>
  );
}
