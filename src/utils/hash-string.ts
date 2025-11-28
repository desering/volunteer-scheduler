export const hashString = async (message: string) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const buffer = await window.crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};
