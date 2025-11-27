"use server";

import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

export async function getClaims() {
  return await supabase
    .from("claims")
    .select("*")
    .order("created_at", { ascending: false });
}

export async function getClaimById(claimId: string) {
  const { data, error } = await supabase
    .from("claims")
    .select("*")
    .eq("id", claimId)
    .single();

  return { data, error };
}
