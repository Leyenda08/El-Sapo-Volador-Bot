// cmds/owner/humanizer.js
// Comando global de humanizer. Solo owners.
// Modos: sigilo, normal, alta, instakill

import humanizer from '../../utils/humanizer.js';

const TIMEZONES = {
  bogota: 'America/Bogota',
  mexico: 'America/Mexico_City',
  madrid: 'Europe/Madrid',
  buenosaires: 'America/Argentina/Buenos_Aires',
  lima: 'America/Lima',
  santiago: 'America/Santiago',
  caracas: 'America/Caracas',
  panama: 'America/Panama',
  guayaquil: 'America/Guayaquil',
  la_paz: 'America/La_Paz',
  montevideo: 'America/Montevideo',
  sao_paulo: 'America/Sao_Paulo',
  new_york: 'America/New_York',
  los_angeles: 'America/Los_Angeles',
};

const SPEEDS = {
  sigilo: {
    emoji: '🐢', label: 'SIGILO',
    desc: 'Parece 100% humano. Respuestas lentas.',
    risk: '🟢 Muy bajo',
    minDelay: 2200, maxDelay: 5000,
    chatLimitCount: 5, globalLimitCount: 20,
    nightMultiplier: 2.5,
  },
  normal: {
    emoji: '🌙', label: 'NORMAL',
    desc: 'Equilibrado. Recomendado para uso diario.',
    risk: '🟢 Bajo',
    minDelay: 900, maxDelay: 2600,
    chatLimitCount: 12, globalLimitCount: 45,
    nightMultiplier: 1.5,
  },
  alta: {
    emoji: '⚡', label: 'ALTA',
    desc: 'Rápido pero con delay humano.',
    risk: '🟡 Medio',
    minDelay: 400, maxDelay: 1200,
    chatLimitCount: 30, globalLimitCount: 90,
    nightMultiplier: 1.3,
  },
  instakill: {
    emoji: '💀', label: 'INSTAKILL',
    desc: 'Casi instantáneo. Solo pruebas.',
    risk: '🔴 ALTO — riesgo de ban',
    minDelay: 50, maxDelay: 200,
    chatLimitCount: 100, globalLimitCount: 300,
    nightMultiplier: 1.0,
  },
};

function speedTable(prefix) {
  return Object.entries(SPEEDS).map(([key, s]) => {
    return `${s.emoji} *${s.label}*\n` +
           `     _${s.desc}_\n` +
           `     Riesgo: ${s.risk}\n` +
           `     Delay: ${s.minDelay}–${s.maxDelay}ms  ·  Límite: ${s.chatLimitCount} msgs/min\n` +
           `     ▸ Escribe: \`${prefix}humanizer velocidad ${key}\``;
  }).join('\n\n');
}

const HELP = (prefix) =>
`🧠 *HUMANIZER — Panel de control*

Elige un *modo de velocidad* para el bot. Cada modo cambia qué tan rápido responde el bot.

━━━━━━━━━━━━━━━━━━━━━━━━━━

${speedTable(prefix)}

━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 *OTROS COMANDOS*

▸ Ver la config actual del bot:
   \`${prefix}humanizer status\`

▸ Delay personalizado (avanzado):
   \`${prefix}humanizer delay 1200 3000\`
   _(delays en milisegundos, min y max)_

▸ Límite de mensajes por minuto:
   \`${prefix}humanizer limite 12 45\`
   _(por chat y global)_

▸ Volver a la configuración recomendada:
   \`${prefix}humanizer reset\`

━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 *SOLO PARA ESTE GRUPO* (escribe desde un grupo)

▸ Ver config del grupo:
   \`${prefix}humanizer grupo status\`

▸ Poner modo solo en este grupo:
   \`${prefix}humanizer grupo modo sigilo\`

▸ Cambiar zona horaria del grupo:
   \`${prefix}humanizer grupo zona madrid\`
   Zonas: bogota, mexico, madrid, buenosaires, lima, santiago, caracas, panama, guayaquil, la_paz, montevideo, sao_paulo, new_york, los_angeles

▸ Horario nocturno del grupo:
   \`${prefix}humanizer grupo noche 22 6\`
   _(más lento de 22h a 6h)_

▸ Volver a heredar la config del bot:
   \`${prefix}humanizer grupo reset\``;

function detectMode(cfg) {
  for (const key of Object.keys(SPEEDS)) {
    const s = SPEEDS[key];
    if (s.minDelay === cfg.minDelay && s.maxDelay === cfg.maxDelay &&
        s.chatLimitCount === cfg.chatLimitCount) {
      return { key, ...s };
    }
  }
  return null;
}

export default {
  command: ['humanizer', 'hz'],
  category: 'owner',
  description: 'Panel de control del sistema anti-ban.',
  isOwner: true,

  async run(client, m, args, usedPrefix, command, text) {
    const sub = (args[0] || '').toLowerCase();
    const chatId = m.chat;

    // ═════ SIN ARGUMENTOS → AYUDA ═════
    if (!sub) {
      return client.sendMessage(m.chat, { text: HELP(usedPrefix) }, { quoted: m });
    }

    // ═════ STATUS GLOBAL ═════
    if (sub === 'status' || sub === 'info') {
      const c = humanizer.getGlobalConfig();
      const current = detectMode(c);
      const modeLine = current
        ? `${current.emoji} *${current.label}*`
        : '⚙️ *Personalizado*';
      return client.sendMessage(m.chat, {
        text:
`🧠 *Estado del HUMANIZER*

🎮 Modo global: ${modeLine}

⚡ Delay base: *${c.minDelay}–${c.maxDelay} ms*
💬 Límite por chat: *${c.chatLimitCount} msgs/min*
🌐 Límite global: *${c.globalLimitCount} msgs/min*
🌙 Modo nocturno: *${c.nightMode ? 'ON' : 'OFF'}*
⏰ Horario: *${String(c.nightStart).padStart(2, '0')}:00 → ${String(c.nightEnd).padStart(2, '0')}:00*
🌍 Zona: *${c.timezone}*

_Cambiar modo: \`${usedPrefix}humanizer velocidad normal\`_`,
      }, { quoted: m });
    }

    // ═════ VELOCIDAD (global) ═════
    if (sub === 'velocidad' || sub === 'speed' || sub === 'modo' || sub === 'mode') {
      const mode = (args[1] || '').toLowerCase();

      if (!mode) {
        return client.sendMessage(m.chat, {
          text:
`⚙️ *Elige un modo de velocidad*

${speedTable(usedPrefix)}

_Escribe por ejemplo: \`${usedPrefix}humanizer velocidad normal\`_`,
        }, { quoted: m });
      }

      if (!SPEEDS[mode]) {
        const list = Object.keys(SPEEDS).join(', ');
        return client.sendMessage(m.chat, {
          text: `❌ Modo *${mode}* no existe.\n\nModos válidos: *${list}*\n\nEjemplo: \`${usedPrefix}humanizer velocidad normal\``,
        }, { quoted: m });
      }

      const s = SPEEDS[mode];
      humanizer.updateGlobalConfig({
        minDelay: s.minDelay,
        maxDelay: s.maxDelay,
        chatLimitCount: s.chatLimitCount,
        globalLimitCount: s.globalLimitCount,
        nightMultiplier: s.nightMultiplier,
      });

      // Advertencia según modo
      let warning = '';
      if (mode === 'instakill') {
        warning = '\n\n⚠️ *ADVERTENCIA:* este modo tiene riesgo ALTO de ban. Úsalo solo para pruebas. Para volver a la seguridad: `.humanizer velocidad normal`';
      } else if (mode === 'alta') {
        warning = '\n\n⚡ Modo rápido. Mantén un uso moderado para no alertar a WhatsApp.';
      } else if (mode === 'sigilo') {
        warning = '\n\n🐢 Modo lento. Ideal si notas que WhatsApp está vigilando el bot.';
      }

      return client.sendMessage(m.chat, {
        text:
`${s.emoji} *Modo ${s.label} activado*\n\n` +
`📝 _${s.desc}_\n\n` +
`⚡ Delay: *${s.minDelay}–${s.maxDelay} ms*\n` +
`💬 Límite por chat: *${s.chatLimitCount} msgs/min*\n` +
`🌐 Límite global: *${s.globalLimitCount} msgs/min*\n` +
`🎯 Riesgo: *${s.risk}*${warning}\n\n` +
`_Comprueba con: \`${usedPrefix}humanizer status\`_`,
      }, { quoted: m });
    }

    // ═════ DELAY personalizado ═════
    if (sub === 'delay') {
      const min = parseInt(args[1], 10);
      const max = parseInt(args[2], 10);
      if (isNaN(min) || isNaN(max) || min < 50 || max > 15000 || min >= max) {
        return client.sendMessage(m.chat, {
          text:
`❌ *Uso correcto:*\n\`${usedPrefix}humanizer delay <min> <max>\`\n\n` +
`*Ejemplo:* \`${usedPrefix}humanizer delay 1200 3000\`\n` +
`Significa: esperar entre *1.2s* y *3s* antes de responder.\n\n` +
`Rango: 50-15000ms. El mínimo debe ser menor al máximo.`,
        }, { quoted: m });
      }
      humanizer.updateGlobalConfig({ minDelay: min, maxDelay: max });
      return client.sendMessage(m.chat, {
        text: `⚙️ *Delay personalizado aplicado*\n\n⚡ Espera entre *${min}ms* y *${max}ms*\n\n_El modo aparecerá como Personalizado en el status._`,
      }, { quoted: m });
    }

    // ═════ LIMITE personalizado ═════
    if (sub === 'limite' || sub === 'limit') {
      const chat = parseInt(args[1], 10);
      const global = parseInt(args[2], 10);
      if (isNaN(chat) || isNaN(global) || chat < 1 || global < 1) {
        return client.sendMessage(m.chat, {
          text:
`❌ *Uso correcto:*\n\`${usedPrefix}humanizer limite <chat> <global>\`\n\n` +
`*Ejemplo:* \`${usedPrefix}humanizer limite 12 45\`\n` +
`Significa: máximo *12 mensajes por chat por minuto* y *45 en total por minuto*.`,
        }, { quoted: m });
      }
      humanizer.updateGlobalConfig({ chatLimitCount: chat, globalLimitCount: global });
      return client.sendMessage(m.chat, {
        text: `💬 *Límite actualizado*\n\n• Por chat: *${chat} msgs/min*\n• Global: *${global} msgs/min*`,
      }, { quoted: m });
    }

    // ═════ RESET global ═════
    if (sub === 'reset' && !args[1]) {
      const s = SPEEDS.normal;
      humanizer.updateGlobalConfig({
        minDelay: s.minDelay,
        maxDelay: s.maxDelay,
        chatLimitCount: s.chatLimitCount,
        globalLimitCount: s.globalLimitCount,
        nightMultiplier: s.nightMultiplier,
      });
      return client.sendMessage(m.chat, {
        text: `${s.emoji} Config global reseteada a modo *${s.label}*.`,
      }, { quoted: m });
    }

    // ═════ GRUPO ═════
    if (sub === 'grupo' || sub === 'group' || sub === 'chat') {
      if (!m.isGroup) {
        return client.sendMessage(m.chat, {
          text: `⚠️ *Los comandos "grupo" solo funcionan dentro de un grupo.*\n\nEntra a un grupo y escribe: \`${usedPrefix}humanizer grupo status\``,
        }, { quoted: m });
      }

      const action = (args[1] || '').toLowerCase();

      // Sin subacción → status
      if (!action || action === 'status') {
        const own = humanizer.getChatConfig(chatId);
        const eff = humanizer.getConfigFor(chatId);
        const hasOwn = Object.keys(own).length > 0;
        const gm = eff.minDelay + '–' + eff.maxDelay;
        return client.sendMessage(m.chat, {
          text:
`📊 *HUMANIZER — Config de este grupo*

🔧 Config propia: *${hasOwn ? 'Sí' : 'No (hereda del bot)'}*
🌍 Zona horaria: *${eff.timezone}*
🌙 Modo nocturno: *${eff.nightMode ? 'ON' : 'OFF'}*
⏰ Horario: *${String(eff.nightStart).padStart(2, '0')}:00 → ${String(eff.nightEnd).padStart(2, '0')}:00*
⚡ Delay: *${gm} ms*
💬 Límite: *${eff.chatLimitCount} msgs/min*

*¿Qué quieres hacer?*
▸ \`${usedPrefix}humanizer grupo modo sigilo\`
▸ \`${usedPrefix}humanizer grupo zona madrid\`
▸ \`${usedPrefix}humanizer grupo noche 22 6\`
▸ \`${usedPrefix}humanizer grupo reset\``,
        }, { quoted: m });
      }

      // RESET
      if (action === 'reset') {
        humanizer.clearChatConfig(chatId);
        return client.sendMessage(m.chat, {
          text: `♻️ Config del grupo eliminada. Ahora este grupo hereda la del bot.\n\n_Comprueba con: \`${usedPrefix}humanizer grupo status\`_`,
        }, { quoted: m });
      }

      // MODO por grupo
      if (action === 'modo' || action === 'velocidad' || action === 'speed') {
        const mode = (args[2] || '').toLowerCase();
        if (!mode) {
          return client.sendMessage(m.chat, {
            text:
`⚙️ *Elige un modo para este grupo*\n\n` +
Object.entries(SPEEDS).map(([k, s]) =>
  `${s.emoji} *${s.label}* — \`${usedPrefix}humanizer grupo modo ${k}\``
).join('\n') +
`\n\n_Ejemplo:_ \`${usedPrefix}humanizer grupo modo sigilo\``,
          }, { quoted: m });
        }
        if (!SPEEDS[mode]) {
          return client.sendMessage(m.chat, {
            text: `❌ Modo *${mode}* no válido. Usa: *sigilo*, *normal*, *alta*, *instakill*.\n\nEjemplo: \`${usedPrefix}humanizer grupo modo sigilo\``,
          }, { quoted: m });
        }
        const s = SPEEDS[mode];
        humanizer.setChatConfig(chatId, {
          minDelay: s.minDelay,
          maxDelay: s.maxDelay,
          chatLimitCount: s.chatLimitCount,
          globalLimitCount: s.globalLimitCount,
          nightMultiplier: s.nightMultiplier,
        });
        return client.sendMessage(m.chat, {
          text: `${s.emoji} Modo *${s.label}* activado *solo para este grupo*.\n\nLos demás grupos siguen con la config del bot.\n\n_Comprueba con: \`${usedPrefix}humanizer grupo status\`_`,
        }, { quoted: m });
      }

      // ZONA
      if (action === 'zona' || action === 'timezone' || action === 'tz') {
        const tzKey = (args[2] || '').toLowerCase();
        if (!tzKey) {
          const list = Object.keys(TIMEZONES).join(', ');
          return client.sendMessage(m.chat, {
            text: `🌍 *Zonas disponibles:*\n${list}\n\n*Ejemplo:* \`${usedPrefix}humanizer grupo zona madrid\``,
          }, { quoted: m });
        }
        if (!TIMEZONES[tzKey]) {
          return client.sendMessage(m.chat, {
            text: `❌ Zona *${tzKey}* no válida.\n\nVer lista: \`${usedPrefix}humanizer grupo zona\`\nEjemplo: \`${usedPrefix}humanizer grupo zona madrid\``,
          }, { quoted: m });
        }
        humanizer.setChatConfig(chatId, { timezone: TIMEZONES[tzKey] });
        return client.sendMessage(m.chat, {
          text: `🌍 Zona horaria de este grupo: *${TIMEZONES[tzKey]}*\n\n_Ahora el horario nocturno usará esta zona._`,
        }, { quoted: m });
      }

      // NOCHE
      if (action === 'noche') {
        const h1 = parseInt(args[2], 10);
        const h2 = parseInt(args[3], 10);
        if (isNaN(h1) || isNaN(h2) || h1 < 0 || h1 > 23 || h2 < 0 || h2 > 23) {
          return client.sendMessage(m.chat, {
            text:
`❌ *Uso correcto:*\n\`${usedPrefix}humanizer grupo noche <inicio> <fin>\`\n\n` +
`*Ejemplo:* \`${usedPrefix}humanizer grupo noche 22 6\`\n` +
`Significa: de *22:00* a *06:00* el bot irá más lento en este grupo.`,
          }, { quoted: m });
        }
        humanizer.setChatConfig(chatId, { nightStart: h1, nightEnd: h2, nightMode: true });
        return client.sendMessage(m.chat, {
          text: `🌙 *Modo nocturno activado*\n\n⏰ De *${String(h1).padStart(2, '0')}:00* a *${String(h2).padStart(2, '0')}:00*\n💤 En ese rango el bot irá más lento en este grupo.`,
        }, { quoted: m });
      }

      // Fallback grupo → ayuda
      return client.sendMessage(m.chat, {
        text: `❓ No entendí *${action}*.\n\nUsa:\n▸ \`${usedPrefix}humanizer grupo status\`\n▸ \`${usedPrefix}humanizer grupo modo sigilo\`\n▸ \`${usedPrefix}humanizer grupo zona madrid\`\n▸ \`${usedPrefix}humanizer grupo noche 22 6\`\n▸ \`${usedPrefix}humanizer grupo reset\``,
      }, { quoted: m });
    }

    // Subcomando desconocido → ayuda con sugerencia
    return client.sendMessage(m.chat, {
      text: `❓ *${sub}* no es un subcomando válido.\n\nPrueba con:\n▸ \`${usedPrefix}humanizer status\`\n▸ \`${usedPrefix}humanizer velocidad normal\`\n▸ \`${usedPrefix}humanizer grupo status\``,
    }, { quoted: m });
  },
};
