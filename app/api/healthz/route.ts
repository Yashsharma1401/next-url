// app/healthz/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  try {
    return NextResponse.json({ ok: true, version: "1.0" });
  } catch (error) {
    console.error("/api/healthz error:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
