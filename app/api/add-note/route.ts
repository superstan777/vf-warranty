import { NextRequest, NextResponse } from "next/server";
import { htmlToText } from "html-to-text";
import { normalizeIncNumber } from "@/utils/utils";
import { getClaimByIncNumber } from "@/utils/queries/claims";
import { insertNote } from "@/utils/queries/notes";
import { checkRequestAuth } from "@/utils/backendUtils";

export async function POST(req: NextRequest) {
  const authError = checkRequestAuth(req);
  if (authError) return authError;

  try {
    const { content, user_name, origin, inc_number } = await req.json();

    if (!content || !inc_number) {
      return NextResponse.json(
        {
          success: false,
          reason: "MISSING_FIELDS",
          details: "Message and incident number are required",
        },
        { status: 200 }
      );
    }

    const normalizedInc = normalizeIncNumber(inc_number);

    const { data: claim, error: claimError } = await getClaimByIncNumber(
      normalizedInc
    );

    if (claimError || !claim) {
      return NextResponse.json(
        {
          success: false,
          reason: "INCIDENT_NOT_FOUND",
          details: `Incident ${normalizedInc} does not exist`,
        },
        { status: 200 }
      );
    }

    if (claim.status !== "in_progress") {
      return NextResponse.json(
        {
          success: false,
          reason: "INCIDENT_NOT_IN_PROGRESS",
          details: `Incident ${normalizedInc} is resolved or cancelled`,
        },
        { status: 200 }
      );
    }

    const cleanText = htmlToText(content, { wordwrap: false });

    const { data: noteData, error: noteError } = await insertNote({
      claim_id: claim.id,
      content: cleanText,
      user_name,
      origin,
    });

    if (noteError || !noteData?.length) {
      console.error("Supabase insert error:", noteError);
      return NextResponse.json(
        {
          success: false,
          reason: "NOTE_INSERT_FAILED",
          details: "Could not save note",
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        note: noteData[0],
        details: "Note successfully added",
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    console.error("Unhandled error:", err);
    return NextResponse.json(
      {
        success: false,
        reason: "UNHANDLED_EXCEPTION",
        details: "Request failed internally",
      },
      { status: 200 }
    );
  }
}
