"use server";

import { createClient } from "@/utils/supabase/client";

const supabase = createClient();
export async function getNotesByClaimId(claimId: string) {
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("claim_id", claimId)
    .order("created_at", { ascending: false });

  return { data, error };
}
