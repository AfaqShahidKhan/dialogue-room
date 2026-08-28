import nodemailer from "nodemailer";
import { env } from "../config/env";
import type { UserDocument } from "../models/user.model";

interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (!env.EMAIL_HOST) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.EMAIL_HOST,
      port: env.EMAIL_PORT,
      auth: env.EMAIL_USERNAME
        ? { user: env.EMAIL_USERNAME, pass: env.EMAIL_PASSWORD }
        : undefined,
    });
  }
  return transporter;
}

async function sendMail(options: MailOptions): Promise<void> {
  const mailer = getTransporter();
  if (!mailer) {
    // Dev mode: no SMTP configured — log instead of sending.
    console.log("📧 [dev email] to:", options.to);
    console.log("📧 [dev email] subject:", options.subject);
    console.log("📧 [dev email] html:\n", options.html);
    return;
  }

  await mailer.sendMail({
    from: env.EMAIL_FROM,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });
}

export async function sendWelcome(user: Pick<UserDocument, "email" | "name">): Promise<void> {
  await sendMail({
    to: user.email,
    subject: "Welcome to Dialogue Room!",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h1>Welcome, ${user.name}!</h1>
        <p>Thanks for joining Dialogue Room — the place to find language exchange partners and chat in real time.</p>
        <p>Complete your profile to start discovering partners.</p>
      </div>
    `,
  });
}

export async function sendPasswordReset(
  user: Pick<UserDocument, "email" | "name">,
  resetUrl: string,
): Promise<void> {
  await sendMail({
    to: user.email,
    subject: "Your password reset link (valid for 10 minutes)",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h1>Password reset</h1>
        <p>Hi ${user.name}, we received a request to reset your password.</p>
        <p><a href="${resetUrl}">Click here to reset your password</a></p>
        <p>This link expires in 10 minutes. If you didn't request this, you can ignore this email.</p>
      </div>
    `,
  });
}
