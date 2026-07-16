import { openDB } from 'idb';

const DB_NAME = 'ats_history_db';
const DB_VERSION = 1;
const STORE_NAME = 'analyses';

async function initDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('createdAt', 'createdAt');
      }
    },
  });
}

export async function saveAnalysis({ fileName, fileBlob, resumeText, jobDescription, result }) {
  const db = await initDB();
  const entry = {
    id: `scan_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
    fileName: fileName || 'Resume.pdf',
    fileBlob,
    resumeText,
    jobDescription,
    result,
  };

  await db.put(STORE_NAME, entry);
  return entry;
}

export async function getAllAnalyses() {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  const items = await store.getAll();
  // Sort newest first
  return items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function deleteAnalysis(id) {
  const db = await initDB();
  await db.delete(STORE_NAME, id);
}

export async function clearAllAnalyses() {
  const db = await initDB();
  await db.clear(STORE_NAME);
}
