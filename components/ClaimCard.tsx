interface ClaimCardProps {
  claim: {
    id: string;
    title: string;
    status: "In Progress" | "Pending" | "Closed";
  };
}

export default function ClaimCard({ claim }: ClaimCardProps) {
  // Kolor statusu w zależności od wartości
  const statusColor = {
    "In Progress": "text-yellow-600 dark:text-yellow-400",
    Pending: "text-blue-600 dark:text-blue-400",
    Closed: "text-green-600 dark:text-green-400",
  };

  return (
    <div className="p-4 rounded-lg border border-gray-200 dark:border-zinc-700 shadow hover:shadow-md transition cursor-pointer bg-white dark:bg-zinc-800">
      <h2 className="text-xl font-medium text-black dark:text-zinc-50">
        {claim.title}
      </h2>
      <p className={`text-sm ${statusColor[claim.status]}`}>{claim.status}</p>
    </div>
  );
}
