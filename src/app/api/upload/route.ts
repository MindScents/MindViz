import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";

import { sessions } from "@/lib/sessions";
import { parseXdf } from "@/lib/parse-xdf";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file || !file.name.endsWith(".xdf")) {
    return NextResponse.json(
      { detail: "Only .xdf files are accepted" },
      { status: 400 }
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const streams = parseXdf(buffer);

    if (!streams || streams.length === 0) {
      return NextResponse.json(
        { detail: "No EEG streams found in file" },
        { status: 400 }
      );
    }

    const sessionId = randomUUID();
    sessions.set(sessionId, { filename: file.name });

    return NextResponse.json({ session_id: sessionId, streams });
  } catch (e: any) {
    return NextResponse.json(
      { detail: `Failed to parse XDF: ${e.message}` },
      { status: 400 }
    );
  }
}
