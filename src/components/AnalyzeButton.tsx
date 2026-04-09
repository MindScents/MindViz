"use client";

interface Props {
  onClick: () => void;
  disabled: boolean;
}

export default function AnalyzeButton({ onClick, disabled }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "14px 40px",
        fontSize: 15,
        fontWeight: 400,
        letterSpacing: 1,
        background: disabled ? "#D5CBBB" : "var(--accent)",
        color: "#fff",
        borderRadius: 10,
        transition: "background 0.2s ease, transform 0.1s ease",
        boxShadow: disabled
          ? "none"
          : "0 4px 16px rgba(201,169,110,0.3)",
      }}
      onMouseEnter={(e) => {
        if (!disabled)
          (e.target as HTMLElement).style.background = "var(--accent-hover)";
      }}
      onMouseLeave={(e) => {
        if (!disabled)
          (e.target as HTMLElement).style.background = "var(--accent)";
      }}
    >
      Analyze
    </button>
  );
}
