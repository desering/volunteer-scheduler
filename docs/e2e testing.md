# Run end-to-end tests locally

End-to-end tests use [Playwright](https://playwright.dev/) and live in `e2e/`.
They open the running app in real (headless) Chromium, Firefox and WebKit and
click through it like a user. Files are named `*.e2e.ts` (not `*.spec.ts`) so
`bun test` doesn't pick them up.

## Prerequisites

* the project is set up as described in the [README](../README.md)
* dependencies are installed: `bun install`

## One-time setup

Download the browsers Playwright drives:

```shell
bunx playwright install
```

Every test runs in all three browsers (see `projects` in
`playwright.config.ts`), so one test shows up as three results.

> [!NOTE]
> Playwright's WebKit doesn't work on macOS 14 (it fails with `Unknown setting:
> PushAPIEnabled`, see [playwright#42964](https://github.com/microsoft/playwright/issues/42964)).
> On macOS 14 skip it: `bun run test:e2e --project=chromium --project=firefox`.

## Run the tests

1. Start Postgres:
   ```shell
   docker compose up -d postgres
   ```

2. Run the tests:
   ```shell
   bun run test:e2e
   ```

Playwright starts the app itself (`bun run --bun dev`, see `webServer` in
`playwright.config.ts`) and waits until it is ready. If something already
serves http://localhost:3000, e.g. `docker compose --profile bun up`, it is
reused instead.

Useful variations:

```shell
bun run test:e2e e2e/layout.e2e.ts     # a single file
bun run test:e2e --project=chromium    # a single browser, e.g. for a quick run
bun run test:e2e --headed              # watch the browser
bun run test:e2e --ui                  # interactive UI mode
bunx playwright show-report            # open the HTML report of the last run
```

Failed tests leave traces and screenshots in `test-results/` (git-ignored).

## CI

The `playwright` job in `.github/workflows/check.yaml` runs on every push, like
the other checks. It starts Postgres as a service container, installs the
browsers and runs `bun run test:e2e`. Playwright builds and starts the
production app (`bun run --bun build && bun run --bun start`), so migrations
are applied on startup. All three browsers run, failures are retried twice and
the HTML report is uploaded as the `playwright-report` artifact.

To look at a failed run, download the artifact from the run's summary page,
unzip it and open it with `bunx playwright show-report <unzipped-folder>`.

## Write a test

Add a `something.e2e.ts` file to `e2e/`. The base URL is configured in
`playwright.config.ts`, so use relative paths:

```ts
import { expect, test } from "@playwright/test";

test("home page shows the date select", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("button", { name: /^Select / }).first()).toBeVisible();
});
```

Prefer role-based locators (`getByRole`, `getByLabel`) over CSS selectors, see
[Playwright locators](https://playwright.dev/docs/locators).
