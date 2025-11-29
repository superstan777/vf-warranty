import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/client";
import { htmlToText } from "html-to-text";

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
    const cleanIncNumber = htmlToText(inc_number, { wordwrap: false });

    // 1. Sprawdzenie inc_number w claims
    const { data: claim, error: claimError } = await supabase
      .from("claims")
      .select("id")
      .eq("inc_number", cleanIncNumber)
      .limit(1)
      .single();

    if (claimError || !claim) {
      return NextResponse.json(
        {
          success: false,
          reason: "INCIDENT_NOT_FOUND",
          message:
            "Incident number does not exist. Provide a valid incident number.",
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
          message: "No pending note found for this user.",
        },
        { status: 200 }
      );
    }

    // 3. Dodanie notatki do notes
    const { data: noteData, error: noteError } = await supabase
      .from("notes")
      .insert({
        claim_id: claim.id,
        content: pending.content,
        user_name: pending.user_name,
        origin: "teams",
      })
      .select();

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

    // 4. Usunięcie pending note
    await supabase.from("pending_notes").delete().eq("user_name", user_name);

    // 5. Zwrócenie info, że note dodane
    return NextResponse.json(
      {
        success: true,
        message: "Note has been posted.",
        note: noteData[0],
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { success: false, reason: "UNHANDLED_EXCEPTION" },
      { status: 200 }
    );
  }
}
