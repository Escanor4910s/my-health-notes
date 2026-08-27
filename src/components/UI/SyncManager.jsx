import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const QUEUE_KEY = 'obsmed-sync-queue';

export function getSyncQueue() {
  try {
    const queue = localStorage.getItem(QUEUE_KEY);
    return queue ? JSON.parse(queue) : [];
  } catch (e) {
    return [];
  }
}

export function addToSyncQueue(action) {
  try {
    const queue = getSyncQueue();
    queue.push(action);
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    window.dispatchEvent(new Event('obsmed-sync-queue-updated'));
  } catch (e) {
    console.error('Error adding to sync queue', e);
  }
}

export function clearSyncQueue() {
  localStorage.setItem(QUEUE_KEY, JSON.stringify([]));
  window.dispatchEvent(new Event('obsmed-sync-queue-updated'));
}

const SyncManager = ({ session }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncDone, setSyncDone] = useState(false);
  const [queueCount, setQueueCount] = useState(0);
  const [syncSuccessMessage, setSyncSuccessMessage] = useState('');

  const updateQueueCount = useCallback(() => {
    setQueueCount(getSyncQueue().length);
  }, []);

  useEffect(() => {
    updateQueueCount();
    window.addEventListener('obsmed-sync-queue-updated', updateQueueCount);
    return () => window.removeEventListener('obsmed-sync-queue-updated', updateQueueCount);
  }, [updateQueueCount]);

  const processQueue = useCallback(async () => {
    if (!session || !isOnline || isSyncing) return;
    const queue = getSyncQueue();
    if (queue.length === 0) return;
    
    setIsSyncing(true);
    let successCount = 0;
    const failedItems = [];
    
    for (const action of queue) {
      try {
        if (action.type === 'upsert') {
          const { error } = await supabase.from('patients').upsert({
            patient_id_local: action.patientId,
            data: action.data,
            last_edit: action.timestamp,
            user_id: session.user.id
          });
          if (error) throw error;
        } else if (action.type === 'delete') {
          const { error } = await supabase.from('patients').delete().eq('patient_id_local', action.patientId);
          if (error) throw error;
        }
        successCount++;
      } catch (err) {
        console.error('Sync item failed:', err);
        failedItems.push(action);
      }
    }
    
    localStorage.setItem(QUEUE_KEY, JSON.stringify(failedItems));
    updateQueueCount();
    
    setIsSyncing(false);
    
    if (successCount > 0) {
      setSyncSuccessMessage(`${successCount} dossier(s) synchronisé(s) avec succès`);
      setSyncDone(true);
      setTimeout(() => setSyncDone(false), 3000);
    }
  }, [isOnline, isSyncing, session, updateQueueCount]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      processQueue();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Initial check
    if (isOnline && getSyncQueue().length > 0) {
       processQueue();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isOnline, processQueue]);

  return (
    <div className="sync-manager">
      <style dangerouslySetInnerHTML={{ __html: `
        .sync-manager {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.25rem 0.75rem;
          background: rgba(248, 250, 252, 0.7);
          backdrop-filter: blur(8px);
          border-radius: 24px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 0.8rem;
          color: #64748b;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .sync-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          transition: background-color 0.3s ease;
        }
        .sync-dot.online {
          background-color: #10b981;
          box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
        }
        .sync-dot.offline {
          background-color: #ef4444;
          box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
          animation: pulse-offline 2s infinite;
        }
        @keyframes pulse-offline {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
          70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
        .sync-icon {
          width: 14px;
          height: 14px;
        }
        .sync-icon.spinning {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .sync-badge {
          background: #ef4444;
          color: white;
          padding: 2px 6px;
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: 600;
        }
        .sync-toast {
          position: fixed;
          bottom: 1.5rem;
          right: 1.5rem;
          background: white;
          border-radius: 24px;
          padding: 0.75rem 1.5rem;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: #0f172a;
          font-weight: 500;
          animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          z-index: 50;
        }
        .toast-icon {
          color: #10b981;
          background: #d1fae5;
          padding: 0.25rem;
          border-radius: 50%;
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
      
      <div className={`sync-dot ${isOnline ? 'online' : 'offline'}`} />
      
      <span style={{ fontWeight: 500 }}>
        {isOnline ? 'En ligne' : 'Hors ligne'}
      </span>

      {isSyncing && (
        <>
          <RefreshCw className="sync-icon spinning" />
          <span>Synchronisation...</span>
        </>
      )}

      {syncDone && !isSyncing && (
        <>
          <Check className="sync-icon" style={{ color: '#10b981' }} />
          <span>Synchronisé</span>
        </>
      )}

      {!isOnline && queueCount > 0 && (
        <span className="sync-badge">
          {queueCount} en attente
        </span>
      )}

      {syncDone && (
        <div className="sync-toast">
          <div className="toast-icon">
            <Check size={18} />
          </div>
          {syncSuccessMessage}
        </div>
      )}
    </div>
  );
};

export default React.memo(SyncManager);
