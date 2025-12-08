import { NextResponse, NextRequest } from "next/server";
import type { ApiResponse } from "@/types/apiResponse";

export function checkRequestAuth(req: NextRequest): NextResponse | null {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || authHeader !== `Bearer ${process.env.BOT_API_TOKEN}`) {
    const response: ApiResponse<null, { reason: string }> = {
      success: false,
      message: "Unauthorized request.",
      errorCode: "UNAUTHORIZED",
      details: { reason: "Invalid or missing token" },
      data: null,
    };
    return NextResponse.json(response, { status: 401 });
  }
  return null;
}

export function dbErrorResponse(logMessage: string, error: unknown) {
  console.error(logMessage, error);
  const response: ApiResponse<null, unknown> = {
    success: false,
    message: "Database connection error. Please try again later.",
    errorCode: "DB_ERROR",
    details: error,
    data: null,
  };
  return NextResponse.json(response, { status: 500 });
}

export function apiResponse<T = unknown, D = unknown>(
  message: string,
  success = true,
  data?: T,
  status = 200,
  errorCode?: string,
  details?: D
) {
  const response: ApiResponse<T, D> = {
    success,
    message,
    data,
    errorCode,
    details,
  };
  return NextResponse.json(response, { status });
}
