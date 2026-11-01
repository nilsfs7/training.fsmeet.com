"use client";

import { useState } from "react";
import { SessionForm } from "@/components/session-form";
import { useSessions } from "@/components/use-sessions";
import { deleteSession, updateSession } from "@/lib/sync";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function EditForm({ id }: { id: string }) {
  const { sessions, ready } = useSessions();
  const session = sessions.find((item) => item.id === id);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  if (!UUID.test(id)) return <p className="meta">This session is not on this phone.</p>;
  if (!ready) return <p className="meta">Loading sessions</p>;
  if (!session) return <p className="meta">This session is not on this phone.</p>;

  return (
    <>
      <SessionForm
        title="Edit Training"
        submitLabel="Save changes"
        initial={session}
        onSave={async (input) => {
          await updateSession({ ...session, ...input, pending: true });
          window.location.assign("/history");
        }}
      />
      {deleteError ? <p className="error">{deleteError}</p> : null}
      <button
        className="button danger"
        type="button"
        disabled={deleting}
        onClick={async () => {
          if (!confirmingDelete) {
            setConfirmingDelete(true);
            return;
          }
          setDeleting(true);
          setDeleteError(null);
          try {
            await deleteSession(session);
            window.location.assign("/history");
          } catch {
            setDeleting(false);
            setDeleteError("Could not delete on this phone.");
          }
        }}
      >
        {deleting ? "Deleting" : confirmingDelete ? "Delete this session" : "Delete session"}
      </button>
    </>
  );
}
