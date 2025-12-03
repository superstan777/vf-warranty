import { createClient } from "@/utils/supabase/client";
import type { Tables } from "@/types/supabase";

type PendingNote = Tables<"pending_notes">;

const supabase = createClient();

export const isPendingNote = async (user_name: string) => {
  const { data, error } = await supabase
    .from("pending_notes")
    .select("id")
    .eq("user_name", user_name)
    .limit(1);

  return { exists: data && data.length > 0, error };
};

export const insertPendingNote = async ({
  user_name,
  content,
}: Pick<PendingNote, "user_name" | "content">) => {
  const { data, error } = await supabase
    .from("pending_notes")
    .insert({ user_name, content })
    .select();

  return { data, error };
};

export const deletePendingNoteByUser = async (
  user_name: string
): Promise<{ error: unknown }> => {
  const { error } = await supabase
    .from("pending_notes")
    .delete()
    .eq("user_name", user_name);

  return { error };
};

export const getPendingNote = async (user_name: string) => {
  const { data, error } = await supabase
    .from("pending_notes")
    .select("*")
    .eq("user_name", user_name)
    .limit(1)
    .maybeSingle();

  return { data, error };
};
