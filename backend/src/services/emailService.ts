import { Announcement } from '../types.js';

// Email service configuration
// Using Resend for email delivery (free tier: 100 emails/day)
// Alternative: SendGrid, Mailgun, Amazon SES

interface EmailConfig {
    apiKey: string;
    fromEmail: string;
    fromName: string;
}

interface JobAlertEmail {
    to: string;
    subject: string;
    jobs: Announcement[];
    unsubscribeToken: string;
}

interface DigestEmail {
    to: string;
    jobs: Announcement[];
    type: 'daily' | 'weekly';
    unsubscribeToken: string;
}

// Check if email service is configured
const isConfigured = (): boolean => {
    return !!process.env.RESEND_API_KEY || !!process.env.SENDGRID_API_KEY;
};

// Get email config
const getConfig = (): EmailConfig | null => {
    if (process.env.RESEND_API_KEY) {
        return {
            apiKey: process.env.RESEND_API_KEY,
            fromEmail: process.env.EMAIL_FROM || 'alerts@sarkariexams.me',
            fromName: process.env.EMAIL_FROM_NAME || 'SarkariExams.me'
        };
    }
    if (process.env.SENDGRID_API_KEY) {
        return {
            apiKey: process.env.SENDGRID_API_KEY,
            fromEmail: process.env.EMAIL_FROM || 'alerts@sarkariexams.me',
            fromName: process.env.EMAIL_FROM_NAME || 'SarkariExams.me'
        };
    }
    return null;
};

// Send email using Resend API
async function sendWithResend(to: string, subject: string, html: string, config: EmailConfig): Promise<boolean> {
    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${config.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: `${config.fromName} <${config.fromEmail}>`,
                to: [to],
                subject,
                html
            })
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('[Email] Resend error:', error);
            return false;
        }

        console.log(`[Email] Sent to ${to}: ${subject}`);
        return true;
    } catch (error) {
        console.error('[Email] Send failed:', error);
        return false;
    }
}

// Generate job alert HTML email
function generateJobAlertHTML(jobs: Announcement[], unsubscribeToken: string): string {
    const jobListHTML = jobs.map(job => `
        <tr>
            <td style="padding: 16px; border-bottom: 1px solid #e5e7eb;">
                <div style="margin-bottom: 8px;">
                    <span style="background: ${getTypeBadgeColor(job.type)}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px; text-transform: uppercase;">
                        ${job.type}
                    </span>
                </div>
                <a href="https://sarkariexams.me/${job.type}/${job.slug}" style="color: #1f2937; font-size: 16px; font-weight: 600; text-decoration: none;">
                    ${escapeHtml(job.title)}
                </a>
                <div style="color: #6b7280; font-size: 14px; margin-top: 4px;">
                    🏛️ ${escapeHtml(job.organization)}
                    ${job.totalPosts ? ` • ${job.totalPosts} Posts` : ''}
                    ${job.deadline ? ` • Last Date: ${formatDate(job.deadline)}` : ''}
                </div>
                <div style="margin-top: 12px;">
                    <a href="https://sarkariexams.me/${job.type}/${job.slug}" style="background: #6366f1; color: white; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 13px;">
                        View Details →
                    </a>
                </div>
            </td>
        </tr>
    `).join('');

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Job Alerts</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: white;">
        <!-- Header -->
        <tr>
            <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 24px; text-align: center;">
                <h1 style="margin: 0; color: white; font-size: 24px;">🔔 New Job Alerts</h1>
                <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">
                    ${jobs.length} new opportunities matching your preferences
                </p>
            </td>
        </tr>
        
        <!-- Jobs List -->
        <tr>
            <td style="padding: 0;">
                <table width="100%" cellpadding="0" cellspacing="0">
                    ${jobListHTML}
                </table>
            </td>
        </tr>
        
        <!-- CTA -->
        <tr>
            <td style="padding: 24px; text-align: center; background: #f9fafb;">
                <a href="https://sarkariexams.me" style="background: #6366f1; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
                    View All Jobs
                </a>
            </td>
        </tr>
        
        <!-- Footer -->
        <tr>
            <td style="padding: 24px; text-align: center; color: #9ca3af; font-size: 12px; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0 0 8px 0;">
                    You're receiving this because you subscribed to job alerts at SarkariExams.me
                </p>
                <a href="https://sarkariexams.me/unsubscribe?token=${unsubscribeToken}" style="color: #6366f1; text-decoration: none;">
                    Unsubscribe
                </a>
                 | 
                <a href="https://sarkariexams.me/profile" style="color: #6366f1; text-decoration: none;">
                    Manage Preferences
                </a>
            </td>
        </tr>
    </table>
</body>
</html>
    `;
}

// Generate digest email HTML
function generateDigestHTML(jobs: Announcement[], type: 'daily' | 'weekly', unsubscribeToken: string): string {
    const title = type === 'daily' ? 'Daily Job Digest' : 'Weekly Job Digest';
    const period = type === 'daily' ? 'today' : 'this week';

    // Group jobs by type
    const grouped = jobs.reduce((acc, job) => {
        const jobType = job.type || 'job';
        if (!acc[jobType]) acc[jobType] = [];
        acc[jobType].push(job);
        return acc;
    }, {} as Record<string, Announcement[]>);

    const sectionsHTML = Object.entries(grouped).map(([jobType, typeJobs]) => `
        <tr>
            <td style="padding: 16px 16px 8px 16px;">
                <h2 style="margin: 0; color: #1f2937; font-size: 18px; border-bottom: 2px solid #6366f1; padding-bottom: 8px;">
                    ${getTypeLabel(jobType)} (${typeJobs.length})
                </h2>
            </td>
        </tr>
        ${typeJobs.slice(0, 5).map(job => `
        <tr>
            <td style="padding: 12px 16px;">
                <a href="https://sarkariexams.me/${job.type}/${job.slug}" style="color: #1f2937; font-size: 15px; font-weight: 500; text-decoration: none;">
                    ${escapeHtml(job.title)}
                </a>
                <div style="color: #6b7280; font-size: 13px; margin-top: 2px;">
                    ${escapeHtml(job.organization)}${job.totalPosts ? ` • ${job.totalPosts} Posts` : ''}
                </div>
            </td>
        </tr>
        `).join('')}
    `).join('');

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: white;">
        <!-- Header -->
        <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 24px; text-align: center;">
                <h1 style="margin: 0; color: white; font-size: 24px;">📋 ${title}</h1>
                <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">
                    ${jobs.length} new opportunities posted ${period}
                </p>
            </td>
        </tr>
        
        <!-- Grouped Jobs -->
        ${sectionsHTML}
        
        <!-- CTA -->
        <tr>
            <td style="padding: 24px; text-align: center; background: #f9fafb;">
                <a href="https://sarkariexams.me" style="background: #10b981; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
                    Explore All Opportunities
                </a>
            </td>
        </tr>
        
        <!-- Footer -->
        <tr>
            <td style="padding: 24px; text-align: center; color: #9ca3af; font-size: 12px; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0 0 8px 0;">
                    You're receiving this ${type} digest from SarkariExams.me
                </p>
                <a href="https://sarkariexams.me/unsubscribe?token=${unsubscribeToken}" style="color: #10b981; text-decoration: none;">
                    Unsubscribe
                </a>
                 | 
                <a href="https://sarkariexams.me/profile" style="color: #10b981; text-decoration: none;">
                    Change Frequency
                </a>
            </td>
        </tr>
    </table>
</body>
</html>
    `;
}

// Helper functions
function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getTypeBadgeColor(type: string): string {
    const colors: Record<string, string> = {
        'job': '#6366f1',
        'result': '#10b981',
        'admit-card': '#f59e0b',
        'answer-key': '#8b5cf6',
        'admission': '#ec4899',
        'syllabus': '#3b82f6'
    };
    return colors[type] || '#6b7280';
}

function getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
        'job': '💼 Latest Jobs',
        'result': '📊 Results',
        'admit-card': '🎫 Admit Cards',
        'answer-key': '📝 Answer Keys',
        'admission': '🎓 Admissions',
        'syllabus': '📚 Syllabus'
    };
    return labels[type] || '📋 Updates';
}

// Public API
export const EmailService = {
    isConfigured,

    /**
     * Send instant job alert email
     */
    async sendJobAlert(data: JobAlertEmail): Promise<boolean> {
        const config = getConfig();
        if (!config) {
            console.log('[Email] Not configured, skipping email');
            return false;
        }

        const html = generateJobAlertHTML(data.jobs, data.unsubscribeToken);
        return sendWithResend(data.to, data.subject, html, config);
    },

    /**
     * Send daily/weekly digest email
     */
    async sendDigest(data: DigestEmail): Promise<boolean> {
        const config = getConfig();
        if (!config) {
            console.log('[Email] Not configured, skipping digest');
            return false;
        }

        const subject = data.type === 'daily'
            ? `📋 Your Daily Job Digest - ${data.jobs.length} New Opportunities`
            : `📋 Weekly Recap - ${data.jobs.length} Jobs This Week`;

        const html = generateDigestHTML(data.jobs, data.type, data.unsubscribeToken);
        return sendWithResend(data.to, subject, html, config);
    },

    /**
     * Send batch emails (with rate limiting)
     */
    async sendBatch(emails: Array<{ to: string; subject: string; jobs: Announcement[]; unsubscribeToken: string }>): Promise<{ sent: number; failed: number }> {
        let sent = 0;
        let failed = 0;

        for (const email of emails) {
            const success = await this.sendJobAlert(email);
            if (success) sent++;
            else failed++;

            // Rate limit: 10 emails per second max
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        console.log(`[Email] Batch complete: ${sent} sent, ${failed} failed`);
        return { sent, failed };
    }
};

export default EmailService;
