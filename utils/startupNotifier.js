import fs from 'fs';
import humanizer from './humanizer.js';

export async function notifyStartup(sock) {
  try {
    // Esperar a que termine el warm-up (15s)
    await new Promise(r => setTimeout(r, 16000));

    const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    const settings = global.db?.data?.settings?.[botJid] || {};
    const ownerNumber = global.config?.owner?.[0] + '@s.whatsapp.net';

    if (!ownerNumber) return;

    const now = new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' });
    const ram = (process.memoryUsage().rss / 1024 / 1024).toFixed(1);
    const cmdCount = global.plugins ? Object.keys(global.plugins).length : '0';

    const text = `
╭━━━━━━━━━━━━━━━━━╮
┃ 🤖 *¡BOT ENCENDIDO!*
╰━━━━━━━━━━━━━━━━━╯

✅ El sistema se ha iniciado correctamente.

📅 *Fecha:* ${now}
🧠 *RAM:* ${ram} MB
⚙️ *Comandos:* ${cmdCount}
🛡️ *Estado:* Online

> _El sistema anti-ban y humanizer están activos._
┈┈┈┈┈┈┈┈┈┈
_𝐘𝐮𝐤𝐢 𝐁𝐨𝐭 · Sistema de Arranque_`;

    if (settings.startupMedia && settings.startupMedia.path && fs.existsSync(settings.startupMedia.path)) {
      const media = settings.startupMedia;
      const payload = {
        [media.type]: await fs.promises.readFile(media.path),
        mimetype: media.mime,
        caption: text
      };
      if (media.type === 'video') payload.gifPlayback = true;

      await sock.sendMessage(ownerNumber, payload);
    } else {
      // Texto por defecto si no hay banner
      await sock.sendMessage(ownerNumber, { text: text });
    }

    console.log('[Startup] Aviso enviado al owner.');

  } catch (e) {
    console.error('[Startup Error]', e.message);
  }
}
