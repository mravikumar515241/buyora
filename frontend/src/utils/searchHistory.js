const STORAGE_KEY = 'buyora_search_history';
const MAX_ITEMS = 10;

export function getLocalSearchHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addLocalSearchHistory(keyword) {
  if (!keyword?.trim()) return;
  const normalized = keyword.trim();
  const next = [normalized, ...getLocalSearchHistory().filter((k) => k.toLowerCase() !== normalized.toLowerCase())];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next.slice(0, MAX_ITEMS)));
}

export function clearLocalSearchHistory() {
  localStorage.removeItem(STORAGE_KEY);
}
