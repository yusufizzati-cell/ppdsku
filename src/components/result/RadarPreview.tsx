"use client";

import { TopicAbility } from "@/engine/irt";

interface RadarPreviewProps {
  topicAbilities: Map<string, TopicAbility>;
}

export function RadarPreview({ topicAbilities }: RadarPreviewProps) {
  const topics = Array.from(topicAbilities.values()).filter(
    (a) => a.answeredCount > 0
  );

  if (topics.length < 3) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-navy-400">
        Perlu minimal 3 topik untuk menampilkan radar chart.
      </div>
    );
  }

  // Simple SVG radar chart
  const cx = 150;
  const cy = 150;
  const maxR = 120;
  const levels = 5;
  const n = topics.length;
  const angleStep = (2 * Math.PI) / n;

  // Grid lines
  const gridLines = [];
  for (let l = 1; l <= levels; l++) {
    const r = (maxR / levels) * l;
    const points = [];
    for (let i = 0; i < n; i++) {
      const angle = angleStep * i - Math.PI / 2;
      points.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
    }
    gridLines.push(points.join(" "));
  }

  // Axis lines
  const axes = topics.map((_, i) => {
    const angle = angleStep * i - Math.PI / 2;
    return {
      x2: cx + maxR * Math.cos(angle),
      y2: cy + maxR * Math.sin(angle),
    };
  });

  // Data polygon
  const dataPoints = topics.map((t, i) => {
    const val = Math.max(0, Math.min(100, t.percent)) / 100;
    const r = val * maxR;
    const angle = angleStep * i - Math.PI / 2;
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
  });

  // Labels
  const labels = topics.map((t, i) => {
    const angle = angleStep * i - Math.PI / 2;
    const labelR = maxR + 20;
    return {
      x: cx + labelR * Math.cos(angle),
      y: cy + labelR * Math.sin(angle),
      text: t.topic.length > 12 ? t.topic.slice(0, 12) + "…" : t.topic,
    };
  });

  return (
    <div className="flex justify-center">
      <svg viewBox="0 0 300 300" className="h-64 w-64 sm:h-72 sm:w-72">
        {/* Grid */}
        {gridLines.map((points, i) => (
          <polygon
            key={i}
            points={points}
            fill="none"
            stroke="#E2E8F0"
            strokeWidth="1"
          />
        ))}

        {/* Axes */}
        {axes.map((axis, i) => (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={axis.x2}
            y2={axis.y2}
            stroke="#CBD5E1"
            strokeWidth="1"
          />
        ))}

        {/* Data */}
        <polygon
          points={dataPoints.join(" ")}
          fill="rgba(37, 99, 235, 0.15)"
          stroke="#2563EB"
          strokeWidth="2"
        />

        {/* Data points */}
        {topics.map((t, i) => {
          const val = Math.max(0, Math.min(100, t.percent)) / 100;
          const r = val * maxR;
          const angle = angleStep * i - Math.PI / 2;
          return (
            <circle
              key={i}
              cx={cx + r * Math.cos(angle)}
              cy={cy + r * Math.sin(angle)}
              r="4"
              fill="#2563EB"
            />
          );
        })}

        {/* Labels */}
        {labels.map((label, i) => (
          <text
            key={i}
            x={label.x}
            y={label.y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-navy-500 text-[9px]"
          >
            {label.text}
          </text>
        ))}
      </svg>
    </div>
  );
}
