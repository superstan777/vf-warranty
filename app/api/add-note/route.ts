import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/client";
import { htmlToText } from "html-to-text";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || authHeader !== `Bearer ${process.env.BOT_API_TOKEN}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { content, user_name, origin, inc_number } = body;

    if (!content || !inc_number) {
      return NextResponse.json(
        { error: "Missing content or inc_number" },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // 1. Szukamy claim po inc_number
    const { data: claim, error: claimError } = await supabase
      .from("claims")
      .select("id")
      .eq("inc_number", inc_number)
      .limit(1)
      .single();

    if (claimError) {
      console.error("Error fetching claim:", claimError);
      return NextResponse.json({ error: claimError.message }, { status: 500 });
    }

    if (!claim) {
      return NextResponse.json(
        { success: false, reason: "NO_INCIDENT_FOUND" },
        { status: 200 }
      );
    }

    // 2. Dodajemy notatkę
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
      console.error("Failed to add note:", noteError);
      return NextResponse.json({ error: noteError.message }, { status: 500 });
    }

    return NextResponse.json(
      { success: true, note: noteData[0] },
      { status: 201 }
    );
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
