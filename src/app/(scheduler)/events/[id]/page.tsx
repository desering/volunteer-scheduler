import { RichText } from "@payloadcms/richtext-lexical/react";
import { Box, Container } from "styled-system/jsx";
import { Card } from "@/components/ui/card";
import { EventDetails } from "@/features/events/components";
import { getEventDetails } from "@/lib/services/get-event-details";

export default async function Page({ params }: PageProps<"/events/[id]">) {
  const { id } = await params;

  const data = await getEventDetails(Number(id));

  return (
    <Container width="full">
      <EventDetails.Root id={Number(id)} initialData={data}>
        <Card.Root
          variant="elevated"
          display="grid"
          gridTemplateColumns={{ base: "1fr", md: "1fr auto" }}
        >
          <Card.Header>
            <Card.Title fontSize="2xl">{data?.title}</Card.Title>
            {data?.description && (
              <Card.Description>
                <RichText data={data?.description} />
              </Card.Description>
            )}
          </Card.Header>
          <Box>
            <Card.Body>
              <EventDetails.ToggleGroup />
            </Card.Body>
            <Card.Footer>
              <EventDetails.Actions />
            </Card.Footer>
          </Box>
        </Card.Root>
      </EventDetails.Root>
    </Container>
  );
}
