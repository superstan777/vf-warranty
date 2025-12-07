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

export function dbErrorResponse(logMessage: string, error: unknown) {
  console.error(logMessage, error);
  return NextResponse.json(
    { message: "Database connection error. Please try again later." },
    { status: 500 }
  );
}
