import MessageBubble from "../../../components/MessageBubble";
import Attachment from "../../../components/Attachment";

const messages = [
  {
    id: 1,
    content: "Client reported a broken screen.",
    timestamp: "2025-11-26 09:15",
    attachments: [],
  },
  {
    id: 2,
    content: "Technician replied: scheduled repair for tomorrow.",
    timestamp: "2025-11-26 10:00",
    attachments: [],
  },
  {
    id: 3,
    content: "Client uploaded a photo of the broken screen.",
    timestamp: "2025-11-26 10:15",
    attachments: [
      {
        id: 1,
        filename: "broken_screen.jpg",
        url: "/mock-images/broken_screen.jpg",
      },
    ],
  },
  {
    id: 4,
    content: "Repair completed. Issue resolved.",
    timestamp: "2025-11-26 12:30",
    attachments: [],
  },
  {
    id: 5,
    content: "Repair completed. Issue resolved.",
    timestamp: "2025-11-26 12:30",
    attachments: [],
  },
  {
    id: 6,
    content: "Repair completed. Issue resolved.",
    timestamp: "2025-11-26 12:30",
    attachments: [],
  },
  {
    id: 7,
    content: "Repair completed. Issue resolved.",
    timestamp: "2025-11-26 12:30",
    attachments: [],
  },
  {
    id: 8,
    content: "Repair completed. Issue resolved.",
    timestamp: "2025-11-26 12:30",
    attachments: [],
  },
];

interface ClaimPageProps {
  params: Promise<{ claimId: string }>;
}

export default async function ClaimPage({ params }: ClaimPageProps) {
  const { claimId } = await params;

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-semibold mb-6">Claim #{claimId}</h1>
      <div className="flex flex-col gap-6">
        {messages
          .slice(0)
          .reverse()
          .map((msg, index) => (
            <MessageBubble key={msg.id} message={msg} isRight={index % 2 === 0}>
              {msg.attachments.map((att) => (
                <Attachment key={att.id} attachment={att} />
              ))}
            </MessageBubble>
          ))}
      </div>
    </div>
  );
}
