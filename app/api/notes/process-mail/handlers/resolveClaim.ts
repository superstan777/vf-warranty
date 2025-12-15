import { normalizeIncNumber } from "@/utils/utils";
import { getClaimByIncNumber } from "@/utils/queries/claims";
import { apiResponse, dbErrorResponse } from "@/utils/backendUtils";

export async function resolveClaim(inc_number: string) {
  const normalizedInc = normalizeIncNumber(inc_number);
  const { data: claim, error } = await getClaimByIncNumber(normalizedInc);

  if (error) {
    return {
      error: dbErrorResponse("Supabase error (getClaimByIncNumber):", error),
    };
  }

  if (!claim || claim.status !== "in_progress") {
    return {
      error: apiResponse(
        "Incident not eligible for notes. Message processed.",
        true,
        undefined,
        200
      ),
    };
  }

  return { claim };
}
