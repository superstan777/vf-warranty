import { NextRequest } from "next/server";
import { htmlToText } from "html-to-text";
import { normalizeIncNumber } from "@/utils/utils";
import { getClaimByIncNumber } from "@/utils/queries/claims";
import { insertNote } from "@/utils/queries/notes";
import {
  checkRequestAuth,
  apiResponse,
  dbErrorResponse,
} from "@/utils/backendUtils";

export async function POST(req: NextRequest) {
  const authError = checkRequestAuth(req);
  if (authError) return authError;

  try {
    const { content, user_name, origin, inc_number } = await req.json();

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

    const cleanText = htmlToText(content, { wordwrap: false }).trim();

    const { data: noteData, error: noteError } = await insertNote({
      claim_id: claim.id,
      content: cleanText,
      user_name,
      origin,
    });

    if (noteError || !noteData?.length) {
      return dbErrorResponse("Supabase error (insertNote):", noteError);
    }

    return apiResponse("Note successfully added.", true, noteData[0], 201);
  } catch (err: unknown) {
    console.error("Unhandled error:", err);
    return apiResponse(
      "Unexpected error. Please try again later.",
      false,
      undefined,
      500,
      "UNHANDLED_EXCEPTION",
      err
    );
  }
}
