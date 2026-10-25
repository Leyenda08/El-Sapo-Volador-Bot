import { CLASES } from '../../../utils/rpgData.js';

export default {
  command: ['clase', 'class'],
  category: 'profile',
  desc: 'Elige tu clase de RPG.',
  usage: '<nombre>',

  async run(client, m, args, usedPrefix, command) {
    const chat = global.db.data.chats[m.chat] || {};
    if (!chat.users) chat.users = {};
    const user = chat.users[m.sender] || (chat.users[m.sender] = {});
    
    const accion = (args[0] || '').toLowerCase();
    const todasLasClases = { ...CLASES, ...(chat.customClasses || {}) };

    if (!accion) {
      let txt = `🧙‍♂️ *SELECCIÓN DE CLASE*\n\n`;
      for (const [key, c] of Object.entries(todasLasClases)) {
        txt += `*${c.nombre}* (\`${key}\`)\n┃ ❤️ HP: ${c.hp} | ⚔️ ATK: ${c.atk} | 🛡️ DEF: ${c.def}\n┃ 💨 SPD: ${c.spd} | 🎯 CRIT: ${c.crit}%\n┃ _${c.desc}_\n\n`;
      }
      txt += `> Para elegir, escribe: *${usedPrefix}clase guerrero*\n> _¡Atención! No podrás cambiarla después._`;
      return m.reply(txt);
    }

    if (user.clase) return m.reply(`❌ Ya eres un *${todasLasClases[user.clase].nombre}*. No puedes cambiar de clase.`);
    if (!todasLasClases[accion]) return m.reply('❌ Esa clase no existe. Revisa la lista con .clase.');

    user.clase = accion;
    global.markPartitionDirty('chats');
    return m.reply(`✅ *¡Clase elegida!*\nAhora eres un *${todasLasClases[accion].nombre}*.\n\n_Usa .moequipo para ver tus estadísticas base._`);
  }
};
