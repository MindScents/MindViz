import { notFound } from "next/navigation";
import { getResult } from "@/lib/db";
import { INGREDIENT_INFO } from "@/lib/ingredients";
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
          maxWidth: "min(90vw, 560px)",
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
            Crafted for{" "}
            <strong style={{ fontWeight: 500 }}>{record.user_name}</strong>
          </div>
        </div>

        {/* Ingredients */}
        <div style={{ marginBottom: 24 }}>
          {sorted.map((ing: Ingredient) => {
            const info = INGREDIENT_INFO[ing.name];
            return (
              <div
                key={ing.name}
                style={{
                  padding: "16px 20px",
                  background: "#FDFBF7",
                  borderRadius: 10,
                  marginBottom: 8,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 400,
                        marginBottom: 2,
                      }}
                    >
                      {ing.name}
                      {info && (
                        <span
                          style={{
                            fontSize: 12,
                            color: NOTE_COLORS[ing.note],
                            marginLeft: 8,
                            fontWeight: 300,
                            fontStyle: "italic",
                          }}
                        >
                          {info.subtitle}
                        </span>
                      )}
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
                {info && (
                  <p
                    style={{
                      fontSize: 12,
                      lineHeight: 1.6,
                      color: "var(--text-secondary)",
                      marginTop: 8,
                    }}
                  >
                    {info.description}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Fragrance Structure & Functional Design */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            marginBottom: 32,
          }}
        >
          <div
            style={{
              padding: 16,
              background: "#FDFBF7",
              borderRadius: 10,
            }}
          >
            <p
              style={{
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: 1.2,
                color: "var(--text-secondary)",
                marginBottom: 10,
                fontWeight: 500,
              }}
            >
              Fragrance Structure
            </p>
            <div
              style={{
                fontSize: 12,
                lineHeight: 2,
                color: "var(--text-primary)",
              }}
            >
              <div>
                <span style={{ color: "#E8C47C", fontWeight: 500 }}>Top:</span>{" "}
                Bergamot, Sweet Orange
              </div>
              <div>
                <span style={{ color: "#C9A46B", fontWeight: 500 }}>
                  Heart:
                </span>{" "}
                Lavender, Clary Sage
              </div>
              <div>
                <span style={{ color: "#8B7355", fontWeight: 500 }}>
                  Base:
                </span>{" "}
                Ylang-Ylang
              </div>
            </div>
          </div>
          <div
            style={{
              padding: 16,
              background: "#FDFBF7",
              borderRadius: 10,
            }}
          >
            <p
              style={{
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: 1.2,
                color: "var(--text-secondary)",
                marginBottom: 10,
                fontWeight: 500,
              }}
            >
              Functional Design
            </p>
            <div
              style={{
                fontSize: 12,
                lineHeight: 2,
                color: "var(--text-primary)",
              }}
            >
              <div>Citrus notes &rarr; reduce mental tension</div>
              <div>Lavender &amp; sage &rarr; parasympathetic activation</div>
              <div>Ylang-ylang &rarr; stabilize emotional baseline</div>
            </div>
          </div>
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
