import { test, expect, type Page } from "@playwright/test";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BASE_URL = "http://localhost:5174";
const LOGIN_URL = `${BASE_URL}/login`;
const HOME_URL = `${BASE_URL}/`;
const ADD_WORD_URL = `${BASE_URL}/words/new`;

// Seeded by global-setup via seed.ts
const VALID_EMAIL = "test@leitner.local";
const VALID_PASSWORD = "TestPassword123!";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Sign in as the seeded test user and land on the home page. */
async function loginAsTestUser(page: Page) {
  await page.goto(LOGIN_URL);
  await page.getByLabel("Email").fill(VALID_EMAIL);
  await page.getByLabel("Password").fill(VALID_PASSWORD);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL(HOME_URL);
}

/** Navigate to the Add Word page from the home page via the bottom nav. */
async function goToAddWordViaNav(page: Page) {
  await page.getByRole("button", { name: /^add$/i }).click();
  await page.waitForURL(ADD_WORD_URL);
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

test.describe("Add Word", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
  });

  // -------------------------------------------------------------------------
  // Navigation
  // -------------------------------------------------------------------------

  test("navigates to /words/new when the bottom nav Add button is clicked", async ({
    page,
  }) => {
    await goToAddWordViaNav(page);

    await expect(page).toHaveURL(ADD_WORD_URL);
    await expect(
      page.getByRole("heading", { name: /add new word/i }),
    ).toBeVisible();
  });

  test("highlights the Add tab as active after navigating to /words/new", async ({
    page,
  }) => {
    await goToAddWordViaNav(page);

    // The active nav item carries text-blue-500; assert the button has that class
    const addButton = page.getByRole("button", { name: /^add$/i });
    await expect(addButton).toHaveClass(/text-blue-500/);
  });

  // -------------------------------------------------------------------------
  // Auth guard
  // -------------------------------------------------------------------------

  test("redirects unauthenticated user from /words/new to /login", async ({
    browser,
  }) => {
    // Fresh browser context — no session cookie
    const freshPage = await browser.newPage();
    await freshPage.goto(ADD_WORD_URL);
    await expect(freshPage).toHaveURL(LOGIN_URL);
    await freshPage.close();
  });

  // -------------------------------------------------------------------------
  // Page structure
  // -------------------------------------------------------------------------

  test("renders the word, meaning, and example sentence fields", async ({
    page,
  }) => {
    await page.goto(ADD_WORD_URL);

    await expect(
      page.getByPlaceholder("e.g. abandon"),
    ).toBeVisible();
    await expect(
      page.getByPlaceholder("e.g. to leave behind"),
    ).toBeVisible();
    await expect(
      page.getByPlaceholder("e.g. He abandoned the project."),
    ).toBeVisible();
  });

  test("Save Word button is disabled when both word and meaning are empty", async ({
    page,
  }) => {
    await page.goto(ADD_WORD_URL);

    await expect(
      page.getByRole("button", { name: /save word/i }),
    ).toBeDisabled();
  });

  test("Save Word button is disabled when only word is filled", async ({
    page,
  }) => {
    await page.goto(ADD_WORD_URL);

    await page.getByPlaceholder("e.g. abandon").fill("ephemeral");

    await expect(
      page.getByRole("button", { name: /save word/i }),
    ).toBeDisabled();
  });

  test("Save Word button is disabled when only meaning is filled", async ({
    page,
  }) => {
    await page.goto(ADD_WORD_URL);

    await page.getByPlaceholder("e.g. to leave behind").fill("lasting a very short time");

    await expect(
      page.getByRole("button", { name: /save word/i }),
    ).toBeDisabled();
  });

  test("Save Word button becomes enabled when both word and meaning are filled", async ({
    page,
  }) => {
    await page.goto(ADD_WORD_URL);

    await page.getByPlaceholder("e.g. abandon").fill("ephemeral");
    await page.getByPlaceholder("e.g. to leave behind").fill("lasting a very short time");

    await expect(
      page.getByRole("button", { name: /save word/i }),
    ).toBeEnabled();
  });


  // -------------------------------------------------------------------------
  // Happy path — successful save (word + meaning only)
  // -------------------------------------------------------------------------

  test("saves a word successfully with only required fields and shows a success toast", async ({
    page,
  }) => {
    await page.goto(ADD_WORD_URL);

    await page.getByPlaceholder("e.g. abandon").fill("ephemeral");
    await page.getByPlaceholder("e.g. to leave behind").fill("lasting a very short time");

    const responsePromise = page.waitForResponse(
      (res) => res.url().includes("/api/words") && res.request().method() === "POST",
    );

    await page.getByRole("button", { name: /save word/i }).click();

    const response = await responsePromise;
    expect(response.status()).toBe(201);

    // Sonner toast confirms success
    await expect(page.getByText(/word saved successfully/i)).toBeVisible();

    // Stays on the Add Word page (no redirect — just a reset)
    await expect(page).toHaveURL(ADD_WORD_URL);
  });

  test("saves a word successfully with all three fields and shows a success toast", async ({
    page,
  }) => {
    await page.goto(ADD_WORD_URL);

    await page.getByPlaceholder("e.g. abandon").fill("ephemeral");
    await page.getByPlaceholder("e.g. to leave behind").fill("lasting a very short time");
    await page
      .getByPlaceholder("e.g. He abandoned the project.")
      .fill("The ephemeral beauty of cherry blossoms is celebrated in Japan.");

    const responsePromise = page.waitForResponse(
      (res) => res.url().includes("/api/words") && res.request().method() === "POST",
    );

    await page.getByRole("button", { name: /save word/i }).click();

    const response = await responsePromise;
    expect(response.status()).toBe(201);

    await expect(page.getByText(/word saved successfully/i)).toBeVisible();
    await expect(page).toHaveURL(ADD_WORD_URL);
  });

  // -------------------------------------------------------------------------
  // Form reset after successful save
  // -------------------------------------------------------------------------

  test("resets all form fields after a successful save", async ({ page }) => {
    await page.goto(ADD_WORD_URL);

    const wordInput = page.getByPlaceholder("e.g. abandon");
    const meaningInput = page.getByPlaceholder("e.g. to leave behind");
    const exampleInput = page.getByPlaceholder("e.g. He abandoned the project.");

    await wordInput.fill("ephemeral");
    await meaningInput.fill("lasting a very short time");
    await exampleInput.fill("The ephemeral joy of a perfect moment.");

    const responsePromise = page.waitForResponse(
      (res) => res.url().includes("/api/words") && res.request().method() === "POST",
    );

    await page.getByRole("button", { name: /save word/i }).click();
    await responsePromise;

    // After the success toast appears, inputs should be cleared
    await expect(page.getByText(/word saved successfully/i)).toBeVisible();
    await expect(wordInput).toHaveValue("");
    await expect(meaningInput).toHaveValue("");
    await expect(exampleInput).toHaveValue("");
  });

  // -------------------------------------------------------------------------
  // Submit button loading state
  // -------------------------------------------------------------------------

  test("Save Word button shows Saving… and is disabled while the request is in-flight", async ({
    page,
  }) => {
    await page.goto(ADD_WORD_URL);

    await page.getByPlaceholder("e.g. abandon").fill("ephemeral");
    await page.getByPlaceholder("e.g. to leave behind").fill("lasting a very short time");

    let resolveIntercepted!: () => void;
    let releaseRequest!: () => void;
    const requestIntercepted = new Promise<void>((r) => { resolveIntercepted = r; });
    const requestReleased = new Promise<void>((r) => { releaseRequest = r; });

    await page.route("**/api/words", async (route) => {
      resolveIntercepted();
      await requestReleased;
      await route.continue();
    });

    const submitButton = page.getByRole("button", { name: /save word|saving/i });
    await submitButton.click();

    await requestIntercepted;

    await expect(page.getByRole("button", { name: /saving/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /saving/i })).toBeDisabled();

    releaseRequest();

    // After release the button returns to its normal caption
    await expect(page.getByRole("button", { name: /save word/i })).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // Server error handling
  // -------------------------------------------------------------------------

  test("shows a server error message when the API returns an error", async ({
    page,
  }) => {
    await page.goto(ADD_WORD_URL);

    await page.getByPlaceholder("e.g. abandon").fill("ephemeral");
    await page.getByPlaceholder("e.g. to leave behind").fill("lasting a very short time");

    // Force the words endpoint to return a 500
    await page.route("**/api/words", (route) =>
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ message: "Internal server error" }),
      }),
    );

    await page.getByRole("button", { name: /save word/i }).click();

    await expect(
      page.locator("p.text-destructive.text-sm"),
    ).toBeVisible();

    // Stays on the page; no navigation away
    await expect(page).toHaveURL(ADD_WORD_URL);
  });

  test("server error clears when the user edits the word field after a failure", async ({
    page,
  }) => {
    await page.goto(ADD_WORD_URL);

    await page.getByPlaceholder("e.g. abandon").fill("ephemeral");
    await page.getByPlaceholder("e.g. to leave behind").fill("lasting a very short time");

    await page.route("**/api/words", (route) =>
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ message: "Internal server error" }),
      }),
    );

    await page.getByRole("button", { name: /save word/i }).click();

    const serverErrorLocator = page.locator("p.text-destructive.text-sm");
    await expect(serverErrorLocator).toBeVisible();

    // Editing the word field should clear the server error
    await page.getByPlaceholder("e.g. abandon").pressSequentially("x");
    await expect(serverErrorLocator).not.toBeVisible();
  });
});
