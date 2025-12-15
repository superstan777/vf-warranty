import { NextRequest } from "next/server";
import { htmlToText } from "html-to-text";
import { normalizeIncNumber } from "@/utils/utils";
import { getClaimByIncNumber } from "@/utils/queries/claims";
import {
  insertNote,
  markNoteAsReady,
  getNoteByGraphId,
} from "@/utils/queries/notes";
import {
  insertAttachment,
  uploadToStorage,
  getAttachmentsByGraphIds,
} from "@/utils/queries/attachments";
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

    if (!inc_number || !graph_id) {
      return apiResponse(
        "Incident number and graph_id are required.",
        false,
        undefined,
        400,
        "MISSING_FIELDS"
      );
    }

    const cleanText = htmlToText(content || "", { wordwrap: false }).trim();
    if (!cleanText) {
      return apiResponse(
        "Message has no meaningful content.",
        true,
        undefined,
        200,
        "EMPTY_NOTE_CONTENT"
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

    if (!claim || claim.status !== "in_progress") {
      return apiResponse(
        "Incident not eligible for notes. Message processed.",
        true,
        undefined,
        200
      );
    }

    let note;
    const { data: existingNote } = await getNoteByGraphId(graph_id);

    if (existingNote) {
      note = existingNote;
    } else {
      const { data, error } = await insertNote({
        claim_id: claim.id,
        content: cleanText,
        user_name,
        origin,
        graph_id,
      });

      if (error || !data?.length) {
        return dbErrorResponse("Supabase error (insertNote):", error);
      }

      note = data[0];
    }

    if (!attachments.length) {
      await markNoteAsReady(note.id);
      return apiResponse("Note processed.", true, { note }, 200);
    }

    const incomingGraphIds = attachments.map(
      (a: IncomingAttachment) => a.graph_id
    );
    const { data: existingAttachments } = await getAttachmentsByGraphIds(
      incomingGraphIds
    );

    const existingIds = new Set(
      existingAttachments?.map((a) => a.graph_id) || []
    );

    let added = 0;

    for (const att of attachments as IncomingAttachment[]) {
      if (existingIds.has(att.graph_id)) {
        continue;
      }

      try {
        const buffer = Buffer.from(att.content_base_64, "base64");
        const path = `${claim.id}/${note.id}/${att.file_name}`;

        const { error: uploadError } = await uploadToStorage(
          path,
          buffer,
          att.content_type
        );
        if (uploadError) throw uploadError;

        const { error: attachError } = await insertAttachment({
          note_id: note.id,
          path,
          graph_id: att.graph_id,
        });
        if (attachError) throw attachError;

        added++;
      } catch (err) {
        console.error("Attachment failed:", err);
      }
    }

    const totalAttachments = existingIds.size + added;

    if (totalAttachments === attachments.length) {
      await markNoteAsReady(note.id);
      return apiResponse("Note processed.", true, { note }, 200);
    }

    return apiResponse(
      "Partial attachment upload. Will retry in 15 minutes.",
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
      "UNHANDLED_EXCEPTION"
    );
  }
}
