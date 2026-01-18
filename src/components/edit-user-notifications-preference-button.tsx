"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { useState } from "react";
import { HStack } from "styled-system/jsx";
import { notificationChannels } from "@/constants/notification-channels";
import { notificationTypes } from "@/constants/notification-types";
import type { User, UserNotificationPreference } from "@/payload-types";
import { Button } from "./ui/button";
import { Dialog } from "./ui/dialog";
import { Switch } from "./ui/switch";
import { Text } from "./ui/text";
import { toaster } from "./ui/toast";

type Props = {
  user: User;
};

export function EditUserNotificationPreferences({ user }: Props) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: notificationPreferences = [] } = useQuery<
    UserNotificationPreference[]
  >({
    queryKey: ["notification-preferences"],
    queryFn: async () => {
      const res = await fetch("/api/users/me/notification-preferences");
      const data = (await res.json()) as { data: UserNotificationPreference[] };
      return data.data;
    },
  });

  const { mutate: updatePreference, isPending } = useMutation({
    mutationFn: async ({
      type,
      channel,
      preference,
    }: {
      type: string;
      channel: string;
      preference: boolean;
    }) => {
      const existingPreference = notificationPreferences.find(
        (pref) => pref.type === type && pref.channel === channel,
      );

      if (existingPreference) {
        const res = await fetch(`/api/users/me/notification-preferences`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: existingPreference.id, preference }),
        });
        if (!res.ok) throw new Error("Failed to update preference");
        return res.json();
      } else {
        const res = await fetch("/api/users/me/notification-preferences", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user: user.id,
            type,
            channel,
            preference,
          }),
        });
        if (!res.ok) throw new Error("Failed to create preference");
        return res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-preferences"] });
      toaster.create({
        type: "success",
        title: "Notification preference updated",
      });
    },
    onError: () => {
      toaster.create({
        type: "error",
        title: "Failed to update notification preference",
      });
    },
  });

  const getPreferenceValue = (type: string, channel: string) => {
    const preference = notificationPreferences.find(
      (pref) => pref.type === type && pref.channel === channel,
    );
    return preference?.preference ?? true;
  };

  const handlePreferenceChange = (
    type: string,
    channel: string,
    preference: boolean,
  ) => {
    updatePreference({ type, channel, preference });
  };

  return (
    <Dialog.Root open={open} onOpenChange={({ open }) => setOpen(open)}>
      <Dialog.Trigger asChild>
        <Button variant="outline">
          <Bell />
          Notifications Settings
        </Button>
      </Dialog.Trigger>

      <Dialog.Backdrop />

      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.CloseTrigger />

          <Dialog.Header>
            <Dialog.Title>Notification Preferences</Dialog.Title>
            <Dialog.Description>
              Choose how you want to be notified.
            </Dialog.Description>
          </Dialog.Header>

          <Dialog.Body gap="4" alignItems="stretch">
            {Object.values(notificationTypes).map((type) => (
              <div key={type.key}>
                <Text size="sm" fontWeight="medium" marginBottom="2">
                  {type.displayName}
                </Text>
                <HStack gap="4">
                  {Object.values(notificationChannels).map((channel) => (
                    <Switch.Root
                      key={channel}
                      checked={getPreferenceValue(type.key, channel)}
                      disabled={isPending}
                      onCheckedChange={(checked) =>
                        handlePreferenceChange(
                          type.key,
                          channel,
                          checked.checked,
                        )
                      }
                    >
                      <Switch.HiddenInput />
                      <Switch.Control>
                        <Switch.Thumb />
                      </Switch.Control>
                      <Switch.Label>{channel}</Switch.Label>
                    </Switch.Root>
                  ))}
                </HStack>
              </div>
            ))}
          </Dialog.Body>

          <Dialog.Footer>
            <Button
              variant="outline"
              type="button"
              onClick={() => setOpen(false)}
            >
              Close
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
