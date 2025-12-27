import express from 'express';
import { pool } from '../db.js';
import { config } from '../config.js';

const router = express.Router();

/**
 * GET /api/rss
 * Generate RSS feed for announcements
 */
router.get('/', async (_req, res) => {
    try {
        const result = await pool.query(`
      SELECT id, title, slug, type, category, organization, content,
             posted_at as "postedAt", deadline
      FROM announcements 
      WHERE is_active = true 
      ORDER BY posted_at DESC 
      LIMIT 50
    `);

        const announcements = result.rows;
        const baseUrl = config.frontendUrl || 'https://sarkari-result-gold.vercel.app';
        const now = new Date().toUTCString();

        const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Sarkari Result - Latest Government Jobs</title>
    <link>${baseUrl}</link>
    <description>Latest Government Jobs, Results, Admit Cards, Answer Keys and more from SarkariResult.com</description>
    <language>en-in</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${baseUrl}/api/rss" rel="self" type="application/rss+xml"/>
    <image>
      <url>${baseUrl}/favicon.ico</url>
      <title>Sarkari Result</title>
      <link>${baseUrl}</link>
    </image>
    ${announcements.map(item => `
    <item>
      <title><![CDATA[${item.title}]]></title>
      <link>${baseUrl}/?item=${item.slug}</link>
      <guid isPermaLink="true">${baseUrl}/?item=${item.slug}</guid>
      <description><![CDATA[${item.organization} - ${item.category} | ${item.type.toUpperCase()}${item.deadline ? ` | Last Date: ${item.deadline}` : ''}]]></description>
      <category>${item.type}</category>
      <pubDate>${new Date(item.postedAt).toUTCString()}</pubDate>
    </item>`).join('')}
  </channel>
</rss>`;

        res.set('Content-Type', 'application/rss+xml');
        res.send(rssXml);
    } catch (error) {
        console.error('Error generating RSS feed:', error);
        res.status(500).send('Error generating RSS feed');
    }
});

export default router;
