// localStorage utility helpers for SERAS
// Keeps favorites, session cache, and preferences local for instant access

const KEYS = {
  CURRENT_USER: 'seras_current_user',
  FAVORITES: 'seras_favorites',
  REMINDERS_PREFS: 'seras_reminder_prefs',
  AI_HISTORY: 'seras_ai_history',
  THEME: 'seras_theme',
};

// ─── Generic Helpers ───
export function getItem(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function setItem(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function removeItem(key) {
  localStorage.removeItem(key);
}

// ─── Current User Session Cache ───
export function getCurrentUser() {
  return getItem(KEYS.CURRENT_USER);
}

export function setCurrentUser(user) {
  setItem(KEYS.CURRENT_USER, user);
}

export function clearCurrentUser() {
  removeItem(KEYS.CURRENT_USER);
}

// ─── Favorites (localStorage for instant UI + synced to Supabase) ───
export function getFavorites(userId) {
  const all = getItem(KEYS.FAVORITES) || {};
  return all[userId] || [];
}

export function toggleFavorite(userId, eventId) {
  const all = getItem(KEYS.FAVORITES) || {};
  const userFavs = all[userId] || [];
  const idx = userFavs.indexOf(eventId);
  if (idx === -1) {
    userFavs.push(eventId);
  } else {
    userFavs.splice(idx, 1);
  }
  all[userId] = userFavs;
  setItem(KEYS.FAVORITES, all);
  return userFavs;
}

export function isFavorite(userId, eventId) {
  return getFavorites(userId).includes(eventId);
}

export function setFavoritesForUser(userId, eventIds) {
  const all = getItem(KEYS.FAVORITES) || {};
  all[userId] = eventIds;
  setItem(KEYS.FAVORITES, all);
}

// ─── AI Chat History ───
export function getAIHistory() {
  return getItem(KEYS.AI_HISTORY) || [];
}

export function addAIMessage(message) {
  const history = getAIHistory();
  history.push(message);
  // Keep last 50 messages
  if (history.length > 50) history.shift();
  setItem(KEYS.AI_HISTORY, history);
}

export function clearAIHistory() {
  removeItem(KEYS.AI_HISTORY);
}

export { KEYS };
