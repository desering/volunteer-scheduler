"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { EventDetailsDrawer } from "@/components/event-details-sheet";

export default function Page({ params }: PageProps<"/events/[id]">) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isDrawerOpen, setIsDrawerOpen] = useState(true);

  const onCloseHandler = () => {
    console.log("Closing drawer for event id:", id);
    setIsDrawerOpen(false);
    queryClient.invalidateQueries({ queryKey: ["eventsByDay"] });
    queryClient.invalidateQueries({ queryKey: ["events"], exact: false });
  };

  return (
    <EventDetailsDrawer
      open={isDrawerOpen}
      eventId={Number(id)}
      onClose={onCloseHandler}
      onExitComplete={() => router.back()}
    />
  );
}
