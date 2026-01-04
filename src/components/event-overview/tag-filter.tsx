import { useQuery } from "@tanstack/react-query";
import { Check, ChevronDown } from "lucide-react";
import { Box, Flex } from "styled-system/jsx";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Menu } from "@/components/ui/menu";

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

  if (tags.length === 0) {
    return null;
  }

  const handleToggleTag = (tagId: number) => {
    if (selectedTags.includes(tagId)) {
      onTagsChange(selectedTags.filter((id) => id !== tagId));
    } else {
      onTagsChange([...selectedTags, tagId]);
    }
  };

  const handleClearTags = () => {
    onTagsChange([]);
  };

  const visibleTags =
    onlyTagIds && onlyTagIds.length > 0
      ? tags.filter((t) => onlyTagIds.includes(t.id))
      : tags;

  const getButtonLabel = () => {
    if (selectedTags.length === 0) {
      return "Filter by tags";
    }
    if (selectedTags.length === 1) {
      return "1 tag selected";
    }
    return `${selectedTags.length} tags selected`;
  };

  return (
    <Box>
      <Flex alignItems="center" gap="2" marginBottom="4" position="relative">
        <Menu.Root closeOnSelect={false}>
          <Menu.Trigger asChild data-menu-trigger>
            <Button variant="outline">
              {getButtonLabel()}
              <ChevronDown size={16} />
            </Button>
          </Menu.Trigger>
          <Menu.Content
            maxWidth="64"
            position="absolute"
            zIndex="50"
            left="0"
            top="100%"
            marginTop="2"
          >
            {visibleTags.map((tag) => (
              <Menu.CheckboxItem
                key={tag.id}
                value={tag.id.toString()}
                checked={selectedTags.includes(tag.id)}
                onCheckedChange={() => handleToggleTag(tag.id)}
              >
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  width="100%"
                >
                  <Text>{tag.text}</Text>
                  {selectedTags.includes(tag.id) && <Check size={16} />}
                </Box>
              </Menu.CheckboxItem>
            ))}
            <Menu.Separator />
            <Menu.Item
              value="clear-all"
              onClick={handleClearTags}
              disabled={selectedTags.length === 0}
            >
              Clear
            </Menu.Item>
          </Menu.Content>
        </Menu.Root>
      </Flex>
    </Box>
  );
};
