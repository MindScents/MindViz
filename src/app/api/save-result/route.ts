import { NextRequest, NextResponse } from "next/server";
import type { SaveResultRequest } from "@/types";

export async function POST(request: NextRequest) {
  const body: SaveResultRequest = await request.json();

  if (!body.user_name?.trim() || !body.user_email?.trim()) {
    return NextResponse.json(
      { detail: "Name and email are required" },
      { status: 400 }
    );
  }

  if (!body.perfume_name || !body.ingredients?.length) {
    return NextResponse.json(
      { detail: "Perfume data is required" },
      { status: 400 }
    );
  }

  // Encode all data into the URL itself — no database needed, links never expire
  const payload = JSON.stringify({
    p: body.perfume_name,
    i: body.ingredients.map((ing) => ({
      n: ing.name,
      v: ing.percentage,
      t: ing.note,
    })),
    u: body.user_name.trim(),
    e: body.user_email.trim(),
  });

  const id = Buffer.from(payload).toString("base64url");
  const origin = request.headers.get("origin") || request.nextUrl.origin;

  return NextResponse.json({
    id,
    url: `${origin}/result/${id}`,
  });
}
