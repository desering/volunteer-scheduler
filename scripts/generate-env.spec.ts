import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test, vi } from "vitest";
import { generateEnvFile } from "./generate-env";

vi.mock("node:crypto", () => ({
  randomBytes: () =>
    Buffer.from([
      0xc6, 0xdc, 0xf8, 0x3a, 0xdb, 0x23, 0x8e, 0x65, 0x55, 0x16, 0x8b, 0xe2,
      0xf0, 0x32, 0x80, 0x99, 0x0d, 0xbb, 0x3d, 0x14, 0x62, 0x3e, 0xf3, 0x24,
      0x5d, 0x18, 0xc8, 0xff, 0xd7, 0xe1, 0xfa, 0x8b,
    ]),
}));

test("generate .env file content without dev containers", () => {
  const envContent = readFileSync(join(process.cwd(), ".env.example"), "utf-8");
  const EXPECTED = `# Database Configuration
DATABASE_URI=postgres://schedule:schedule@localhost:5432/schedule

# Payload CMS Secret
PAYLOAD_SECRET=xtz4OtsjjmVVFovi8DKAmQ27PRRiPvMkXRjI/9fh+os=

# Organization Configuration
ORG_NAME="De Sering"

# Email Configuration
EMAIL_FROM_ADDRESS=schedule@localhost
EMAIL_FROM_NAME='De Sering Schedule'

# SMTP Configuration
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=schedule
SMTP_PASS=schedule
`;

  expect(generateEnvFile(envContent)).toEqual(EXPECTED);
});

test("generate .env file content with REMOTE_CONTAINERS env var", () => {
  const envContent = readFileSync(join(process.cwd(), ".env.example"), "utf-8");
  const EXPECTED = `# Database Configuration
DATABASE_URI=postgres://schedule:schedule@postgres:5432/schedule

# Payload CMS Secret
PAYLOAD_SECRET=xtz4OtsjjmVVFovi8DKAmQ27PRRiPvMkXRjI/9fh+os=

# Organization Configuration
ORG_NAME="De Sering"

# Email Configuration
EMAIL_FROM_ADDRESS=schedule@localhost
EMAIL_FROM_NAME='De Sering Schedule'

# SMTP Configuration
SMTP_HOST=maildev
SMTP_PORT=1025
SMTP_USER=schedule
SMTP_PASS=schedule
`;

  process.env.REMOTE_CONTAINERS = "true";
  expect(generateEnvFile(envContent)).toEqual(EXPECTED);
  process.env.REMOTE_CONTAINERS = undefined;
});
