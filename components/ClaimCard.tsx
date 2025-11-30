import type { Tables } from "@/types/supabase";
import StatusTag from "./StatusTag";

type Claim = Tables<"claims">;

interface ClaimCardProps {
  claim: Claim;
}

export default function ClaimCard({ claim }: ClaimCardProps) {
  return (
    <div className="p-4 rounded-lg border border-gray-200 dark:border-zinc-700 shadow-sm hover:shadow-md transition cursor-pointer bg-white dark:bg-zinc-800">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-500 dark:text-zinc-400">
          {claim.inc_number}
        </span>

        <StatusTag status={claim.status} />
      </div>

      <h2 className="text-lg font-semibold text-black dark:text-zinc-50 leading-tight">
        {claim.title}
      </h2>
    </div>
  );
}
