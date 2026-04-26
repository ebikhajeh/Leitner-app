import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { setupUser } from "@/test/setup";
import ForgotPasswordPage from "./ForgotPasswordPage";

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    requestPasswordReset: vi.fn(),
  },
}));

vi.mock("framer-motion", () => ({
  motion: {
    div: React.forwardRef(({ children, ...props }: any, ref: any) => {
      const { initial, animate, transition, exit, whileHover, whileTap, ...domProps } = props;
      return <div ref={ref} {...domProps}>{children}</div>;
    }),
  },
}));

import { authClient } from "@/lib/auth-client";
const mockRequestPasswordReset = authClient.requestPasswordReset as unknown as ReturnType<typeof vi.fn>;

function renderPage() {
  return render(
    <MemoryRouter>
      <ForgotPasswordPage />
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  mockRequestPasswordReset.mockResolvedValue({ data: {}, error: null } as any);
});

describe("ForgotPasswordPage", () => {
  describe("initial render", () => {
    it("renders the page heading and subtitle", () => {
      renderPage();
      expect(screen.getByRole("heading", { name: /forgot password/i })).toBeInTheDocument();
      expect(screen.getByText(/enter your email/i)).toBeInTheDocument();
    });

    it("renders email field", () => {
      renderPage();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });

    it("renders the submit button", () => {
      renderPage();
      expect(screen.getByRole("button", { name: /send reset link/i })).toBeInTheDocument();
    });

    it("renders the sign in link", () => {
      renderPage();
      expect(screen.getByRole("link", { name: /sign in/i })).toBeInTheDocument();
    });

    it("submit button is enabled initially", () => {
      renderPage();
      expect(screen.getByRole("button", { name: /send reset link/i })).not.toBeDisabled();
    });
  });

  describe("form validation", () => {
    it("shows error for empty email on submit", async () => {
      const user = setupUser();
      renderPage();
      await user.click(screen.getByRole("button", { name: /send reset link/i }));
      expect(await screen.findByText(/valid email/i)).toBeInTheDocument();
    });

    it("shows error for invalid email format", async () => {
      const user = setupUser();
      renderPage();
      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "notanemail" } });
      await user.click(screen.getByRole("button", { name: /send reset link/i }));
      expect(await screen.findByText(/valid email/i)).toBeInTheDocument();
    });

    it("does not submit with whitespace-only email", async () => {
      const user = setupUser();
      renderPage();
      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "   " } });
      await user.click(screen.getByRole("button", { name: /send reset link/i }));
      expect(await screen.findByText(/valid email/i)).toBeInTheDocument();
      expect(mockRequestPasswordReset).not.toHaveBeenCalled();
    });

    it("does not submit when email is empty", async () => {
      const user = setupUser();
      renderPage();
      await user.click(screen.getByRole("button", { name: /send reset link/i }));
      await screen.findByText(/valid email/i);
      expect(mockRequestPasswordReset).not.toHaveBeenCalled();
    });
  });

  describe("loading state", () => {
    it("disables submit button while submitting", async () => {
      let resolve: (v: any) => void;
      mockRequestPasswordReset.mockImplementation(
        () => new Promise((r) => { resolve = r; })
      );
      const user = setupUser();
      renderPage();
      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "user@example.com" } });
      const btn = screen.getByRole("button", { name: /send reset link/i });
      await user.click(btn);
      expect(btn).toBeDisabled();
      resolve!({ data: {}, error: null });
    });
  });

  describe("success state", () => {
    it("swaps form for success message after request succeeds", async () => {
      const user = setupUser();
      renderPage();
      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "user@example.com" } });
      await user.click(screen.getByRole("button", { name: /send reset link/i }));
      expect(await screen.findByText(/check your inbox/i)).toBeInTheDocument();
    });

    it("shows expiry copy in success state", async () => {
      const user = setupUser();
      renderPage();
      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "user@example.com" } });
      await user.click(screen.getByRole("button", { name: /send reset link/i }));
      expect(await screen.findByText(/expires in 1/i)).toBeInTheDocument();
    });

    it("hides the form in success state", async () => {
      const user = setupUser();
      renderPage();
      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "user@example.com" } });
      await user.click(screen.getByRole("button", { name: /send reset link/i }));
      await screen.findByText(/check your inbox/i);
      expect(screen.queryByRole("button", { name: /send reset link/i })).not.toBeInTheDocument();
    });

    it("calls requestPasswordReset with trimmed email and correct redirectTo", async () => {
      const user = setupUser();
      renderPage();
      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "  user@example.com  " } });
      await user.click(screen.getByRole("button", { name: /send reset link/i }));
      await screen.findByText(/check your inbox/i);
      expect(mockRequestPasswordReset).toHaveBeenCalledWith({
        email: "user@example.com",
        redirectTo: expect.stringContaining("/reset-password"),
      });
    });

    it("uses generic success copy (no email confirmation)", async () => {
      const user = setupUser();
      renderPage();
      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "user@example.com" } });
      await user.click(screen.getByRole("button", { name: /send reset link/i }));
      expect(await screen.findByText(/if an account exists/i)).toBeInTheDocument();
    });
  });

  describe("error state", () => {
    it("displays server error message when request fails", async () => {
      mockRequestPasswordReset.mockResolvedValue({
        data: null,
        error: { message: "Too many requests. Please try again later." },
      } as any);
      const user = setupUser();
      renderPage();
      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "user@example.com" } });
      await user.click(screen.getByRole("button", { name: /send reset link/i }));
      expect(await screen.findByText(/too many requests/i)).toBeInTheDocument();
    });

    it("shows fallback error message when error has no message", async () => {
      mockRequestPasswordReset.mockResolvedValue({
        data: null,
        error: {},
      } as any);
      const user = setupUser();
      renderPage();
      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "user@example.com" } });
      await user.click(screen.getByRole("button", { name: /send reset link/i }));
      expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument();
    });

    it("clears server error when user edits email field", async () => {
      mockRequestPasswordReset.mockResolvedValueOnce({
        data: null,
        error: { message: "Too many requests." },
      } as any);
      const user = setupUser();
      renderPage();
      const emailInput = screen.getByLabelText(/email/i);
      fireEvent.change(emailInput, { target: { value: "user@example.com" } });
      await user.click(screen.getByRole("button", { name: /send reset link/i }));
      expect(await screen.findByText(/too many requests/i)).toBeInTheDocument();
      fireEvent.change(emailInput, { target: { value: "other@example.com" } });
      await waitFor(() => {
        expect(screen.queryByText(/too many requests/i)).not.toBeInTheDocument();
      });
    });

    it("keeps the form visible after an error", async () => {
      mockRequestPasswordReset.mockResolvedValue({
        data: null,
        error: { message: "Error" },
      } as any);
      const user = setupUser();
      renderPage();
      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "user@example.com" } });
      await user.click(screen.getByRole("button", { name: /send reset link/i }));
      await screen.findByText(/error/i);
      expect(screen.getByRole("button", { name: /send reset link/i })).toBeInTheDocument();
    });
  });
});
