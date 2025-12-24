import { config } from '../config.js';
import { Announcement } from '../types.js';

const TELEGRAM_API_BASE = 'https://api.telegram.org/bot';

interface TelegramResponse {
  ok: boolean;
  result?: any;
  description?: string;
}

/**
 * Check if Telegram notifications are configured
 */
export function isTelegramConfigured(): boolean {
  return !!(config.telegramBotToken && config.telegramChannelId);
}

/**
 * Send a message to the configured Telegram channel
 */
export async function sendTelegramMessage(text: string, parseMode: 'HTML' | 'Markdown' = 'HTML'): Promise<boolean> {
  if (!isTelegramConfigured()) {
    console.log('[Telegram] Not configured, skipping notification');
    return false;
  }

  try {
    const url = `${TELEGRAM_API_BASE}${config.telegramBotToken}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: config.telegramChannelId,
        text,
        parse_mode: parseMode,
        disable_web_page_preview: false,
      }),
    });

    const data = await response.json() as TelegramResponse;
    
    if (!data.ok) {
      console.error('[Telegram] Failed to send message:', data.description);
      return false;
    }

    console.log('[Telegram] Message sent successfully');
    return true;
  } catch (error) {
    console.error('[Telegram] Error sending message:', error);
    return false;
  }
}

/**
 * Format and send an announcement notification
 */
export async function sendAnnouncementNotification(
  announcement: Announcement,
  siteUrl: string = 'https://sarkari-result-gold.vercel.app'
): Promise<boolean> {
  const typeEmoji = getTypeEmoji(announcement.type);
  const typeName = getTypeName(announcement.type);
  
  const message = `
${typeEmoji} <b>New ${typeName}</b>

📌 <b>${escapeHtml(announcement.title)}</b>

🏢 <b>Organization:</b> ${escapeHtml(announcement.organization)}
📂 <b>Category:</b> ${escapeHtml(announcement.category)}
${announcement.totalPosts ? `👥 <b>Total Posts:</b> ${announcement.totalPosts.toLocaleString()}` : ''}
${announcement.deadline ? `📅 <b>Last Date:</b> ${formatDate(announcement.deadline)}` : ''}
${announcement.location ? `📍 <b>Location:</b> ${escapeHtml(announcement.location)}` : ''}

🔗 <a href="${siteUrl}?item=${announcement.slug}">View Details</a>

#SarkariResult #${announcement.type.replace('-', '')} #GovtJobs
`.trim();

  return sendTelegramMessage(message, 'HTML');
}

/**
 * Get emoji for announcement type
 */
function getTypeEmoji(type: string): string {
  const emojis: Record<string, string> = {
    'job': '💼',
    'result': '📊',
    'admit-card': '🎫',
    'answer-key': '🔑',
    'admission': '🎓',
    'syllabus': '📚',
  };
  return emojis[type] || '📢';
}

/**
 * Get display name for announcement type
 */
function getTypeName(type: string): string {
  const names: Record<string, string> = {
    'job': 'Job Notification',
    'result': 'Result Declared',
    'admit-card': 'Admit Card Available',
    'answer-key': 'Answer Key Released',
    'admission': 'Admission Open',
    'syllabus': 'Syllabus Published',
  };
  return names[type] || 'Announcement';
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Format date for display
 */
function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
