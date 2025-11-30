import crypto from "node:crypto";

export const hashString = async (message: string) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hash = crypto.createHash("SHA-256").update(data).digest();
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};
