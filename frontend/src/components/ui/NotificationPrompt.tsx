import { useState, useEffect } from 'react';
import { API_BASE } from '../../utils/constants';

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

const DISMISS_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

export function NotificationPrompt() {
    const [showPrompt, setShowPrompt] = useState(false);
    const [permission, setPermission] = useState<NotificationPermission>('default');

    useEffect(() => {
        // Check if notifications are supported
        if (!('Notification' in window) || !('serviceWorker' in navigator)) {
            return;
        }

        setPermission(Notification.permission);

        // Show prompt if permission not decided and not dismissed recently
        const dismissed = localStorage.getItem('notification_prompt_dismissed');
        const dismissedAt = dismissed ? Number(dismissed) : 0;
        const withinCooldown = dismissedAt && Date.now() - dismissedAt < DISMISS_COOLDOWN_MS;

        if (Notification.permission === 'default' && !withinCooldown) {
            // Delay the prompt a bit for better UX
            const timer = setTimeout(() => setShowPrompt(true), 3000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAllow = async () => {
        try {
            const perm = await Notification.requestPermission();
            setPermission(perm);
            setShowPrompt(false);

            if (perm === 'granted') {
                // Subscribe to push notifications
                const registration = await navigator.serviceWorker.ready;

                // Get VAPID public key from backend
                const response = await fetch(`${API_BASE}/api/push/vapid-public-key`);
                if (!response.ok) {
                    throw new Error('Failed to load VAPID key');
                }
                const { publicKey } = await response.json();
                if (!publicKey) {
                    throw new Error('Missing VAPID public key');
                }

                const subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
                });

                // Send subscription to backend
                const subscribeResponse = await fetch(`${API_BASE}/api/push/subscribe`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(subscription.toJSON()),
                });
                if (!subscribeResponse.ok) {
                    throw new Error('Failed to save push subscription');
                }

                console.log('Push subscription saved');
            }
        } catch (error) {
            console.error('Failed to subscribe to push:', error);
        }
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        localStorage.setItem('notification_prompt_dismissed', Date.now().toString());
    };

    if (!showPrompt || permission !== 'default') return null;

    return (
        <div className="notification-prompt">
            <div className="notification-prompt-content">
                <span className="notification-icon">🔔</span>
                <div className="notification-text">
                    <strong>Enable Notifications</strong>
                    <p>Get instant alerts for new jobs, results & admit cards!</p>
                </div>
                <div className="notification-buttons">
                    <button onClick={handleDismiss} className="notification-btn dismiss">Later</button>
                    <button onClick={handleAllow} className="notification-btn allow">Allow</button>
                </div>
            </div>
        </div>
    );
}

export default NotificationPrompt;
