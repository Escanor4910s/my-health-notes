export function saveVersionSnapshot(patientId, formData, prevData) {
  if (!patientId || !formData) return;
  
  // Basic deep compare to see what sections changed
  const modifiedSections = [];
  const allKeys = new Set([...Object.keys(formData), ...Object.keys(prevData || {})]);
  
  for (const key of allKeys) {
    const newVal = JSON.stringify(formData[key] || {});
    const oldVal = JSON.stringify(prevData?.[key] || {});
    if (newVal !== oldVal) {
      modifiedSections.push(key);
    }
  }
  
  if (modifiedSections.length === 0) return;
  
  const historyKey = `obsmed-history-${patientId}`;
  let history = [];
  try {
    const saved = localStorage.getItem(historyKey);
    if (saved) history = JSON.parse(saved);
  } catch (e) {
    console.error("Error reading history", e);
  }
  
  // Don't save if it's too fast (debounce 2 minutes handled by caller or here)
  const now = new Date();
  if (history.length > 0) {
    const lastTime = new Date(history[0].timestamp);
    if (now.getTime() - lastTime.getTime() < 2 * 60 * 1000) {
      // Less than 2 minutes ago, update the latest snapshot instead of creating a new one
      history[0].data = { ...formData };
      history[0].sectionsModified = [...new Set([...history[0].sectionsModified, ...modifiedSections])];
      history[0].timestamp = now.toISOString();
      localStorage.setItem(historyKey, JSON.stringify(history));
      return;
    }
  }
  
  history.unshift({
    timestamp: now.toISOString(),
    data: { ...formData },
    sectionsModified: modifiedSections
  });
  
  // Limit to 20 snapshots
  if (history.length > 20) history = history.slice(0, 20);
  
  localStorage.setItem(historyKey, JSON.stringify(history));
}

export function addToSyncQueue(action) {
  const queueKey = 'obsmed-sync-queue';
  let queue = [];
  try {
    const saved = localStorage.getItem(queueKey);
    if (saved) queue = JSON.parse(saved);
  } catch (e) {
    console.error("Error reading sync queue", e);
  }
  
  // Find and update if existing upsert for same patient
  if (action.type === 'upsert') {
    const existingIdx = queue.findIndex(item => item.type === 'upsert' && item.patientId === action.patientId);
    if (existingIdx >= 0) {
      queue[existingIdx] = { ...action, timestamp: new Date().toISOString() };
    } else {
      queue.push({ ...action, timestamp: new Date().toISOString() });
    }
  } else {
    queue.push({ ...action, timestamp: new Date().toISOString() });
  }
  
  localStorage.setItem(queueKey, JSON.stringify(queue));
  
  // Dispatch custom event so SyncManager can update UI
  window.dispatchEvent(new Event('obsmed-sync-queue-updated'));
}
