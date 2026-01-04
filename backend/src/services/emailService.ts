import nodemailer from 'nodemailer';
import config from '../config/env';

export interface InviteEmailData {
  email: string;
  inviteToken: string;
  inviterName: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    if (config.email && config.email.user && config.email.password) {
      this.transporter = nodemailer.createTransport({
        host: config.email.host,
        port: config.email.port,
        secure: false,
        auth: {
          user: config.email.user,
          pass: config.email.password,
        },
      });
      console.log('✅ Email service initialized with Gmail');
    } else {
      console.warn('⚠️  Email credentials not configured. Emails will be logged to console.');
    }
  }

  async sendInviteEmail(data: InviteEmailData): Promise<void> {
    const inviteUrl = `${config.FRONTEND_URL || 'http://localhost:3000'}/accept-invitation?token=${data.inviteToken}`;

    const mailOptions = {
      from: config.email?.from || 'noreply@freelance-pm.com',
      to: data.email,
      subject: 'Invitation to Join Freelance Project Manager',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button { 
              display: inline-block; 
              padding: 12px 24px; 
              background-color: #2563eb; 
              color: white; 
              text-decoration: none; 
              border-radius: 6px;
              margin: 20px 0;
            }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Welcome to Freelance Project Manager! 🚀</h2>
            <p>Hello,</p>
            <p><strong>${data.inviterName}</strong> has invited you to join Freelance Project Manager.</p>
            <p>Click the button below to set up your account and get started:</p>
            <a href="${inviteUrl}" class="button">Accept Invitation</a>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #2563eb;">${inviteUrl}</p>
            <p><strong>This invitation link expires in 7 days.</strong></p>
            <div class="footer">
              <p>If you didn't expect this invitation, you can safely ignore this email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    if (this.transporter) {
      await this.transporter.sendMail(mailOptions);
      console.log(`📧 Invite email sent to ${data.email}`);
    } else {
      console.log(`📧 [MOCK] Invite email would be sent to ${data.email}`);
      console.log(`📧 Invite URL: ${inviteUrl}`);
    }
  }
}

export default new EmailService();
