import { RichText } from "@payloadcms/richtext-lexical/react";
import { Box, Container, Flex } from "styled-system/jsx";
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
          variant="subtle"
          direction={{ base: "vertical", md: "horizontal" }}
        >
          <Box flex="1">
            <Card.Title fontSize="2xl">{data?.title}</Card.Title>
            {data?.description && (
              <Card.Description>
                <RichText data={data?.description} />
              </Card.Description>
            )}
          </Box>
          <Flex flexDirection="column" gap="4">
            <EventDetails.ToggleGroup />
            <EventDetails.Actions />
          </Flex>
        </Card.Root>
      </EventDetails.Root>
    </Container>
  );
}
