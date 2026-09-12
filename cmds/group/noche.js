import humanizer from '../../utils/humanizer.js';

function pad(n) { return String(n).padStart(2, '0'); }
function parseHour(str) {
  if (!str) return null;
  const m = String(str).trim().match(/^(\d{1,2})(?::(\d{2}))?$/);
  if (!m) return null;
  const h = parseInt(m[1], 10);
  if (isNaN(h) || h < 0 || h > 23) return null;
  return h;
}
function fmtHour(h) { return pad(h) + ':00'; }

const HELP = (prefix) =>
'🌙 *Configuración de Modo Nocturno*\n\n' +
'El modo nocturno hace que el bot sea más lento en un rango de horas, para simular que "duerme".\n\n' +
'*Comandos:*\n\n' +
'• *' + prefix + 'noche on*\n  Activa el modo nocturno.\n\n' +
'• *' + prefix + 'noche off*\n  Desactiva el modo nocturno.\n\n' +
'• *' + prefix + 'noche 22 6*\n  Define horario (22h → 6h). Acepta `22 6` o `22:00 06:00`.\n\n' +
'• *' + prefix + 'noche estado*\n  Muestra la config del grupo.\n\n' +
'• *' + prefix + 'noche reset*\n  Vuelve a valores por defecto.\n\n' +
'• *' + prefix + 'noche velocidad lenta|normal|rapida*\n  Ajusta la velocidad base del grupo.';

const SPEEDS = {
  lenta:  { minDelay: 1400, maxDelay: 3800, chatLimitCount: 8,  nightMultiplier: 2.0 },
  normal: { minDelay: 900,  maxDelay: 2600, chatLimitCount: 12, nightMultiplier: 1.5 },
  rapida: { minDelay: 500,  maxDelay: 1500, chatLimitCount: 20, nightMultiplier: 1.2 },
};

export default {
  command: ['noche', 'horario', 'nightmode', 'lentitud'],
  category: 'group',
  description: 'Configura el modo nocturno y la velocidad del bot.',
  isAdmin: true,
  usage: '<on|off|HH HH|estado|reset|velocidad>',

  async run(client, m, args, usedPrefix) {
    if (!m.isGroup) {
      return client.sendMessage(m.chat, { text: '⚠️ Solo funciona en grupos.' }, { quoted: m });
    }
    const action = (args[0] || '').toLowerCase();
    const chatId = m.chat;

    if (!action) {
      return client.sendMessage(m.chat, { text: HELP(usedPrefix) }, { quoted: m });
    }

    if (action === 'on') {
      humanizer.setChatConfig(chatId, { nightMode: true });
      const c = humanizer.getConfigFor(chatId);
      return client.sendMessage(m.chat, {
        text: '🌙 *Modo nocturno ACTIVADO*\n\n⏰ Horario: *' + fmtHour(c.nightStart) + ' → ' + fmtHour(c.nightEnd) + '*\n🐢 Multiplicador: *x' + c.nightMultiplier + '*',
      }, { quoted: m });
    }

    if (action === 'off') {
      humanizer.setChatConfig(chatId, { nightMode: false });
      return client.sendMessage(m.chat, { text: '☀️ *Modo nocturno DESACTIVADO*.' }, { quoted: m });
    }

    if (action === 'reset' || action === 'default') {
      humanizer.clearChatConfig(chatId);
      return client.sendMessage(m.chat, { text: '♻️ Config restablecida.' }, { quoted: m });
    }

    if (action === 'estado' || action === 'status' || action === 'info') {
      const c = humanizer.getConfigFor(chatId);
      const own = Object.keys(humanizer.getChatConfig(chatId)).length > 0;
      return client.sendMessage(m.chat, {
        text:
'📊 *Estado de humanización*\n\n' +
'🔧 Config propia: *' + (own ? 'Sí' : 'No (hereda del bot)') + '*\n' +
'🌙 Modo nocturno: *' + (c.nightMode ? 'ON' : 'OFF') + '*\n' +
'⏰ Horario: *' + fmtHour(c.nightStart) + ' → ' + fmtHour(c.nightEnd) + '*\n' +
'🐢 Multiplicador: *x' + c.nightMultiplier + '*\n' +
'⚡ Delay base: *' + c.minDelay + '–' + c.maxDelay + ' ms*\n' +
'💬 Límite por chat: *' + c.chatLimitCount + ' msgs/' + (c.chatLimitWindow / 1000) + 's*\n' +
'🌐 Límite global: *' + c.globalLimitCount + ' msgs/' + (c.globalLimitWindow / 1000) + 's*\n' +
'👋 Delay bienvenida: *' + c.groupEventMinDelay + '–' + c.groupEventMaxDelay + ' ms*\n' +
'🛡️ Delay admin: *' + c.groupActionMinDelay + '–' + c.groupActionMaxDelay + ' ms*',
      }, { quoted: m });
    }

    if (action === 'velocidad' || action === 'speed') {
      const mode = (args[1] || '').toLowerCase();
      if (!SPEEDS[mode]) {
        return client.sendMessage(m.chat, { text: '❌ Usa: *lenta*, *normal* o *rapida*.' }, { quoted: m });
      }
      humanizer.setChatConfig(chatId, SPEEDS[mode]);
      return client.sendMessage(m.chat, { text: '⚙️ Velocidad configurada en modo *' + mode.toUpperCase() + '*.' }, { quoted: m });
    }

    const h1 = parseHour(args[0]);
    const h2 = parseHour(args[1]);
    if (h1 !== null && h2 !== null) {
      humanizer.setChatConfig(chatId, { nightStart: h1, nightEnd: h2, nightMode: true });
      return client.sendMessage(m.chat, {
        text: '🌙 *Horario nocturno actualizado*\n\n⏰ De *' + fmtHour(h1) + '* a *' + fmtHour(h2) + '*\n_Modo nocturno activado automáticamente._',
      }, { quoted: m });
    }

    return client.sendMessage(m.chat, { text: HELP(usedPrefix) }, { quoted: m });
  },
};
