import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(_req: Request, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;

  try {
    const link = await prisma.link.findUnique({ where: { code } });
    if (!link) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.link.update({
      where: { code },
      data: {
        clicks: { increment: 1 },
        lastClicked: new Date(),
      },
    });

    return NextResponse.redirect(link.url, 302);
  } catch (error) {
    console.error("/api/[code] redirect error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
