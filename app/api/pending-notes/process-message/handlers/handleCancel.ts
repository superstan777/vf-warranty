import { apiResponse, dbErrorResponse } from "@/utils/backendUtils";
import {
  isPendingNote,
  deletePendingNoteByUser,
} from "@/utils/queries/pendingNotes";

export async function handleCancel(user_name: string) {
  try {
    const { exists, error } = await isPendingNote(user_name);

    if (error) {
      return dbErrorResponse("Supabase error (isPendingNote):", error);
    }

    if (!exists) {
      return apiResponse(
        "There is no pending note to cancel.",
        false,
        undefined,
        404,
        "PENDING_NOTE_NOT_FOUND"
      );
    }

    const { error: deleteErr } = await deletePendingNoteByUser(user_name);

    if (deleteErr) {
      return dbErrorResponse(
        "Supabase error (deletePendingNoteByUser):",
        deleteErr
      );
    }

    return apiResponse(
      "Pending note cancelled. Send message to start new process.",
      true,
      undefined,
      200
    );
  } catch (err) {
    console.error("Unhandled error in handleCancel:", err);
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
