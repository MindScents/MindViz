import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MindViz",
  description: "EEG-to-Perfume Visualizer",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
