import { NextResponse } from "next/server";
import { insertPendingNote } from "@/utils/queries/pendingNotes";
import { dbErrorResponse } from "@/utils/backendUtils";

export async function handleNewPending(user_name: string, content: string) {
  const { data, error } = await insertPendingNote({ user_name, content });

  if (error || !data || data.length === 0) {
    return dbErrorResponse("Supabase error (insertPendingNote):", error);
  }

  return NextResponse.json(
    {
      message:
        "Note saved as pending. Provide the incident number to confirm or type 'cancel' to abort action.",
    },
    { status: 201 }
  );
}
