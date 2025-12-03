import { NextRequest, NextResponse } from "next/server";
import { htmlToText } from "html-to-text";
import { isPendingNote, insertPendingNote } from "@/utils/queries/pendingNotes";
import { checkRequestAuth } from "@/utils/backendAuth";

export async function POST(req: NextRequest) {
  const authError = checkRequestAuth(req);
  if (authError) return authError;

  try {
    const { user_name, content } = await req.json();
    if (!user_name || !content) {
      return NextResponse.json(
        { success: false, reason: "MISSING_FIELDS" },
        { status: 200 }
      );
    }

    // Sprawdzenie, czy pending note już istnieje
    const { exists, error: checkError } = await isPendingNote(user_name);
    if (checkError) {
      console.error("Error checking pending note:", checkError);
      return NextResponse.json(
        { success: false, reason: "CHECK_FAILED" },
        { status: 200 }
      );
    }
    if (exists) {
      return NextResponse.json(
        { success: false, reason: "PENDING_ALREADY_EXISTS" },
        { status: 200 }
      );
    }

    // Dodanie pending note
    const cleanText = htmlToText(content, { wordwrap: false });
    const { data: pendingData, error: insertError } = await insertPendingNote({
      user_name,
      content: cleanText,
    });

    if (insertError || !pendingData || pendingData.length === 0) {
      console.error("Failed to insert pending note:", insertError);
      return NextResponse.json(
        { success: false, reason: "PENDING_INSERT_FAILED" },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message:
          'Pending note added. Please provide incident number or type "cancel" to abort action.',
        pending_note: pendingData[0],
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
