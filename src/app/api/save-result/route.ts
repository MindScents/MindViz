import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { saveResult } from "@/lib/db";
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

  const id = randomUUID();
  const origin = request.headers.get("origin") || request.nextUrl.origin;

  await saveResult({
    id,
    perfume_name: body.perfume_name,
    ingredients: body.ingredients,
    user_name: body.user_name.trim(),
    user_email: body.user_email.trim(),
    created_at: new Date().toISOString(),
  });

  return NextResponse.json({
    id,
    url: `${origin}/result/${id}`,
  });
}
