import { NextResponse } from "next/server";
import {
  isPendingNote,
  deletePendingNoteByUser,
} from "@/utils/queries/pendingNotes";

export async function handleCancel(user_name: string) {
  const { exists, error } = await isPendingNote(user_name);

  if (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error while checking pending note." },
      { status: 500 }
    );
  }

  if (!exists) {
    return NextResponse.json(
      { message: "There is no pending note to cancel." },
      { status: 404 }
    );
  }

  await deletePendingNoteByUser(user_name);

  return NextResponse.json(
    { message: "Pending note cancelled." },
    { status: 200 }
  );
}
