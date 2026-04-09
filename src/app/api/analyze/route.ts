import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";

import { sessions } from "@/lib/sessions";

const INGREDIENTS = [
  { name: "Bergamot", note: "top" as const },
  { name: "Sweet Orange", note: "top" as const },
  { name: "Lavender", note: "middle" as const },
  { name: "Clary Sage", note: "middle" as const },
  { name: "Ylang-Ylang", note: "base" as const },
];

const PERFUME_NAMES = [
  "Neural Bloom", "Cortex Whisper", "Synapse Garden",
  "Theta Reverie", "Alpha Serenity", "Delta Drift",
  "Brainwave Bouquet", "Mindful Essence", "Cerebral Mist",
  "Neuron Nectar", "Pulse Petals", "Wave Harmony",
];

/** Simple seeded PRNG (mulberry32) */
function createRng(seed: number) {
  let s = seed | 0;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const sessionId = body.session_id;

  if (!sessionId || !sessions.has(sessionId)) {
    return NextResponse.json(
      { detail: "Invalid session" },
      { status: 400 }
    );
  }

  const { filename } = sessions.get(sessionId)!;

  // Deterministic seed from filename
  const hash = createHash("md5").update(filename).digest("hex");
  const seed = parseInt(hash.substring(0, 8), 16);
  const rng = createRng(seed);

  // Simulate processing delay
  const delay = 2000 + rng() * 1500;
  await new Promise((r) => setTimeout(r, delay));

  // Generate random percentages for all 5 ingredients, summing to 100
  const raw = INGREDIENTS.map(() => 10 + Math.floor(rng() * 25));
  const total = raw.reduce((a, b) => a + b, 0);
  const pcts = raw.map((r) => Math.round((r / total) * 100));
  pcts[pcts.length - 1] = 100 - pcts.slice(0, -1).reduce((a, b) => a + b, 0);

  const ingredients = INGREDIENTS.map((ing, i) => ({
    name: ing.name,
    percentage: pcts[i],
    note: ing.note,
  }));

  return NextResponse.json({
    perfume_name: PERFUME_NAMES[Math.floor(rng() * PERFUME_NAMES.length)],
    ingredients,
  });
}
