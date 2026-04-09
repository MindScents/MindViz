"use client";

interface Props {
  channels: string[];
  selected: Set<string>;
  onToggle: (ch: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

export default function ChannelSelector({
  channels,
  selected,
  onToggle,
  onSelectAll,
  onDeselectAll,
}: Props) {
  return (
    <div
      style={{
        width: 200,
        padding: "20px 16px",
        background: "var(--card-bg)",
        borderRadius: "var(--radius)",
        boxShadow: "var(--card-shadow)",
        overflowY: "auto",
        maxHeight: "calc(100vh - 160px)",
      }}
    >
      <h3
        style={{
          fontSize: 13,
          color: "var(--text-secondary)",
          marginBottom: 12,
          textTransform: "uppercase",
          letterSpacing: 1,
        }}
      >
        Channels
      </h3>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button
          onClick={onSelectAll}
          style={{
            flex: 1,
            padding: "4px 0",
            fontSize: 11,
            background: "var(--bg)",
            borderRadius: 6,
            color: "var(--text-secondary)",
          }}
        >
          All
        </button>
        <button
          onClick={onDeselectAll}
          style={{
            flex: 1,
            padding: "4px 0",
            fontSize: 11,
            background: "var(--bg)",
            borderRadius: 6,
            color: "var(--text-secondary)",
          }}
        >
          None
        </button>
      </div>
      {channels.map((ch) => (
        <label
          key={ch}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 0",
            fontSize: 13,
            cursor: "pointer",
            color: selected.has(ch)
              ? "var(--text-primary)"
              : "var(--text-secondary)",
          }}
        >
          <input
            type="checkbox"
            checked={selected.has(ch)}
            onChange={() => onToggle(ch)}
            style={{ accentColor: "var(--accent)" }}
          />
          {ch}
        </label>
      ))}
    </div>
  );
}
