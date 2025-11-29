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
    const { user_name } = await req.json();
    if (!user_name) {
      return NextResponse.json(
        { success: false, reason: "MISSING_USER_NAME" },
        { status: 200 }
      );
    }

    const supabase = createClient();

    // Sprawdzenie, czy pending note istnieje
    const { data: existingPending, error } = await supabase
      .from("pending_notes")
      .select("*")
      .eq("user_name", user_name)
      .limit(1)
      .single();

    if (error) {
      console.error("Error fetching pending note:", error);
      return NextResponse.json(
        { success: false, reason: "PENDING_FETCH_FAILED" },
        { status: 200 }
      );
    }

    if (!existingPending) {
      return NextResponse.json(
        {
          success: false,
          reason: "NO_PENDING_NOTE",
          message: "No pending note found for this user.",
        },
        { status: 200 }
      );
    }

    // Jeśli istnieje, zwracamy pending note
    return NextResponse.json(
      {
        success: true,
        message: "Pending note found.",
        pending_note: existingPending,
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
