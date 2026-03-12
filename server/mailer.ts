import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";

const FROM_EMAIL = "hello@musicindustryconnect.com";
const FROM_NAME = "Music Industry Connect";

export async function sendOpportunityApplicationEmail({
  posterEmail,
  posterName,
  applicantEmail,
  applicantPhone,
  opportunityContent,
  answers,
}: {
  posterEmail: string;
  posterName: string;
  applicantEmail: string;
  applicantPhone?: string;
  opportunityContent: string;
  answers?: Record<string, string>;
}) {
  const apiKey = process.env.MAILERSEND_API_KEY;
  if (!apiKey) {
    throw new Error("MAILERSEND_API_KEY is not configured");
  }

  const mailerSend = new MailerSend({ apiToken: apiKey });

  const answersHtml = answers && Object.keys(answers).length > 0
    ? `<h3 style="color:#c084fc;margin-top:20px;">Application Answers</h3>` +
      Object.entries(answers)
        .map(([question, answer]) =>
          `<div style="margin-bottom:12px;">
            <p style="font-weight:bold;margin:0 0 4px;">${question}</p>
            <p style="margin:0;color:#555;">${answer || "(No answer provided)"}</p>
          </div>`
        ).join("")
    : "";

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
      <div style="background:linear-gradient(135deg,#c084fc,#a855f7);padding:24px 32px;">
        <h1 style="color:white;margin:0;font-size:22px;">New Application Received</h1>
        <p style="color:rgba(255,255,255,0.85);margin:4px 0 0;font-size:14px;">Music Industry Connect · MiC Is Hot</p>
      </div>
      <div style="padding:28px 32px;">
        <p style="color:#374151;font-size:15px;margin-top:0;">Hi <strong>${posterName}</strong>,</p>
        <p style="color:#374151;font-size:15px;">Someone has applied to your opportunity on MiC. Here are their details:</p>

        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:20px;margin:20px 0;">
          <h3 style="color:#c084fc;margin-top:0;">Applicant Info</h3>
          <p style="margin:0 0 8px;"><strong>Email:</strong> <a href="mailto:${applicantEmail}" style="color:#c084fc;">${applicantEmail}</a></p>
          ${applicantPhone ? `<p style="margin:0;"><strong>Phone:</strong> ${applicantPhone}</p>` : ""}
        </div>

        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:20px;margin:20px 0;">
          <h3 style="color:#c084fc;margin-top:0;">Your Opportunity</h3>
          <p style="color:#374151;margin:0;">${opportunityContent}</p>
        </div>

        ${answersHtml}

        <p style="color:#6b7280;font-size:13px;margin-top:28px;border-top:1px solid #e5e7eb;padding-top:16px;">
          Reply directly to <a href="mailto:${applicantEmail}" style="color:#c084fc;">${applicantEmail}</a> to get in touch with this applicant.
        </p>
      </div>
    </div>
  `;

  const params = new EmailParams()
    .setFrom(new Sender(FROM_EMAIL, FROM_NAME))
    .setTo([new Recipient(posterEmail, posterName)])
    .setSubject("New Application for Your Opportunity - MiC")
    .setHtml(html)
    .setText(
      `New application received!\n\nApplicant Email: ${applicantEmail}${applicantPhone ? `\nApplicant Phone: ${applicantPhone}` : ""}\n\nOpportunity: ${opportunityContent}\n\nReply to ${applicantEmail} to get in touch.`
    );

  await mailerSend.email.send(params);
}
