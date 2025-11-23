import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  context: { params: Promise<{ code: string }> }
) {
  const { code } = await context.params;
  const normalizedCode = code?.toLowerCase();

  try {
    const link = await prisma.link.findUnique({ where: { code: normalizedCode } });
    if (!link) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(link);
  } catch (error) {
    console.error(`/api/links/[code] GET error for code=${normalizedCode}:`, error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ code: string }> }
) {
  const { code } = await context.params;
  const normalizedCode = code?.toLowerCase();
  try {
    const result = await prisma.link.deleteMany({ where: { code: normalizedCode } });
    if (result.count === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    console.info(`/api/links/[code] deleted code=${normalizedCode} (count=${result.count})`);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(`/api/links/[code] DELETE error for code=${normalizedCode}:`, error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
