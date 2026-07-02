import nodemailer from "nodemailer";
import { env } from "../../config/env.js";

class EmailService {
  private transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: false,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });

  async sendMail(options: {
    to: string;
    subject: string;
    html: string;
    text?: string;
  }) {
    return await this.transporter.sendMail({
      from: env.SMTP_FROM,
      ...options,
    });
  }
}

export const emailService = new EmailService();
