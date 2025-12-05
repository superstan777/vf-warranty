import { NextRequest, NextResponse } from "next/server";
import { checkRequestAuth } from "@/utils/backendAuth";
import { handleNewPending } from "./handlers/handleNewPending";
import { handleResolvePending } from "./handlers/handleResolvePending";
import { handleCancel } from "./handlers/handleCancel";
import { isPendingNote } from "@/utils/queries/pendingNotes";
import { dbErrorResponse } from "@/utils/errors";

export async function POST(req: NextRequest) {
  const authError = checkRequestAuth(req);
  if (authError) return authError;

  try {
    const { user_name, content } = await req.json();

    if (!user_name || !content) {
      return NextResponse.json(
        { message: "Missing user name or content." },
        { status: 400 }
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
    return NextResponse.json(
      { message: "Unexpected error. Please try again later." },
      { status: 500 }
    );
  }
}
