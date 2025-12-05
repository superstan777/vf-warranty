import { NextResponse } from "next/server";
import {
  isPendingNote,
  deletePendingNoteByUser,
} from "@/utils/queries/pendingNotes";
import { dbErrorResponse } from "@/utils/errors";

export async function handleCancel(user_name: string) {
  const { exists, error } = await isPendingNote(user_name);

  if (error) {
    return dbErrorResponse("Supabase error (isPendingNote):", error);
  }

  if (!exists) {
    return NextResponse.json(
      { message: "There is no pending note to cancel." },
      { status: 404 }
    );
  }

  const { error: deleteErr } = await deletePendingNoteByUser(user_name);

  if (deleteErr) {
    return dbErrorResponse(
      "Supabase error (deletePendingNoteByUser):",
      deleteErr
    );
  }

  return NextResponse.json(
    { message: "Pending note cancelled. Send message to start new process." },
    { status: 200 }
  );
}
