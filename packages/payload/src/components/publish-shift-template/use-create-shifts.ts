import { createShiftsFromTemplate } from "@/actions";
import { toast } from "@payloadcms/ui";
import { useState } from "react";

export const useCreateShifts = (
  templateId: number,
  selectedDays: Date[],
  onCreated: () => void,
) => {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string>();

  const createShifts = async () => {
    if (isCreating) return;
    setIsCreating(true);
    setError(undefined);

    try {
      await createShiftsFromTemplate(templateId, selectedDays);
      toast.success("Shifts created successfully");
      onCreated();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unknown error occurred",
      );
      toast.error("Failed to create shifts");
    } finally {
      setIsCreating(false);
    }
  };

  return { isCreating, createShifts, error };
};
