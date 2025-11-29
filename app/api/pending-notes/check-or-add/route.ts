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
    const { user_name, content, origin } = await req.json();
    if (!user_name || !content) {
      return NextResponse.json(
        { success: false, reason: "MISSING_FIELDS" },
        { status: 200 }
      );
    }

    const supabase = createClient();

    const { data: existing } = await supabase
      .from("pending_notes")
      .select("id")
      .eq("user_name", user_name)
      .limit(1);

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { success: false, reason: "PENDING_ALREADY_EXISTS" },
        { status: 200 }
      );
    }

    const cleanText = htmlToText(content, { wordwrap: false });
    const { data: pendingData, error: insertError } = await supabase
      .from("pending_notes")
      .insert({ user_name, content: cleanText, origin })
      .select();

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
  } catch (err: any) {
    console.error("Unhandled error:", err);
    return NextResponse.json(
      { success: false, reason: "UNHANDLED_EXCEPTION" },
      { status: 200 }
    );
  }
}
