import { NoteForm } from "@/components/NoteForm";
import MessageBubble from "../../../components/MessageBubble";
import { getClaimById } from "@/lib/queries/claims";
import { getNotesByClaimId } from "@/lib/queries/notes";

interface ClaimPageProps {
  params: Promise<{ claimId: string }>;
}

export default async function ClaimPage({ params }: ClaimPageProps) {
  const { claimId } = await params;

  const { data: claim, error: claimError } = await getClaimById(claimId);

  if (claimError || !claim) {
    console.error("Error fetching claim:", claimError);
    return <p>Failed to load claim.</p>;
  }

  const { data: notes, error: notesError } = await getNotesByClaimId(claimId);

  if (notesError) {
    console.error("Error fetching notes:", notesError);
  }

  return (
    <div className="p-8 max-w-3xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-semibold mb-2">{claim.inc_number}</h1>
        <p className="text-gray-600 mb-6">{claim.description}</p>
      </div>

      <NoteForm claimId={claimId} />

      <div className="flex flex-col gap-6">
        {notes && notes.length > 0 ? (
          notes.map((note, index) => (
            <MessageBubble
              key={note.id}
              content={note.content}
              createdAt={note.created_at}
              userName={note.user_name}
              isRight={index % 2 === 0}
            />
          ))
        ) : (
          <p className="text-gray-500 text-sm text-center">No notes found</p>
        )}
      </div>
    </div>
  );
}
