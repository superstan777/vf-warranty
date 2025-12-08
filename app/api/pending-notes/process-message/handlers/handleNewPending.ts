import { insertPendingNote } from "@/utils/queries/pendingNotes";
import { dbErrorResponse, apiResponse } from "@/utils/backendUtils";

export async function handleNewPending(user_name: string, content: string) {
  try {
    const { data, error } = await insertPendingNote({ user_name, content });

    if (error || !data || data.length === 0) {
      return dbErrorResponse("Supabase error (insertPendingNote):", error);
    }

    return apiResponse(
      "Note saved as pending. Provide the incident number to confirm or type 'cancel' to abort action.",
      true,
      undefined,
      201
    );
  } catch (err) {
    console.error("Unhandled error in handleNewPending:", err);
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
