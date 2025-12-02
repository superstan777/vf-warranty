// app/api/attachment/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { fileName, contentBase64, noteId } = body;

    if (!fileName || !contentBase64 || !noteId) {
      return NextResponse.json(
        { success: false, reason: "MISSING_FIELDS" },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // konwertujemy Base64 na Buffer
    const buffer = Buffer.from(contentBase64, "base64");

    const filePath = `attachments/note_${noteId}/${fileName}`;

    // upload do Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("attachments")
      .upload(filePath, buffer, {
        upsert: true,
        contentType: "application/octet-stream",
      });

    if (uploadError) {
      console.error("Supabase upload failed:", uploadError);
      return NextResponse.json(
        { success: false, reason: "UPLOAD_FAILED", details: uploadError },
        { status: 500 }
      );
    }

    // opcjonalnie zapis w tabeli attachments
    const { error: dbError } = await supabase.from("attachments").insert([
      {
        note_id: noteId,
        content: "",
        content_url: filePath,
        file_name: fileName,
      },
    ]);

    if (dbError) {
      console.error("DB insert failed:", dbError);
      return NextResponse.json(
        { success: false, reason: "DB_INSERT_FAILED", details: dbError },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "File uploaded successfully",
      filePath,
    });
  } catch (err) {
    console.error("Unhandled exception:", err);
    return NextResponse.json(
      { success: false, reason: "UNHANDLED_EXCEPTION", details: err },
      { status: 500 }
    );
  }
}
