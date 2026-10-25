"use client";

import { BellDot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sendTestNotification } from "./send-push-notification";

export function SendPushNotification() {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={() => {
        void sendTestNotification();
      }}
    >
      <BellDot />
      Send Test Notification
    </Button>
  );
}
