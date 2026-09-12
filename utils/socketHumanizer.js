// utils/socketHumanizer.js
// Parchea sock.sendMessage para añadir jitter humano a TODOS los envíos.
// - Respeta el warm-up
// - No añade delay a media pesada (imagen/video/audio/doc)
// - Se puede saltar con { __skipHumanizer: true }
// - No duplica el delay si ya viene de humanizer.sendText

import humanizer from './humanizer.js';
import warmup from './warmup.js';
import Logger from './logger.js';

const SKIP_FLAG = '__skipHumanizer';
const MARKER = '__humanizerPatched';

export function patchSocket(sock) {
  if (sock[MARKER]) {
    Logger.warn('[socketHumanizer] Socket ya estaba parcheado, ignorando.');
    return sock;
  }

  const originalSendMessage = sock.sendMessage.bind(sock);

  sock.sendMessage = async function (jid, content, options = {}) {
    // 1) Respetar warm-up (aplica a todo, incluido lo crítico)
    if (!warmup.isReady()) {
      await warmup.waitIfNeeded();
    }

    // 2) Skip explícito
    if (options && options[SKIP_FLAG]) {
      const cleanOptions = { ...options };
      delete cleanOptions[SKIP_FLAG];
      return originalSendMessage(jid, content, cleanOptions);
    }

    // 3) Detectar si es texto plano (no media pesada)
    const isPlainText =
      typeof content === 'string' ||
      (content &&
        typeof content === 'object' &&
        content.text &&
        !content.image &&
        !content.video &&
        !content.document &&
        !content.audio &&
        !content.sticker);

    // 4) Delay solo si es texto plano
    if (isPlainText) {
      try {
        await humanizer.humanDelay(500, 1800, jid);
      } catch (e) {
        // Si falla el delay, no bloqueamos el envío
        Logger.warn(`[socketHumanizer] delay fail: ${e.message}`);
      }
    }

    return originalSendMessage(jid, content, options);
  };

  Object.defineProperty(sock, MARKER, {
    value: true,
    writable: false,
    enumerable: false,
    configurable: false,
  });

  Logger.success('[socketHumanizer] Socket parcheado: jitter humano activo.');
  return sock;
}

export default { patchSocket };
