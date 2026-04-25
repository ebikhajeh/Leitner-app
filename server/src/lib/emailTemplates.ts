export function buildPasswordResetEmail(resetUrl: string): { subject: string; html: string } {
  return {
    subject: "Reset your Leitner password",
    html: `
      <p>You requested a password reset for your Leitner account.</p>
      <p>
        <a href="${resetUrl}" style="
          display:inline-block;
          background:#3b82f6;
          color:#fff;
          padding:12px 24px;
          border-radius:8px;
          text-decoration:none;
          font-weight:600;
        ">Reset Password</a>
      </p>
      <p>This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
      <p style="color:#6b7280;font-size:12px;">
        Or copy and paste this URL into your browser:<br/>
        ${resetUrl}
      </p>
    `,
  };
}
