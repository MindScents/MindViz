import { getResult } from "@/lib/db";
import { notFound } from "next/navigation";
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

export default async function ResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const record = await getResult(id);

  if (!record) return notFound();

  const sorted = [...record.ingredients].sort((a, b) => {
    const order = { top: 0, middle: 1, base: 2 };
    return order[a.note] - order[b.note];
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
      }}
    >
      <div
        style={{
          background: "var(--card-bg)",
          borderRadius: 16,
          padding: "48px 40px",
          maxWidth: 480,
          width: "100%",
          boxShadow: "0 4px 32px rgba(0,0,0,0.06)",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <p
            style={{
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: 2,
              color: "var(--text-secondary)",
              marginBottom: 8,
            }}
          >
            Neural Fragrance
          </p>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 300,
              color: "var(--text-primary)",
              marginBottom: 16,
            }}
          >
            {record.perfume_name}
          </h1>
          <div
            style={{
              display: "inline-block",
              padding: "8px 20px",
              background: "var(--bg)",
              borderRadius: 20,
              fontSize: 13,
              color: "var(--text-secondary)",
            }}
          >
            Crafted for <strong style={{ fontWeight: 500 }}>{record.user_name}</strong>
          </div>
        </div>

        {/* Ingredients */}
        <div style={{ marginBottom: 32 }}>
          {sorted.map((ing: Ingredient) => (
            <div
              key={ing.name}
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
                  {ing.name}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: NOTE_COLORS[ing.note],
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  {NOTE_LABELS[ing.note]}
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
                      width: `${ing.percentage}%`,
                      height: "100%",
                      background: NOTE_COLORS[ing.note],
                      borderRadius: 3,
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
                {ing.percentage}%
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            textAlign: "center",
            fontSize: 12,
            color: "var(--text-secondary)",
            borderTop: "1px solid #F0EBE0",
            paddingTop: 20,
          }}
        >
          <p>MindViz &middot; EEG-to-Perfume</p>
          <p style={{ marginTop: 4, opacity: 0.6 }}>{record.user_email}</p>
        </div>
      </div>
    </div>
  );
}
