import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { setupUser } from "@/test/setup";
import SignUpPage from "./SignUpPage";
import { authClient } from "@/lib/auth-client";

// ── Mocks ──────────────────────────────────────────────────────────────────────

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    signUp: {
      email: vi.fn(),
    },
  },
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return { ...actual, useNavigate: () => mockNavigate };
});

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

// ── Helpers ────────────────────────────────────────────────────────────────────

const mockedSignUp = vi.mocked(authClient.signUp.email);

function renderPage() {
  return render(
    <MemoryRouter>
      <SignUpPage />
    </MemoryRouter>
  );
}

function fillForm({
  name = "Alice Smith",
  email = "alice@example.com",
  password = "password123",
  confirmPassword = "password123",
} = {}) {
  fireEvent.change(screen.getByPlaceholderText("Your name"), { target: { value: name } });
  fireEvent.change(screen.getByPlaceholderText("you@example.com"), { target: { value: email } });
  fireEvent.change(screen.getByPlaceholderText("Min. 8 characters"), { target: { value: password } });
  fireEvent.change(screen.getByPlaceholderText("••••••••"), { target: { value: confirmPassword } });
}

// ── Tests ──────────────────────────────────────────────────────────────────────

describe("SignUpPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedSignUp.mockResolvedValue(undefined as never);
  });

  // ── Initial render ─────────────────────────────────────────────────────────

  describe("initial render", () => {
    it("renders the branding headline", () => {
      renderPage();
      expect(screen.getByRole("heading", { name: "Create account" })).toBeInTheDocument();
    });

    it("renders the branding subtitle", () => {
      renderPage();
      expect(screen.getByText("Start learning smarter with Leitner.")).toBeInTheDocument();
    });

    it("renders all four form fields", () => {
      renderPage();
      expect(screen.getByPlaceholderText("Your name")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Min. 8 characters")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();
    });

    it("renders the submit button", () => {
      renderPage();
      expect(screen.getByRole("button", { name: /create account/i })).toBeInTheDocument();
    });

    it("renders the Sign in link to /login", () => {
      renderPage();
      const link = screen.getByRole("link", { name: /sign in/i });
      expect(link).toHaveAttribute("href", "/login");
    });

    it("password fields start hidden", () => {
      renderPage();
      expect(screen.getByPlaceholderText("Min. 8 characters")).toHaveAttribute("type", "password");
      expect(screen.getByPlaceholderText("••••••••")).toHaveAttribute("type", "password");
    });
  });

  // ── Validation — name ──────────────────────────────────────────────────────

  describe("name validation", () => {
    it("shows error when name is empty", async () => {
      const user = setupUser();
      renderPage();
      await user.click(screen.getByRole("button", { name: /create account/i }));
      expect(await screen.findByText("Name must be at least 2 characters")).toBeInTheDocument();
    });

    it("shows error when name is only 1 character", async () => {
      const user = setupUser();
      renderPage();
      fireEvent.change(screen.getByPlaceholderText("Your name"), { target: { value: "A" } });
      await user.click(screen.getByRole("button", { name: /create account/i }));
      expect(await screen.findByText("Name must be at least 2 characters")).toBeInTheDocument();
    });

    it("shows error when name is whitespace only", async () => {
      const user = setupUser();
      renderPage();
      fireEvent.change(screen.getByPlaceholderText("Your name"), { target: { value: "   " } });
      await user.click(screen.getByRole("button", { name: /create account/i }));
      expect(await screen.findByText("Name must be at least 2 characters")).toBeInTheDocument();
    });
  });

  // ── Validation — email ─────────────────────────────────────────────────────

  describe("email validation", () => {
    it("shows error for an invalid email format", async () => {
      const user = setupUser();
      renderPage();
      fireEvent.change(screen.getByPlaceholderText("you@example.com"), { target: { value: "not-an-email" } });
      await user.click(screen.getByRole("button", { name: /create account/i }));
      expect(await screen.findByText("Enter a valid email address")).toBeInTheDocument();
    });
  });

  // ── Validation — password ──────────────────────────────────────────────────

  describe("password validation", () => {
    it("shows error when password is fewer than 8 characters", async () => {
      const user = setupUser();
      renderPage();
      fireEvent.change(screen.getByPlaceholderText("Min. 8 characters"), { target: { value: "short" } });
      await user.click(screen.getByRole("button", { name: /create account/i }));
      expect(await screen.findByText("Password must be at least 8 characters")).toBeInTheDocument();
    });

    it("shows error when password is 8 spaces", async () => {
      const user = setupUser();
      renderPage();
      fireEvent.change(screen.getByPlaceholderText("Min. 8 characters"), { target: { value: "        " } });
      await user.click(screen.getByRole("button", { name: /create account/i }));
      expect(await screen.findByText("Password must be at least 8 characters")).toBeInTheDocument();
    });
  });

  // ── Validation — confirm password ──────────────────────────────────────────

  describe("confirm password validation", () => {
    it("shows error when confirmPassword is empty", async () => {
      const user = setupUser();
      renderPage();
      fireEvent.change(screen.getByPlaceholderText("Min. 8 characters"), { target: { value: "password123" } });
      await user.click(screen.getByRole("button", { name: /create account/i }));
      expect(await screen.findByText("Please confirm your password")).toBeInTheDocument();
    });

    it("shows error when passwords do not match", async () => {
      const user = setupUser();
      renderPage();
      fireEvent.change(screen.getByPlaceholderText("Min. 8 characters"), { target: { value: "password123" } });
      fireEvent.change(screen.getByPlaceholderText("••••••••"), { target: { value: "different456" } });
      await user.click(screen.getByRole("button", { name: /create account/i }));
      expect(await screen.findByText("Passwords do not match")).toBeInTheDocument();
    });
  });

  // ── No API call on invalid submit ──────────────────────────────────────────

  describe("invalid submit", () => {
    it("does not call authClient.signUp.email when form is invalid", async () => {
      const user = setupUser();
      renderPage();
      await user.click(screen.getByRole("button", { name: /create account/i }));
      await screen.findByText("Name must be at least 2 characters");
      expect(mockedSignUp).not.toHaveBeenCalled();
    });
  });

  // ── Password visibility toggle ─────────────────────────────────────────────

  describe("password visibility toggle", () => {
    it("shows the password when Show password is clicked on the password field", async () => {
      const user = setupUser();
      renderPage();
      const [showPasswordBtn] = screen.getAllByRole("button", { name: /show password/i });
      await user.click(showPasswordBtn);
      expect(screen.getByPlaceholderText("Min. 8 characters")).toHaveAttribute("type", "text");
    });

    it("hides the password again when Hide password is clicked on the password field", async () => {
      const user = setupUser();
      renderPage();
      const [showPasswordBtn] = screen.getAllByRole("button", { name: /show password/i });
      await user.click(showPasswordBtn);
      await user.click(screen.getByRole("button", { name: /hide password/i }));
      expect(screen.getByPlaceholderText("Min. 8 characters")).toHaveAttribute("type", "password");
    });

    it("toggles the confirm password field independently", async () => {
      const user = setupUser();
      renderPage();
      const showButtons = screen.getAllByRole("button", { name: /show password/i });
      // The second Show password button belongs to confirmPassword
      await user.click(showButtons[1]);
      expect(screen.getByPlaceholderText("••••••••")).toHaveAttribute("type", "text");
      // Main password field remains hidden
      expect(screen.getByPlaceholderText("Min. 8 characters")).toHaveAttribute("type", "password");
    });
  });

  // ── Successful sign up ─────────────────────────────────────────────────────

  describe("successful sign up", () => {
    beforeEach(() => {
      mockedSignUp.mockImplementation(async (_data: unknown, callbacks: any) => {
        await callbacks?.onSuccess?.();
      });
    });

    it("calls authClient.signUp.email with name, email, and password", async () => {
      const user = setupUser();
      renderPage();
      fillForm();
      await user.click(screen.getByRole("button", { name: /create account/i }));
      await waitFor(() => {
        expect(mockedSignUp).toHaveBeenCalledWith(
          { name: "Alice Smith", email: "alice@example.com", password: "password123" },
          expect.objectContaining({ onSuccess: expect.any(Function), onError: expect.any(Function) })
        );
      });
    });

    it("trims whitespace from name and email before sending", async () => {
      const user = setupUser();
      renderPage();
      fillForm({ name: "  Alice Smith  ", email: "  alice@example.com  " });
      await user.click(screen.getByRole("button", { name: /create account/i }));
      await waitFor(() => {
        expect(mockedSignUp).toHaveBeenCalledWith(
          expect.objectContaining({ name: "Alice Smith", email: "alice@example.com" }),
          expect.any(Object)
        );
      });
    });

    it("navigates to / after successful sign up", async () => {
      const user = setupUser();
      renderPage();
      fillForm();
      await user.click(screen.getByRole("button", { name: /create account/i }));
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/");
      });
    });
  });

  // ── Loading state ──────────────────────────────────────────────────────────

  describe("loading state", () => {
    it("disables the submit button while the request is pending", async () => {
      const user = setupUser();
      mockedSignUp.mockImplementation(() => new Promise(() => {}));
      renderPage();
      fillForm();
      const submitBtn = screen.getByRole("button", { name: /create account/i });
      await user.click(submitBtn);
      await waitFor(() => expect(submitBtn).toBeDisabled());
    });

    it("shows a loading spinner while the request is pending", async () => {
      const user = setupUser();
      mockedSignUp.mockImplementation(() => new Promise(() => {}));
      renderPage();
      fillForm();
      await user.click(screen.getByRole("button", { name: /create account/i }));
      await waitFor(() => {
        expect(document.querySelector(".animate-spin")).toBeInTheDocument();
      });
    });
  });

  // ── Server error ───────────────────────────────────────────────────────────

  describe("server error", () => {
    beforeEach(() => {
      mockedSignUp.mockImplementation(async (_data: unknown, callbacks: any) => {
        await callbacks?.onError?.({ error: { message: "Email already in use" } });
      });
    });

    it("displays the server error message on failure", async () => {
      const user = setupUser();
      renderPage();
      fillForm();
      await user.click(screen.getByRole("button", { name: /create account/i }));
      expect(await screen.findByText("Email already in use")).toBeInTheDocument();
    });

    it("clears the server error when the name field is edited", async () => {
      const user = setupUser();
      renderPage();
      fillForm();
      await user.click(screen.getByRole("button", { name: /create account/i }));
      await screen.findByText("Email already in use");
      fireEvent.change(screen.getByPlaceholderText("Your name"), { target: { value: "Bob" } });
      expect(screen.queryByText("Email already in use")).not.toBeInTheDocument();
    });

    it("clears the server error when the email field is edited", async () => {
      const user = setupUser();
      renderPage();
      fillForm();
      await user.click(screen.getByRole("button", { name: /create account/i }));
      await screen.findByText("Email already in use");
      fireEvent.change(screen.getByPlaceholderText("you@example.com"), { target: { value: "bob@example.com" } });
      expect(screen.queryByText("Email already in use")).not.toBeInTheDocument();
    });

    it("clears the server error when the password field is edited", async () => {
      const user = setupUser();
      renderPage();
      fillForm();
      await user.click(screen.getByRole("button", { name: /create account/i }));
      await screen.findByText("Email already in use");
      fireEvent.change(screen.getByPlaceholderText("Min. 8 characters"), { target: { value: "newpassword123" } });
      expect(screen.queryByText("Email already in use")).not.toBeInTheDocument();
    });
  });
});
