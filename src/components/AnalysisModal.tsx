"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import QRCode from "qrcode";
import type { AnalyzeResponse } from "@/types";
import PerfumeCard from "./PerfumeCard";

interface Props {
  visible: boolean;
  result: AnalyzeResponse | null;
  onClose: () => void;
}

const SCAN_TEXTS = [
  "Reading brainwaves...",
  "Analyzing neural patterns...",
  "Mapping emotional landscape...",
  "Composing your formula...",
];

export default function AnalysisModal({ visible, result, onClose }: Props) {
  const [scanIndex, setScanIndex] = useState(0);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!visible || result) return;
    setScanIndex(0);
    const timer = setInterval(() => {
      setScanIndex((prev) => (prev + 1) % SCAN_TEXTS.length);
    }, 900);
    return () => clearInterval(timer);
  }, [visible, result]);

  // Reset state when modal opens for a new analysis
  useEffect(() => {
    if (visible && !result) {
      setUserName("");
      setUserEmail("");
      setQrDataUrl(null);
      setResultUrl(null);
      setError("");
    }
  }, [visible, result]);

  const handleGenerateQR = useCallback(async () => {
    if (!result) return;

    if (!userName.trim()) {
      setError("Please enter your name");
      return;
    }
    if (!userEmail.trim()) {
      setError("Please enter your email");
      return;
    }

    setError("");
    setSaving(true);

    try {
      const res = await fetch("/api/save-result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          perfume_name: result.perfume_name,
          ingredients: result.ingredients,
          user_name: userName.trim(),
          user_email: userEmail.trim(),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to save");
      }

      const data = await res.json();
      setResultUrl(data.url);

      const dataUrl = await QRCode.toDataURL(data.url, {
        width: 200,
        margin: 2,
        color: { dark: "#3D2B1F", light: "#FFFFFF" },
      });
      setQrDataUrl(dataUrl);
    } catch (e: any) {
      setError(e?.message || "Failed to generate QR code");
    } finally {
      setSaving(false);
    }
  }, [result, userName, userEmail]);

  if (!visible) return null;

  const sortedIngredients = result
    ? [...result.ingredients].sort((a, b) => {
        const order = { top: 0, middle: 1, base: 2 };
        return order[a.note] - order[b.note];
      })
    : [];

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    fontSize: 14,
    border: "1px solid #E0D8CC",
    borderRadius: 8,
    background: "#FDFBF7",
    color: "var(--text-primary)",
    fontFamily: "var(--font)",
    outline: "none",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(61, 43, 31, 0.6)",
        backdropFilter: "blur(8px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 25 }}
        style={{
          background: "var(--card-bg)",
          borderRadius: 16,
          padding: "48px 40px",
          maxWidth: 460,
          width: "90%",
          maxHeight: "85vh",
          overflowY: "auto",
          position: "relative",
        }}
      >
        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ textAlign: "center", padding: "40px 0" }}
            >
              <div
                style={{
                  position: "relative",
                  width: 120,
                  height: 120,
                  margin: "0 auto 32px",
                }}
              >
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: "50%",
                      border: "2px solid var(--accent)",
                      opacity: 0,
                      animation: `pulse 2.4s ease-out ${i * 0.8}s infinite`,
                    }}
                  />
                ))}
                <div
                  style={{
                    position: "absolute",
                    inset: "30%",
                    borderRadius: "50%",
                    background: "var(--accent)",
                    opacity: 0.2,
                    animation: "glow 1.2s ease-in-out infinite alternate",
                  }}
                />
              </div>
              <p
                style={{
                  fontSize: 14,
                  color: "var(--text-secondary)",
                  minHeight: 20,
                }}
              >
                {SCAN_TEXTS[scanIndex]}
              </p>
              <style>{`
                @keyframes pulse {
                  0% { transform: scale(0.5); opacity: 0.6; }
                  100% { transform: scale(1.8); opacity: 0; }
                }
                @keyframes glow {
                  0% { opacity: 0.15; transform: scale(0.9); }
                  100% { opacity: 0.35; transform: scale(1.1); }
                }
              `}</style>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Title */}
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
                  Your Neural Fragrance
                </p>
                <h2
                  style={{
                    fontSize: 28,
                    fontWeight: 300,
                    color: "var(--text-primary)",
                  }}
                >
                  {result.perfume_name}
                </h2>
              </div>

              {/* Ingredients */}
              <div>
                {sortedIngredients.map((ing, i) => (
                  <motion.div
                    key={ing.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <PerfumeCard ingredient={ing} />
                  </motion.div>
                ))}
              </div>

              {/* User info & QR code section */}
              <div
                style={{
                  marginTop: 28,
                  padding: 20,
                  background: "#FDFBF7",
                  borderRadius: 12,
                }}
              >
                <p
                  style={{
                    fontSize: 12,
                    textTransform: "uppercase",
                    letterSpacing: 1.5,
                    color: "var(--text-secondary)",
                    marginBottom: 16,
                  }}
                >
                  Save & Share
                </p>

                <div style={{ marginBottom: 12 }}>
                  <input
                    type="text"
                    placeholder="Your name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    disabled={!!qrDataUrl}
                    style={inputStyle}
                  />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <input
                    type="email"
                    placeholder="Your email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    disabled={!!qrDataUrl}
                    style={inputStyle}
                  />
                </div>

                {error && (
                  <p style={{ fontSize: 13, color: "#C44", marginBottom: 12 }}>
                    {error}
                  </p>
                )}

                {!qrDataUrl ? (
                  <button
                    onClick={handleGenerateQR}
                    disabled={saving}
                    style={{
                      width: "100%",
                      padding: "12px",
                      fontSize: 14,
                      fontWeight: 400,
                      letterSpacing: 0.5,
                      background: saving ? "#D5CBBB" : "var(--accent)",
                      color: "#fff",
                      borderRadius: 8,
                      transition: "background 0.2s",
                    }}
                  >
                    {saving ? "Generating..." : "Generate QR Code"}
                  </button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{ textAlign: "center" }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={qrDataUrl}
                      alt="QR Code"
                      style={{
                        width: 200,
                        height: 200,
                        margin: "0 auto 12px",
                        display: "block",
                        borderRadius: 8,
                      }}
                    />
                    <p
                      style={{
                        fontSize: 12,
                        color: "var(--text-secondary)",
                        marginBottom: 8,
                      }}
                    >
                      Scan to view your fragrance
                    </p>
                    {resultUrl && (
                      <a
                        href={resultUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: 12,
                          color: "var(--accent)",
                          textDecoration: "underline",
                          wordBreak: "break-all",
                        }}
                      >
                        {resultUrl}
                      </a>
                    )}
                  </motion.div>
                )}
              </div>

              {/* Close */}
              <div style={{ textAlign: "center", marginTop: 24 }}>
                <button
                  onClick={onClose}
                  style={{
                    padding: "10px 32px",
                    fontSize: 13,
                    color: "var(--text-secondary)",
                    background: "var(--bg)",
                    borderRadius: 8,
                    transition: "background 0.2s",
                  }}
                >
                  Close
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
