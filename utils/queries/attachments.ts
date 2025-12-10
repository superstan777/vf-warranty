import { createClient } from "@/utils/supabase/client";
import type { Tables } from "@/types/supabase";

type Attachment = Tables<"attachments">;

const supabase = createClient();

export const insertAttachment = async ({
  note_id,
  path,
}: Pick<Attachment, "note_id" | "path">) => {
  const { data, error } = await supabase
    .from("attachments")
    .insert({ note_id, path })
    .select();

  return { data, error };
};

export const uploadToStorage = async (
  storagePath: string,
  fileBuffer: Buffer,
  contentType: string
) => {
  const { data, error } = await supabase.storage
    .from("attachments")
    .upload(storagePath, fileBuffer, {
      contentType,
      upsert: true,
    });
  return { data, error };
};
