import { API_BASE } from './constants';
import type { Announcement } from '../types';

// Fetch all announcements
export async function fetchAnnouncements(): Promise<Announcement[]> {
    const response = await fetch(`${API_BASE}/api/announcements`);
    if (!response.ok) throw new Error('Failed to fetch announcements');
    const payload = await response.json();
    return payload.data ?? [];
}

// Fetch announcements by type
export async function fetchAnnouncementsByType(type: string): Promise<Announcement[]> {
    const response = await fetch(`${API_BASE}/api/announcements?type=${type}`);
    if (!response.ok) throw new Error('Failed to fetch announcements');
    const payload = await response.json();
    return payload.data ?? [];
}

// Fetch single announcement by slug
export async function fetchAnnouncementBySlug(slug: string): Promise<Announcement | null> {
    const response = await fetch(`${API_BASE}/api/announcements/${slug}`);
    if (!response.ok) return null;
    const payload = await response.json();
    return payload.data ?? null;
}

// Fetch user bookmarks
export async function fetchBookmarks(token: string): Promise<Announcement[]> {
    const response = await fetch(`${API_BASE}/api/bookmarks`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) return [];
    const payload = await response.json();
    return payload.data ?? [];
}

// Add bookmark
export async function addBookmark(announcementId: number, token: string): Promise<boolean> {
    const response = await fetch(`${API_BASE}/api/bookmarks`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ announcementId })
    });
    return response.ok;
}

// Remove bookmark
export async function removeBookmark(announcementId: number, token: string): Promise<boolean> {
    const response = await fetch(`${API_BASE}/api/bookmarks/${announcementId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.ok;
}

// Subscribe to push notifications
export async function subscribeToPush(subscription: PushSubscription): Promise<boolean> {
    const response = await fetch(`${API_BASE}/api/push/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription.toJSON())
    });
    return response.ok;
}
