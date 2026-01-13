/**
 * SEO-Friendly URL Router
 * Converts between internal state and clean URL paths
 */

import type { ContentType } from './types';

// Page types
export type PageType = 'home' | 'admin' | 'about' | 'contact' | 'privacy' | 'disclaimer' | 'up-police-2026';
export type TabType = ContentType | 'bookmarks' | 'profile' | undefined;

// URL path mappings
const TAB_TO_PATH: Record<string, string> = {
    'job': '/jobs',
    'result': '/results',
    'admit-card': '/admit-cards',
    'answer-key': '/answer-keys',
    'admission': '/admissions',
    'syllabus': '/syllabus',
    'bookmarks': '/bookmarks',
    'profile': '/profile',
};

const PATH_TO_TAB: Record<string, TabType> = {
    '/jobs': 'job',
    '/results': 'result',
    '/admit-cards': 'admit-card',
    '/answer-keys': 'answer-key',
    '/admissions': 'admission',
    '/syllabus': 'syllabus',
    '/bookmarks': 'bookmarks',
    '/profile': 'profile',
};

const PAGE_PATHS = ['/about', '/contact', '/privacy', '/disclaimer', '/admin'];

// Navigation state interface
export interface NavState {
    activeTab?: TabType;
    selectedItemSlug?: string | null;
    currentPage: PageType;
}

/**
 * Generate URL for a given tab type
 */
export function getUrlForTab(tab: TabType): string {
    if (!tab) return '/';
    return TAB_TO_PATH[tab] || '/';
}

/**
 * Generate URL for a detail item
 */
export function getUrlForItem(slug: string, type?: ContentType): string {
    // Determine base path from type
    const basePath = type ? (TAB_TO_PATH[type] || '/jobs') : '/jobs';
    return `${basePath}/${slug}`;
}

/**
 * Generate URL for a static page
 */
export function getUrlForPage(page: PageType): string {
    if (page === 'home') return '/';
    if (page === 'up-police-2026') return '/jobs/up-police-constable-2026';
    return `/${page}`;
}

/**
 * Parse current URL path into navigation state
 */
export function parseUrl(pathname: string): NavState {
    // Home page
    if (pathname === '/' || pathname === '') {
        return { currentPage: 'home' };
    }

    // Static pages
    if (PAGE_PATHS.includes(pathname)) {
        const page = pathname.slice(1) as PageType; // Remove leading /
        return { currentPage: page };
    }

    // Category pages (e.g., /jobs, /results)
    if (PATH_TO_TAB[pathname]) {
        return {
            activeTab: PATH_TO_TAB[pathname],
            currentPage: 'home',
        };
    }

    // Detail pages (e.g., /jobs/up-police-2026)
    const pathParts = pathname.split('/').filter(Boolean);
    if (pathParts.length >= 2) {
        const categoryPath = '/' + pathParts[0];
        const slug = pathParts.slice(1).join('/');

        // Special case for UP Police page
        if (slug === 'up-police-constable-2026') {
            return { currentPage: 'up-police-2026' };
        }

        return {
            selectedItemSlug: slug,
            activeTab: PATH_TO_TAB[categoryPath],
            currentPage: 'home',
        };
    }

    // Fallback to home
    return { currentPage: 'home' };
}

/**
 * Build URL from navigation state
 */
export function buildUrl(state: NavState): string {
    if (state.selectedItemSlug) {
        // Detail page - use the item's type for the base path
        const basePath = state.activeTab ? TAB_TO_PATH[state.activeTab] : '/jobs';
        return `${basePath}/${state.selectedItemSlug}`;
    }

    if (state.activeTab) {
        return getUrlForTab(state.activeTab);
    }

    if (state.currentPage !== 'home') {
        return getUrlForPage(state.currentPage);
    }

    return '/';
}
