import { useQuery } from "@tanstack/react-query";
import { Check, ChevronDown, MapPinIcon, TagIcon } from "lucide-react";
import { Box, Flex, HStack } from "styled-system/jsx";
import { Button } from "@/components/ui/button";
import { Menu } from "@/components/ui/menu";
import { Text } from "@/components/ui/text";

type Tag = {
  id: number;
  text: string;
};

type Location = {
  id: number;
  title: string;
};

export type Filter = {
  id: number;
  label: string;
  type: "location" | "tag";
};

const fetchTagsAndLocations = async (): Promise<Filter[]> => {
  const tagRes = await fetch("/api/tags");
  const locationsRes = await fetch("/api/locations");
  const tagData = (await tagRes.json()) as { docs: Tag[] };
  const locationsData = (await locationsRes.json()) as { docs: Location[] };
  const tagFilters: Filter[] = tagData.docs.map((tag) => ({
    id: tag.id,
    label: tag.text,
    type: "tag",
  }));
  const locationFilters: Filter[] = locationsData.docs.map((loc) => ({
    id: loc.id,
    label: loc.title,
    type: "location",
  }));
  const result = [...tagFilters, ...locationFilters];
  return result;
};

type FilterFilterProps = {
  selectedFilters: Filter[];
  onFilterChange: (tags: Filter[]) => void;
};

export const TagFilter = ({
  selectedFilters,
  onFilterChange,
}: FilterFilterProps) => {
  const { data: filters = [], isPending } = useQuery<Filter[]>({
    queryKey: ["filters"],
    queryFn: fetchTagsAndLocations,
  });

  if (isPending) {
    return (
      <Box>
        <Flex alignItems="center" gap="2" marginBottom="4" position="relative">
          <Button variant="outline" disabled>
            Filter
            <ChevronDown size={16} />
          </Button>
        </Flex>
      </Box>
    );
  }

  if (filters.length === 0) {
    return null;
  }

  const handleToggleFilter = (filter: Filter) => {
    if (selectedFilters.includes(filter)) {
      onFilterChange(selectedFilters.filter((t) => t !== filter));
    } else {
      onFilterChange([...selectedFilters, filter]);
    }
  };

  const handleClearTags = () => {
    onFilterChange([]);
  };

  const visibleTags = filters?.filter((l) => l.type === "tag") ?? [];
  const visibleLocations = filters?.filter((l) => l.type === "location") ?? [];

  const getButtonFilter = () => {
    if (selectedFilters.length === 0) {
      return "Filter";
    }
    if (selectedFilters.length === 1) {
      return "1 filter selected";
    }
    return `${selectedFilters.length} filters selected`;
  };

  return (
    <Box>
      <Flex alignItems="center" gap="2" marginBottom="4" position="relative">
        <Menu.Root closeOnSelect={false}>
          <Menu.Trigger asChild data-menu-trigger>
            <Button variant="outline">
              {getButtonFilter()}
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
            <Menu.ItemGroup>
              <Menu.ItemGroupLabel fontWeight="bold">
                <HStack gap="2">
                  <TagIcon size={16} style={{ color: "#9ca3af" }} />
                  Tags
                </HStack>
              </Menu.ItemGroupLabel>
              {visibleTags.map((tag) => (
                <Menu.CheckboxItem
                  key={tag.label}
                  value={tag.label}
                  checked={selectedFilters.includes(tag)}
                  onCheckedChange={() => handleToggleFilter(tag)}
                >
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    width="100%"
                  >
                    <Text>{tag.label}</Text>
                    {selectedFilters.includes(tag) && <Check size={16} />}
                  </Box>
                </Menu.CheckboxItem>
              ))}
            </Menu.ItemGroup>
            <Menu.Separator borderColor="border.default" />
            <Menu.ItemGroup>
              <Menu.ItemGroupLabel fontWeight="bold">
                <HStack gap="2">
                  <MapPinIcon size={16} style={{ color: "#9ca3af" }} />
                  Locations
                </HStack>
              </Menu.ItemGroupLabel>
              {visibleLocations.map((loc) => (
                <Menu.CheckboxItem
                  key={loc.label}
                  value={loc.label}
                  checked={selectedFilters.includes(loc)}
                  onCheckedChange={() => handleToggleFilter(loc)}
                >
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    width="100%"
                  >
                    <Text>{loc.label}</Text>
                    {selectedFilters.includes(loc) && <Check size={16} />}
                  </Box>
                </Menu.CheckboxItem>
              ))}
            </Menu.ItemGroup>
            <Menu.Separator borderColor="border.default" />
            <Menu.Item
              value="clear-all"
              onClick={handleClearTags}
              disabled={selectedFilters.length === 0}
            >
              Clear
            </Menu.Item>
          </Menu.Content>
        </Menu.Root>
      </Flex>
    </Box>
  );
};
