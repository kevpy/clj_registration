import Resend from "@auth/core/providers/resend";
import { Resend as ResendAPI } from "resend";
import { RandomReader, generateRandomString } from "@oslojs/crypto/random";

export const ResendOTPPasswordReset = Resend({
    id: "resend-otp",
    apiKey: process.env.AUTH_RESEND_KEY,
    async generateVerificationToken() {
        const random: RandomReader = {
            read(bytes) {
                crypto.getRandomValues(bytes);
            },
        };
        const alphabet = "0123456789";
        const length = 8;
        return generateRandomString(random, alphabet, length);
    },
    async sendVerificationRequest({ identifier: email, provider, token }) {
        const resend = new ResendAPI(provider.apiKey);
        const { error } = await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || "noreply@resend.dev",
            to: [email],
            subject: "Reset your password",
            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; margin-bottom: 24px;">Password Reset Request</h2>
          <p style="color: #555; font-size: 16px; line-height: 1.5;">
            You requested to reset your password. Use the verification code below:
          </p>
          <div style="background-color: #f5f5f5; padding: 24px; border-radius: 8px; text-align: center; margin: 24px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #333;">${token}</span>
          </div>
          <p style="color: #777; font-size: 14px;">
            This code will expire in 15 minutes.
          </p>
          <p style="color: #777; font-size: 14px;">
            If you didn't request this password reset, you can safely ignore this email.
          </p>
        </div>
      `,
        });

        if (error) {
            throw new Error(`Could not send password reset email: ${error.message}`);
        }
    },
});
