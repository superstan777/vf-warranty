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
    const { user_name, content, attachments } = await req.json();

    if (!user_name || !content) {
      return NextResponse.json(
        { success: false, reason: "MISSING_FIELDS" },
        { status: 200 }
      );
    }

    const supabase = createClient();

    // Sprawdzenie, czy pending note już istnieje
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

    // Dodanie pending note
    const cleanText = htmlToText(content, { wordwrap: false });
    const { data: pendingData, error: insertError } = await supabase
      .from("pending_notes")
      .insert({ user_name, content: cleanText })
      .select()
      .single();

    if (insertError || !pendingData) {
      console.error("Failed to insert pending note:", insertError);
      return NextResponse.json(
        { success: false, reason: "PENDING_INSERT_FAILED" },
        { status: 200 }
      );
    }

    const pendingNote = pendingData;

    // Parsowanie attachments
    let parsedAttachments: any[] = [];
    if (attachments) {
      try {
        parsedAttachments =
          typeof attachments === "string"
            ? JSON.parse(attachments)
            : attachments;
      } catch (err) {
        console.error("Failed to parse attachments JSON:", err);
        parsedAttachments = [];
      }
    }

    // Przygotowanie attachments do inserta
    const attachmentsToInsert = parsedAttachments
      .map((attachment) => {
        try {
          // Forwarded message
          if (
            attachment.contentType === "forwardedMessageReference" &&
            attachment.content
          ) {
            return {
              pending_note_id: pendingNote.id,
              content: attachment.content,
              contentUrl: null,
              name: null,
            } as const;
          }

          // Plik / obrazek
          if (attachment.contentType === "reference" && attachment.contentUrl) {
            return {
              pending_note_id: pendingNote.id,
              content: null,
              contentUrl: attachment.contentUrl,
              name: attachment.name || "file",
            } as const;
          }

          return null;
        } catch (err) {
          console.error("Failed to process attachment:", err);
          return null;
        }
      })
      .filter(
        (
          a
        ): a is
          | {
              pending_note_id: string;
              content: string;
              contentUrl: null;
              name: null;
            }
          | {
              pending_note_id: string;
              content: null;
              contentUrl: string;
              name: string;
            } => a !== null
      );

    // Dodanie attachments do bazy
    if (attachmentsToInsert.length > 0) {
      const { error: attachError } = await supabase
        .from("pending_attachments")
        .insert(attachmentsToInsert);

      if (attachError) {
        console.error("Failed to insert pending attachments:", attachError);
      }
    }

    return NextResponse.json(
      {
        success: true,
        message:
          'Pending note added. Please provide incident number or type "cancel" to abort action.',
        pending_note: pendingNote,
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
