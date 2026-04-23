import React from "react";
import { render } from "@testing-library/react";
import { screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { setupUser } from "@/test/setup";
import ReviewPage from "./ReviewPage";
import api from "@/lib/api";
import type { Word } from "@/features/review/types";

vi.mock("@/lib/api", () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

vi.mock("framer-motion", () => ({
  motion: {
    div: React.forwardRef(
      (
        { children, initial: _i, animate: _a, exit: _e, transition: _t, ...props }: React.HTMLAttributes<HTMLDivElement> & Record<string, unknown>,
        ref: React.Ref<HTMLDivElement>
      ) => <div ref={ref} {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const mockedGet = vi.mocked(api.get);
const mockedPatch = vi.mocked(api.patch);

function makeWord(overrides: Partial<Word> = {}): Word {
  return {
    id: "word-1",
    word: "abandon",
    meaning: "to leave behind",
    exampleSentence: "He abandoned the project.",
    createdAt: "2025-01-01T00:00:00Z",
    box: 1,
    nextReviewAt: "2025-01-01T00:00:00Z",
    lastReviewedAt: null,
    reviewCount: 0,
    ...overrides,
  };
}

function mockDueWords(words: Word[]) {
  mockedGet.mockResolvedValue({ data: { words } });
}

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}><ReviewPage /></QueryClientProvider>
  );
}

describe("ReviewPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedPatch.mockResolvedValue({ data: {} });
  });

  // ── Loading / error states ────────────────────────────────────────────────

  describe("loading and error states", () => {
    it("shows a loading skeleton while the query is in flight", () => {
      mockedGet.mockReturnValue(new Promise(() => {}));
      renderPage();
      expect(document.querySelector(".animate-pulse")).toBeInTheDocument();
    });

    it("shows an error message when the query fails", async () => {
      mockedGet.mockRejectedValue(new Error("network error"));
      renderPage();
      expect(await screen.findByText(/failed to load words/i)).toBeInTheDocument();
    });
  });

  // ── No due cards ──────────────────────────────────────────────────────────

  describe("no due cards", () => {
    it("shows the all caught up message when there are no due words", async () => {
      mockDueWords([]);
      renderPage();
      expect(await screen.findByText(/all caught up/i)).toBeInTheDocument();
    });
  });

  // ── Normal mode session ───────────────────────────────────────────────────

  describe("normal mode (Word → Meaning)", () => {
    it("shows the word and Show Answer button in recall phase", async () => {
      mockDueWords([makeWord()]);
      renderPage();

      expect(await screen.findByText("abandon")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /show answer/i })).toBeInTheDocument();
      expect(screen.queryByText("to leave behind")).not.toBeInTheDocument();
    });

    it("reveals the meaning and difficulty buttons after clicking Show Answer", async () => {
      const user = setupUser();
      mockDueWords([makeWord()]);
      renderPage();

      await user.click(await screen.findByRole("button", { name: /show answer/i }));

      expect(screen.getByText("to leave behind")).toBeInTheDocument();
      expect(screen.getByText("He abandoned the project.")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /hard/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /medium/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /easy/i })).toBeInTheDocument();
    });

    it("does not show example sentence when it is null", async () => {
      const user = setupUser();
      mockDueWords([makeWord({ exampleSentence: null })]);
      renderPage();

      await user.click(await screen.findByRole("button", { name: /show answer/i }));

      expect(screen.queryByText(/example/i)).not.toBeInTheDocument();
    });

    it("calls the review API with the correct difficulty when Easy is clicked", async () => {
      const user = setupUser();
      mockDueWords([makeWord({ id: "word-1" })]);
      renderPage();

      await user.click(await screen.findByRole("button", { name: /show answer/i }));
      await user.click(screen.getByRole("button", { name: /easy/i }));

      await waitFor(() => {
        expect(mockedPatch).toHaveBeenCalledWith("/words/word-1/review", { difficulty: "easy" });
      });
    });

    it("calls the review API with hard difficulty", async () => {
      const user = setupUser();
      mockDueWords([makeWord({ id: "word-1" })]);
      renderPage();

      await user.click(await screen.findByRole("button", { name: /show answer/i }));
      await user.click(screen.getByRole("button", { name: /hard/i }));

      await waitFor(() => {
        expect(mockedPatch).toHaveBeenCalledWith("/words/word-1/review", { difficulty: "hard" });
      });
    });
  });

  // ── Reverse mode session ──────────────────────────────────────────────────

  describe("reverse mode (Meaning → Word)", () => {
    it("shows the meaning as the prompt after switching to reverse mode", async () => {
      const user = setupUser();
      mockDueWords([makeWord()]);
      renderPage();

      await screen.findByText("abandon");
      await user.click(screen.getByRole("button", { name: /meaning → word/i }));

      expect(screen.getByText("to leave behind")).toBeInTheDocument();
      expect(screen.queryByText("abandon")).not.toBeInTheDocument();
    });

    it("reveals the word after clicking Show Answer in reverse mode", async () => {
      const user = setupUser();
      mockDueWords([makeWord()]);
      renderPage();

      await screen.findByText("abandon");
      await user.click(screen.getByRole("button", { name: /meaning → word/i }));
      await user.click(screen.getByRole("button", { name: /show answer/i }));

      expect(screen.getByText("abandon")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /easy/i })).toBeInTheDocument();
    });
  });

  // ── Navigation ────────────────────────────────────────────────────────────

  describe("navigation", () => {
    const twoWords = [
      makeWord({ id: "word-1", word: "abandon" }),
      makeWord({ id: "word-2", word: "benign" }),
    ];

    function getNavButtons() {
      return screen.getAllByRole("button").filter(
        b => b.closest(".flex.justify-between") !== null
      );
    }

    it("prev button is disabled on the first card", async () => {
      mockDueWords(twoWords);
      renderPage();

      await screen.findByText("abandon");
      const [prevBtn, nextBtn] = getNavButtons();
      expect(prevBtn).toBeDisabled();
      expect(nextBtn).toBeEnabled();
    });

    it("navigates to the next card", async () => {
      const user = setupUser();
      mockDueWords(twoWords);
      renderPage();

      await screen.findByText("abandon");
      const [, nextBtn] = getNavButtons();
      await user.click(nextBtn);

      expect(await screen.findByText("benign")).toBeInTheDocument();
    });

    it("next button is disabled on the last card after navigating", async () => {
      const user = setupUser();
      mockDueWords(twoWords);
      renderPage();

      await screen.findByText("abandon");
      const [, nextBtn] = getNavButtons();
      await user.click(nextBtn);

      await screen.findByText("benign");
      const [prevBtn2, nextBtn2] = getNavButtons();
      expect(prevBtn2).toBeEnabled();
      expect(nextBtn2).toBeDisabled();
    });

    it("shows correct progress counters", async () => {
      mockDueWords(twoWords);
      renderPage();

      await screen.findByText("abandon");
      expect(screen.getByText(/1/)).toBeInTheDocument();
      expect(screen.getByText(/2/)).toBeInTheDocument();
    });
  });

  // ── Session complete ──────────────────────────────────────────────────────

  describe("session complete", () => {
    it("shows session complete state after rating the only card", async () => {
      const user = setupUser();
      mockDueWords([makeWord()]);
      mockedPatch.mockResolvedValue({ data: {} });
      // After invalidation, return empty list
      mockedGet
        .mockResolvedValueOnce({ data: { words: [makeWord()] } })
        .mockResolvedValue({ data: { words: [] } });

      renderPage();

      await user.click(await screen.findByRole("button", { name: /show answer/i }));
      await user.click(screen.getByRole("button", { name: /medium/i }));

      expect(await screen.findByText(/session complete/i)).toBeInTheDocument();
      expect(screen.getByText(/1 card/i)).toBeInTheDocument();
    });

    it("shows Review Again button in session complete state", async () => {
      const user = setupUser();
      mockDueWords([makeWord()]);
      mockedGet
        .mockResolvedValueOnce({ data: { words: [makeWord()] } })
        .mockResolvedValue({ data: { words: [] } });

      renderPage();

      await user.click(await screen.findByRole("button", { name: /show answer/i }));
      await user.click(screen.getByRole("button", { name: /easy/i }));

      expect(await screen.findByRole("button", { name: /review again/i })).toBeInTheDocument();
    });

    it("uses plural 'cards' when session total is greater than 1", async () => {
      const user = setupUser();
      const two = [makeWord({ id: "w1" }), makeWord({ id: "w2", word: "benign" })];
      mockedGet
        .mockResolvedValueOnce({ data: { words: two } })
        .mockResolvedValue({ data: { words: [] } });

      renderPage();

      await user.click(await screen.findByRole("button", { name: /show answer/i }));
      await user.click(screen.getByRole("button", { name: /easy/i }));
      await user.click(await screen.findByRole("button", { name: /show answer/i }));
      await user.click(screen.getByRole("button", { name: /easy/i }));

      expect(await screen.findByText(/2 cards/i)).toBeInTheDocument();
    });
  });
});
