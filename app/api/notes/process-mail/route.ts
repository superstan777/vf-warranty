import { NextRequest } from "next/server";
import { checkRequestAuth, apiResponse } from "@/utils/backendUtils";
import { validateRequestPayload } from "./handlers/validateRequest";
import { resolveClaim } from "./handlers/resolveClaim";
import { resolveNote } from "./handlers/resolveNote";
import { processAttachments } from "./handlers/processAttachments";
import { finalizeNote } from "./handlers/finalizeNote";

export interface IncomingAttachment {
  graph_id: string;
  file_name: string;
  content_type: string;
  content_base_64: string;
}

export async function POST(req: NextRequest) {
  const authError = checkRequestAuth(req);
  if (authError) return authError;

  try {
    const payload = await req.json();

    const validation = validateRequestPayload(payload);
    if (validation.error) return validation.error;

    const { cleanText } = validation;
    const {
      inc_number,
      graph_id,
      attachments = [],
      user_name,
      origin,
    } = payload;

    const claimResult = await resolveClaim(inc_number);
    if (claimResult.error) return claimResult.error;

    const noteResult = await resolveNote({
      graph_id,
      claim_id: claimResult.claim.id,
      content: cleanText!,
      user_name,
      origin,
    });

    if (noteResult.error) return noteResult.error;

    const attachmentResult = await processAttachments({
      attachments: attachments as IncomingAttachment[],
      claimId: claimResult.claim.id,
      noteId: noteResult.note.id,
    });

    if (!attachmentResult.completed) {
      return apiResponse(
        "Partial attachment upload. Will retry.",
        false,
        undefined,
        500,
        "ATTACHMENTS_PARTIAL_FAILURE"
      );
    }

    return finalizeNote(noteResult.note.id, noteResult.note);
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
