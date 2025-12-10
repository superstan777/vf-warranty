import { NextRequest } from "next/server";
import { insertAttachment, uploadToStorage } from "@/utils/queries/attachments";
import {
  checkRequestAuth,
  apiResponse,
  dbErrorResponse,
} from "@/utils/backendUtils";

export async function POST(req: NextRequest) {
  const authError = checkRequestAuth(req);
  if (authError) return authError;

  try {
    const { claim_id, note_id, file_name, content_type, content_base_64 } =
      await req.json();

    if (!note_id || !file_name || !content_type || !content_base_64) {
      return apiResponse(
        "note_id, file_name, content_type and content_base_64 are required",
        false,
        undefined,
        400,
        "MISSING_FIELDS"
      );
    }

    // --- DECODE BASE64 ---
    let fileBuffer: Buffer;
    try {
      fileBuffer = Buffer.from(content_base_64, "base64");
    } catch (err) {
      return apiResponse(
        "content_base_64 is not valid base64",
        false,
        undefined,
        400,
        "INVALID_BASE64",
        err
      );
    }

    const storagePath = `${claim_id}/${note_id}/${file_name}`;

    // --- UPLOAD TO STORAGE ---
    const { data: uploadData, error: uploadError } = await uploadToStorage(
      storagePath,
      fileBuffer,
      content_type
    );

    if (uploadError) {
      return apiResponse(
        "Could not upload file to storage",
        false,
        undefined,
        500,
        "UPLOAD_FAILED",
        uploadError
      );
    }

    // Final path — w razie gdyby Supabase zmienił nazwę
    const finalPath = uploadData?.path ?? storagePath;

    // --- SAVE METADATA IN DB ---
    const { data: attachmentData, error: insertError } = await insertAttachment(
      {
        note_id,
        path: finalPath,
      }
    );

    if (insertError) {
      return dbErrorResponse("Supabase error (insertAttachment):", insertError);
    }

    return apiResponse(
      "Attachment successfully uploaded.",
      true,
      attachmentData?.[0] ?? { path: finalPath },
      201
    );
  } catch (err) {
    console.error("Unhandled error:", err);
    return apiResponse(
      "Unexpected internal error.",
      false,
      undefined,
      500,
      "UNHANDLED_EXCEPTION",
      err
    );
  }
}
