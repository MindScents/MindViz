"use client";

import { useState, useRef, type DragEvent } from "react";

interface Props {
  onUpload: (file: File) => void;
  loading: boolean;
}

export default function UploadZone({ onUpload, loading }: Props) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith(".xdf")) {
      onUpload(file);
    }
  }

  function handleSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
      }}
    >
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        style={{
          width: 480,
          padding: "64px 48px",
          background: "var(--card-bg)",
          borderRadius: "var(--radius)",
          boxShadow: "var(--card-shadow)",
          border: dragging
            ? "2px dashed var(--accent)"
            : "2px dashed transparent",
          textAlign: "center",
          cursor: "pointer",
          transition: "border-color 0.2s ease",
        }}
      >
        {loading ? (
          <>
            <div style={{ fontSize: 32, marginBottom: 16 }}>...</div>
            <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
              Uploading & parsing EEG data...
            </p>
          </>
        ) : (
          <>
            <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>
              &#x1F9E0;
            </div>
            <h2 style={{ marginBottom: 8, fontSize: 20, fontWeight: 400 }}>
              MindViz
            </h2>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: 14,
                marginBottom: 24,
              }}
            >
              Drag & drop your .xdf EEG file here, or click to browse
            </p>
            <div
              style={{
                display: "inline-block",
                padding: "10px 28px",
                background: "var(--accent)",
                color: "#fff",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 400,
              }}
            >
              Select File
            </div>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept=".xdf"
          onChange={handleSelect}
          style={{ display: "none" }}
        />
      </div>
    </div>
  );
}
