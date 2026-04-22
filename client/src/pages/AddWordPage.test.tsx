import React from "react";
import { screen, waitFor } from "@testing-library/react";
import renderWithProviders from "@/test/renderWithProviders";
import { setupUser } from "@/test/setup";
import { toast } from "sonner";
import AddWordPage from "./AddWordPage";
import api from "@/lib/api";
import { MAX_WORD_LENGTH } from "@shared/wordValidation";

vi.mock("@/lib/api", () => ({
  default: { post: vi.fn() },
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn() },
  Toaster: () => null,
}));

vi.mock("framer-motion", () => ({
  motion: {
    div: React.forwardRef(
      (
        { children, initial: _i, animate: _a, transition: _t, ...props }: React.HTMLAttributes<HTMLDivElement> & Record<string, unknown>,
        ref: React.Ref<HTMLDivElement>
      ) => <div ref={ref} {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const mockedPost = vi.mocked(api.post);

type PostHandlers = {
  words?: () => Promise<unknown>;
  generateWord?: () => Promise<unknown>;
};

function mockPost({ words, generateWord }: PostHandlers) {
  mockedPost.mockImplementation((url: string) => {
    if (url === "/words" && words) return words() as ReturnType<typeof api.post>;
    if (url === "/generate-word" && generateWord) return generateWord() as ReturnType<typeof api.post>;
    return Promise.reject(new Error(`Unexpected POST to ${url}`)) as ReturnType<typeof api.post>;
  });
}

function renderPage() {
  return renderWithProviders(<AddWordPage />);
}

function getWordInput() {
  return screen.getByPlaceholderText(/e\.g\. abandon/i);
}

function getMeaningInput() {
  return screen.getByPlaceholderText(/e\.g\. to leave behind/i);
}

function getSaveButton() {
  return screen.getByRole("button", { name: /save word/i });
}

function getGenerateButton() {
  return screen.getByRole("button", { name: /generate with ai/i });
}

describe("AddWordPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Rendering ────────────────────────────────────────────────────────────

  describe("rendering", () => {
    it("shows page heading", () => {
      renderPage();
      expect(screen.getByText("Add New Word")).toBeInTheDocument();
    });

    it("shows AI assistant panel open by default", () => {
      renderPage();
      expect(screen.getByText("AI Word Assistant")).toBeInTheDocument();
      expect(getGenerateButton()).toBeInTheDocument();
    });

    it("renders word, meaning, and example sentence fields", () => {
      renderPage();
      expect(getWordInput()).toBeInTheDocument();
      expect(getMeaningInput()).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/e\.g\. he abandoned the project/i)).toBeInTheDocument();
    });

    it("Save Word button is disabled when form is empty", () => {
      renderPage();
      expect(getSaveButton()).toBeDisabled();
    });

    it("Generate button is disabled when word field is empty", () => {
      renderPage();
      expect(getGenerateButton()).toBeDisabled();
    });
  });

  // ── Button enable/disable ─────────────────────────────────────────────────

  describe("button state", () => {
    it("enables Save Word only when both word and meaning are filled", async () => {
      const user = setupUser();
      renderPage();

      await user.type(getWordInput(), "abandon");
      expect(getSaveButton()).toBeDisabled();

      await user.type(getMeaningInput(), "to leave behind");
      expect(getSaveButton()).toBeEnabled();
    });

    it("enables Generate button when word has content", async () => {
      const user = setupUser();
      renderPage();

      await user.type(getWordInput(), "abandon");
      expect(getGenerateButton()).toBeEnabled();
    });

    it("disables Save Word again when meaning is cleared", async () => {
      const user = setupUser();
      renderPage();

      await user.type(getWordInput(), "abandon");
      await user.type(getMeaningInput(), "to leave behind");
      expect(getSaveButton()).toBeEnabled();

      await user.clear(getMeaningInput());
      expect(getSaveButton()).toBeDisabled();
    });
  });

  // ── Form validation ───────────────────────────────────────────────────────

  describe("form validation", () => {
    it("shows error for prompt-like word on submit", async () => {
      const user = setupUser();
      renderPage();

      await user.type(getWordInput(), "explain the process");
      await user.type(getMeaningInput(), "some meaning");
      await user.click(getSaveButton());

      expect(
        await screen.findByText(/please enter a word or short phrase/i)
      ).toBeInTheDocument();
    });

    it("shows error when word exceeds max length", async () => {
      const user = setupUser();
      renderPage();

      await user.type(getWordInput(), "a".repeat(MAX_WORD_LENGTH + 1));
      await user.type(getMeaningInput(), "some meaning");
      await user.click(getSaveButton());

      expect(
        await screen.findByText(new RegExp(`${MAX_WORD_LENGTH} characters or fewer`, "i"))
      ).toBeInTheDocument();
    });
  });

  // ── Save word flow ────────────────────────────────────────────────────────

  describe("save word", () => {
    it("shows Saving… while the request is pending", async () => {
      const user = setupUser();
      mockPost({ words: () => new Promise(() => {}) });
      renderPage();

      await user.type(getWordInput(), "abandon");
      await user.type(getMeaningInput(), "to leave behind");
      await user.click(getSaveButton());

      expect(await screen.findByRole("button", { name: /saving…/i })).toBeDisabled();
    });

    it("shows success toast and resets the form on save", async () => {
      const user = setupUser();
      mockPost({ words: () => Promise.resolve({ data: {} }) });
      renderPage();

      await user.type(getWordInput(), "abandon");
      await user.type(getMeaningInput(), "to leave behind");
      await user.click(getSaveButton());

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          "Word saved successfully!",
          expect.any(Object)
        );
      });

      expect(getWordInput()).toHaveValue("");
      expect(getMeaningInput()).toHaveValue("");
    });

    it("shows a server error message when the API call fails", async () => {
      const user = setupUser();
      mockPost({ words: () => Promise.reject({ response: { data: { message: "Word already exists" } } }) });
      renderPage();

      await user.type(getWordInput(), "abandon");
      await user.type(getMeaningInput(), "to leave behind");
      await user.click(getSaveButton());

      expect(await screen.findByText("Word already exists")).toBeInTheDocument();
    });

    it("clears the server error when the word field is edited", async () => {
      const user = setupUser();
      mockPost({ words: () => Promise.reject({ response: { data: { message: "Word already exists" } } }) });
      renderPage();

      await user.type(getWordInput(), "abandon");
      await user.type(getMeaningInput(), "to leave behind");
      await user.click(getSaveButton());
      await screen.findByText("Word already exists");

      await user.type(getWordInput(), "x");
      expect(screen.queryByText("Word already exists")).not.toBeInTheDocument();
    });
  });

  // ── AI generation flow ────────────────────────────────────────────────────

  describe("AI generation", () => {
    it("fills meaning and example sentence on successful generation", async () => {
      const user = setupUser();
      mockPost({
        generateWord: () => Promise.resolve({ data: { meaning: "to leave behind", exampleSentence: "He abandoned the project." } }),
      });
      renderPage();

      await user.type(getWordInput(), "abandon");
      await user.click(getGenerateButton());

      expect(await screen.findByDisplayValue("to leave behind")).toBeInTheDocument();
      expect(screen.getByDisplayValue("He abandoned the project.")).toBeInTheDocument();
    });

    it("shows AI error message when generation fails", async () => {
      const user = setupUser();
      mockPost({ generateWord: () => Promise.reject({ response: { data: { message: "AI service unavailable" } } }) });
      renderPage();

      await user.type(getWordInput(), "abandon");
      await user.click(getGenerateButton());

      expect(await screen.findByText("AI service unavailable")).toBeInTheDocument();
    });

    it("shows AI is thinking and disables button while generating", async () => {
      const user = setupUser();
      mockPost({ generateWord: () => new Promise(() => {}) });
      renderPage();

      await user.type(getWordInput(), "abandon");
      await user.click(getGenerateButton());

      const thinkingBtn = await screen.findByRole("button", { name: /ai is thinking/i });
      expect(thinkingBtn).toBeDisabled();
    });
  });

  // ── AI panel collapse ─────────────────────────────────────────────────────

  describe("AI assistant panel", () => {
    it("collapses the panel when the trigger is clicked", async () => {
      const user = setupUser();
      renderPage();

      const trigger = screen.getByRole("button", { name: /ai word assistant/i });
      expect(trigger).toHaveAttribute("aria-expanded", "true");

      await user.click(trigger);

      expect(trigger).toHaveAttribute("aria-expanded", "false");
    });

    it("re-expands the panel on a second click", async () => {
      const user = setupUser();
      renderPage();

      const trigger = screen.getByRole("button", { name: /ai word assistant/i });
      await user.click(trigger);
      await user.click(trigger);

      expect(trigger).toHaveAttribute("aria-expanded", "true");
    });
  });
});
