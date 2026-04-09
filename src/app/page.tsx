"use client";

import { useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import UploadZone from "@/components/UploadZone";
import EEGChart from "@/components/EEGChart";
import ChannelSelector from "@/components/ChannelSelector";
import AnalyzeButton from "@/components/AnalyzeButton";
import AnalysisModal from "@/components/AnalysisModal";
import type { EEGStream, AnalyzeResponse } from "@/types";

type AppState = "upload" | "visualize";

export default function Home() {
  const [appState, setAppState] = useState<AppState>("upload");
  const [uploading, setUploading] = useState(false);
  const [filename, setFilename] = useState<string>("");
  const [stream, setStream] = useState<EEGStream | null>(null);
  const [selectedChannels, setSelectedChannels] = useState<Set<string>>(
    new Set()
  );

  const [modalVisible, setModalVisible] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);

  const handleUpload = useCallback(async (file: File) => {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Upload failed");
      }
      const data = await res.json();
      setFilename(file.name);
      const firstStream = data.streams[0];
      setStream(firstStream);
      setSelectedChannels(new Set(firstStream.ch_names));
      setAppState("visualize");
    } catch (e: any) {
      alert(e?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }, []);

  const handleAnalyze = useCallback(async () => {
    setResult(null);
    setModalVisible(true);
    setAnalyzing(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Analysis failed");
      }
      const data: AnalyzeResponse = await res.json();
      setResult(data);
    } catch (e: any) {
      alert(e?.message || "Analysis failed");
      setModalVisible(false);
    } finally {
      setAnalyzing(false);
    }
  }, [filename]);

  const toggleChannel = (ch: string) => {
    setSelectedChannels((prev) => {
      const next = new Set(prev);
      if (next.has(ch)) next.delete(ch);
      else next.add(ch);
      return next;
    });
  };

  const selectAll = () => {
    if (stream) setSelectedChannels(new Set(stream.ch_names));
  };

  const deselectAll = () => setSelectedChannels(new Set());

  if (appState === "upload") {
    return <UploadZone onUpload={handleUpload} loading={uploading} />;
  }

  return (
    <div style={{ padding: 24, minHeight: "100vh" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 300, letterSpacing: 1 }}>
            MindViz
          </h1>
          {stream && (
            <p
              style={{
                fontSize: 12,
                color: "var(--text-secondary)",
                marginTop: 4,
              }}
            >
              {stream.name} &middot; {stream.ch_names.length} channels &middot;{" "}
              {stream.srate} Hz &middot; {stream.duration}s
            </p>
          )}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            onClick={() => {
              setAppState("upload");
              setStream(null);
              setFilename("");
              setSelectedChannels(new Set());
              setResult(null);
              setModalVisible(false);
            }}
            style={{
              padding: "6px 16px",
              fontSize: 13,
              border: "1px solid #E0D8CC",
              borderRadius: "var(--radius)",
              background: "transparent",
              color: "#8B7355",
              cursor: "pointer",
            }}
          >
            &larr; Re-upload
          </button>
          <AnalyzeButton onClick={handleAnalyze} disabled={analyzing} />
        </div>
      </div>

      <div style={{ display: "flex", gap: 16 }}>
        {stream && (
          <>
            <ChannelSelector
              channels={stream.ch_names}
              selected={selectedChannels}
              onToggle={toggleChannel}
              onSelectAll={selectAll}
              onDeselectAll={deselectAll}
            />
            <EEGChart stream={stream} selectedChannels={selectedChannels} />
          </>
        )}
      </div>

      <AnimatePresence>
        {modalVisible && (
          <AnalysisModal
            visible={modalVisible}
            result={result}
            onClose={() => setModalVisible(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
