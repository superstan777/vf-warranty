import { createClient } from "@/utils/supabase/client";
import type { TablesInsert } from "@/types/supabase";

type Attachment = TablesInsert<"attachments">;

const supabase = createClient();

export const insertAttachment = async ({
  note_id,
  path,
  graph_id,
}: Attachment) => {
  const { data, error } = await supabase
    .from("attachments")
    .insert({ note_id, path, graph_id })
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

export async function getAttachmentsByGraphIds(graphIds: string[]) {
  if (!graphIds.length) return { data: [], error: null };

  return supabase
    .from("attachments")
    .select("graph_id")
    .in("graph_id", graphIds);
}
