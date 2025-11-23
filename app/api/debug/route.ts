import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Debug endpoint - shows all links in DB
export async function GET() {
  try {
    const links = await prisma.link.findMany({
      select: { id: true, code: true, url: true, clicks: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      count: links.length,
      links,
    });
  } catch (error) {
    console.error("/api/debug error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
