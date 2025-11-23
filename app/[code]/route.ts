import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(_req: Request, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;
  const normalizedCode = code?.toLowerCase();

  console.log(`/[code] GET incoming: code=${code}, normalized=${normalizedCode}`);

  try {
    const link = await prisma.link.findUnique({ where: { code: normalizedCode } });

    console.log(`/[code] DB lookup for code=${normalizedCode}: ${link ? 'FOUND' : 'NOT FOUND'}`);

    if (!link) {
      console.warn(`/[code] returning 404 for code=${normalizedCode}`);
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.link.update({
      where: { code: normalizedCode },
      data: {
        clicks: { increment: 1 },
        lastClicked: new Date(),
      },
    });

    console.log(`/[code] incremented clicks for code=${normalizedCode}`);

    // Ensure the URL is absolute. If stored URL lacks protocol, default to https://
    let targetUrl = link.url;
    try {
      new URL(targetUrl);
    } catch {
      targetUrl = `https://${targetUrl}`;
      console.warn(`/[code] redirect: normalized URL for code=${normalizedCode} from ${link.url} to ${targetUrl}`);
    }

    // Redirect to the stored URL
    console.log(`/[code] redirecting code=${normalizedCode} to ${targetUrl}`);
    return NextResponse.redirect(targetUrl, 302);
  } catch (error) {
    console.error(`/[code] redirect error for code=${normalizedCode}:`, error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
