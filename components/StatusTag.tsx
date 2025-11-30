import type { Tables } from "@/types/supabase";

type Claim = Tables<"claims">;

interface StatusTagProps {
  status: Claim["status"];
}

const statusStyles: Record<Claim["status"], string> = {
  in_progress:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  cancelled: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  resolved:
    "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
};

export default function StatusTag({ status }: StatusTagProps) {
  return (
    <span
      className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${statusStyles[status]}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}
