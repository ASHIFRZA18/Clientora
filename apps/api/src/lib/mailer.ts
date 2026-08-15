interface EmailPayload {
  to: string;
  subject: string;
  body: string;
}

/**
 * Phase 2 stub: logs the "email" to the console so auth flows are testable
 * without a real provider. Replace the implementation in Phase 9/10 with
 * Postmark, SendGrid, or SES — the call sites elsewhere never change.
 */
export async function sendEmail({ to, subject, body }: EmailPayload) {
  console.log(
    `\n─── [mailer:dev] ──────────────────────────\nTo: ${to}\nSubject: ${subject}\n${body}\n────────────────────────────────────────────\n`
  );
}
