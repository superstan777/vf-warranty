import { NextRequest, NextResponse } from "next/server";
import { htmlToText } from "html-to-text";
import { normalizeIncNumber } from "@/utils/inc";
import { getClaimByIncNumber } from "@/utils/queries/claims";
import {
  getPendingNote,
  deletePendingNoteByUser,
} from "@/utils/queries/pendingNotes";
import { insertNote } from "@/utils/queries/notes";
import { checkRequestAuth } from "@/utils/backendAuth";

export async function POST(req: NextRequest) {
  const authError = checkRequestAuth(req);
  if (authError) return authError;
  try {
    const { user_name, inc_number } = await req.json();
    if (!user_name || !inc_number) {
      return NextResponse.json(
        { success: false, reason: "MISSING_FIELDS" },
        { status: 200 }
      );
    }

    const cleanIncNumber = normalizeIncNumber(
      htmlToText(inc_number, { wordwrap: false }).toUpperCase().trim()
    );

    // 1. Sprawdzenie inc_number w claims
    const { data: claim, error: claimError } = await getClaimByIncNumber(
      cleanIncNumber
    );
    if (claimError || !claim) {
      return NextResponse.json(
        {
          success: false,
          reason: "INCIDENT_NOT_FOUND",
          message:
            "Incident number does not exist. Provide a valid incident number",
        },
        { status: 200 }
      );
    }

    // 1a. Sprawdzenie statusu claima
    if (claim.status === "cancelled" || claim.status === "resolved") {
      return NextResponse.json(
        {
          success: false,
          status: claim.status,
          message:
            claim.status === "cancelled"
              ? "This claim has been cancelled"
              : "This claim has been resolved",
        },
        { status: 200 }
      );
    }

    // 2. Pobranie pending note dla user_name
    const { data: pending, error: pendingError } = await getPendingNote(
      user_name
    );
    if (pendingError || !pending) {
      return NextResponse.json(
        {
          success: false,
          reason: "NO_PENDING_NOTE",
          message: "No pending note found for this user",
        },
        { status: 200 }
      );
    }

    // 3. Dodanie notatki
    const { data: noteData, error: noteError } = await insertNote({
      claim_id: claim.id,
      content: pending.content,
      user_name: pending.user_name,
      origin: "teams",
    });

    if (noteError || !noteData || noteData.length === 0) {
      console.error("Failed to insert note:", noteError);
      return NextResponse.json(
        {
          success: false,
          reason: "NOTE_INSERT_FAILED",
          message: "Could not save note",
        },
        { status: 200 }
      );
    }

    // 4. Usuń pending note
    await deletePendingNoteByUser(user_name);

    return NextResponse.json(
      {
        success: true,
        message: "Note has been posted",
        note: noteData[0],
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    console.error(err);
    return NextResponse.json(
      { success: false, reason: "UNHANDLED_EXCEPTION" },
      { status: 200 }
    );
  }
}
