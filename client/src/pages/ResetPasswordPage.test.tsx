import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { setupUser } from "@/test/setup";
import ResetPasswordPage from "./ResetPasswordPage";

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    resetPassword: vi.fn(),
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
const mockResetPassword = authClient.resetPassword as ReturnType<typeof vi.fn>;

function renderWithToken(token = "test-token-abc") {
  return render(
    <MemoryRouter initialEntries={[`/reset-password?token=${token}`]}>
      <ResetPasswordPage />
    </MemoryRouter>
  );
}

function renderWithoutToken() {
  return render(
    <MemoryRouter initialEntries={["/reset-password"]}>
      <ResetPasswordPage />
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  mockResetPassword.mockResolvedValue({ data: {}, error: null } as any);
});

describe("ResetPasswordPage", () => {
  describe("no-token guard", () => {
    it("shows invalid reset link message when token is absent", () => {
      renderWithoutToken();
      expect(screen.getByText(/invalid reset link/i)).toBeInTheDocument();
    });

    it("shows link to request a new reset link", () => {
      renderWithoutToken();
      expect(screen.getByRole("link", { name: /request a new one/i })).toBeInTheDocument();
    });

    it("does not render the password form when token is absent", () => {
      renderWithoutToken();
      expect(screen.queryByLabelText(/new password/i)).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /reset password/i })).not.toBeInTheDocument();
    });

    it("does not call resetPassword when token is absent", () => {
      renderWithoutToken();
      expect(mockResetPassword).not.toHaveBeenCalled();
    });
  });

  describe("initial render with token", () => {
    it("renders the page heading and subtitle", () => {
      renderWithToken();
      expect(screen.getByRole("heading", { name: /set new password/i })).toBeInTheDocument();
      expect(screen.getByText(/choose a strong password/i)).toBeInTheDocument();
    });

    it("renders new password and confirm password fields", () => {
      renderWithToken();
      expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    });

    it("renders the submit button", () => {
      renderWithToken();
      expect(screen.getByRole("button", { name: /reset password/i })).toBeInTheDocument();
    });

    it("renders back to sign in link", () => {
      renderWithToken();
      expect(screen.getByRole("link", { name: /back to sign in/i })).toBeInTheDocument();
    });

    it("password fields are type=password by default", () => {
      renderWithToken();
      const inputs = screen.getAllByPlaceholderText(/\*{4,}|min\. 8/i);
      inputs.forEach((input) => expect(input).toHaveAttribute("type", "password"));
    });
  });

  describe("form validation", () => {
    it("shows error when password is too short", async () => {
      const user = setupUser();
      renderWithToken();
      fireEvent.change(screen.getByLabelText(/new password/i), { target: { value: "abc" } });
      fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: "abc" } });
      await user.click(screen.getByRole("button", { name: /reset password/i }));
      expect(await screen.findByText(/at least 8 characters/i)).toBeInTheDocument();
    });

    it("shows error when password is whitespace-only (under 8 non-space chars)", async () => {
      const user = setupUser();
      renderWithToken();
      fireEvent.change(screen.getByLabelText(/new password/i), { target: { value: "       " } });
      fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: "       " } });
      await user.click(screen.getByRole("button", { name: /reset password/i }));
      expect(await screen.findByText(/at least 8 characters/i)).toBeInTheDocument();
    });

    it("shows error when passwords don't match", async () => {
      const user = setupUser();
      renderWithToken();
      fireEvent.change(screen.getByLabelText(/new password/i), { target: { value: "password123" } });
      fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: "different123" } });
      await user.click(screen.getByRole("button", { name: /reset password/i }));
      expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
    });

    it("shows error when confirm password is empty", async () => {
      const user = setupUser();
      renderWithToken();
      fireEvent.change(screen.getByLabelText(/new password/i), { target: { value: "password123" } });
      await user.click(screen.getByRole("button", { name: /reset password/i }));
      expect(await screen.findByText(/confirm your password/i)).toBeInTheDocument();
    });

    it("does not call resetPassword when validation fails", async () => {
      const user = setupUser();
      renderWithToken();
      await user.click(screen.getByRole("button", { name: /reset password/i }));
      await screen.findByText(/at least 8 characters/i);
      expect(mockResetPassword).not.toHaveBeenCalled();
    });
  });

  describe("password visibility toggles", () => {
    it("toggles new password field to text when Show password is clicked", async () => {
      const user = setupUser();
      renderWithToken();
      const toggles = screen.getAllByRole("button", { name: /show password/i });
      await user.click(toggles[0]);
      expect(screen.getByLabelText(/new password/i)).toHaveAttribute("type", "text");
    });

    it("toggles confirm password field to text when second Show password is clicked", async () => {
      const user = setupUser();
      renderWithToken();
      const toggles = screen.getAllByRole("button", { name: /show password/i });
      await user.click(toggles[1]);
      expect(screen.getByLabelText(/confirm password/i)).toHaveAttribute("type", "text");
    });

    it("toggles new password back to password type on second click", async () => {
      const user = setupUser();
      renderWithToken();
      const toggle = screen.getAllByRole("button", { name: /show password/i })[0];
      await user.click(toggle);
      await user.click(screen.getByRole("button", { name: /hide password/i }));
      expect(screen.getByLabelText(/new password/i)).toHaveAttribute("type", "password");
    });

    it("toggles are independent — toggling one doesn't affect the other", async () => {
      const user = setupUser();
      renderWithToken();
      const toggles = screen.getAllByRole("button", { name: /show password/i });
      await user.click(toggles[0]);
      expect(screen.getByLabelText(/new password/i)).toHaveAttribute("type", "text");
      expect(screen.getByLabelText(/confirm password/i)).toHaveAttribute("type", "password");
    });
  });

  describe("loading state", () => {
    it("disables submit button while submitting", async () => {
      let resolve: (v: any) => void;
      mockResetPassword.mockImplementation(
        () => new Promise((r) => { resolve = r; })
      );
      const user = setupUser();
      renderWithToken();
      fireEvent.change(screen.getByLabelText(/new password/i), { target: { value: "password123" } });
      fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: "password123" } });
      const btn = screen.getByRole("button", { name: /reset password/i });
      await user.click(btn);
      expect(btn).toBeDisabled();
      resolve!({ data: {}, error: null });
    });
  });

  describe("success state", () => {
    it("shows password updated message after success", async () => {
      const user = setupUser();
      renderWithToken();
      fireEvent.change(screen.getByLabelText(/new password/i), { target: { value: "newpassword1" } });
      fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: "newpassword1" } });
      await user.click(screen.getByRole("button", { name: /reset password/i }));
      expect(await screen.findByText(/password updated/i)).toBeInTheDocument();
    });

    it("shows sign in link in success state", async () => {
      const user = setupUser();
      renderWithToken();
      fireEvent.change(screen.getByLabelText(/new password/i), { target: { value: "newpassword1" } });
      fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: "newpassword1" } });
      await user.click(screen.getByRole("button", { name: /reset password/i }));
      await screen.findByText(/password updated/i);
      const signInLinks = screen.getAllByRole("link", { name: /sign in/i });
      expect(signInLinks.length).toBeGreaterThanOrEqual(1);
    });

    it("hides the form in success state", async () => {
      const user = setupUser();
      renderWithToken();
      fireEvent.change(screen.getByLabelText(/new password/i), { target: { value: "newpassword1" } });
      fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: "newpassword1" } });
      await user.click(screen.getByRole("button", { name: /reset password/i }));
      await screen.findByText(/password updated/i);
      expect(screen.queryByRole("button", { name: /reset password/i })).not.toBeInTheDocument();
    });

    it("calls resetPassword with newPassword and token from URL", async () => {
      const user = setupUser();
      renderWithToken("my-secret-token-xyz");
      fireEvent.change(screen.getByLabelText(/new password/i), { target: { value: "newpassword1" } });
      fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: "newpassword1" } });
      await user.click(screen.getByRole("button", { name: /reset password/i }));
      await screen.findByText(/password updated/i);
      expect(mockResetPassword).toHaveBeenCalledWith({
        newPassword: "newpassword1",
        token: "my-secret-token-xyz",
      });
    });
  });

  describe("error state", () => {
    it("displays server error when resetPassword fails", async () => {
      mockResetPassword.mockResolvedValue({
        data: null,
        error: { message: "This link is invalid or has expired." },
      } as any);
      const user = setupUser();
      renderWithToken();
      fireEvent.change(screen.getByLabelText(/new password/i), { target: { value: "password123" } });
      fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: "password123" } });
      await user.click(screen.getByRole("button", { name: /reset password/i }));
      expect(await screen.findByText(/invalid or has expired/i)).toBeInTheDocument();
    });

    it("shows fallback error when error has no message", async () => {
      mockResetPassword.mockResolvedValue({
        data: null,
        error: {},
      } as any);
      const user = setupUser();
      renderWithToken();
      fireEvent.change(screen.getByLabelText(/new password/i), { target: { value: "password123" } });
      fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: "password123" } });
      await user.click(screen.getByRole("button", { name: /reset password/i }));
      expect(await screen.findByText(/invalid or has expired/i)).toBeInTheDocument();
    });

    it("clears server error when user edits password field", async () => {
      mockResetPassword.mockResolvedValueOnce({
        data: null,
        error: { message: "Token expired." },
      } as any);
      const user = setupUser();
      renderWithToken();
      const passwordInput = screen.getByLabelText(/new password/i);
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: "password123" } });
      await user.click(screen.getByRole("button", { name: /reset password/i }));
      expect(await screen.findByText(/token expired/i)).toBeInTheDocument();
      fireEvent.change(passwordInput, { target: { value: "newpassword1" } });
      await waitFor(() => {
        expect(screen.queryByText(/token expired/i)).not.toBeInTheDocument();
      });
    });

    it("clears server error when user edits confirm password field", async () => {
      mockResetPassword.mockResolvedValueOnce({
        data: null,
        error: { message: "Token expired." },
      } as any);
      const user = setupUser();
      renderWithToken();
      fireEvent.change(screen.getByLabelText(/new password/i), { target: { value: "password123" } });
      const confirmInput = screen.getByLabelText(/confirm password/i);
      fireEvent.change(confirmInput, { target: { value: "password123" } });
      await user.click(screen.getByRole("button", { name: /reset password/i }));
      expect(await screen.findByText(/token expired/i)).toBeInTheDocument();
      fireEvent.change(confirmInput, { target: { value: "password1234" } });
      await waitFor(() => {
        expect(screen.queryByText(/token expired/i)).not.toBeInTheDocument();
      });
    });

    it("keeps the form visible after an error", async () => {
      mockResetPassword.mockResolvedValue({
        data: null,
        error: { message: "Error" },
      } as any);
      const user = setupUser();
      renderWithToken();
      fireEvent.change(screen.getByLabelText(/new password/i), { target: { value: "password123" } });
      fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: "password123" } });
      await user.click(screen.getByRole("button", { name: /reset password/i }));
      await screen.findByText(/error/i);
      expect(screen.getByRole("button", { name: /reset password/i })).toBeInTheDocument();
    });
  });
});
