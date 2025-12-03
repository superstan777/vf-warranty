import { NextRequest, NextResponse } from "next/server";

export function checkRequestAuth(req: NextRequest): NextResponse | null {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || authHeader !== `Bearer ${process.env.BOT_API_TOKEN}`) {
    return NextResponse.json(
      { success: false, reason: "UNAUTHORIZED" },
      { status: 200 }
    );
  }
  return null;
}
