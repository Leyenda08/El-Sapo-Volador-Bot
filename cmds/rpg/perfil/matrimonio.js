export default {
  command: ['casarse', 'marry', 'harem', 'divorciarse'],
  category: 'profile',
  desc: 'Sistema de Harén.',
  usage: '<@usuario | harem>',

  async run(client, m, args, usedPrefix, command) {
    const chat = global.db.data.chats[m.chat] || {};
    if (!chat.users) chat.users = {};
    const user = chat.users[m.sender] || (chat.users[m.sender] = { harem: [] });
    if (!user.harem) user.harem = [];
    
    const target = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : null;

    if (command === 'harem') {
      if (user.harem.length === 0) return m.reply('👑 Tu harén está vacío.');
      let txt = `👑 *TU HARÉN (${user.harem.length})*\n\n`;
      user.harem.forEach((p, i) => { txt += `*${i + 1}.* @${p.split('@')[0]}\n`; });
      return m.reply(txt, { mentions: user.harem });
    }

    if (command === 'divorciarse') {
      if (!target || !user.harem.includes(target)) return m.reply('❌ No está en tu harén.');
      user.harem = user.harem.filter(id => id !== target);
      global.markPartitionDirty('chats');
      return m.reply(`💔 Has echado a @${target.split('@')[0]} de tu harén.`, { mentions: [target] });
    }

    if (command === 'casarse') {
      if (!target) return m.reply('⚠️ Menciona a quién quieres agregar.');
      if (user.harem.includes(target)) return m.reply('❌ Ya está en tu harén.');
      
      const targetUser = chat.users[target] || (chat.users[target] = {});
      if (targetUser.marriedTo) return m.reply('❌ Esa persona ya tiene un dueño (o dueña).');

      user.harem.push(target);
      targetUser.marriedTo = m.sender; // El dueño del harén
      global.markPartitionDirty('chats');

      return m.reply(`👑 *¡HARÉN EXPANDIDO!* 👑\n\n@${m.sender.split('@')[0]} ha añadido a @${target.split('@')[0]} a su harén.`, { mentions: [m.sender, target] });
    }
  }
};
