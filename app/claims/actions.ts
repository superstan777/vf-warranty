"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/client";
import { auth } from "@/auth";

export async function createClaim(title: string, description: string) {
  const session = await auth();
  const supabase = createClient();

  if (!session?.user?.name) {
    throw new Error("User name is missing");
  }

  const { data, error } = await supabase
    .from("claims")
    .insert({
      title,
      description,
      user_name: session.user.name,
    })
    .select();

  if (error) {
    console.error("Failed to create claim:", error);
    throw new Error("Failed to create claim");
  }

  // Opcjonalnie odświeżamy listę claims
  revalidatePath("/claims");

  return data[0]; // zwracamy nowo utworzony claim
}
