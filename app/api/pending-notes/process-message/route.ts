import { NextRequest } from "next/server";
import {
  checkRequestAuth,
  dbErrorResponse,
  apiResponse,
} from "@/utils/backendUtils";
import { handleNewPending } from "./handlers/handleNewPending";
import { handleResolvePending } from "./handlers/handleResolvePending";
import { handleCancel } from "./handlers/handleCancel";
import { isPendingNote } from "@/utils/queries/pendingNotes";

export async function POST(req: NextRequest) {
  const authError = checkRequestAuth(req);
  if (authError) return authError;

  try {
    const { user_name, content } = await req.json();

    if (!user_name || !content) {
      return apiResponse(
        "Missing user name or content.",
        false,
        undefined,
        400,
        "VALIDATION_ERROR"
      );
    }

    const trimmed = content.trim().toLowerCase();

    if (trimmed === "cancel") {
      return handleCancel(user_name);
    }

    const { exists, error } = await isPendingNote(user_name);

    if (error) {
      return dbErrorResponse("Supabase error (isPendingNote):", error);
    }

    if (exists) {
      return handleResolvePending(user_name, content);
    }

    return handleNewPending(user_name, content);
  } catch (err) {
    console.error("Unhandled error in POST /api:", err);
    return apiResponse(
      "Unexpected error. Please try again later.",
      false,
      undefined,
      500,
      "UNHANDLED_EXCEPTION",
      err
    );
  }
}
