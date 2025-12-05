import { CloudOffIcon, CircleX } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

interface ErrorComponentProps {
  type: "database" | "claim";
}

export function ErrorComponent({ type }: ErrorComponentProps) {
  return (
    <div className="absolute top-0 left-0 w-full h-screen flex flex-col items-center justify-center">
      <Empty className="text-center">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            {type === "database" ? (
              <CloudOffIcon size={48} />
            ) : (
              <CircleX size={48} />
            )}
          </EmptyMedia>
          <EmptyTitle className="text-2xl font-semibold mb-2">Oops!</EmptyTitle>
          <EmptyDescription className="text-gray-600">
            {type === "database"
              ? "We are having trouble connecting to the database. Please try again in a few minutes."
              : "The claim number you entered does not exist. Please check the URL or try again."}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );
}
