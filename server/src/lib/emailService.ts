import { Resend } from "resend";
import { buildPasswordResetEmail } from "./emailTemplates";

let _resend: Resend | null = null;
let _fromEmail: string | null = null;

function getClient(): { resend: Resend; fromEmail: string } {
  if (!_resend || !_fromEmail) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) throw new Error("Missing required env var: RESEND_API_KEY");

    const fromEmail = process.env.RESEND_FROM_EMAIL;
    if (!fromEmail) throw new Error("Missing required env var: RESEND_FROM_EMAIL");

    _resend = new Resend(apiKey);
    _fromEmail = fromEmail;
  }
  return { resend: _resend, fromEmail: _fromEmail };
}

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
  const { resend, fromEmail } = getClient();
  const { subject, html } = buildPasswordResetEmail(resetUrl);
  await resend.emails.send({ from: fromEmail, to, subject, html });
}
