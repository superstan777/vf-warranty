import { NextRequest } from "next/server";
import { htmlToText } from "html-to-text";

import { normalizeIncNumber } from "@/utils/utils";
import { getClaimByIncNumber } from "@/utils/queries/claims";
import { insertNote, markNoteAsReady } from "@/utils/queries/notes";
import { insertAttachment, uploadToStorage } from "@/utils/queries/attachments";

import {
  checkRequestAuth,
  apiResponse,
  dbErrorResponse,
} from "@/utils/backendUtils";

// Typ załączników dostarczanych przez bota
interface IncomingAttachment {
  graph_id: string;
  file_name: string;
  content_type: string;
  content_base_64: string;
}

export async function POST(req: NextRequest) {
  const authError = checkRequestAuth(req);
  if (authError) return authError;

  try {
    const {
      content,
      user_name,
      origin,
      inc_number,
      graph_id,
      attachments = [], // array[] lub brak
    } = await req.json();

    if (!content || !inc_number) {
      return apiResponse(
        "Message content and incident number are required.",
        false,
        undefined,
        400,
        "MISSING_FIELDS"
      );
    }

    // Normalize INC
    const normalizedInc = normalizeIncNumber(inc_number);

    // Fetch claim
    const { data: claim, error: claimError } = await getClaimByIncNumber(
      normalizedInc
    );
    if (claimError) {
      return dbErrorResponse(
        "Supabase error (getClaimByIncNumber):",
        claimError
      );
    }
    if (!claim) {
      return apiResponse(
        `Incident ${normalizedInc} does not exist.`,
        false,
        undefined,
        404,
        "INCIDENT_NOT_FOUND"
      );
    }
    if (claim.status !== "in_progress") {
      return apiResponse(
        `Incident ${normalizedInc} is resolved or cancelled.`,
        false,
        undefined,
        409,
        "INCIDENT_NOT_IN_PROGRESS"
      );
    }

    // Clean text
    const cleanText = htmlToText(content, { wordwrap: false }).trim();

    // Create note (ready_for_display = false)
    const { data: noteData, error: noteError } = await insertNote({
      claim_id: claim.id,
      content: cleanText,
      user_name,
      origin,
      graph_id,
    });

    if (noteError || !noteData?.length) {
      return dbErrorResponse("Supabase error (insertNote):", noteError);
    }

    const note = noteData[0];
    const noteId = note.id;

    // If no attachments → note ready immediately
    if (!attachments.length) {
      await markNoteAsReady(noteId);
      return apiResponse("Note added (no attachments).", true, { note }, 201);
    }

    // --- PROCESS ATTACHMENTS ---
    let success = 0;

    for (const att of attachments as IncomingAttachment[]) {
      try {
        const fileBuffer = Buffer.from(att.content_base_64, "base64");
        const storagePath = `${claim.id}/${noteId}/${att.file_name}`;

        const { error: uploadError, data: uploadData } = await uploadToStorage(
          storagePath,
          fileBuffer,
          att.content_type
        );

        if (uploadError) throw uploadError;

        const finalPath = uploadData?.path ?? storagePath;

        const { error: attachError } = await insertAttachment({
          note_id: noteId,
          path: finalPath,
          graph_id: att.graph_id,
        });

        if (attachError) throw attachError;

        success++;
      } catch (err) {
        console.error("Failed to handle attachment:", err);
      }
    }

    // All attachments added → mark as ready
    if (success === attachments.length) {
      await markNoteAsReady(noteId);

      return apiResponse(
        "Note added. All attachments uploaded.",
        true,
        { note, attachments_added: success },
        201
      );
    }

    // Some attachments failed
    return apiResponse(
      `Note added, but only ${success}/${attachments.length} attachments uploaded.`,
      false,
      {
        note,
        attachments_added: success,
        attachments_missing: attachments.length - success,
      },
      207, // Multi-Status
      "ATTACHMENTS_PARTIAL_FAILURE"
    );
  } catch (err) {
    console.error("Unhandled error:", err);
    return apiResponse(
      "Unexpected error.",
      false,
      undefined,
      500,
      "UNHANDLED_EXCEPTION",
      err
    );
  }
}
