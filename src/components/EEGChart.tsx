"use client";

import { useState } from "react";
import ReactECharts from "echarts-for-react";
import type { EEGStream } from "@/types";

const CHANNEL_COLORS = [
  "#C97B6B", "#7BA68C", "#6B8FC9", "#C9A46B", "#9B6BC9",
  "#6BC9B8", "#C96B8F", "#8BC96B", "#C9836B", "#6B7EC9",
  "#B8C96B", "#6BC9C9", "#C96B6B", "#6BC96B", "#C9C96B",
  "#6B6BC9",
];

type DisplayMode = "overlay" | "split";

interface Props {
  stream: EEGStream;
  selectedChannels: Set<string>;
}

export default function EEGChart({ stream, selectedChannels }: Props) {
  const [mode, setMode] = useState<DisplayMode>("overlay");
  const { ch_names, data, srate } = stream;

  const visibleIndices = ch_names
    .map((name, i) => ({ name, i }))
    .filter((c) => selectedChannels.has(c.name));

  const nSamples = data[0]?.length ?? 0;
  const xData = Array.from({ length: nSamples }, (_, i) =>
    (i / srate).toFixed(2)
  );
  const defaultZoomEnd = Math.min(100, ((5 * srate) / nSamples) * 100);

  const toggleBtn = (
    <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
      {(["overlay", "split"] as const).map((m) => (
        <button
          key={m}
          onClick={() => setMode(m)}
          style={{
            padding: "4px 14px",
            fontSize: 12,
            border: "1px solid #E0D8CC",
            borderRadius: "var(--radius)",
            background: mode === m ? "#C9A96E" : "transparent",
            color: mode === m ? "#fff" : "#8B7355",
            cursor: "pointer",
            fontWeight: mode === m ? 600 : 400,
          }}
        >
          {m === "overlay" ? "Overlay" : "Split"}
        </button>
      ))}
    </div>
  );

  if (mode === "split") {
    return (
      <div
        style={{
          flex: 1,
          background: "var(--card-bg)",
          borderRadius: "var(--radius)",
          boxShadow: "var(--card-shadow)",
          padding: "16px",
        }}
      >
        {toggleBtn}
        <div
          style={{
            height: "calc(100vh - 240px)",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {visibleIndices.map(({ name, i }, colorIdx) => {
            const color = CHANNEL_COLORS[colorIdx % CHANNEL_COLORS.length];
            const option = {
              animation: false,
              backgroundColor: "transparent",
              tooltip: {
                trigger: "axis" as const,
                axisPointer: { type: "cross" as const },
                textStyle: { fontSize: 11 },
              },
              legend: { show: false },
              grid: { left: 60, right: 24, top: 20, bottom: 20 },
              xAxis: {
                type: "category" as const,
                data: xData,
                axisLabel: {
                  fontSize: 10,
                  color: "#8B7355",
                  formatter: (v: string) => `${parseFloat(v).toFixed(1)}s`,
                },
                axisLine: { lineStyle: { color: "#E0D8CC" } },
              },
              yAxis: {
                type: "value" as const,
                min: -0.0002,
                max: 0.0002,
                axisLabel: { fontSize: 10, color: "#8B7355" },
                splitLine: { lineStyle: { color: "#F0EBE0" } },
                axisLine: { lineStyle: { color: "#E0D8CC" } },
                name,
                nameTextStyle: {
                  fontSize: 11,
                  color,
                  fontWeight: "bold" as const,
                },
              },
              dataZoom: [{ type: "inside" as const, xAxisIndex: 0 }],
              series: [
                {
                  name,
                  type: "line" as const,
                  data: data[i],
                  showSymbol: false,
                  lineStyle: { width: 1 },
                  color,
                  sampling: "lttb" as const,
                  large: true,
                  largeThreshold: 1000,
                },
              ],
            };

            return (
              <div
                key={name}
                style={{
                  borderRadius: "var(--radius)",
                  border: "1px solid #F0EBE0",
                  padding: "4px 0",
                }}
              >
                <ReactECharts
                  option={option}
                  style={{ height: 120, width: "100%" }}
                  notMerge
                  lazyUpdate
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Overlay mode
  const series = visibleIndices.map(({ name, i }, colorIdx) => ({
    name,
    type: "line" as const,
    data: data[i],
    showSymbol: false,
    lineStyle: { width: 1 },
    color: CHANNEL_COLORS[colorIdx % CHANNEL_COLORS.length],
    sampling: "lttb" as const,
    large: true,
    largeThreshold: 1000,
  }));

  const option = {
    animation: false,
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis" as const,
      axisPointer: { type: "cross" as const },
      textStyle: { fontSize: 11 },
    },
    legend: { show: false },
    grid: { left: 60, right: 24, top: 16, bottom: 80 },
    xAxis: {
      type: "category" as const,
      data: xData,
      axisLabel: {
        fontSize: 11,
        color: "#8B7355",
        formatter: (v: string) => `${parseFloat(v).toFixed(1)}s`,
      },
      axisLine: { lineStyle: { color: "#E0D8CC" } },
    },
    yAxis: {
      type: "value" as const,
      min: -0.0002,
      max: 0.0002,
      axisLabel: { fontSize: 11, color: "#8B7355" },
      splitLine: { lineStyle: { color: "#F0EBE0" } },
      axisLine: { lineStyle: { color: "#E0D8CC" } },
      name: "Volts",
      nameTextStyle: { fontSize: 11, color: "#8B7355" },
    },
    dataZoom: [
      {
        type: "slider" as const,
        xAxisIndex: 0,
        start: 0,
        end: defaultZoomEnd,
        height: 24,
        bottom: 12,
        borderColor: "#E0D8CC",
        fillerColor: "rgba(201,169,110,0.15)",
        handleStyle: { color: "#C9A96E" },
        textStyle: { color: "#8B7355" },
      },
      { type: "inside" as const, xAxisIndex: 0 },
      { type: "inside" as const, yAxisIndex: 0, orient: "vertical" as const },
    ],
    series,
  };

  return (
    <div
      style={{
        flex: 1,
        background: "var(--card-bg)",
        borderRadius: "var(--radius)",
        boxShadow: "var(--card-shadow)",
        padding: "16px",
      }}
    >
      {toggleBtn}
      <ReactECharts
        option={option}
        style={{ height: "calc(100vh - 240px)", width: "100%" }}
        notMerge
        lazyUpdate
      />
    </div>
  );
}
