import { NextResponse } from "next/server";
import { htmlToText } from "html-to-text";

import { normalizeIncNumber } from "@/utils/inc";

import { getClaimByIncNumber } from "@/utils/queries/claims";
import {
  getPendingNote,
  deletePendingNoteByUser,
} from "@/utils/queries/pendingNotes";
import { insertNote } from "@/utils/queries/notes";

export async function handleResolvePending(user_name: string, content: string) {
  const rawInc = htmlToText(content, { wordwrap: false }).trim().toUpperCase();
  const inc = normalizeIncNumber(rawInc);

  const { data: claim, error: claimErr } = await getClaimByIncNumber(inc);

  if (claimErr) {
    console.error("Claim lookup error:", claimErr);
    return NextResponse.json(
      { message: "Server error while fetching the incident. Try again later." },
      { status: 500 }
    );
  }

  if (!claim) {
    return NextResponse.json(
      {
        message:
          "Incident number does not exist. Provide correct incident number or type 'cancel' to abort action.",
      },
      { status: 400 }
    );
  }

  if (claim.status === "cancelled") {
    return NextResponse.json(
      {
        message:
          "This claim has been cancelled. Provide correct incident number or type 'cancel' to abort action.",
      },
      { status: 400 }
    );
  }

  if (claim.status === "resolved") {
    return NextResponse.json(
      {
        message:
          "This claim has already been resolved. Provide correct incident number or type 'cancel' to abort action.",
      },
      { status: 400 }
    );
  }

  const { data: pending, error: pendingErr } = await getPendingNote(user_name);

  if (pendingErr) {
    console.error("Pending note lookup error:", pendingErr);
    return NextResponse.json(
      { message: "Server error while fetching pending note." },
      { status: 500 }
    );
  }

  const { data: noteData, error: noteErr } = await insertNote({
    claim_id: claim.id,
    user_name: pending!.user_name,
    content: pending!.content,
    origin: "teams",
  });

  if (noteErr || !noteData || noteData.length === 0) {
    console.error("Insert note failed:", noteErr);
    return NextResponse.json(
      { message: "Could not save note." },
      { status: 500 }
    );
  }

  await deletePendingNoteByUser(user_name);

  return NextResponse.json(
    { message: "Note has been added." },
    { status: 200 }
  );
}
