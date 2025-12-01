import { createClient } from "@/utils/supabase/client";
import { getBotAccessToken } from "@/utils/botToken";

export async function processAttachments(noteId: string, attachments: any[]) {
  const supabase = createClient();
  const botToken = await getBotAccessToken();

  console.log(attachments);

  console.log(
    `Processing ${attachments.length} attachments for note ${noteId}`
  );

  for (const att of attachments) {
    try {
      // Forwarded message
      if (att.contentType === "forwardedMessageReference") {
        console.log(
          `Forwarded message detected, saving content as is for note ${noteId}`
        );
        const { error } = await supabase.from("attachments").insert([
          {
            note_id: noteId,
            content: att.content || "",
            content_url: "",
            file_name: "",
          },
        ]);

        if (error)
          console.error("DB error inserting forwarded message:", error);
        else console.log("Forwarded message saved successfully");

        // Plik / obrazek
      } else if (att.contentType === "reference" && att.contentUrl) {
        console.log(`Downloading file from ${att.contentUrl}`);
        const fileData = await fetch(att.contentUrl, {
          headers: { Authorization: `Bearer ${botToken}` },
        }).then((res) => res.arrayBuffer());

        const fileName = att.name || `file_${Date.now()}`;
        const filePath = `attachments/note_${noteId}/${fileName}`;
        console.log(`Uploading file to Supabase Storage at path: ${filePath}`);

        const { error: uploadError } = await supabase.storage
          .from("attachments")
          .upload(filePath, Buffer.from(fileData), { upsert: true });

        if (uploadError) {
          console.error(
            "Failed to upload file to Supabase Storage:",
            uploadError
          );
          continue;
        } else {
          console.log("File uploaded successfully");
        }

        const { error: dbError } = await supabase.from("attachments").insert([
          {
            note_id: noteId,
            content: "",
            content_url: filePath,
            file_name: fileName,
          },
        ]);

        if (dbError)
          console.error("Failed to insert attachment record:", dbError);
        else console.log("Attachment record inserted into DB successfully");
      } else {
        console.log("Skipping unknown attachment type:", att.contentType);
      }
    } catch (err) {
      console.error("Failed to process attachment:", err);
    }
  }

  console.log(`Finished processing attachments for note ${noteId}`);
}
