import { NextRequest } from "next/server";
import { updateNoteVisibility } from "@/utils/queries/notes";
import {
  checkRequestAuth,
  apiResponse,
  dbErrorResponse,
} from "@/utils/backendUtils";

export async function PATCH(req: NextRequest) {
  const authError = checkRequestAuth(req);
  if (authError) return authError;

  try {
    const { note_id } = await req.json();

    if (!note_id) {
      return apiResponse(
        "Missing note_id.",
        false,
        undefined,
        400,
        "MISSING_NOTE_ID"
      );
    }

    const { data, error } = await updateNoteVisibility(note_id, true);

    if (error) {
      return dbErrorResponse("Supabase error (updateNoteVisibility):", error);
    }

    if (!data) {
      return apiResponse(
        "Note not found.",
        false,
        undefined,
        404,
        "NOTE_NOT_FOUND"
      );
    }

    return apiResponse("Note marked as ready.", true, data, 200);
  } catch (err) {
    console.error("Unhandled error (mark-ready):", err);
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
