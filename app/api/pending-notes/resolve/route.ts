import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/client";
import {
  normalizeIncNumber,
  fetchPendingNoteWithAttachments,
} from "./helpers/pending";
import { insertNote } from "./helpers/notes";
import { processAttachments } from "./helpers/attachments";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || authHeader !== `Bearer ${process.env.BOT_API_TOKEN}`) {
    return NextResponse.json(
      { success: false, reason: "UNAUTHORIZED" },
      { status: 200 }
    );
  }

  try {
    const { user_name, inc_number } = await req.json();
    if (!user_name || !inc_number) {
      return NextResponse.json(
        { success: false, reason: "MISSING_FIELDS" },
        { status: 200 }
      );
    }

    const supabase = createClient();
    const cleanIncNumber = normalizeIncNumber(inc_number);

    const { data: claim, error: claimError } = await supabase
      .from("claims")
      .select("id,status")
      .eq("inc_number", cleanIncNumber)
      .limit(1)
      .single();

    if (claimError || !claim) {
      return NextResponse.json(
        {
          success: false,
          reason: "INCIDENT_NOT_FOUND",
          message: "Incident number does not exist",
        },
        { status: 200 }
      );
    }

    if (claim.status === "cancelled" || claim.status === "resolved") {
      return NextResponse.json(
        {
          success: false,
          status: claim.status,
          message:
            claim.status === "cancelled" ? "Claim cancelled" : "Claim resolved",
        },
        { status: 200 }
      );
    }

    const { pendingNote, pendingAttachments } =
      await fetchPendingNoteWithAttachments(user_name);
    if (!pendingNote)
      return NextResponse.json(
        {
          success: false,
          reason: "NO_PENDING_NOTE",
          message: "No pending note",
        },
        { status: 200 }
      );

    const note = await insertNote(claim.id, pendingNote);
    await processAttachments(note.id, pendingAttachments);

    await supabase.from("pending_notes").delete().eq("user_name", user_name);

    return NextResponse.json(
      { success: true, message: "Note posted", note },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Unhandled exception:", err);
    return NextResponse.json(
      { success: false, reason: "UNHANDLED_EXCEPTION" },
      { status: 200 }
    );
  }
}
