import { test, expect, type Page } from "@playwright/test";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BASE_URL = "http://localhost:5174";
const LOGIN_URL = `${BASE_URL}/login`;
const HOME_URL = `${BASE_URL}/`;

// Seeded by global-setup via seed.ts
const VALID_EMAIL = "test@leitner.local";
const VALID_PASSWORD = "TestPassword123!";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Fill and submit the login form. */
async function fillAndSubmitLogin(
  page: Page,
  email: string,
  password: string,
) {
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();
}

/** Log in as the seeded test user and land on the home page. */
async function loginAsTestUser(page: Page) {
  await page.goto(LOGIN_URL);
  await fillAndSubmitLogin(page, VALID_EMAIL, VALID_PASSWORD);
  await page.waitForURL(HOME_URL);
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

test.describe("Authentication", () => {
  // -------------------------------------------------------------------------
  // Successful sign-in
  // -------------------------------------------------------------------------

  test("signs in with valid credentials and lands on the home page", async ({
    page,
  }) => {
    await page.goto(LOGIN_URL);

    await fillAndSubmitLogin(page, VALID_EMAIL, VALID_PASSWORD);

    await page.waitForURL(HOME_URL);
    // Home page renders a welcome message with the user's identifier
    await expect(
      page.getByText(/welcome back to your deck/i),
    ).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // Client-side validation (empty / invalid fields)
  // -------------------------------------------------------------------------

  test("shows validation error when email field is empty on submit", async ({
    page,
  }) => {
    await page.goto(LOGIN_URL);

    // Leave email blank, fill password
    await page.getByLabel("Password").fill("anything");
    await page.getByRole("button", { name: /sign in/i }).click();

    await expect(
      page.getByText(/enter a valid email address/i),
    ).toBeVisible();

    // Should NOT navigate away
    await expect(page).toHaveURL(LOGIN_URL);
  });

  test("shows validation error when password field is empty on submit", async ({
    page,
  }) => {
    await page.goto(LOGIN_URL);

    await page.getByLabel("Email").fill(VALID_EMAIL);
    // Leave password blank
    await page.getByRole("button", { name: /sign in/i }).click();

    await expect(page.getByText(/password is required/i)).toBeVisible();

    await expect(page).toHaveURL(LOGIN_URL);
  });

  test("shows validation error when both fields are empty on submit", async ({
    page,
  }) => {
    await page.goto(LOGIN_URL);

    await page.getByRole("button", { name: /sign in/i }).click();

    await expect(
      page.getByText(/enter a valid email address/i),
    ).toBeVisible();
    await expect(page.getByText(/password is required/i)).toBeVisible();

    await expect(page).toHaveURL(LOGIN_URL);
  });

  test("shows validation error for an invalid email format", async ({
    page,
  }) => {
    await page.goto(LOGIN_URL);

    await page.getByLabel("Email").fill("not-an-email");
    await page.getByLabel("Password").fill("anything");
    await page.getByRole("button", { name: /sign in/i }).click();

    await expect(
      page.getByText(/enter a valid email address/i),
    ).toBeVisible();

    await expect(page).toHaveURL(LOGIN_URL);
  });

  // -------------------------------------------------------------------------
  // Server-side failures
  // -------------------------------------------------------------------------

  test("shows server error for wrong password", async ({ page }) => {
    await page.goto(LOGIN_URL);

    await fillAndSubmitLogin(page, VALID_EMAIL, "WrongPassword!");

    // Stays on login page
    await expect(page).toHaveURL(LOGIN_URL);
    // A server-level error message is rendered above the submit button
    await expect(
      page.locator("p.text-destructive.text-sm"),
    ).toBeVisible();
  });

  test("shows server error for non-existent email", async ({ page }) => {
    await page.goto(LOGIN_URL);

    await fillAndSubmitLogin(page, "nobody@nowhere.example", VALID_PASSWORD);

    await expect(page).toHaveURL(LOGIN_URL);
    await expect(
      page.locator("p.text-destructive.text-sm"),
    ).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // Sign-out
  // -------------------------------------------------------------------------

  test("signs out and redirects to the login page", async ({ page }) => {
    await loginAsTestUser(page);

    await page.getByRole("button", { name: /sign out/i }).click();
    await page.waitForURL(LOGIN_URL);
    // Login form is visible again
    await expect(
      page.getByRole("button", { name: /sign in/i }),
    ).toBeVisible();
  });

  test("cannot access the home page after signing out", async ({ page }) => {
    await loginAsTestUser(page);
    await page.getByRole("button", { name: /sign out/i }).click();
    await page.waitForURL(LOGIN_URL);

    // Directly navigate to protected route after sign-out
    await page.goto(HOME_URL);
    await expect(page).toHaveURL(LOGIN_URL);
  });

  // -------------------------------------------------------------------------
  // Protected route — unauthenticated access
  // -------------------------------------------------------------------------

  test("redirects unauthenticated user from / to /login", async ({ page }) => {
    // Fresh context — no session cookie
    await page.goto(HOME_URL);
    await expect(page).toHaveURL(LOGIN_URL);
  });

  test("redirects unauthenticated user from an unknown route to /login via /", async ({
    page,
  }) => {
    // App has a catch-all that goes to / which is protected
    await page.goto(`${BASE_URL}/some/unknown/path`);
    await expect(page).toHaveURL(LOGIN_URL);
  });

  // -------------------------------------------------------------------------
  // Protected route — authenticated access
  // -------------------------------------------------------------------------

  test("authenticated user can access the home page directly", async ({
    page,
  }) => {
    await loginAsTestUser(page);

    // Navigate away then back
    await page.goto(LOGIN_URL); // triggers PublicOnlyRoute redirect to /
    await expect(page).toHaveURL(HOME_URL);
  });

  // -------------------------------------------------------------------------
  // PublicOnlyRoute — redirect already-authenticated user away from /login
  // -------------------------------------------------------------------------

  test("redirects authenticated user away from /login to home page", async ({
    page,
  }) => {
    await loginAsTestUser(page);

    // Try to visit login while authenticated
    await page.goto(LOGIN_URL);
    await expect(page).toHaveURL(HOME_URL);
  });

  // -------------------------------------------------------------------------
  // Session persistence across page refresh
  // -------------------------------------------------------------------------

  test("session persists after a full page reload", async ({ page }) => {
    await loginAsTestUser(page);

    // Hard reload
    await page.reload();

    // Should still be on the home page, not kicked to login
    await expect(page).toHaveURL(HOME_URL);
    await expect(
      page.getByText(/welcome back to your deck/i),
    ).toBeVisible();
  });

  test("session persists after navigating away and back", async ({ page }) => {
    await loginAsTestUser(page);

    // Go to login (redirected to home), then back — session still active
    await page.goto(LOGIN_URL);
    await expect(page).toHaveURL(HOME_URL);

    await page.goBack();
    await page.goto(HOME_URL);
    await expect(page).toHaveURL(HOME_URL);
  });

  // -------------------------------------------------------------------------
  // UI state — validation error clears on input change
  // -------------------------------------------------------------------------

  test("server error clears when user edits the email field", async ({
    page,
  }) => {
    await page.goto(LOGIN_URL);

    // Trigger a server error
    await fillAndSubmitLogin(page, VALID_EMAIL, "WrongPassword!");
    const serverErrorLocator = page.locator("p.text-destructive.text-sm");
    await expect(serverErrorLocator).toBeVisible();

    // Typing in email clears the server error (onChange handler calls setServerError(null))
    await page.getByLabel("Email").pressSequentially("x");
    await expect(serverErrorLocator).not.toBeVisible();
  });

  test("server error clears when user edits the password field", async ({
    page,
  }) => {
    await page.goto(LOGIN_URL);

    await fillAndSubmitLogin(page, VALID_EMAIL, "WrongPassword!");
    const serverErrorLocator = page.locator("p.text-destructive.text-sm");
    await expect(serverErrorLocator).toBeVisible();

    await page.getByLabel("Password").pressSequentially("x");
    await expect(serverErrorLocator).not.toBeVisible();
  });

  // -------------------------------------------------------------------------
  // Sign-in button disabled while submitting
  // -------------------------------------------------------------------------

  test("sign-in button is disabled while the form is submitting", async ({
    page,
  }) => {
    await page.goto(LOGIN_URL);

    await page.getByLabel("Email").fill(VALID_EMAIL);
    await page.getByLabel("Password").fill(VALID_PASSWORD);

    let resolveIntercepted!: () => void;
    let releaseRequest!: () => void;
    const requestIntercepted = new Promise<void>((r) => { resolveIntercepted = r; });
    const requestReleased = new Promise<void>((r) => { releaseRequest = r; });

    await page.route("**/api/auth/**", async (route) => {
      resolveIntercepted(); // request is now in-flight; unblock the test
      await requestReleased; // hold here until the assertion is done
      await route.continue();
    });

    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    await requestIntercepted; // wait until route handler has the request
    await expect(submitButton).toBeDisabled();

    releaseRequest(); // let the request complete
    await page.waitForURL(HOME_URL);
  });
});
