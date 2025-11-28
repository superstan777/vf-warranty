import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/client";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (
    !authHeader ||
    authHeader !== `Bearer ${process.env.TEAMS_BOT_API_TOKEN}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { content, user_name } = body;

    if (!content) {
      return NextResponse.json({ error: "Missing content" }, { status: 400 });
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from("notes")
      .insert({
        claim_id: "4a839530-0555-42bb-89c1-b33a5f4b41e3",
        content,
        user_name,
        origin: "teams",
      })
      .select();

    if (error) {
      console.error("Failed to add note:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, note: data[0] }, { status: 201 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
