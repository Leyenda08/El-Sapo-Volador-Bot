export default {
  command: ['adoptar', 'hijo', 'desheredar', 'familia'],
  category: 'profile',
  desc: 'Sistema de adopción y árbol familiar.',
  usage: '<@usuario | ver>',

  async run(client, m, args, usedPrefix, command) {
    const chat = global.db.data.chats[m.chat] || {};
    if (!chat.users) chat.users = {};
    
    const user = chat.users[m.sender] || (chat.users[m.sender] = {});
    if (!user.children) user.children = [];
    if (!user.parents) user.parents = [];

    const target = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : null;

    // VER FAMILIA
    if (command === 'familia') {
      const pareja = user.marriedTo ? `@${user.marriedTo.split('@')[0]}` : 'Nadie';
      const hijos = user.children.length > 0 ? user.children.map(c => `@${c.split('@')[0]}`).join(', ') : 'Ninguno';
      const padres = user.parents.length > 0 ? user.parents.map(p => `@${p.split('@')[0]}`).join(', ') : 'Ninguno';

      return m.reply(`👨‍👩‍👧 *ÁRBOL GENEALÓGICO*\n\n💍 *Pareja:* ${pareja}\n👶 *Hijos:* ${hijos}\n👵 *Padres:* ${padres}`, { mentions: [user.marriedTo, ...user.children, ...user.parents].filter(Boolean) });
    }

    // ADOPTAR
    if (command === 'adoptar' || command === 'hijo') {
      if (!target) return m.reply(`⚠️ Menciona a quién quieres adoptar.\nEj: *${usedPrefix}adoptar @usuario*`);
      if (target === m.sender) return m.reply('❌ No puedes adoptarte a ti mismo.');
      
      const targetUser = chat.users[target] || (chat.users[target] = {});
      if (!targetUser.parents) targetUser.parents = [];
      if (!targetUser.children) targetUser.children = [];

      if (user.children.includes(target)) return m.reply('❌ Ya es tu hijo/a.');
      if (user.parents.includes(target)) return m.reply('❌ No puedes adoptar a tu propio padre/madre.');
      
      if (targetUser.parents.length >= 2) return m.reply('❌ Esa persona ya tiene 2 padres. No puedes adoptarla.');

      user.children.push(target);
      targetUser.parents.push(m.sender);
      global.markPartitionDirty('chats');

      return m.reply(`👨‍👩‍👧 *¡FAMILIA CRECIÓ!* 👨‍👩‍👧\n\n*@${m.sender.split('@')[0]}* ha adoptado oficialmente a *@${target.split('@')[0]}*.\n\n_Que viva la familia._`, { mentions: [m.sender, target] });
    }

    // DESHEREDAR
    if (command === 'desheredar') {
      if (!target) return m.reply(`⚠️ Menciona a quién quieres desheredar.`);
      if (!user.children.includes(target)) return m.reply('❌ No está en tu lista de hijos.');

      const targetUser = chat.users[target];
      user.children = user.children.filter(id => id !== target);
      if (targetUser && targetUser.parents) {
        targetUser.parents = targetUser.parents.filter(id => id !== m.sender);
      }
      global.markPartitionDirty('chats');

      return m.reply(`💔 *¡DESHEREDADO!* 💔\n\n*@${m.sender.split('@')[0]}* ha echado de la casa a *@${target.split('@')[0]}*.`, { mentions: [m.sender, target] });
    }
  }
};
