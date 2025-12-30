import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, AlertTriangle } from 'lucide-react';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { db as dexieDb } from '../db/db';
import { authFetch as safeAuthFetch } from '../services/authService';
import './SyncManager.css';

export function SyncManager() {
    const isOnline = useNetworkStatus();
    const [pendingCount, setPendingCount] = useState(0);
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncResult, setSyncResult] = useState(null);

    // Monitor pending count - Server status is detected automatically via authFetch events
    useEffect(() => {
        const checkPending = async () => {
            const count = await dexieDb.pendingSync.count();
            setPendingCount(count);
        };

        // Check pending on mount
        checkPending();

        // Listen for new offline items to update immediately
        window.addEventListener('zdemo:offline-saved', checkPending);

        // Also listen for online/offline mode changes to refresh pending count
        const handleModeChange = () => checkPending();
        window.addEventListener('zdemo:online-mode', handleModeChange);
        window.addEventListener('zdemo:offline-mode', handleModeChange);

        return () => {
            window.removeEventListener('zdemo:offline-saved', checkPending);
            window.removeEventListener('zdemo:online-mode', handleModeChange);
            window.removeEventListener('zdemo:offline-mode', handleModeChange);
        };
    }, []);

    const processQueue = async () => {
        if (!isOnline || pendingCount === 0 || isSyncing) return;

        setIsSyncing(true);
        setSyncResult(null);
        let successCount = 0;
        let failCount = 0;

        try {
            // Get all pending requests ordered by timestamp
            const pendingRequests = await dexieDb.pendingSync.orderBy('timestamp').toArray();

            for (const req of pendingRequests) {
                try {
                    // Send request using fetch directly to bypass authFetch's offline capture
                    // But we need the token, so we use authFetch but we need to know if it fails
                    // Actually, authFetch returns "offline: true" if it fails.
                    // We need to force a real network request. 
                    // Let's use fetch manually with getToken logic duplicated or exported helpers.
                    // BETTER: Add a flag to authFetch to bypass offline logic? 
                    // No, authFetch checks navigator.onLine. If we are online, it tries. 
                    // The issue is if it fails again, it queues again? 
                    // We need to delete FROM queue only if success.

                    // We can reuse authFetch. If it throws or returns 500, we keep it in queue.

                    const response = await safeAuthFetch(req.url.replace(import.meta.env.VITE_API_URL || '', ''), { // Adjust url handling
                        method: req.method,
                        body: req.body ? JSON.stringify(req.body) : undefined,
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });

                    // Check if it was caught by offline logic again
                    const data = await response.clone().json().catch(() => ({}));
                    if (data.offline) {
                        throw new Error('Sigue offline o servidor caído');
                    }

                    if (response.ok) {
                        await dexieDb.pendingSync.delete(req.id);
                        successCount++;
                    } else {
                        // Server returned specific error (400, 422, etc)
                        // Should we keep retrying? Maybe not for 4xx errors.
                        // For now, let's keep it but mark as error? 
                        // Simple strategy: Delete 4xx (client error), Keep 5xx (server error)
                        if (response.status >= 400 && response.status < 500) {
                            console.error('Error cliente sincronizando:', req, response.status);
                            // Delete to avoid stuck queue? Or move to "failed" table?
                            // User asked for "Manual Sync", so maybe just leave it and warn?
                            // Let's delete it so the queue moves on.
                            await dexieDb.pendingSync.delete(req.id);
                            failCount++;
                        } else {
                            throw new Error(`Server Error ${response.status}`);
                        }
                    }
                } catch (err) {
                    console.error('Error sincronizando req:', req, err);
                    failCount++;
                    // Stop processing rest of queue if connection issue
                    break;
                }
            }
        } catch (err) {
            console.error('Error general de sync:', err);
        } finally {
            setIsSyncing(false);
            const remaining = await dexieDb.pendingSync.count();
            setPendingCount(remaining);

            if (successCount > 0 || failCount > 0) {
                setSyncResult({ success: successCount, fail: failCount });
                setTimeout(() => setSyncResult(null), 5000);
            }
        }
    };

    const [safeGuard, setSafeGuard] = useState(false);

    // Safeguard delay when coming back online
    useEffect(() => {
        if (pendingCount > 0 && isOnline) {
            setSafeGuard(true);
            const timer = setTimeout(() => setSafeGuard(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [pendingCount, isOnline]);

    if (!isOnline) {
        return (
            <div className="sync-alert sync-alert--offline">
                <div className="sync-alert__content">
                    <WifiOff size={20} />
                    <span>Sin conexión. Tus cambios están seguros en local.</span>
                </div>
            </div>
        );
    }

    if (pendingCount > 0) {
        return (
            <div className="sync-alert sync-alert--pending">
                <div className="sync-alert__content">
                    <AlertTriangle size={20} />
                    <span>Conexión restablecida: {pendingCount} acciones pendientes</span>
                </div>
                <button
                    className="sync-alert__button"
                    onClick={processQueue}
                    disabled={isSyncing || safeGuard}
                >
                    {isSyncing ? (
                        <>
                            <RefreshCw className="spin" size={16} /> Sincronizando...
                        </>
                    ) : safeGuard ? (
                        'Espere...'
                    ) : (
                        'Sincronizar Ahora'
                    )}
                </button>
            </div>
        );
    }

    // Success feedback
    if (syncResult) {
        return (
            <div className={`sync-alert sync-alert--${syncResult.fail > 0 ? 'warning' : 'success'}`}>
                <div className="sync-alert__content">
                    {syncResult.fail > 0 ? <AlertTriangle size={20} /> : <Wifi size={20} />}
                    <span>
                        Sincronización: {syncResult.success} completos
                        {syncResult.fail > 0 && `, ${syncResult.fail} fallidos`}
                    </span>
                </div>
            </div>
        );
    }

    return null;
}
