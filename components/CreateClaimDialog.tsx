"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createClaim } from "@/app/claims/actions";

const formSchema = z.object({
  title: z.string().min(1, "Title cannot be empty"),
  description: z.string().min(1, "Description cannot be empty"),
});

export function CreateClaimDialog() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      toast.promise(() => createClaim(data.title, data.description), {
        loading: "Creating claim...",
        success: "Claim created successfully",
        error: "Failed to create claim",
      });

      form.reset();
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <Dialog
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          // resetujemy pola i błędy przy zamykaniu dialogu
          form.reset();
          form.clearErrors();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button>Create New Claim</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Claim</DialogTitle>
          <DialogDescription>
            Provide a title and description for the new claim and submit.
          </DialogDescription>
        </DialogHeader>

        <form id="create-claim-form" onSubmit={form.handleSubmit(onSubmit)}>
          <Controller
            name="title"
            control={form.control}
            render={({ field, fieldState }) => (
              <div className="grid gap-2 mb-4">
                <Label htmlFor="title">Title</Label>
                <Input
                  {...field}
                  id="title"
                  placeholder="Enter claim title..."
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <p className="text-red-600 text-sm">
                    {fieldState.error?.message}
                  </p>
                )}
              </div>
            )}
          />

          <Controller
            name="description"
            control={form.control}
            render={({ field, fieldState }) => (
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  {...field}
                  id="description"
                  placeholder="Enter claim description..."
                  rows={10}
                  className="h-40 min-h-40 max-h-40 resize-none overflow-y-auto"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <p className="text-red-600 text-sm">
                    {fieldState.error?.message}
                  </p>
                )}
              </div>
            )}
          />
        </form>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit" form="create-claim-form">
            Create Claim
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
