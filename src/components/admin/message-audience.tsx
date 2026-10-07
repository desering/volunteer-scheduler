"use client";

import {
  Button,
  toast,
  useDocumentInfo,
  useFormModified,
} from "@payloadcms/ui";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { css } from "styled-system/css";
import {
  previewMessageAudience,
  sendMessage,
} from "@/actions/admin/message-actions";
import { format } from "@/utils/tz-format";

type Preview = Awaited<ReturnType<typeof previewMessageAudience>>;

const box = css({
  border: "1px solid var(--theme-elevation-150)",
  borderRadius: "4px",
  padding: "16px",
  marginBlock: "24px",
  display: "flex",
  flexDirection: "column",
  gap: "12px",
});

/**
 * Shown under the audience filters on a message: who it will reach, and the
 * Send button. Works on the last SAVED version of the message, so what you
 * preview is exactly what the send job will use.
 */
export const MessageAudience = () => {
  const { id } = useDocumentInfo();
  const modified = useFormModified();
  const router = useRouter();
  const [preview, setPreview] = useState<Preview>();
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      setPreview(await previewMessageAudience(Number(id)));
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Could not load the audience",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!id) {
    return (
      <div className={box}>
        <strong>Who will get this</strong>
        <p>Save the draft to see who this message will reach.</p>
      </div>
    );
  }

  const reachable = preview?.sample ? preview.matching - preview.optedOut : 0;

  const send = async () => {
    try {
      await sendMessage(Number(id));
      toast.success(
        `Sending to ${reachable} ${reachable === 1 ? "volunteer" : "volunteers"}. This takes a few minutes.`,
      );
      setConfirming(false);
      router.refresh();
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not send");
    }
  };

  return (
    <div className={box}>
      <strong>Who will get this</strong>
      {modified && (
        <p className={css({ color: "var(--theme-warning-600)" })}>
          You have unsaved changes. Save first: the preview and Send use the
          last saved version.
        </p>
      )}
      {loading && !preview && <p>Working it out…</p>}
      {preview && (
        <>
          <p>{preview.description}.</p>
          <p className={css({ fontSize: "1.25rem" })}>
            <strong>{reachable}</strong>{" "}
            {reachable === 1 ? "volunteer" : "volunteers"}
            {preview.optedOut > 0 &&
              ` (${preview.optedOut} more match but switched off invitations)`}
          </p>
          {preview.sample.length > 0 && (
            <ul
              className={css({
                columns: { base: 1, md: 2 },
                listStyle: "none",
                padding: 0,
                margin: 0,
                fontSize: "0.9rem",
              })}
            >
              {preview.sample.map((v) => (
                <li key={v.id}>
                  {v.name}{" "}
                  <span
                    className={css({ color: "var(--theme-elevation-500)" })}
                  >
                    · {v.shifts} shifts
                    {v.lastShift
                      ? ` · last ${format(new Date(v.lastShift), "d MMM yyyy")}`
                      : ""}
                  </span>
                </li>
              ))}
              {reachable > preview.sample.length && (
                <li>…and {reachable - preview.sample.length} more</li>
              )}
            </ul>
          )}
          <div
            className={css({ display: "flex", gap: "8px", flexWrap: "wrap" })}
          >
            <Button
              buttonStyle="secondary"
              size="small"
              onClick={load}
              disabled={loading}
            >
              Refresh
            </Button>
            <Button
              buttonStyle="secondary"
              size="small"
              el="anchor"
              url={`/api/admin/messages/${id}/audience`}
            >
              Download list (for WhatsApp etc.)
            </Button>
            {preview.status === "draft" && !confirming && (
              <Button
                size="small"
                disabled={reachable === 0 || modified}
                onClick={() => setConfirming(true)}
              >
                Send to {reachable}{" "}
                {reachable === 1 ? "volunteer" : "volunteers"}…
              </Button>
            )}
            {preview.status === "draft" && confirming && (
              <>
                <Button size="small" onClick={send}>
                  Yes, email {reachable}{" "}
                  {reachable === 1 ? "volunteer" : "volunteers"} now
                </Button>
                <Button
                  buttonStyle="secondary"
                  size="small"
                  onClick={() => setConfirming(false)}
                >
                  Cancel
                </Button>
              </>
            )}
            {preview.status !== "draft" && (
              <p>
                This message is {preview.status}. Duplicate it to send something
                similar.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
};
