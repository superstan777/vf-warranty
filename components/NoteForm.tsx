"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

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

export function NoteForm({ claimId }: { claimId: string }) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      note: "",
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      toast.promise(() => addNote(claimId, data.note), {
        loading: "Adding note...",
        success: "Note added successfully",
        error: "Failed to add note",
      });

      form.reset();
    } catch (error) {
      console.error(error);
    }
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
