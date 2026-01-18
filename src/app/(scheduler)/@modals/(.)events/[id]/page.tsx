"use client";

import { Portal } from "@ark-ui/react";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { useAuth } from "@payloadcms/ui/providers/Auth";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { SquarePenIcon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useEffect, useMemo, useState } from "react";
import { Flex, HStack } from "styled-system/jsx";
import { hstack } from "styled-system/patterns";
import { Badge } from "@/components/ui/badge";
import { IconButton } from "@/components/ui/icon-button";
import { Link } from "@/components/ui/link";
import { Sheet } from "@/components/ui/sheet";
import { EventDetails } from "@/features/events";
import { useEventDetailsQuery } from "@/features/events/hooks/use-event-details-query";
import { eventsQueryConfig } from "@/features/events/hooks/use-events-query";

export default function Page({ params }: PageProps<"/events/[id]">) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isDrawerOpen, setIsDrawerOpen] = useState(true);

  const { user } = useAuth();
  const { data, isLoading } = useEventDetailsQuery(Number(id));

  const timeRange = useMemo(() => {
    const start = data?.start_date;
    const end = data?.end_date;

    if (!start || !end) return;

    return `${format(start, "iiii dd MMMM")}, ${format(start, "HH:mm")} - ${format(end, "HH:mm")}`;
  }, [data]);

  // Invalidate events both when the drawer is closed normally or when navigating back
  useEffect(() => {
    if (!isDrawerOpen) {
      queryClient.invalidateQueries({
        ...eventsQueryConfig(),
      });
    }

    return () => {
      if (isDrawerOpen) return;

      queryClient.invalidateQueries({
        ...eventsQueryConfig(),
        stale: false,
      });
    };
  }, [queryClient.invalidateQueries, isDrawerOpen]);

  return (
    <EventDetails.Root id={Number(id)}>
      <Sheet.Root
        open={isDrawerOpen}
        onExitComplete={() => router.back()}
        onOpenChange={({ open }) => {
          !open && setIsDrawerOpen(false);
        }}
        variant={{
          base: "bottom",
          md: "right",
        }}
        unmountOnExit
      >
        <Portal>
          <Sheet.Backdrop />
          <Sheet.Positioner>
            <Sheet.Content
              maxHeight={{ base: "80vh", md: "100vh" }}
              overflowY="auto"
              display="flex"
              flexDirection="column"
              style={{
                display: isLoading ? "none" : undefined,
              }}
            >
              <Sheet.Header flexGrow="1">
                <Flex gap="2" alignItems="flex-end">
                  <Sheet.Title fontSize="2xl">{data?.title}</Sheet.Title>

                  {user?.roles?.includes("admin") && (
                    <Link
                      href={`/admin/collections/events/${id}`}
                      target={"_blank"}
                      className={hstack({ gap: "1" })}
                    >
                      edit
                      <SquarePenIcon size={16} />
                    </Link>
                  )}
                </Flex>

                <Sheet.Description
                  display="flex"
                  flexDirection="column"
                  alignItems="start"
                  gap="2"
                >
                  {timeRange && <Badge>{timeRange}</Badge>}

                  {(data?.tags.length ?? 0) > 0 && (
                    <HStack gap="2">
                      {data?.tags.map((tag) =>
                        typeof tag === "object" && tag !== null ? (
                          <Badge key={tag.id}>{tag.text}</Badge>
                        ) : null,
                      )}
                    </HStack>
                  )}

                  {data?.description && <RichText data={data.description} />}
                </Sheet.Description>

                <Sheet.CloseTrigger asChild>
                  <IconButton variant="ghost" size="lg">
                    <XIcon />
                  </IconButton>
                </Sheet.CloseTrigger>
              </Sheet.Header>

              <Sheet.Body>
                <EventDetails.ToggleGroup />
              </Sheet.Body>

              <Sheet.Footer justifyContent="center">
                <EventDetails.Actions />
              </Sheet.Footer>
            </Sheet.Content>
          </Sheet.Positioner>
        </Portal>
      </Sheet.Root>
    </EventDetails.Root>
  );
}
