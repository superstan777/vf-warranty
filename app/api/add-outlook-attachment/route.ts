import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/client";

export async function POST(req: NextRequest) {
  // --- AUTH CHECK ---
  const authHeader = req.headers.get("authorization");
  if (!authHeader || authHeader !== `Bearer ${process.env.BOT_API_TOKEN}`) {
    return NextResponse.json(
      { success: false, reason: "UNAUTHORIZED" },
      { status: 200 }
    );
  }

  try {
    // --- PARSE BODY ---
    const body = await req.json();
    const { note_id, file_name, content_type, content_base_64 } = body;

    if (!note_id || !file_name || !content_type || !content_base_64) {
      return NextResponse.json(
        {
          success: false,
          reason: "MISSING_FIELDS",
          details:
            "note_id, file_name, content_type and content_base_64 are required",
        },
        { status: 200 }
      );
    }

    const supabase = createClient();

    // --- DECODE FILE ---
    let fileBuffer: Buffer;
    try {
      fileBuffer = Buffer.from(content_base_64, "base64");
    } catch (err) {
      return NextResponse.json(
        {
          success: false,
          reason: "INVALID_BASE64",
          details: "content_base_64 is not valid base64",
        },
        { status: 200 }
      );
    }

    // --- STORAGE PATH: {note_id}/{file_name} ---
    const storagePath = `${note_id}/${file_name}`;

    // --- UPLOAD TO SUPABASE STORAGE ---
    const { error: uploadError } = await supabase.storage
      .from("attachments")
      .upload(storagePath, fileBuffer, {
        contentType: content_type,
        upsert: true,
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      return NextResponse.json(
        {
          success: false,
          reason: "UPLOAD_FAILED",
          details: "Could not upload file to storage",
        },
        { status: 200 }
      );
    }

    // --- OPTIONAL: SAVE METADATA TO DB TABLE ---
    const { error: insertError } = await supabase.from("attachments").insert({
      note_id,
      file_name,
      path: storagePath,
      content_type,
    });

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      return NextResponse.json(
        {
          success: false,
          reason: "METADATA_INSERT_FAILED",
          details: "File uploaded but metadata could not be saved",
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        path: storagePath,
        details: "Attachment successfully uploaded",
      },
      { status: 200 }
    );
  } catch (err) {
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
