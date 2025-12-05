import { NextResponse } from "next/server";
import { htmlToText } from "html-to-text";
import { normalizeIncNumber } from "@/utils/inc";
import { getClaimByIncNumber } from "@/utils/queries/claims";
import {
  getPendingNote,
  deletePendingNoteByUser,
} from "@/utils/queries/pendingNotes";
import { insertNote } from "@/utils/queries/notes";
import { dbErrorResponse } from "@/utils/errors";

export async function handleResolvePending(user_name: string, content: string) {
  const INC_HELP_TEXT =
    "Provide correct incident number or type 'cancel' to abort action.";

  const rawInc = htmlToText(content, { wordwrap: false }).trim().toUpperCase();
  const inc = normalizeIncNumber(rawInc);

  const { data: claim, error: claimErr } = await getClaimByIncNumber(inc);

  if (claimErr) {
    return dbErrorResponse("Supabase error (getClaimByIncNumber):", claimErr);
  }

  if (!claim) {
    return NextResponse.json(
      { message: `Incident number does not exist. ${INC_HELP_TEXT}` },
      { status: 400 }
    );
  }

  if (claim.status === "cancelled") {
    return NextResponse.json(
      { message: `This claim has been cancelled. ${INC_HELP_TEXT}` },
      { status: 400 }
    );
  }

  if (claim.status === "resolved") {
    return NextResponse.json(
      { message: `This claim has already been resolved. ${INC_HELP_TEXT}` },
      { status: 400 }
    );
  }

  const { data: pending, error: pendingErr } = await getPendingNote(user_name);

  if (pendingErr) {
    return dbErrorResponse("Supabase error (getPendingNote):", pendingErr);
  }

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

  return NextResponse.json(
    { message: "Note has been added." },
    { status: 200 }
  );
}
