import nodemailer from "nodemailer";

const canSend = () =>
  Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

export const sendMail = async ({ to, subject, html, text }) => {
  if (!canSend()) {
    console.log("[email:dev]", { to, subject, text, html: html?.slice(0, 240) });
    return { mocked: true };
  }
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  await transporter.sendMail({
    from: `"BloomBar" <${process.env.SMTP_USER}>`,
    to,
    subject,
    text,
    html,
  });
  return { mocked: false };
};
