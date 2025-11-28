import Link from "next/link";
import ClaimCard from "@/components/ClaimCard";
import { getClaims } from "@/lib/queries/claims";

export default async function ClaimsPage() {
  const { data: claims, error } = await getClaims();

  if (error) {
    console.error("Error fetching claims:", error);
    return <p>Failed to load claims</p>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold mb-6">Warranty Claims</h1>
      <p className="mb-6 text-gray-600 dark:text-zinc-400">
        List of warranty claims. Click on a claim to see details and timeline
      </p>

      {/* EMPTY STATE */}
      {(!claims || claims.length === 0) && (
        <p className="text-gray-500 text-sm border rounded-lg p-4 text-center">
          No claims found
        </p>
      )}

      {/* LIST */}
      <div className="flex flex-col gap-4">
        {claims?.map((claim) => (
          <Link key={claim.id} href={`/claims/${claim.id}`}>
            <ClaimCard
              claim={{
                id: claim.id,
                title: claim.inc_number,
                status: "In Progress",
              }}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
