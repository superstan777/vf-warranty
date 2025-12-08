import { htmlToText } from "html-to-text";
import { normalizeIncNumber } from "@/utils/utils";
import { getClaimByIncNumber } from "@/utils/queries/claims";
import {
  getPendingNote,
  deletePendingNoteByUser,
} from "@/utils/queries/pendingNotes";
import { insertNote } from "@/utils/queries/notes";
import { dbErrorResponse, apiResponse } from "@/utils/backendUtils";

export async function handleResolvePending(user_name: string, content: string) {
  const INC_HELP_TEXT =
    "Provide correct incident number or type 'cancel' to abort action.";

  try {
    const rawInc = htmlToText(content, { wordwrap: false })
      .trim()
      .toUpperCase();
    const inc = normalizeIncNumber(rawInc);

    const { data: claim, error: claimErr } = await getClaimByIncNumber(inc);
    if (claimErr)
      return dbErrorResponse("Supabase error (getClaimByIncNumber):", claimErr);

    if (!claim) {
      return apiResponse(
        `Incident number does not exist. ${INC_HELP_TEXT}`,
        false,
        undefined,
        400,
        "INCIDENT_NOT_FOUND"
      );
    }

    if (claim.status === "cancelled") {
      return apiResponse(
        `This claim has been cancelled. ${INC_HELP_TEXT}`,
        false,
        undefined,
        400,
        "INCIDENT_CANCELLED"
      );
    }

    if (claim.status === "resolved") {
      return apiResponse(
        `This claim has already been resolved. ${INC_HELP_TEXT}`,
        false,
        undefined,
        400,
        "INCIDENT_RESOLVED"
      );
    }

    const { data: pending, error: pendingErr } = await getPendingNote(
      user_name
    );
    if (pendingErr)
      return dbErrorResponse("Supabase error (getPendingNote):", pendingErr);

    const { data: noteData, error: noteErr } = await insertNote({
      claim_id: claim.id,
      user_name: pending!.user_name,
      content: pending!.content,
      origin: "teams",
    });
    if (noteErr || !noteData || noteData.length === 0) {
      return dbErrorResponse("Supabase error (insertNote):", noteErr);
    }

    await deletePendingNoteByUser(user_name);

    return apiResponse("Note has been added.", true, noteData[0], 200);
  } catch (err) {
    console.error("Unhandled error in handleResolvePending:", err);
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
