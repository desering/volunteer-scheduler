// src/components/register-push-notifications-button.tsx
"use client";

import { BellDot } from "lucide-react";
import { registerPushNotification } from "@/components/push-notification";
import { Button } from "@/components/ui/button";

export function RegisterPushNotificationsButton() {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={() => {
        void registerPushNotification();
      }}
    >
      <BellDot />
      Register push notifications
    </Button>
  );
}
