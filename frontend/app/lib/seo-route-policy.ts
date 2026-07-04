export const indexableRoutes = [
  '/',
  '/jobs',
  '/results',
  '/admit-cards',
  '/answer-keys',
  '/syllabus',
  '/admissions',
  '/states',
  '/organizations',
  '/archive',
  '/important',
] as const;

export const noindexRoutes = [
  '/search',
  '/join',
  '/profile',
  '/bookmarks',
  '/admin',
] as const;

export const robotsDisallowRoutes = [
  '/api/',
  '/admin',
  '/metrics',
  '/healthz',
  ...noindexRoutes.filter((route) => route !== '/admin'),
] as const;

export function normalizeRoutePath(pathname: string) {
  const trimmed = pathname.trim();
  if (!trimmed) return '/';

  let parsedPath = trimmed;
  try {
    parsedPath = new URL(trimmed, 'https://sarkariexams.me').pathname;
  } catch {
    parsedPath = trimmed.split('#')[0]?.split('?')[0] || '/';
  }

  const withoutHash = parsedPath.split('#')[0] || '/';
  const withoutQuery = withoutHash.split('?')[0] || '/';
  const withLeadingSlash = withoutQuery.startsWith('/') ? withoutQuery : `/${withoutQuery}`;

  if (withLeadingSlash.length > 1 && withLeadingSlash.endsWith('/')) {
    return withLeadingSlash.slice(0, -1);
  }

  return withLeadingSlash;
}

export function shouldNoindex(pathname: string) {
  const path = normalizeRoutePath(pathname);
  return noindexRoutes.some((route) => path === route || path.startsWith(`${route}/`));
}

export function shouldExcludeFromSitemap(pathname: string) {
  return shouldNoindex(pathname);
}
