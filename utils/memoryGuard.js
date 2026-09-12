import Logger from './logger.js';

let intervalId = null;
let lastRss = 0;
let growthAlertCount = 0;

export function startMemoryGuard(opts = {}) {
  const {
    intervalMs = 5 * 60 * 1000,
    growLimitMB = 60,
    hardLimitMB = 320,
    autoRestart = true,
  } = opts;

  if (intervalId) clearInterval(intervalId);

  intervalId = setInterval(() => {
    const mem = process.memoryUsage();
    const rssMB = mem.rss / 1024 / 1024;
    const heapMB = mem.heapUsed / 1024 / 1024;
    const growMB = rssMB - lastRss;

    if (typeof global.gc === 'function') { try { global.gc(); } catch {} }

    const tag = growMB > growLimitMB ? '🚨' : growMB > 30 ? '⚠️' : '📊';
    Logger.info(`${tag} [Mem] RSS ${rssMB.toFixed(0)}MB | Heap ${heapMB.toFixed(0)}MB | Δ ${growMB.toFixed(0)}MB`);

    if (growMB > growLimitMB) {
      growthAlertCount++;
      Logger.warn(`[Mem] Crecimiento anómalo (${growthAlertCount}/3)`);
      if (growthAlertCount >= 3 && typeof global.gc === 'function') {
        Logger.warn('[Mem] GC agresivo');
        try { global.gc(); } catch {}
      }
    } else growthAlertCount = 0;

    if (autoRestart && rssMB > hardLimitMB) {
      Logger.error(`[Mem] RSS ${rssMB.toFixed(0)}MB > ${hardLimitMB}MB. Reiniciando...`);
      setTimeout(() => process.exit(1), 2000);
    }
    lastRss = rssMB;
  }, intervalMs);

  return () => { if (intervalId) clearInterval(intervalId); intervalId = null; };
}

export function stopMemoryGuard() { if (intervalId) clearInterval(intervalId); intervalId = null; }
export default { startMemoryGuard, stopMemoryGuard };
