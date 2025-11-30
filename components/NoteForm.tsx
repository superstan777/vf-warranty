"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Textarea } from "./ui/textarea";
import { addNote } from "@/app/claims/[claimId]/actions";

const formSchema = z.object({
  note: z.string().min(1, "Note cannot be empty"),
});

interface NoteFormProps {
  claimId: string;
  status: "in_progress" | "resolved" | "cancelled";
}

export function NoteForm({ claimId, status }: NoteFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { note: "" },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      await toast.promise(() => addNote(claimId, data.note, "app"), {
        loading: "Adding note...",
        success: "Note added successfully",
        error: "Failed to add note",
      });

      form.reset();
    } catch (err) {
      console.error(err);
    }
  }

  if (status === "resolved" || status === "cancelled") {
    const messages = {
      resolved: "This claim has been resolved",
      cancelled: "This claim has been cancelled",
    };

    return (
      <Card className="w-full">
        <CardContent className="text-center text-gray-700 dark:text-zinc-300 font-medium">
          {messages[status]}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardContent>
        <form id="note-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="note"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="note-form-content">
                    Add a new note
                  </FieldLabel>
                  <Textarea
                    {...field}
                    id="note-form-content"
                    placeholder="Write your note here..."
                    rows={6}
                    className="min-h-24 resize-none"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="justify-end">
        <Button type="submit" form="note-form">
          Add note
        </Button>
      </CardFooter>
    </Card>
  );
}
