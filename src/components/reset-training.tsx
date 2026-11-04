"use client";

import { useState } from "react";
import { resetTraining } from "@/lib/sync";

export function ResetTraining() {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <section className="card account-card">
      <p className="eyebrow">Training</p>
      <p className="meta">Deletes every saved session.</p>
      {confirming ? (
        <p className="category-warning" role="status">
          Delete all training data?
        </p>
      ) : null}
      {error ? <p className="error">{error}</p> : null}
      <button
        className="button danger"
        type="button"
        disabled={deleting}
        onClick={() => {
          if (!confirming) {
            setConfirming(true);
            return;
          }
          setDeleting(true);
          setError(null);
          resetTraining()
            .then(() => setConfirming(false))
            .catch(() => setError("Could not delete training."))
            .finally(() => setDeleting(false));
        }}
      >
        {deleting ? "Deleting" : confirming ? "Delete all training" : "Reset"}
      </button>
    </section>
  );
}
