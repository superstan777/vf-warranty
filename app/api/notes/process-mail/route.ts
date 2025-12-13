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
      attachments = [],
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

    const normalizedInc = normalizeIncNumber(inc_number);
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
        `Incident ${normalizedInc} does not exist. Message processed.`,
        true,
        undefined,
        200,
        "INCIDENT_NOT_FOUND"
      );
    }

    if (claim.status !== "in_progress") {
      return apiResponse(
        `Incident ${normalizedInc} is resolved or cancelled. Message processed.`,
        true,
        undefined,
        200,
        "INCIDENT_NOT_IN_PROGRESS"
      );
    }
    const cleanText = htmlToText(content, { wordwrap: false }).trim();

    if (!cleanText) {
      return apiResponse(
        "Message has no meaningful content. Skipped note creation.",
        true,
        undefined,
        200,
        "EMPTY_NOTE_CONTENT"
      );
    }

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

    if (!attachments.length) {
      await markNoteAsReady(noteId);
      return apiResponse("Note added (no attachments).", true, { note }, 201);
    }

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

    if (success === attachments.length) {
      const { data: updatedNote, error: markError } = await markNoteAsReady(
        noteId
      );
      if (markError || !updatedNote) {
        console.error("Failed to mark note as ready:", markError);
        return dbErrorResponse("Supabase error (markNoteAsReady):", markError);
      }

      return apiResponse(
        "Note added. All attachments uploaded.",
        true,
        { note: updatedNote, attachments_added: success },
        201
      );
    }

    return apiResponse(
      `Failed to add note. The system will retry processing this message in the next polling cycle.`,
      false,
      undefined,
      500,
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
