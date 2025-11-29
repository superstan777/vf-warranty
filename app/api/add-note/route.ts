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
    const body = await req.json();
    const { content, user_name, origin, inc_number } = body;

    if (!content || !inc_number) {
      return NextResponse.json(
        {
          success: false,
          reason: "MISSING_FIELDS",
          details: "content and inc_number are required",
        },
        { status: 200 }
      );
    }

    const supabase = createClient();

    const { data: claim, error: claimError } = await supabase
      .from("claims")
      .select("id")
      .eq("inc_number", inc_number)
      .limit(1)
      .single();

    if (claimError || !claim) {
      return NextResponse.json(
        {
          success: false,
          reason: "INCIDENT_NOT_FOUND",
          details: `Incident ${inc_number} does not exist`,
        },
        { status: 200 }
      );
    }

    const cleanText = htmlToText(content, { wordwrap: false });
    const { data: noteData, error: noteError } = await supabase
      .from("notes")
      .insert({
        claim_id: claim.id,
        content: cleanText,
        user_name,
        origin,
      })
      .select();

    if (noteError) {
      console.error("Supabase insert error:", noteError);
      return NextResponse.json(
        {
          success: false,
          reason: "NOTE_INSERT_FAILED",
          details: "Could not save note",
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        note: noteData[0],
        details: "Note successfully added",
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Unhandled error:", err);
    return NextResponse.json(
      {
        success: false,
        reason: "UNHANDLED_EXCEPTION",
        details: "Request failed internally",
      },
      { status: 200 }
    );
  }
}
