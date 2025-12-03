import { NextRequest, NextResponse } from "next/server";
import {
  isPendingNote,
  deletePendingNoteByUser,
} from "@/utils/queries/pendingNotes";
import { checkRequestAuth } from "@/utils/backendAuth";

export async function POST(req: NextRequest) {
  const authError = checkRequestAuth(req);
  if (authError) return authError;

  try {
    const { user_name } = await req.json();
    if (!user_name) {
      return NextResponse.json(
        { success: false, reason: "MISSING_USER_NAME" },
        { status: 200 }
      );
    }

    // Sprawdzenie, czy pending note istnieje
    const { exists, error: checkError } = await isPendingNote(user_name);
    if (checkError) {
      console.error("Error checking pending note:", checkError);
      return NextResponse.json(
        { success: false, reason: "PENDING_CHECK_FAILED" },
        { status: 200 }
      );
    }

    if (!exists) {
      return NextResponse.json(
        {
          success: false,
          reason: "NO_PENDING_NOTE",
          message: "No pending note found for this user.",
        },
        { status: 200 }
      );
    }

    const { error: deleteError } = await deletePendingNoteByUser(user_name);
    if (deleteError) {
      console.error("Error deleting pending note:", deleteError);
      return NextResponse.json(
        { success: false, reason: "PENDING_DELETE_FAILED" },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Pending note has been successfully deleted." },
      { status: 200 }
    );
  } catch (err: unknown) {
    console.error("Unhandled error:", err);
    return NextResponse.json(
      { success: false, reason: "UNHANDLED_EXCEPTION" },
      { status: 200 }
    );
  }
}
