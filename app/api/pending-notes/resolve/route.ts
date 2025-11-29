import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/client";

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

    // Sprawdzenie pending note
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
          message: "No pending note found for user",
        },
        { status: 200 }
      );
    }

    // Obsługa cancel
    if (inc_number.toLowerCase() === "cancel") {
      await supabase.from("pending_notes").delete().eq("user_name", user_name);
      return NextResponse.json(
        { success: true, message: "Action has been cancelled" },
        { status: 200 }
      );
    }

    // Sprawdzenie inc_number w claims
    const { data: claim } = await supabase
      .from("claims")
      .select("id")
      .eq("inc_number", inc_number)
      .limit(1)
      .single();

    if (!claim) {
      return NextResponse.json(
        {
          success: false,
          reason: "INCIDENT_NOT_FOUND",
          message:
            'Incident number does not exist. Provide a valid incident number or type "cancel" to abort action.',
        },
        { status: 200 }
      );
    }

    const cleanText = pending.content;
    const { data: noteData, error: noteError } = await supabase
      .from("notes")
      .insert({
        claim_id: claim.id,
        content: cleanText,
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

    await supabase.from("pending_notes").delete().eq("user_name", user_name);

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
