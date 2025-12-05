import { NextResponse } from "next/server";

export function dbErrorResponse(logMessage: string, error: any) {
  console.error(logMessage, error);
  return NextResponse.json(
    { message: "Database connection error. Please try again later." },
    { status: 500 }
  );
}
