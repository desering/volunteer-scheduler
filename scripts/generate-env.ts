import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const generateEnvFile = () => {
  const envPath = join(process.cwd(), ".env");
  const envExamplePath = join(process.cwd(), ".env.example");

  if (existsSync(envPath)) {
    console.log("⚠️  .env file already exists. Aborting to prevent overwrite.");
    return;
  }

  if (!existsSync(envExamplePath)) {
    console.error("Error: .env.example file not found.");
    process.exit(1);
  }

  // Read the template
  let envContent = readFileSync(envExamplePath, "utf-8");

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
      .replace("SMTP_HOST=127.0.0.1", "SMTP_HOST=maildev");
    console.log(
      "✓ Detected devcontainer environment, using Docker service names",
    );
  }

  // Write the .env file
  writeFileSync(envPath, envContent);

  console.log("✅ .env file generated successfully!");
};

generateEnvFile();
