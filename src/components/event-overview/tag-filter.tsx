"use client";

import { useQuery } from "@tanstack/react-query";
import { Box, Flex } from "styled-system/jsx";
import { Badge } from "@/components/ui/badge";

type Tag = {
  id: number;
  text: string;
};

type TagFilterProps = {
  selectedTags: number[];
  onTagsChange: (tagIds: number[]) => void;
  onlyTagIds?: number[];
};

export const TagFilter = ({
  selectedTags,
  onTagsChange,
  onlyTagIds,
}: TagFilterProps) => {
  const { data: tags = [] } = useQuery<Tag[]>({
    queryKey: ["tags"],
    queryFn: async () => {
      const res = await fetch("/api/tags");
      const data = (await res.json()) as { docs: Tag[] };
      return data.docs;
    },
  });

  const handleToggleTag = (tagId: number) => {
    if (selectedTags.includes(tagId)) {
      onTagsChange(selectedTags.filter((id) => id !== tagId));
    } else {
      onTagsChange([...selectedTags, tagId]);
    }
  };

  const visibleTags =
    onlyTagIds && onlyTagIds.length > 0
      ? tags.filter((t) => onlyTagIds.includes(t.id))
      : tags;

  return (
    <Box>
      <Flex alignItems="center" gap="2" marginBottom="4">
        <Box display="flex" gap="2" flexWrap="wrap">
          {visibleTags.map((tag) => {
            const isSelected = selectedTags.includes(tag.id);
            return (
              <Badge
                key={tag.id}
                display="inline-flex"
                alignItems="center"
                gap="1"
                paddingX="3"
                height="8"
                variant={isSelected ? "solid" : "subtle"}
                style={{ cursor: "pointer" }}
                onClick={() => handleToggleTag(tag.id)}
                aria-pressed={isSelected}
              >
                <span>{tag.text}</span>
              </Badge>
            );
          })}
        </Box>
      </Flex>
    </Box>
  );
};
