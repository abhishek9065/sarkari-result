import type { MetadataRoute } from 'next';
import { robotsDisallowRoutes } from '@/app/lib/seo-route-policy';
import { siteConfig } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [...robotsDisallowRoutes],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
