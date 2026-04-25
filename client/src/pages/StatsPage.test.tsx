import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { setupUser } from "@/test/setup";
import StatsPage from "./StatsPage";
import api from "@/lib/api";

vi.mock("@/lib/api", () => ({
  default: {
    get: vi.fn(),
  },
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
}));

const mockedGet = vi.mocked(api.get);

const BASE_STATS = {
  totalWords: 42,
  mastered: 9,
  retention: 75,
  sessions: 14,
  leitnerBoxes: [
    { box: 1, count: 12 },
    { box: 2, count: 10 },
    { box: 3, count: 8 },
    { box: 4, count: 6 },
    { box: 5, count: 6 },
  ],
  weeklyActivity: [5, 3, 0, 7, 2, 0, 4] as [number, number, number, number, number, number, number],
};

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}><StatsPage /></QueryClientProvider>
  );
}

describe("StatsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Loading state ──────────────────────────────────────────────────────────

  describe("loading state", () => {
    it("shows skeleton placeholders while stats are loading", () => {
      mockedGet.mockReturnValue(new Promise(() => {}));
      renderPage();
      expect(document.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
    });

    it("shows the page heading while loading", () => {
      mockedGet.mockReturnValue(new Promise(() => {}));
      renderPage();
      expect(screen.getByText("Progress & Stats")).toBeInTheDocument();
    });
  });

  // ── Error state ────────────────────────────────────────────────────────────

  describe("error state", () => {
    it("shows the error message when query fails", async () => {
      mockedGet.mockRejectedValue(new Error("Network error"));
      renderPage();
      expect(await screen.findByText("Couldn't load your stats")).toBeInTheDocument();
    });

    it("shows the retry button when query fails", async () => {
      mockedGet.mockRejectedValue(new Error("Network error"));
      renderPage();
      expect(await screen.findByRole("button", { name: /retry/i })).toBeInTheDocument();
    });

    it("retries the query when Retry is clicked", async () => {
      const user = setupUser();
      mockedGet
        .mockRejectedValueOnce(new Error("Network error"))
        .mockResolvedValue({ data: BASE_STATS });
      renderPage();
      const retryBtn = await screen.findByRole("button", { name: /retry/i });

      await user.click(retryBtn);

      await waitFor(() => {
        expect(mockedGet).toHaveBeenCalledTimes(2);
      });
    });

    it("does not show skeletons in error state", async () => {
      mockedGet.mockRejectedValue(new Error("Network error"));
      renderPage();
      await screen.findByText("Couldn't load your stats");
      expect(document.querySelectorAll(".animate-pulse").length).toBe(0);
    });
  });

  // ── Stat cards ─────────────────────────────────────────────────────────────

  describe("stat cards", () => {
    it("renders total words count", async () => {
      mockedGet.mockResolvedValue({ data: BASE_STATS });
      renderPage();
      expect(await screen.findByText("42")).toBeInTheDocument();
    });

    it("renders mastered count", async () => {
      mockedGet.mockResolvedValue({ data: BASE_STATS });
      renderPage();
      expect(await screen.findByText("9")).toBeInTheDocument();
    });

    it("renders retention percentage", async () => {
      mockedGet.mockResolvedValue({ data: BASE_STATS });
      renderPage();
      expect(await screen.findByText("75%")).toBeInTheDocument();
    });

    it("renders sessions count", async () => {
      mockedGet.mockResolvedValue({ data: BASE_STATS });
      renderPage();
      expect(await screen.findByText("14")).toBeInTheDocument();
    });

    it("renders all stat card labels", async () => {
      mockedGet.mockResolvedValue({ data: BASE_STATS });
      renderPage();
      await screen.findByText("Total Words");
      // "Mastered" appears in both stat cards and Leitner box section — use getAllByText
      expect(screen.getAllByText("Mastered").length).toBeGreaterThan(0);
      expect(screen.getByText("Retention")).toBeInTheDocument();
      expect(screen.getByText("Sessions")).toBeInTheDocument();
    });
  });

  // ── Leitner boxes ──────────────────────────────────────────────────────────

  describe("Leitner boxes", () => {
    it("renders all five box labels", async () => {
      mockedGet.mockResolvedValue({ data: BASE_STATS });
      renderPage();
      await screen.findByText("Leitner Boxes");
      for (let box = 1; box <= 5; box++) {
        expect(screen.getByText(`Box ${box}`)).toBeInTheDocument();
      }
    });

    it("renders the semantic box sublabels", async () => {
      mockedGet.mockResolvedValue({ data: BASE_STATS });
      renderPage();
      await screen.findByText("Leitner Boxes");
      expect(screen.getByText("New")).toBeInTheDocument();
      expect(screen.getByText("Learning")).toBeInTheDocument();
      expect(screen.getByText("Familiar")).toBeInTheDocument();
      expect(screen.getByText("Confident")).toBeInTheDocument();
      // "Mastered" also appears as a stat card label — getAllByText to avoid ambiguity
      expect(screen.getAllByText("Mastered").length).toBeGreaterThan(0);
    });

    it("renders counts for boxes with words", async () => {
      mockedGet.mockResolvedValue({ data: BASE_STATS });
      renderPage();
      await screen.findByText("Leitner Boxes");
      expect(screen.getByText("12")).toBeInTheDocument();
      expect(screen.getByText("10")).toBeInTheDocument();
    });

    it("does not render a count label for empty boxes", async () => {
      const statsWithEmptyBox = {
        ...BASE_STATS,
        leitnerBoxes: [
          { box: 1, count: 5 },
          { box: 2, count: 0 },
          { box: 3, count: 0 },
          { box: 4, count: 0 },
          { box: 5, count: 0 },
        ],
      };
      mockedGet.mockResolvedValue({ data: statsWithEmptyBox });
      renderPage();
      await screen.findByText("Leitner Boxes");
      expect(screen.queryByText("0")).not.toBeInTheDocument();
    });
  });

  // ── Weekly activity ────────────────────────────────────────────────────────

  describe("weekly activity", () => {
    it("renders the weekly activity section heading", async () => {
      mockedGet.mockResolvedValue({ data: BASE_STATS });
      renderPage();
      expect(await screen.findByText("Weekly Activity")).toBeInTheDocument();
    });

    it("renders all day labels", async () => {
      mockedGet.mockResolvedValue({ data: BASE_STATS });
      renderPage();
      await screen.findByText("Weekly Activity");
      for (const day of ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]) {
        expect(screen.getByText(day)).toBeInTheDocument();
      }
    });
  });
});
