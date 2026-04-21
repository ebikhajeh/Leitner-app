---
name: Auth Flow
description: Login helper pattern, session handling, and sign-out locator used across all spec files
type: project
---

## loginAsTestUser helper (copy into each spec file that needs auth)
```ts
async function loginAsTestUser(page: Page) {
  await page.goto("http://localhost:5174/login");
  await page.getByLabel("Email").fill("test@leitner.local");
  await page.getByLabel("Password").fill("TestPassword123!");
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL("http://localhost:5174/");
}
```

## Sign-out
HomePage renders an icon-only button with `aria-label="Sign out"`:
```ts
await page.getByRole("button", { name: /sign out/i }).click();
// or
await page.getByLabel("Sign out").click();
```

## Fresh (unauthenticated) browser context
To test protected-route redirects without touching the existing page's cookies:
```ts
test("redirects unauthenticated user", async ({ browser }) => {
  const freshPage = await browser.newPage();
  await freshPage.goto(ADD_WORD_URL);
  await expect(freshPage).toHaveURL(LOGIN_URL);
  await freshPage.close();
});
```
Do not use `page.context().clearCookies()` mid-test — it can interfere with the auth state of other tests running in the same worker. Prefer a fresh context.

## Session persistence
Sessions are httpOnly cookies set by Better Auth. They persist across page.reload() and page.goto() calls within the same browser context.

## Auth API interception pattern (for loading-state tests)
```ts
await page.route("**/api/auth/**", async (route) => {
  resolveIntercepted();
  await requestReleased;
  await route.continue();
});
```
