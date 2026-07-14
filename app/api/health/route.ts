import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const rule = await prisma.ruleRecord.findFirst({
      select: { id: true }
    });

    if (!rule) {
      return NextResponse.json(
        { status: "error" },
        {
          status: 503,
          headers: {
            "Cache-Control": "no-store"
          }
        }
      );
    }

    return NextResponse.json(
      { status: "ok" },
      {
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  } catch {
    return NextResponse.json(
      { status: "error" },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  }
}
