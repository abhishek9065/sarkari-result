// Format date to readable string
export function formatDate(date: string | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}

// Calculate days remaining from deadline
export function getDaysRemaining(deadline: string | undefined): number | null {
    if (!deadline) return null;
    return Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

// Check if deadline is expired
export function isExpired(deadline: string | undefined): boolean {
    const days = getDaysRemaining(deadline);
    return days !== null && days < 0;
}

// Check if deadline is urgent (7 days or less)
export function isUrgent(deadline: string | undefined): boolean {
    const days = getDaysRemaining(deadline);
    return days !== null && days <= 7 && days >= 0;
}

// Convert VAPID key for push notifications
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

// Get badge color based on content type
export function getTypeBadgeColor(type: string): string {
    const colors: Record<string, string> = {
        'job': '#27AE60',
        'result': '#3498DB',
        'admit-card': '#9B59B6',
        'answer-key': '#E67E22',
        'admission': '#1ABC9C',
        'syllabus': '#34495E'
    };
    return colors[type] || '#666';
}
