// utils/socketHumanizer.js
import humanizer from './humanizer.js';
import warmup from './warmup.js';
import Logger from './logger.js';

const SKIP_FLAG = '__skipHumanizer';
const MARKER = '__humanizerPatched';

export function patchSocket(sock) {
  if (sock[MARKER]) {
    Logger.warn('[socketHumanizer] Socket ya parcheado');
    return sock;
  }
  const originalSendMessage = sock.sendMessage.bind(sock);

  sock.sendMessage = async function (jid, content, options = {}) {
    if (!warmup.isReady()) await warmup.waitIfNeeded();

    if (options && options[SKIP_FLAG]) {
      const cleanOptions = { ...options };
      delete cleanOptions[SKIP_FLAG];
      return originalSendMessage(jid, content, cleanOptions);
    }

    const isPlainText =
      typeof content === 'string' ||
      (content && typeof content === 'object' && content.text &&
        !content.image && !content.video && !content.document &&
        !content.audio && !content.sticker);

    if (isPlainText) {
      try { await humanizer.humanDelay(500, 1800, jid); }
      catch (e) { Logger.warn(`[socketHumanizer] delay fail: ${e.message}`); }
    }
    return originalSendMessage(jid, content, options);
  };

  Object.defineProperty(sock, MARKER, {
    value: true, writable: false, enumerable: false, configurable: false,
  });
  Logger.success('[socketHumanizer] Socket parcheado: jitter humano activo.');
  return sock;
}

export default { patchSocket };
