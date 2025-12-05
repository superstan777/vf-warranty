import { NoteForm } from "@/components/NoteForm";
import MessageBubble from "../../../components/MessageBubble";
import StatusTag from "@/components/StatusTag";
import { getClaimById } from "@/utils/queries/claims";
import { getNotesWithAttachmentsByClaimId } from "@/utils/queries/notes";
import SystemMessageBubble from "@/components/SystemMessageBubble";
import { ErrorComponent } from "@/components/ErrorComponent";

interface ClaimPageProps {
  params: Promise<{ claimId: string }>;
}

export default async function ClaimPage({ params }: ClaimPageProps) {
  const { claimId } = await params;

  const { data: claim, error: claimError } = await getClaimById(claimId);

  if (claimError) {
    console.error("Supabase connection error:", claimError);
    return <ErrorComponent type="database" />;
  }

  if (!claim) {
    return <ErrorComponent type="claim" />;
  }

  const {
    notes,
    attachments,
    error: notesError,
  } = await getNotesWithAttachmentsByClaimId(claimId);
  if (notesError) {
    console.error("Error fetching notes:", notesError);
  }

  return (
    <div className="p-8 max-w-3xl mx-auto flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold">{claim.inc_number}</h1>
          <StatusTag status={claim.status} />
        </div>

        <h2 className="text-xl font-medium text-black dark:text-zinc-100">
          {claim.title}
        </h2>

        <p className="text-gray-600 dark:text-zinc-400">{claim.description}</p>
      </div>

      <NoteForm status={claim.status} claimId={claimId} />

      <div className="flex flex-col gap-6">
        {notes && notes.length > 0 ? (
          notes.map((note, index) => (
            <MessageBubble
              key={note.id}
              note={note}
              attachments={attachments?.[note.id] ?? []}
              isRight={index % 2 === 0}
            />
          ))
        ) : (
          <p className="text-gray-500 text-sm text-center">No notes found</p>
        )}
      </div>
      <SystemMessageBubble
        text={`Claim was created by ${claim.created_by ?? "Unknown user"}`}
        createdAt={claim.created_at}
      />
    </div>
  );
}
