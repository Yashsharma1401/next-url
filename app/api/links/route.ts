import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidCode, isValidUrl } from "@/lib/validate";

export async function GET() {
  const links = await prisma.link.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(links);
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);

    if (!body) {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { url, code } = body as { url?: string; code?: string };

    if (!url || !isValidUrl(url)) {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    // Normalize code to lowercase for consistency
    const normalizedCode = code?.toLowerCase();

    if (normalizedCode && !isValidCode(normalizedCode)) {
      return NextResponse.json({ error: "Invalid code format" }, { status: 400 });
    }

    // check code uniqueness
    if (normalizedCode) {
      const exists = await prisma.link.findUnique({ where: { code: normalizedCode } });
      if (exists) {
        return NextResponse.json({ error: "Code already exists" }, { status: 409 });
      }
    }

    // generate code if not provided (7 characters by default)
    const random = () =>
      [...Array(7)]
        .map(() =>
          "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"[
            Math.floor(Math.random() * 62)
          ]
        )
        .join("")
        .toLowerCase();

    let newCode = normalizedCode ?? random();

    // avoid infinite loop in unlikely collision
    for (let i = 0; i < 10 && (await prisma.link.findUnique({ where: { code: newCode } })); i++) {
      newCode = random();
    }

    const link = await prisma.link.create({
      data: {
        code: newCode,
        url,
      },
    });

    return NextResponse.json(link, { status: 201 });
  } catch (error) {
    console.error("/api/links POST error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
