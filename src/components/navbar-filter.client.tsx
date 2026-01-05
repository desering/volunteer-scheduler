"use client";

import { Portal } from "@ark-ui/react";
import { useQuery } from "@tanstack/react-query";
import { Check, FilterIcon, MapPinIcon, TagIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Box, HStack, panda } from "styled-system/jsx";
import { Button } from "@/components/ui/button";
import { Menu } from "@/components/ui/menu";
import { Text } from "@/components/ui/text";

type Tag = {
  id: number;
  text: string;
};

type Location = {
  id: number;
  text: string;
};

export const NavbarFilterClient = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);

  // Sync from URL on mount
  useEffect(() => {
    const tags = searchParams.getAll("tags[]");
    const locations = searchParams.getAll("locations[]");
    if (tags.length > 0) setSelectedTags(tags);
    if (locations.length > 0) setSelectedLocations(locations);
  }, []);

  // Update URL when selections change
  const updateURL = useCallback(
    (tags: string[], locations: string[]) => {
      const params = new URLSearchParams();
      tags.forEach((tag) => params.append("tags[]", tag));
      locations.forEach((loc) => params.append("locations[]", loc));
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router],
  );

  const { data: tags = [] } = useQuery<Tag[]>({
    queryKey: ["tags"],
    queryFn: async () => {
      const res = await fetch("/api/tags");
      const data = (await res.json()) as { docs: Tag[] };
      return data.docs;
    },
  });

  const { data: locations = [] } = useQuery<Location[]>({
    queryKey: ["locations"],
    queryFn: async () => {
      const res = await fetch("/api/locations");
      const data = (await res.json()) as { docs: Location[] };
      return data.docs;
    },
  });

  const handleToggleTag = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(newTags);
    updateURL(newTags, selectedLocations);
  };

  const handleToggleLocation = (location: string) => {
    const newLocations = selectedLocations.includes(location)
      ? selectedLocations.filter((l) => l !== location)
      : [...selectedLocations, location];
    setSelectedLocations(newLocations);
    updateURL(selectedTags, newLocations);
  };

  const handleClearAll = () => {
    setSelectedTags([]);
    setSelectedLocations([]);
    updateURL([], []);
  };

  const totalSelected = selectedTags.length + selectedLocations.length;

  const getButtonLabel = () => {
    if (totalSelected === 0) {
      return "Filter";
    }
    if (totalSelected === 1) {
      return "1 filter";
    }
    return `${totalSelected} filters`;
  };

  if (tags.length === 0 && locations.length === 0) {
    return null;
  }

  return (
    <Menu.Root closeOnSelect={false} positioning={{ placement: "bottom-start" }}>
      <Menu.Trigger asChild data-menu-trigger>
        <Button variant="outline">
          <HStack gap="2">
            <FilterIcon size={16} />
            <panda.span hideBelow="sm">{getButtonLabel()}</panda.span>
          </HStack>
        </Button>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content minWidth="64" maxWidth="250px" zIndex="9999">
            {tags.length > 0 && (
              <>
                <Menu.ItemGroup>
                  <Menu.ItemGroupLabel fontWeight="bold">
                    <HStack gap="2">
                      <TagIcon size={16} style={{ color: '#9ca3af' }} />
                      Tags
                    </HStack>
                  </Menu.ItemGroupLabel>
                  {tags.map((tag) => (
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
                </Menu.ItemGroup>
              </>
            )}

            {tags.length > 0 && locations.length > 0 && <Menu.Separator borderColor="border.default" />}

            {locations.length > 0 && (
              <>
                <Menu.ItemGroup>
                  <Menu.ItemGroupLabel fontWeight="bold">
                    <HStack gap="2">
                      <MapPinIcon size={16} style={{ color: '#9ca3af' }} />
                      Locations
                    </HStack>
                  </Menu.ItemGroupLabel>
                  {locations.map((location) => (
                    <Menu.CheckboxItem
                      key={location.text}
                      value={location.text}
                      checked={selectedLocations.includes(location.text)}
                      onCheckedChange={() => handleToggleLocation(location.text)}
                    >
                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                        width="100%"
                      >
                        <Text>{location.text}</Text>
                        {selectedLocations.includes(location.text) && (
                          <Check size={16} />
                        )}
                      </Box>
                    </Menu.CheckboxItem>
                  ))}
                </Menu.ItemGroup>
              </>
            )}

            <Menu.Separator borderColor="border.default" />
            <Menu.Item
              value="clear-all"
              onClick={handleClearAll}
              disabled={totalSelected === 0}
            >
              Clear all
            </Menu.Item>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
};
