"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { insertClaim } from "@/utils/queries/claims";

export async function createClaim(title: string, description: string) {
  const session = await auth();

  if (!session?.user?.name) {
    throw new Error("User name is missing");
  }

  const { data, error } = await insertClaim({
    title,
    description,
    created_by: session.user.name,
  });

  if (error || !data || data.length === 0) {
    console.error("Failed to create claim:", error);
    throw new Error("Failed to create claim");
  }

  revalidatePath("/claims");

  return data[0];
}
