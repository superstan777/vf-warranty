import Link from "next/link";
import ClaimCard from "@/components/ClaimCard";
import { getClaims } from "@/utils/queries/claims";

export default async function ClaimsPage() {
  const { data: claims, error } = await getClaims();

  if (error) {
    console.error("Error fetching claims:", error);
    return (
      <div className="p-8 max-w-4xl mx-auto text-center">
        <p className="text-gray-600">
          Oops! We couldn't load the claims at the moment. Please refresh the
          page or try again in a few minutes
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">Warranty Claims</h1>
        <p className="text-gray-600 dark:text-zinc-400">
          List of warranty claims. Click on a claim to see details and timeline
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {!claims || claims.length === 0 ? (
          <div className="text-gray-500 text-sm p-6 border rounded-lg text-center">
            No claims found
          </div>
        ) : (
          claims.map((claim) => (
            <Link key={claim.id} href={`/claims/${claim.id}`}>
              <ClaimCard claim={claim} />
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
