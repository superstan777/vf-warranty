import { NextRequest, NextResponse } from "next/server";
import { getPendingNote } from "@/utils/queries/pendingNotes";
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

    const { data: pendingNote, error } = await getPendingNote(user_name);
    if (error) {
      console.error("Error fetching pending note:", error);
      return NextResponse.json(
        { success: false, reason: "PENDING_FETCH_FAILED" },
        { status: 200 }
      );
    }

    if (!pendingNote) {
      return NextResponse.json(
        {
          success: false,
          reason: "NO_PENDING_NOTE",
          message: "No pending note found for this user",
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Pending note found",
        pending_note: pendingNote,
      },
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
