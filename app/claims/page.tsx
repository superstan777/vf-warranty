import Link from "next/link";
import ClaimCard from "../../components/ClaimCard";

const claims: {
  id: string;
  title: string;
  status: "In Progress" | "Pending" | "Closed";
}[] = [
  { id: "1", title: "Claim #1 - Broken Screen", status: "In Progress" },
  { id: "2", title: "Claim #2 - Battery Issue", status: "Pending" },
  { id: "3", title: "Claim #3 - Software Bug", status: "Closed" },
  { id: "4", title: "Claim #4 - Missing Parts", status: "In Progress" },
  { id: "5", title: "Claim #5 - Overheating", status: "Pending" },
];

export default function ClaimsPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold mb-6">Warranty Claims</h1>
      <p className="mb-6 text-gray-600 dark:text-zinc-400">
        This is a mock list of warranty claims. Click on a claim to see details
        and timeline.
      </p>
      <div className="flex flex-col gap-4">
        {claims.map((claim) => (
          <Link key={claim.id} href={`/claims/${claim.id}`}>
            <ClaimCard claim={claim} />
          </Link>
        ))}
      </div>
    </div>
  );
}
