// resolve/helpers/attachments.ts

import { createClient } from "@/utils/supabase/client";
import { getBotAccessToken } from "@/utils/botToken";
import { downloadTeamsFile } from "./graph";

export async function processAttachments(noteId: string, attachments: any[]) {
  const supabase = createClient();
  const botToken = await getBotAccessToken();

  console.log(
    `Processing ${attachments.length} attachments for note ${noteId}`
  );

  for (const att of attachments) {
    try {
      // ---------------------------
      // 1. Forwarded TEXT message
      // ---------------------------
      if (!att.file_name && att.content) {
        console.log("Saving forwarded text message");

        await supabase.from("attachments").insert([
          {
            note_id: noteId,
            content: att.content,
            content_url: "",
            file_name: "",
          },
        ]);

        continue;
      }

      // ---------------------------
      // 2. Teams FILE attachment
      // ---------------------------
      if (att.file_name) {
        const fileName = att.file_name;
        console.log(`Downloading Teams file: ${fileName}`);

        let fileData: ArrayBuffer;

        try {
          fileData = await downloadTeamsFile(botToken, fileName);
        } catch (err) {
          console.error("Graph download failed:", err, att);
          continue;
        }

        const filePath = `attachments/note_${noteId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("attachments")
          .upload(filePath, Buffer.from(fileData), {
            upsert: true,
            contentType: "application/octet-stream",
          });

        if (uploadError) {
          console.error("Supabase upload failed:", uploadError);
          continue;
        }

        await supabase.from("attachments").insert([
          {
            note_id: noteId,
            content: "",
            content_url: filePath,
            file_name: fileName,
          },
        ]);

        console.log(`Attachment ${fileName} saved.`);
        continue;
      }

      // ---------------------------
      // 3. Unknown format
      // ---------------------------
      console.log("Skipping unknown attachment:", att);
    } catch (err) {
      console.error("Failed to process attachment:", err, att);
    }
  }

  console.log(`Finished processing attachments for note ${noteId}`);
}
