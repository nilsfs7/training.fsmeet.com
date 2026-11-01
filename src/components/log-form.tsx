"use client";

import { SessionForm } from "@/components/session-form";
import { captureSession } from "@/lib/sync";

export function LogForm() {
  return (
    <SessionForm
      title="Log Training"
      submitLabel="Save session"
      onSave={async (input) => {
        await captureSession(input);
        window.location.assign("/");
      }}
    />
  );
}
