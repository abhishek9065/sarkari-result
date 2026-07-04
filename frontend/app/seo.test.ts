import { describe, expect, it, vi } from 'vitest';

import { normalizeCanonicalPath } from './lib/metadata';
import {
  noindexRoutes,
  normalizeRoutePath,
  shouldExcludeFromSitemap,
  shouldNoindex,
} from './lib/seo-route-policy';
import robots from './robots';

vi.mock('@/lib/content-api', () => ({
  getRawListing: vi.fn(async ({ type }: { type: string }) => [
    {
      href: `/${type}s/public-notice`,
      indexable: true,
      publishedAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
    },
    {
      href: `/${type}s/private-notice`,
      indexable: false,
      publishedAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
    },
  ]),
  getTaxonomyList: vi.fn(async () => []),
  getContentPagesByType: vi.fn(async (type: string) => {
    if (type === 'info') {
      return [
        { slug: 'bookmarks', pageType: 'info', seoCanonicalPath: '/bookmarks' },
        { slug: 'profile', pageType: 'info', seoCanonicalPath: '/profile' },
      ];
    }

    if (type === 'auxiliary') {
      return [
        { slug: 'important', pageType: 'auxiliary', seoCanonicalPath: '/important' },
        { slug: 'telegram', pageType: 'community', seoCanonicalPath: '/join/telegram' },
      ];
    }

    return [];
  }),
}));

describe('SEO route policy', () => {
  it('normalizes route paths consistently', () => {
    expect(normalizeRoutePath('jobs?search=ssc')).toBe('/jobs');
    expect(normalizeRoutePath('/jobs/')).toBe('/jobs');
    expect(normalizeRoutePath('https://sarkariexams.me/search?q=railway')).toBe('/search');
  });

  it('marks noindex routes and nested paths as sitemap exclusions', () => {
    for (const route of noindexRoutes) {
      expect(shouldNoindex(route)).toBe(true);
      expect(shouldExcludeFromSitemap(`${route}/nested`)).toBe(true);
    }

    expect(shouldNoindex('/jobs')).toBe(false);
    expect(shouldExcludeFromSitemap('/results/ssc-cgl')).toBe(false);
  });
});

describe('metadata canonical normalization', () => {
  it('removes query strings, hashes, and trailing slashes', () => {
    expect(normalizeCanonicalPath('/jobs/?q=ssc#top')).toBe('/jobs');
    expect(normalizeCanonicalPath('results/latest/')).toBe('/results/latest');
    expect(normalizeCanonicalPath('')).toBe('/');
  });
});

describe('robots', () => {
  it('uses app robots as the noindex/disallow source of truth', () => {
    const result = robots();
    const firstRule = Array.isArray(result.rules) ? result.rules[0] : result.rules;

    expect(firstRule.disallow).toEqual(
      expect.arrayContaining(['/api/', '/admin', '/metrics', '/healthz', '/search', '/join', '/profile', '/bookmarks']),
    );
    expect(result.sitemap).toBe('https://sarkariexams.me/sitemap.xml');
  });
});

describe('sitemap', () => {
  it('excludes noindex routes and non-indexable listing items', async () => {
    const { default: sitemap } = await import('./sitemap');
    const entries = await sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(urls).toContain('https://sarkariexams.me');
    expect(urls).toContain('https://sarkariexams.me/important');
    expect(urls).not.toContain('https://sarkariexams.me/search');
    expect(urls).not.toContain('https://sarkariexams.me/profile');
    expect(urls).not.toContain('https://sarkariexams.me/bookmarks');
    expect(urls).not.toContain('https://sarkariexams.me/join/telegram');
    expect(urls.some((url) => url.endsWith('/private-notice'))).toBe(false);
  });
});
