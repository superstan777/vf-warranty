import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/client";
import { htmlToText } from "html-to-text";

function normalizeIncNumber(raw: string) {
  const clean = htmlToText(raw, { wordwrap: false }).toUpperCase().trim();

  const match = clean.match(/INC(\d+)/i);
  if (!match) return clean;

  const num = match[1];
  const padded = num.padStart(5, "0");

  return `INC${padded}`;
}

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

    // 1. Sprawdzenie inc_number w claims
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
    const { data: pending, error: pendingError } = await supabase
      .from("pending_notes")
      .select("*")
      .eq("user_name", user_name)
      .limit(1)
      .single();

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

    // 2a. Pobranie pending attachments
    const { data: pendingAttachments } = await supabase
      .from("pending_attachments")
      .select("*")
      .eq("pending_note_id", pending.id);

    // 3. Dodanie notatki
    const { data: noteData, error: noteError } = await supabase
      .from("notes")
      .insert({
        claim_id: claim.id,
        content: pending.content,
        user_name: pending.user_name,
        origin: "teams",
      })
      .select()
      .single();

    if (noteError || !noteData) {
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

    // 3a. Dodanie attachments do note
    if (pendingAttachments && pendingAttachments.length > 0) {
      const attachmentsToInsert = pendingAttachments.map((att) => ({
        note_id: noteData.id,
        content: att.content,
      }));

      const { error: attachError } = await supabase
        .from("attachments")
        .insert(attachmentsToInsert);

      if (attachError) {
        console.error("Failed to insert attachments:", attachError);
      }
    }

    // 4. Usuń pending note (pending attachments usuną się automatycznie dzięki cascade)
    await supabase.from("pending_notes").delete().eq("user_name", user_name);

    // 5. Zwróć sukces
    return NextResponse.json(
      {
        success: true,
        message: "Note has been posted",
        note: noteData,
      },
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
