import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { setupUser } from "@/test/setup";
import { toast } from "sonner";
import SettingsPage from "./SettingsPage";
import api from "@/lib/api";

vi.mock("@/lib/api", () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("sonner", () => ({
  toast: Object.assign(vi.fn(), { success: vi.fn() }),
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
    section: React.forwardRef(
      (
        { children, initial: _i, animate: _a, transition: _t, ...props }: React.HTMLAttributes<HTMLDivElement> & Record<string, unknown>,
        ref: React.Ref<HTMLDivElement>
      ) => <section ref={ref} {...props}>{children}</section>
    ),
  },
}));

const mockedGet = vi.mocked(api.get);
const mockedPatch = vi.mocked(api.patch);
const mockedDelete = vi.mocked(api.delete);

const BASE_SETTINGS = {
  id: "s1",
  userId: "u1",
  dailyReviewLimit: 20,
  dailyDueCards: 10 as number | null,
  autoSave: false,
};

function mockSettings(overrides: Partial<typeof BASE_SETTINGS> = {}) {
  const settings = { ...BASE_SETTINGS, ...overrides };
  mockedGet.mockResolvedValue({ data: { settings } });
  mockedPatch.mockResolvedValue({ data: { settings } });
  mockedDelete.mockResolvedValue({ data: { settings: BASE_SETTINGS } });
  return settings;
}

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}><SettingsPage /></QueryClientProvider>
  );
}

describe("SettingsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Loading state ──────────────────────────────────────────────────────────

  describe("loading state", () => {
    it("shows skeletons while settings are loading", () => {
      mockedGet.mockReturnValue(new Promise(() => {}));
      renderPage();
      expect(document.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
    });
  });

  // ── Initial render ─────────────────────────────────────────────────────────

  describe("initial render", () => {
    it("renders the page heading", async () => {
      mockSettings();
      renderPage();
      expect(await screen.findByText("Settings")).toBeInTheDocument();
    });

    it("populates the custom input with the saved review limit", async () => {
      mockSettings({ dailyReviewLimit: 30 });
      renderPage();
      expect(await screen.findByRole("spinbutton")).toHaveValue(30);
    });

    it("displays ∞ when dailyDueCards is null", async () => {
      mockSettings({ dailyDueCards: null });
      renderPage();
      expect(await screen.findByText("∞")).toBeInTheDocument();
    });

    it("Save button is enabled when autoSave is off", async () => {
      mockSettings({ autoSave: false });
      renderPage();
      expect(await screen.findByRole("button", { name: /^save$/i })).toBeEnabled();
    });

    it("Save button shows Auto-saving and is disabled when autoSave is on", async () => {
      mockSettings({ autoSave: true });
      renderPage();
      expect(await screen.findByRole("button", { name: /auto-saving/i })).toBeDisabled();
    });
  });

  // ── Review limit ───────────────────────────────────────────────────────────

  describe("review limit", () => {
    it("clicking a preset updates the custom input value", async () => {
      const user = setupUser();
      mockSettings({ dailyReviewLimit: 20 });
      renderPage();
      await screen.findByText("Settings");

      // "30" appears only in review presets (due presets are 5/10/15/All)
      await user.click(screen.getByRole("button", { name: "30" }));

      expect(screen.getByRole("spinbutton")).toHaveValue(30);
    });

    it("typing a custom value updates the review limit input", async () => {
      mockSettings({ dailyReviewLimit: 20 });
      renderPage();
      await screen.findByText("Settings");

      fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "45" } });

      expect(screen.getByRole("spinbutton")).toHaveValue(45);
    });
  });

  // ── Due cards limit ────────────────────────────────────────────────────────

  describe("due cards limit", () => {
    it("clicking the All preset shows ∞", async () => {
      const user = setupUser();
      mockSettings({ dailyDueCards: 10 });
      renderPage();
      await screen.findByText("Settings");

      await user.click(screen.getByRole("button", { name: "All" }));

      expect(screen.getByText("∞")).toBeInTheDocument();
    });

    it("clicking a numeric preset from All removes ∞", async () => {
      const user = setupUser();
      mockSettings({ dailyDueCards: null });
      renderPage();
      await screen.findByText("∞");

      // "15" appears only in due presets
      await user.click(screen.getByRole("button", { name: "15" }));

      expect(screen.queryByText("∞")).not.toBeInTheDocument();
    });
  });

  // ── Manual save ────────────────────────────────────────────────────────────

  describe("manual save", () => {
    it("calls PATCH /settings with current form values", async () => {
      const user = setupUser();
      mockSettings({ dailyReviewLimit: 20, dailyDueCards: 10, autoSave: false });
      renderPage();
      await screen.findByText("Settings");

      await user.click(screen.getByRole("button", { name: /^save$/i }));

      await waitFor(() => {
        expect(mockedPatch).toHaveBeenCalledWith("/settings", {
          dailyReviewLimit: 20,
          dailyDueCards: 10,
          autoSave: false,
        });
      });
    });

    it("maps the All dueLimit to null in the PATCH payload", async () => {
      const user = setupUser();
      mockSettings({ dailyDueCards: 10 });
      renderPage();
      await screen.findByText("Settings");

      await user.click(screen.getByRole("button", { name: "All" }));
      await user.click(screen.getByRole("button", { name: /^save$/i }));

      await waitFor(() => {
        expect(mockedPatch).toHaveBeenCalledWith("/settings", expect.objectContaining({
          dailyDueCards: null,
        }));
      });
    });

    it("shows a success toast with a description of the saved limits", async () => {
      const user = setupUser();
      mockSettings({ dailyReviewLimit: 20, dailyDueCards: 10 });
      renderPage();
      await screen.findByText("Settings");

      await user.click(screen.getByRole("button", { name: /^save$/i }));

      await waitFor(() => {
        expect(vi.mocked(toast.success)).toHaveBeenCalledWith(
          "Settings saved",
          expect.objectContaining({ description: "20 cards/day · 10 due cards" })
        );
      });
    });
  });

  // ── Reset ──────────────────────────────────────────────────────────────────

  describe("reset", () => {
    it("calls DELETE /settings on Reset click", async () => {
      const user = setupUser();
      mockSettings();
      renderPage();
      await screen.findByText("Settings");

      await user.click(screen.getByRole("button", { name: /reset/i }));

      await waitFor(() => {
        expect(mockedDelete).toHaveBeenCalledWith("/settings");
      });
    });

    it("shows a reset toast on success", async () => {
      const user = setupUser();
      mockSettings();
      renderPage();
      await screen.findByText("Settings");

      await user.click(screen.getByRole("button", { name: /reset/i }));

      await waitFor(() => {
        expect(vi.mocked(toast)).toHaveBeenCalledWith("Reset to defaults");
      });
    });

    it("restores the default review limit in the input after reset", async () => {
      const user = setupUser();
      mockSettings({ dailyReviewLimit: 50 });
      mockedDelete.mockResolvedValue({
        data: { settings: { ...BASE_SETTINGS, dailyReviewLimit: 20 } },
      });
      renderPage();
      await screen.findByText("Settings");

      await user.click(screen.getByRole("button", { name: /reset/i }));

      await waitFor(() => {
        expect(screen.getByRole("spinbutton")).toHaveValue(20);
      });
    });
  });

  // ── Auto-save toggle ───────────────────────────────────────────────────────

  describe("auto-save toggle", () => {
    it("toggling auto-save on calls PATCH with autoSave: true immediately", async () => {
      const user = setupUser();
      mockSettings({ autoSave: false });
      renderPage();
      await screen.findByText("Settings");

      await user.click(screen.getByRole("switch"));

      await waitFor(() => {
        expect(mockedPatch).toHaveBeenCalledWith(
          "/settings",
          expect.objectContaining({ autoSave: true })
        );
      });
    });

    it("shows a success toast after toggling auto-save", async () => {
      const user = setupUser();
      mockSettings({ autoSave: false });
      renderPage();
      await screen.findByText("Settings");

      await user.click(screen.getByRole("switch"));

      await waitFor(() => {
        expect(vi.mocked(toast.success)).toHaveBeenCalledWith("Settings saved", expect.any(Object));
      });
    });

    it("Save button becomes disabled after toggling autoSave on", async () => {
      const user = setupUser();
      mockSettings({ autoSave: false });
      renderPage();
      expect(await screen.findByRole("button", { name: /^save$/i })).toBeEnabled();

      await user.click(screen.getByRole("switch"));

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /auto-saving/i })).toBeDisabled();
      });
    });
  });

  // ── Auto-save debounce ─────────────────────────────────────────────────────

  describe("auto-save debounced changes", () => {
    it("calls PATCH after changing a review limit preset when autoSave is on", async () => {
      const user = setupUser();
      mockSettings({ autoSave: true });
      renderPage();
      await screen.findByText("Settings");

      await user.click(screen.getByRole("button", { name: "30" }));

      await waitFor(
        () => {
          expect(mockedPatch).toHaveBeenCalledWith(
            "/settings",
            expect.objectContaining({ dailyReviewLimit: 30 })
          );
        },
        { timeout: 1000 }
      );
    });

    it("calls PATCH with null after selecting All for due cards when autoSave is on", async () => {
      const user = setupUser();
      mockSettings({ autoSave: true });
      renderPage();
      await screen.findByText("Settings");

      await user.click(screen.getByRole("button", { name: "All" }));

      await waitFor(
        () => {
          expect(mockedPatch).toHaveBeenCalledWith(
            "/settings",
            expect.objectContaining({ dailyDueCards: null })
          );
        },
        { timeout: 1000 }
      );
    });
  });
});
