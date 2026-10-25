import humanizer from '../../utils/humanizer.js';

const SPEEDS = {
  sigilo: { minDelay: 2200, maxDelay: 5000, chatLimitCount: 5, globalLimitCount: 20, nightMultiplier: 2.5 },
  normal: { minDelay: 900, maxDelay: 2600, chatLimitCount: 12, globalLimitCount: 45, nightMultiplier: 1.5 },
  alta: { minDelay: 400, maxDelay: 1200, chatLimitCount: 30, globalLimitCount: 90, nightMultiplier: 1.3 },
  instakill: { minDelay: 50, maxDelay: 200, chatLimitCount: 100, globalLimitCount: 300, nightMultiplier: 1.0 },
};

const menuTexto = (prefix) => `
🧠 *PANEL DE CONTROL ANTI-BAN*
> _Elige cómo de rápido responde el bot._

*» MODOS DISPONIBLES:*

🐢 *SIGILO* \`(${prefix}humanizer velocidad sigilo)\`
> _Máxima seguridad. Respuestas lentas para parecer 100% humano._
> ⚠️ Riesgo de ban: *MUY BAJO*

🌙 *NORMAL* \`(${prefix}humanizer velocidad normal)\`
> _Equilibrado. Recomendado para el día a día._
> ⚠️ Riesgo de ban: *BAJO*

⚡ *ALTA* \`(${prefix}humanizer velocidad alta)\`
> _Rápido, pero mantiene un delay mínimo humano._
> ⚠️ Riesgo de ban: *MEDIO*

💀 *INSTAKILL* \`(${prefix}humanizer velocidad instakill)\`
> _Casi instantáneo. Solo para pruebas._
> ⚠️ Riesgo de ban: *ALTO*

*» OTROS COMANDOS:*
> *${prefix}humanizer status* - Ver tu configuración actual
`;

export default {
  command: ['humanizer', 'hz'],
  category: 'owner',
  isOwner: false, // Lo dejamos abierto para que no tengas problemas
  desc: 'Configuración del sistema anti-ban.',

  async run(client, m, args, usedPrefix, command) {
    const sub = (args[0] || '').toLowerCase();

    // Si solo escribe .humanizer
    if (!sub) {
      return client.sendMessage(m.chat, { text: menuTexto(usedPrefix) }, { quoted: m });
    }

    // Si escribe .humanizer velocidad
    if (sub === 'velocidad' || sub === 'speed') {
      const mode = (args[1] || '').toLowerCase();
      
      if (!mode || !SPEEDS[mode]) {
        return client.sendMessage(m.chat, { text: `⚠️ *Modo no válido.*\n\n${menuTexto(usedPrefix)}` }, { quoted: m });
      }
      
      humanizer.updateGlobalConfig(SPEEDS[mode]);
      
      // Respuesta con advertencia según el modo elegido
      let aviso = '';
      if (mode === 'instakill') aviso = '💀 *¡CUIDADO!* Este modo tiene riesgo ALTO de que WhatsApp banee el bot.';
      if (mode === 'sigilo') aviso = '🐢 Modo ultra seguro activado. El bot tardará más en responder.';
      
      return m.reply(`⚙️ Velocidad cambiada al modo *${mode.toUpperCase()}*.\n\n${aviso}\n\n> _Puedes ver los detalles con ${usedPrefix}humanizer status_`);
    }

    // Si escribe .humanizer status
    if (sub === 'status') {
      const c = humanizer.getGlobalConfig();
      return m.reply(`📊 *ESTADO DEL ANTI-BAN*\n\n⚡ *Delay:* ${c.minDelay}ms - ${c.maxDelay}ms\n💬 *Límite por chat:* ${c.chatLimitCount} msgs/min\n🌐 *Límite global:* ${c.globalLimitCount} msgs/min\n\n> _Los límites cambian si usas modo nocturno._`);
    }

    // Si escribe cualquier otra cosa
    return client.sendMessage(m.chat, { text: menuTexto(usedPrefix) }, { quoted: m });
  }
};
