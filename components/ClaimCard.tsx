import type { Tables } from "@/types/supabase";

type Claim = Tables<"claims">;

interface ClaimCardProps {
  claim: Claim;
}

export default function ClaimCard({ claim }: ClaimCardProps) {
  const statusStyles: Record<string, string> = {
    in_progress:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
    cancelled:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
    resolved:
      "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  };

  return (
    <div className="p-4 rounded-lg border border-gray-200 dark:border-zinc-700 shadow-sm hover:shadow-md transition cursor-pointer bg-white dark:bg-zinc-800">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-500 dark:text-zinc-400">
          {claim.inc_number}
        </span>

        <span
          className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${
            statusStyles[claim.status]
          }`}
        >
          {claim.status.replace("_", " ")}
        </span>
      </div>

      <h2 className="text-lg font-semibold text-black dark:text-zinc-50 leading-tight">
        {claim.title}
      </h2>
    </div>
  );
}
