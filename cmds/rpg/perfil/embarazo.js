export default {
  command: ['tenerbebe', 'embarazar', 'tiempoembarazo'],
  category: 'profile',
  desc: 'Inicia el proceso de embarazo en el RPG.',
  isAdmin: false,

  async run(client, m, args, usedPrefix, command) {
    const chat = global.db.data.chats[m.chat] || {};
    if (!chat.users) chat.users = {};
    const user = chat.users[m.sender] || (chat.users[m.sender] = {});

    // Configurar tiempo (Solo Admin)
    if (command === 'tiempoembarazo') {
      if (!m.isAdmin) return m.reply('❌ Solo los administradores pueden cambiar el tiempo de embarazo.');
      const horas = parseInt(args[0]);
      if (!horas || horas < 1) return m.reply('⚠️ Uso: .tiempoembarazo <horas>\nEjemplo: .tiempoembarazo 2');
      chat.pregnancyTime = horas * 60 * 60 * 1000;
      global.markPartitionDirty('chats');
      return m.reply(`✅ El tiempo de embarazo ahora es de *${horas} horas*.`);
    }

    // Iniciar Embarazo
    if (command === 'tenerbebe' || command === 'embarazar') {
      const target = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : (m.quoted ? m.quoted.sender : null);
      if (!target) return m.reply(`⚠️ Debes mencionar a tu pareja para tener un bebé.\nEj: ${usedPrefix}tenerbebe @pareja`);
      if (target === m.sender) return m.reply('❌ Necesitas a otra persona.');

      const targetUser = chat.users[target] || (chat.users[target] = {});

      if (user.embarazo) return m.reply('❌ Ya estás en estado de embarazo.');
      if (targetUser.embarazo) return m.reply('❌ Tu pareja ya está embarazada.');

      // Validar que estén casados
      const casados = (user.harem && user.harem.includes(target)) || (targetUser.harem && targetUser.harem.includes(m.sender)) || user.marriedTo === target;
      if (!casados) return m.reply('❌ Deben estar casados primero para tener un bebé.');

      // Algoritmo de género (50/50)
      const genero = Math.random() < 0.5 ? 'Niño' : 'Niña';
      const emoji = genero === 'Niño' ? '👶' : '👶🏼';
      
      const tiempo = chat.pregnancyTime || 24 * 60 * 60 * 1000; // Default 24 horas
      const fin = Date.now() + tiempo;

      user.embarazo = { fin, pareja: target, genero };
      global.markPartitionDirty('chats');

      return m.reply(`🤰 *¡EMBARAZO!* ${emoji}\n\n*@${m.sender.split('@')[0]}* y *@${target.split('@')[0]}* están esperando un *${genero}*.\n\n⏳ El bebé nacerá en *${Math.floor(tiempo / (1000 * 60 * 60))} horas*.\n> _Mientras está embarazada, no podrá participar en batallas ni apostar._`, { mentions: [m.sender, target] });
    }
  }
};
