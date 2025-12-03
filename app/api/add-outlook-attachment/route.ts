import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const { note_id, file_name, content_type, content_base_64 } =
      await req.json();

    if (!note_id || !file_name || !content_type || !content_base_64) {
      return NextResponse.json(
        { error: "Missing parameters" },
        { status: 400 }
      );
    }

    // Init Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! // requires service role to upload server-side
    );

    // Decode Base64 → Buffer
    const fileBuffer = Buffer.from(content_base_64, "base64");

    // Unified storage path (no mail / teams distinctions)
    const storagePath = `${note_id}/${file_name}`;

    // Upload file
    const { error: uploadError } = await supabase.storage
      .from("attachments")
      .upload(storagePath, fileBuffer, {
        contentType: content_type,
        upsert: true,
      });

    if (uploadError) {
      console.error(uploadError);
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    // Optional DB metadata entry
    await supabase.from("attachments").insert([
      {
        note_id,
        file_name,
        path: storagePath,
        content_type,
      },
    ]);

    return NextResponse.json(
      { success: true, path: storagePath },
      { status: 200 }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
