import Logger from './logger.js';
import warmup from './warmup.js';

const GLOBAL_CONFIG = {
  minDelay: 900,
  maxDelay: 2600,
  typingPerChar: 28,
  minTypingTime: 800,
  maxTypingTime: 6500,
  readDelayMin: 400,
  readDelayMax: 1800,
  chatLimitWindow: 60000,
  chatLimitCount: 12,
  globalLimitWindow: 60000,
  globalLimitCount: 45,
  groupEventMinDelay: 3000,
  groupEventMaxDelay: 8000,
  groupActionMinDelay: 1200,
  groupActionMaxDelay: 3500,
  nightMode: false,
  nightStart: 1,
  nightEnd: 6,
  nightMultiplier: 1.5,
  verbose: false,
};

function getChatConfig(chatId) {
  if (!chatId) return {};
  try { return global?.db?.data?.chats?.[chatId]?.humanizer || {}; }
  catch { return {}; }
}

function setChatConfig(chatId, patch) {
  if (!chatId) return false;
  try {
    if (!global.db.data.chats[chatId]) global.db.data.chats[chatId] = {};
    if (!global.db.data.chats[chatId].humanizer) global.db.data.chats[chatId].humanizer = {};
    Object.assign(global.db.data.chats[chatId].humanizer, patch);
    if (global.markPartitionDirty) global.markPartitionDirty('chats');
    if (global.queueSaveDatabase) global.queueSaveDatabase();
    return true;
  } catch (e) { Logger.warn('[Humanizer] ' + e.message); return false; }
}

function clearChatConfig(chatId) {
  if (!chatId) return false;
  try {
    if (global.db.data.chats[chatId]?.humanizer) {
      delete global.db.data.chats[chatId].humanizer;
      if (global.markPartitionDirty) global.markPartitionDirty('chats');
      if (global.queueSaveDatabase) global.queueSaveDatabase();
      return true;
    }
  } catch {}
  return false;
}

function resolve(chatId, key) {
  const cc = getChatConfig(chatId);
  return cc[key] !== undefined ? cc[key] : GLOBAL_CONFIG[key];
}

const chatWindows = new Map();
const globalWindow = [];

function now() { return Date.now(); }
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

export function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function isNightTime(chatId) {
  if (!resolve(chatId, 'nightMode')) return false;
  const start = resolve(chatId, 'nightStart');
  const end = resolve(chatId, 'nightEnd');
  const h = parseInt(new Date().toLocaleString('es-CO', {
    timeZone: 'America/Bogota', hour: 'numeric', hour12: false,
  }), 10);
  if (start === end) return false;
  if (start < end) return h >= start && h < end;
  return h >= start || h < end;
}

export function humanDelay(min, max, chatId = null) {
  const mn = min ?? resolve(chatId, 'minDelay');
  const mx = max ?? resolve(chatId, 'maxDelay');
  let ms = randomBetween(mn, mx);
  if (isNightTime(chatId)) ms = Math.floor(ms * resolve(chatId, 'nightMultiplier'));
  return sleep(ms);
}

function cleanWindow(arr, windowMs) {
  const t = now();
  while (arr.length && t - arr[0] > windowMs) arr.shift();
}

async function waitForSlot(chatId) {
  if (!warmup.isReady()) await warmup.waitIfNeeded();
  if (!chatWindows.has(chatId)) chatWindows.set(chatId, []);
  const cw = chatWindows.get(chatId);
  const chatWindowMs = resolve(chatId, 'chatLimitWindow');
  const chatLimit = resolve(chatId, 'chatLimitCount');
  const globalWindowMs = resolve(chatId, 'globalLimitWindow');
  const globalLimit = resolve(chatId, 'globalLimitCount');
  let attempts = 0;
  while (attempts++ < 30) {
    cleanWindow(cw, chatWindowMs);
    cleanWindow(globalWindow, globalWindowMs);
    if (cw.length < chatLimit && globalWindow.length < globalLimit) {
      const t = now();
      cw.push(t); globalWindow.push(t);
      return;
    }
    const waitChat = cw.length >= chatLimit ? chatWindowMs - (now() - cw[0]) : 0;
    const waitGlobal = globalWindow.length >= globalLimit ? globalWindowMs - (now() - globalWindow[0]) : 0;
    await sleep(Math.max(waitChat, waitGlobal, 400) + randomBetween(100, 600));
  }
}

async function simulateTyping(sock, jid, text = '', chatId = null) {
  const perChar = resolve(chatId, 'typingPerChar');
  const minT = resolve(chatId, 'minTypingTime');
  const maxT = resolve(chatId, 'maxTypingTime');
  const base = Math.min(maxT, Math.max(minT, (text?.length || 0) * perChar));
  const total = Math.max(600, base + randomBetween(-200, 400));
  try {
    await sock.sendPresenceUpdate('composing', jid);
    await sleep(total);
    await sock.sendPresenceUpdate('paused', jid);
  } catch {}
}

export async function sendText(sock, jid, content, opts = {}) {
  const { skipThrottle = false, skipTyping = false, delay = null, ...sendOpts } = opts;
  if (!skipThrottle) await waitForSlot(jid);
  if (Array.isArray(delay)) await humanDelay(delay[0], delay[1], jid);
  else await humanDelay(null, null, jid);
  const text = typeof content === 'string' ? content : (content?.text || '');
  if (!skipTyping && text) await simulateTyping(sock, jid, text, jid);
  else if (!skipTyping) await humanDelay(300, 800, jid);
  const payload = typeof content === 'string' ? { text: content } : content;
  return sock.sendMessage(jid, payload, sendOpts);
}

export async function sendMedia(sock, jid, content, opts = {}) {
  return sendText(sock, jid, content, { ...opts, skipTyping: true });
}

export async function sendGroupEvent(sock, jid, content, opts = {}) {
  await humanDelay(resolve(jid, 'groupEventMinDelay'), resolve(jid, 'groupEventMaxDelay'), jid);
  return sendText(sock, jid, content, { ...opts, skipTyping: opts.skipTyping ?? false, delay: [400, 1200] });
}

export async function sendGroupAction(sock, jid, content, opts = {}) {
  await humanDelay(resolve(jid, 'groupActionMinDelay'), resolve(jid, 'groupActionMaxDelay'), jid);
  return sendText(sock, jid, content, { ...opts, skipTyping: true });
}

export async function readLater(sock, keys, chatId = null) {
  await humanDelay(resolve(chatId, 'readDelayMin'), resolve(chatId, 'readDelayMax'), chatId);
  try { await sock.readMessages(keys); } catch {}
}

export function safeFire(promise) {
  Promise.resolve(promise).catch(err => Logger.warn('[Humanizer] ' + (err?.message || err)));
}

export function getGlobalConfig() { return { ...GLOBAL_CONFIG }; }
export function updateGlobalConfig(patch) { Object.assign(GLOBAL_CONFIG, patch); }
export function setVerbose(v) { GLOBAL_CONFIG.verbose = !!v; }
export function getConfigFor(chatId) { return { ...GLOBAL_CONFIG, ...getChatConfig(chatId) }; }

export { getChatConfig, setChatConfig, clearChatConfig };

export default {
  sendText, sendMedia, sendGroupEvent, sendGroupAction,
  readLater, humanDelay, safeFire,
  getGlobalConfig, updateGlobalConfig, setVerbose,
  getConfigFor, getChatConfig, setChatConfig, clearChatConfig,
  randomBetween,
};
