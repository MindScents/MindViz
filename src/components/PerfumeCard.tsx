"use client";

import type { Ingredient } from "@/types";

const NOTE_LABELS: Record<string, string> = {
  top: "Top Note",
  middle: "Middle Note",
  base: "Base Note",
};

const NOTE_COLORS: Record<string, string> = {
  top: "#E8C47C",
  middle: "#C9A46B",
  base: "#8B7355",
};

interface Props {
  ingredient: Ingredient;
}

export default function PerfumeCard({ ingredient }: Props) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "16px 20px",
        background: "#FDFBF7",
        borderRadius: 10,
        marginBottom: 8,
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 400, marginBottom: 4 }}>
          {ingredient.name}
        </div>
        <div
          style={{
            fontSize: 11,
            color: NOTE_COLORS[ingredient.note],
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          {NOTE_LABELS[ingredient.note]}
        </div>
      </div>
      <div style={{ width: 120, marginRight: 12 }}>
        <div
          style={{
            height: 6,
            background: "#F0EBE0",
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${ingredient.percentage}%`,
              height: "100%",
              background: NOTE_COLORS[ingredient.note],
              borderRadius: 3,
              transition: "width 0.8s ease",
            }}
          />
        </div>
      </div>
      <div
        style={{
          fontSize: 14,
          fontWeight: 400,
          color: "var(--text-secondary)",
          minWidth: 36,
          textAlign: "right",
        }}
      >
        {ingredient.percentage}%
      </div>
    </div>
  );
}
