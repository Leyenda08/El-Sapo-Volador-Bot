export default {
  command: ['prestigiar', 'prestige', 'renacer'],
  category: 'profile',
  desc: 'Renace para volverte más fuerte (Requiere Nivel 50).',

  async run(client, m, args, usedPrefix, command) {
    const chat = global.db.data.chats[m.chat] || {};
    if (!chat.users) chat.users = {};
    const user = chat.users[m.sender] || {};

    if ((user.level || 1) < 50) {
      return m.reply(`❌ Aún no puedes prestigiar. Necesitas Nivel 50 y actualmente eres Nivel *${user.level || 1}*.`);
    }

    user.prestige = (user.prestige || 0) + 1;
    user.level = 1;
    user.exp = 0;
    global.markPartitionDirty('chats');

    const texto = `
🌟 *¡RENACIMIENTO DIVINO!* 🌟

@${m.sender.split('@')[0]} ha sacrificado su poder terrenal y ha renacido con el rango de:
*✨ PRESTIGIO ${user.prestige} ✨*

> _Su nivel vuelve a 1, pero su poder ahora es absoluto._
> _Los ítems de la tienda de prestigio se han desbloqueado para él._`;

    await client.sendMessage(m.chat, { text: texto, mentions: [m.sender] }, { quoted: m });
  }
};
