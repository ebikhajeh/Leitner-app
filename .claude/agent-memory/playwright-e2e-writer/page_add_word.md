---
name: AddWordPage — Locators & Behavior
description: Form field locators, Zod validation messages, success/error behavior, and API details for /words/new
type: project
---

## Route
`/words/new` — protected (ProtectedRoute, redirects to /login if unauthenticated)

## Form fields
Labels are raw `<label>` elements WITHOUT `htmlFor`/`id` association — do NOT use `getByLabel()`.
Use `getByPlaceholder()` instead:

| Field | Locator | Required |
|---|---|---|
| Word | `getByPlaceholder("e.g. abandon")` | Yes |
| Meaning | `getByPlaceholder("e.g. to leave behind")` | Yes |
| Example Sentence | `getByPlaceholder("e.g. He abandoned the project.")` — `<textarea>` | No |

## Submit button
- `getByRole("button", { name: /save word/i })` in idle/enabled state
- `getByRole("button", { name: /saving/i })` while isPending
- Disabled when: `word` or `meaning` is empty/whitespace, OR `isPending === true`
- canSubmit guard: button is disabled at the DOM level before Zod runs — keyboard Enter on a field can still trigger submit and show Zod errors

## Validation errors (Zod, client-side)
- Word missing: `getByText(/word is required/i)` as `<p class="text-destructive text-xs">`
- Meaning missing: `getByText(/meaning is required/i)` as `<p class="text-destructive text-xs">`

## Server error
- Rendered as `<p class="text-destructive text-sm">` above the submit button
- Clears when user edits the word field (onChange handler calls `setServerError(null)`)
- Meaning field onChange also clears it

## Success behavior
- API: `POST /api/words` → expects HTTP 201
- Toast: `toast.success("Word saved successfully!")` via Sonner, positioned bottom-center
  - Locator: `getByText(/word saved successfully/i)`
- After success: form resets to empty, word input refocused — page stays at `/words/new` (NO redirect)

## API endpoint
- `POST /api/words` (proxied via Vite `/api` → backend port 3001 in test mode)
- Body: `{ word, meaning, exampleSentence? }`
- Auth: required (httpOnly cookie session)

## waitForResponse pattern for words API
```ts
const responsePromise = page.waitForResponse(
  (res) => res.url().includes("/api/words") && res.request().method() === "POST",
);
await page.getByRole("button", { name: /save word/i }).click();
await responsePromise;
```

## Route interception for error simulation
```ts
await page.route("**/api/words", (route) =>
  route.fulfill({
    status: 500,
    contentType: "application/json",
    body: JSON.stringify({ message: "Internal server error" }),
  }),
);
```
