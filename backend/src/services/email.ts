import sgMail from '@sendgrid/mail';
import { config } from '../config.js';
import { Announcement } from '../types.js';

// Initialize SendGrid
const initSendGrid = () => {
  if (!config.emailPass) {
    console.warn('SENDGRID_API_KEY not configured. Email notifications disabled.');
    return false;
  }
  sgMail.setApiKey(config.emailPass);
  return true;
};

const isConfigured = initSendGrid();

/**
 * Check if email service is configured
 */
export const isEmailConfigured = (): boolean => {
  return isConfigured;
};

/**
 * Send verification email to new subscriber
 */
export const sendVerificationEmail = async (
  email: string,
  verificationToken: string,
  categories: string[]
): Promise<boolean> => {
  if (!isConfigured) {
    console.log('SendGrid not configured, skipping verification email');
    return false;
  }

  const verifyUrl = `${config.frontendUrl}/verify?token=${verificationToken}`;
  const categoryList = categories.length > 0 ? categories.join(', ') : 'All categories';

  try {
    await sgMail.send({
      to: email,
      from: config.emailFrom || 'noreply@sarkariresult.com',
      subject: '📧 Verify your Sarkari Result subscription',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1a365d; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .button { display: inline-block; background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏛️ Sarkari Result</h1>
            </div>
            <div class="content">
              <h2>Confirm your subscription</h2>
              <p>Thank you for subscribing to Sarkari Result notifications!</p>
              <p><strong>Categories:</strong> ${categoryList}</p>
              <p>Please click the button below to verify your email address:</p>
              <a href="${verifyUrl}" class="button">✅ Verify Email</a>
              <p>If you didn't subscribe, you can ignore this email.</p>
            </div>
            <div class="footer">
              <p>© 2024 Sarkari Result | Government Jobs & Results Portal</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
    console.log(`Verification email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Failed to send verification email:', error);
    return false;
  }
};

/**
 * Send announcement notification email to subscribers
 */
export const sendAnnouncementEmail = async (
  emails: string[],
  announcement: Announcement,
  unsubscribeTokens: Map<string, string>
): Promise<number> => {
  if (!isConfigured || emails.length === 0) {
    return 0;
  }

  const announcementUrl = `${config.frontendUrl}/?item=${announcement.slug}`;
  let sentCount = 0;

  for (const email of emails) {
    const unsubscribeToken = unsubscribeTokens.get(email);
    const unsubscribeUrl = `${config.frontendUrl}/unsubscribe?token=${unsubscribeToken}`;

    try {
      await sgMail.send({
        to: email,
        from: config.emailFrom || 'noreply@sarkariresult.com',
        subject: `🆕 New ${announcement.type}: ${announcement.title}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #1a365d; color: white; padding: 20px; text-align: center; }
              .content { padding: 20px; background: #f9f9f9; }
              .announcement { background: white; padding: 15px; border-left: 4px solid #f97316; margin: 15px 0; }
              .button { display: inline-block; background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; }
              .meta { color: #666; font-size: 14px; margin: 10px 0; }
              .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🏛️ Sarkari Result</h1>
                <p>New ${announcement.type.toUpperCase()} Alert!</p>
              </div>
              <div class="content">
                <div class="announcement">
                  <h2>${announcement.title}</h2>
                  <p class="meta">
                    📌 <strong>${announcement.organization}</strong><br>
                    📂 Category: ${announcement.category}<br>
                    ${announcement.deadline ? `📅 Deadline: ${new Date(announcement.deadline).toLocaleDateString('en-IN')}` : ''}
                  </p>
                </div>
                <a href="${announcementUrl}" class="button">📄 View Details</a>
              </div>
              <div class="footer">
                <p>© 2024 Sarkari Result | Government Jobs & Results Portal</p>
                <p><a href="${unsubscribeUrl}">Unsubscribe</a> from these notifications</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });
      sentCount++;
    } catch (error) {
      console.error(`Failed to send email to ${email}:`, error);
    }
  }

  console.log(`Sent ${sentCount}/${emails.length} announcement emails`);
  return sentCount;
};
