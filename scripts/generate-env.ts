import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export const generateEnvFile = (envContent: string): string => {
  // Generate a random base64 secret (32 bytes = 256 bits)
  const secret = randomBytes(32).toString("base64");

  // Replace the placeholder with the generated secret
  envContent = envContent.replace("PAYLOAD_SECRET_PLACEHOLDER", secret);

  // Detect if running in a devcontainer
  const isDevContainer =
    process.env.REMOTE_CONTAINERS === "true" || existsSync("/.dockerenv");

  // If in devcontainer, replace localhost/127.0.0.1 with Docker service names
  if (isDevContainer) {
    envContent = envContent
      .replace("@localhost:5432", "@postgres:5432")
      .replace("SMTP_HOST=localhost", "SMTP_HOST=maildev");
    console.log(
      "✓ Detected devcontainer environment, using Docker service names",
    );
  }

  return envContent;
};

if (import.meta.main) {
  const envPath = join(process.cwd(), ".env");
  const envExamplePath = join(process.cwd(), ".env.example");

  if (existsSync(envPath)) {
    console.log(
      "⚠️ Error: .env file already exists. Aborting to prevent overwrite.",
    );
    process.exit(1);
  }

  if (!existsSync(envExamplePath)) {
    console.error("⚠️ Error: .env.example file not found.");
    process.exit(1);
  }

  const envContent = readFileSync(envExamplePath, "utf-8");

  writeFileSync(envPath, generateEnvFile(envContent));

  console.log("✅ .env file generated successfully!");
}
