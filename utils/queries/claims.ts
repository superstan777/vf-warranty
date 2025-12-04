"use server";

import { createClient } from "@/utils/supabase/client";
import type { Tables } from "@/types/supabase";

type Claim = Tables<"claims">;

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

export async function getClaimByIncNumber(incNumber: string) {
  const { data, error } = await supabase
    .from("claims")
    .select("id, status")
    .eq("inc_number", incNumber)
    .limit(1)
    .maybeSingle();

  return { data, error };
}

export const insertClaim = async ({
  title,
  description,
  created_by,
}: Pick<Claim, "title" | "description" | "created_by">) => {
  const { data, error } = await supabase
    .from("claims")
    .insert({ title, description, created_by })
    .select();

  return { data, error };
};
