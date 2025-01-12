import { createEventsFromTemplate } from "@/actions";
import type { UTCDate } from "@date-fns/utc";
import { toast } from "@payloadcms/ui";
import { useState } from "react";

export const useCreateEvents = (
  templateId: number,
  selectedDays: UTCDate[],
  onCreated: () => void,
) => {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string>();

  const createEvents = async () => {
    if (isCreating) return;
    setIsCreating(true);
    setError(undefined);

    try {
      await createEventsFromTemplate(templateId, selectedDays);
      toast.success("Events created successfully");
      onCreated();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unknown error occurred",
      );
      toast.error("Failed to create events");
    } finally {
      setIsCreating(false);
    }
  };

  return { isCreating, createEvents, error };
};
