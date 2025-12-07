import { NextRequest, NextResponse } from "next/server";
import { insertAttachment, uploadToStorage } from "@/utils/queries/attachments";
import { checkRequestAuth } from "@/utils/backendUtils";

export async function POST(req: NextRequest) {
  const authError = checkRequestAuth(req);
  if (authError) return authError;

  try {
    const { claim_id, note_id, file_name, content_type, content_base_64 } =
      await req.json();

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

    // --- DECODE FILE ---
    let fileBuffer: Buffer;
    try {
      const utf8String = Buffer.from(content_base_64, "base64").toString(
        "utf-8"
      );
      fileBuffer = Buffer.from(utf8String, "base64");
    } catch {
      return NextResponse.json(
        {
          success: false,
          reason: "INVALID_BASE64",
          details: "content_base_64 is not valid base64",
        },
        { status: 200 }
      );
    }

    const storagePath = `${claim_id}/${note_id}/${file_name}`;

    // --- UPLOAD TO STORAGE ---
    const { error: uploadError } = await uploadToStorage(
      storagePath,
      fileBuffer,
      content_type
    );
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

    // --- SAVE METADATA ---
    const { error: insertError } = await insertAttachment({
      note_id,
      path: storagePath,
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
