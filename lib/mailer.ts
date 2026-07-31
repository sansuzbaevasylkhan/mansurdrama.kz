/**
 * Email жіберу — Gmail SMTP (nodemailer) арқылы.
 *
 * Admin жаңа қолданушы қосқанда, сол адамға тіркелгі туралы хат
 * автоматты жіберіледі (GMAIL_USER адресінен).
 *
 * Конфигурация: .env-де GMAIL_USER, GMAIL_APP_PASSWORD
 * (Google Account → Security → App passwords).
 */

import nodemailer from "nodemailer";

function isConfigured(): boolean {
  return Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
}

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
  return transporter;
}

export const isMailerConfigured = isConfigured;

export async function sendWelcomeEmail(params: {
  to: string;
  name: string;
  password?: string;
}): Promise<boolean> {
  if (!isConfigured()) {
    console.warn("[mailer] GMAIL_USER/GMAIL_APP_PASSWORD орнатылмаған, email жіберілмеді.");
    return false;
  }

  const { to, name, password } = params;
  const siteUrl = "https://mansurdrama-kz.vercel.app";

  const passwordBlock = password
    ? `<p><strong>Уақытша құпия сөз:</strong> ${password}</p><p style="color:#888;font-size:13px">Бірінші кіргенде құпия сөзді өзгертуге кеңес береміз.</p>`
    : `<p>Сіз email-ге тіркелгісіз — мобиль қосымшада тек email арқылы кіре аласыз, құпия сөз қажет емес.</p>`;

  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#0a0a10;color:#fff;border-radius:16px">
      <h2 style="color:#ec4899;margin-bottom:4px">Mansur Drama</h2>
      <p>Сәлеметсіз бе, <strong>${name}</strong>!</p>
      <p>Сіз үшін Mansur Drama платформасында тіркелгі жасалды.</p>
      <p><strong>Email:</strong> ${to}</p>
      ${passwordBlock}
      <p style="margin-top:20px">
        <a href="${siteUrl}" style="background:#ec4899;color:#fff;padding:10px 20px;border-radius:10px;text-decoration:none;font-weight:600">Сайтқа өту</a>
      </p>
      <p style="color:#888;font-size:12px;margin-top:24px">Бұл хат автоматты жіберілді, жауап бермеңіз.</p>
    </div>
  `;

  try {
    await getTransporter().sendMail({
      from: `"Mansur Drama" <${process.env.GMAIL_USER}>`,
      to,
      subject: "Mansur Drama — тіркелгіңіз жасалды",
      html,
    });
    return true;
  } catch (err) {
    console.error("[mailer] sendWelcomeEmail failed:", err);
    return false;
  }
}
