// utils/warmup.js
// Tras conectar, el bot espera N segundos antes de enviar nada.
// Reduce drásticamente la detección anti-bot.

import Logger from './logger.js';

let connectedAt = 0;
let readyAt = 0;
let warmedUp = false;
let warmupMs = 90_000;

export function markConnected(ms = 90_000) {
  connectedAt = Date.now();
  warmupMs = ms;
  readyAt = connectedAt + warmupMs;
  warmedUp = false;
  Logger.info(`[Warmup] Bot conectado. Esperando ${Math.round(warmupMs / 1000)}s antes de enviar mensajes...`);
}

export function isReady() { return Date.now() >= readyAt; }

export function getRemainingMs() {
  const left = readyAt - Date.now();
  return left > 0 ? left : 0;
}

export async function waitIfNeeded() {
  const remaining = getRemainingMs();
  if (remaining > 0) {
    if (!warmedUp) {
      Logger.info(`[Warmup] Esperando ${Math.round(remaining / 1000)}s más...`);
      warmedUp = true;
    }
    await new Promise(r => setTimeout(r, remaining));
  }
}

export function status() {
  return { connectedAt, readyAt, warmupMs, ready: isReady(), remaining: getRemainingMs() };
}

export function setWarmupMs(ms) { warmupMs = Math.max(0, ms); }

export default { markConnected, isReady, getRemainingMs, waitIfNeeded, status, setWarmupMs };
