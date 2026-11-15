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

1. Start the app, it must be reachable on http://localhost:3000:
   ```shell
   docker compose --profile bun up
   ```
   or, with standalone bun, `docker compose up` and `bun --bun dev`.

2. In another terminal, run the tests:
   ```shell
   bun run test:e2e
   ```

Useful variations:

```shell
bun run test:e2e e2e/layout.e2e.ts     # a single file
bun run test:e2e --project=chromium    # a single browser, e.g. for a quick run
bun run test:e2e --headed              # watch the browser
bun run test:e2e --ui                  # interactive UI mode
bunx playwright show-report            # open the HTML report of the last run
```

Failed tests leave traces and screenshots in `test-results/` (git-ignored).

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
