import { registry } from '../../core/system/commandLoader.js';

export default {
  command: ['help', 'ayuda'],
  category: 'main',
  desc: 'Muestra la ayuda detallada de todos los comandos.',
  usage: '[categoría | comando]',

  async run(client, m, args, usedPrefix, command) {
    const target = (args[0] || '').toLowerCase();
    
    const comandos = Array.from(registry.comandos.values());
    const categorias = {};
    const nombresUnicos = new Set();

    comandos.forEach(cmd => {
      if (!cmd.command || cmd.command.length === 0) return;
      const nombreReal = cmd.command[0];
      if (nombresUnicos.has(nombreReal)) return;
      nombresUnicos.add(nombreReal);

      const cat = cmd.category || 'otros';
      if (!categorias[cat]) categorias[cat] = [];
      categorias[cat].push(cmd);
    });

    const iconos = {
      economia: '🪙 Economía', juegos: '🎰 Juegos', profile: '🎮 Perfil y RPG',
      group: '🛡️ Administración', downloads: '📥 Descargas', herramientas: '🛠️ Herramientas',
      stickers: '🖼️ Stickers', main: '📱 Principal', owner: '👑 Dueño', reactions: '🎭 Reacciones'
    };

    if (!target) {
      let txt = `*» 📚 CENTRO DE AYUDA - ${global.config?.namebot || 'El Sapo Volador'}*\n\n`;
      txt += `> Escribe *${usedPrefix}help <categoría>* para ver los comandos.\n\n`;
      for (const cat of Object.keys(categorias).sort()) {
        const nombreCat = iconos[cat] || `📁 ${cat.charAt(0).toUpperCase() + cat.slice(1)}`;
        txt += `✧ ${nombreCat}\n`;
      }
      txt += `\n*Ejemplo:* *${usedPrefix}help juegos*`;
      return client.sendMessage(m.chat, { text: txt }, { quoted: m });
    }

    if (categorias[target]) {
      const listaCmds = categorias[target].sort((a, b) => a.command[0].localeCompare(b.command[0]));
      let txt = `*» 📁 CATEGORÍA: ${target.toUpperCase()}*\n\n`;
      
      listaCmds.forEach(c => {
        // Ocultar comandos de admin a los no admins (usando m.isAdmin de forma segura)
        if ((c.isAdmin || c.isOwner) && !m.isAdmin && !m.isOwner) return;

        txt += `*${usedPrefix}${c.command[0]}*\n`;
        txt += `┃ ${c.desc || 'Sin descripción.'}\n\n`;
      });
      txt += `> Para saber cómo usar uno, escribe: *${usedPrefix}help <comando>*`;
      return client.sendMessage(m.chat, { text: txt }, { quoted: m });
    }

    const cmdData = registry.getCommand(target);
    if (cmdData) {
      let txt = `*» 🛠️ INFORMACIÓN DEL COMANDO*\n\n`;
      txt += `✨ *Comando:* ${usedPrefix}${cmdData.command[0]}\n`;
      txt += `📝 *Descripción:* ${cmdData.desc || 'Sin descripción.'}\n`;
      txt += `⚙️ *Uso:* ${cmdData.usage ? usedPrefix + cmdData.command[0] + ' ' + cmdData.usage : usedPrefix + cmdData.command[0]}\n`;
      if (cmdData.command.length > 1) {
        txt += `🔗 *Alias:* ${cmdData.command.slice(1).map(a => usedPrefix + a).join(', ')}\n`;
      }
      txt += `\n*» Permisos:*\n`;
      txt += `┃ ${cmdData.isOwner ? '👑 Solo Dueño' : cmdData.isAdmin ? '🛡️ Solo Admins' : '👤 Todos'}\n`;
      return client.sendMessage(m.chat, { text: txt }, { quoted: m });
    }

    return m.reply(`❌ No encontré la categoría o el comando *${target}*.\nEscribe *${usedPrefix}help* para ver las categorías.`);
  }
};
