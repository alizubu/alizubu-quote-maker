// --- IndexedDB Helper for Fonts ---
export const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('StoryMakerFontsDB', 1);
    request.onupgradeneeded = () => { request.result.createObjectStore('fonts', { keyPath: 'name' }); };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};