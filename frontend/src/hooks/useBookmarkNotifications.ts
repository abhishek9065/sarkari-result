import { useEffect, useCallback } from 'react';
import type { Announcement } from '../types';

interface UseBookmarkNotificationsOptions {
    bookmarks: Announcement[];
    daysBeforeDeadline?: number;
    onNotification?: (announcement: Announcement, daysLeft: number) => void;
}

export function useBookmarkNotifications({
    bookmarks,
    daysBeforeDeadline = 3,
    onNotification
}: UseBookmarkNotificationsOptions) {

    const checkDeadlines = useCallback(() => {
        const now = new Date();
        const notifiedKey = 'bookmark-notifications-sent';
        const notified = JSON.parse(localStorage.getItem(notifiedKey) || '{}');

        bookmarks.forEach(bookmark => {
            if (!bookmark.deadline) return;

            const deadline = new Date(bookmark.deadline);
            const timeDiff = deadline.getTime() - now.getTime();
            const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

            // Check if deadline is approaching and we haven't notified yet
            if (daysLeft > 0 && daysLeft <= daysBeforeDeadline && !notified[bookmark.id]) {
                // Mark as notified
                notified[bookmark.id] = Date.now();
                localStorage.setItem(notifiedKey, JSON.stringify(notified));

                // Show browser notification
                if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification('⏰ Deadline Approaching!', {
                        body: `${bookmark.title} deadline in ${daysLeft} day${daysLeft === 1 ? '' : 's'}!`,
                        icon: '/icons/icon-192x192.png',
                        tag: `deadline-${bookmark.id}`
                    });
                }

                // Call optional callback
                onNotification?.(bookmark, daysLeft);
            }
        });
    }, [bookmarks, daysBeforeDeadline, onNotification]);

    useEffect(() => {
        // Check immediately
        checkDeadlines();

        // Check every hour
        const interval = setInterval(checkDeadlines, 60 * 60 * 1000);

        return () => clearInterval(interval);
    }, [checkDeadlines]);

    // Helper to get approaching deadlines
    const getApproachingDeadlines = useCallback(() => {
        const now = new Date();
        return bookmarks
            .filter(b => b.deadline)
            .map(b => ({
                ...b,
                daysLeft: Math.ceil((new Date(b.deadline!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
            }))
            .filter(b => b.daysLeft > 0 && b.daysLeft <= daysBeforeDeadline)
            .sort((a, b) => a.daysLeft - b.daysLeft);
    }, [bookmarks, daysBeforeDeadline]);

    return { checkDeadlines, getApproachingDeadlines };
}

export default useBookmarkNotifications;
