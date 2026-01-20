import { useQuery } from "@tanstack/react-query";
import { Check, ChevronDown } from "lucide-react";
import { Box, Flex } from "styled-system/jsx";
import { Button } from "@/components/ui/button";
import { Menu } from "@/components/ui/menu";
import { Text } from "@/components/ui/text";

type Tag = {
  id: number;
  text: string;
};

type TagFilterProps = {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  onlyTags?: string[];
};

export const TagFilter = ({
  selectedTags,
  onTagsChange,
  onlyTags,
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

  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter((t) => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const handleClearTags = () => {
    onTagsChange([]);
  };

  const visibleTags =
    onlyTags && onlyTags.length > 0
      ? tags.filter((t) => onlyTags.includes(t.text))
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
                key={tag.text}
                value={tag.text}
                checked={selectedTags.includes(tag.text)}
                onCheckedChange={() => handleToggleTag(tag.text)}
              >
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  width="100%"
                >
                  <Text>{tag.text}</Text>
                  {selectedTags.includes(tag.text) && <Check size={16} />}
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
