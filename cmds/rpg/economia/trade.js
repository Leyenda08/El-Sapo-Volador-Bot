export default {
  command: ['trade', 'intercambiar', 'aceptartrade', 'rechazartrade'],
  category: 'economia',
  desc: 'Intercambia ítems o monedas de forma segura.',
  usage: '<@usuario> <cantidad_coins> <id_objeto>',

  async run(client, m, args, usedPrefix, command) {
    if (!global.db.data.trades) global.db.data.trades = {};
    const chat = global.db.data.chats[m.chat] || {};
    if (!chat.users) chat.users = {};
    const user = chat.users[m.sender] || (chat.users[m.sender] = { coins: 0, inventory: [] });
    if (!user.inventory) user.inventory = [];

    // CANCELAR / RECHAZAR
    if (command === 'rechazartrade') {
      const target = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : null;
      if (target && global.db.data.trades[target + m.sender]) {
        delete global.db.data.trades[target + m.sender];
        return m.reply('❌ Has rechazado el intercambio.');
      }
      return m.reply('❌ No hay ningún intercambio pendiente.');
    }

    // ACEPTAR
    if (command === 'aceptartrade') {
      const tradeId = m.sender + (m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : '');
      const trade = global.db.data.trades[tradeId];
      
      if (!trade) return m.reply('❌ No tienes un intercambio pendiente con esta persona.');
      if (Date.now() > trade.expira) {
        delete global.db.data.trades[tradeId];
        return m.reply('❌ El intercambio ha expirado.');
      }

      const userB = chat.users[m.sender];
      const userA = chat.users[trade.sender];

      // Validar que aún tengan el dinero/ítem
      if (userA.coins < trade.coinsA || !userA.inventory.includes(trade.itemA)) return m.reply('❌ El otro usuario ya no tiene los fondos o el ítem.');
      if (userB.coins < trade.coinsB || (trade.itemB && !userB.inventory.includes(trade.itemB))) return m.reply('❌ Ya no tienes los fondos o el ítem.');

      // Hacer el intercambio
      userA.coins = userA.coins - trade.coinsA + trade.coinsB;
      userB.coins = userB.coins - trade.coinsB + trade.coinsA;

      if (trade.itemA) {
        userA.inventory = userA.inventory.filter(i => i !== trade.itemA);
        userB.inventory.push(trade.itemA);
      }
      if (trade.itemB) {
        userB.inventory = userB.inventory.filter(i => i !== trade.itemB);
        userA.inventory.push(trade.itemB);
      }

      delete global.db.data.trades[tradeId];
      global.markPartitionDirty('chats');
      global.markPartitionDirty('trades');

      return m.reply(`🤝 *¡INTERCAMBIO COMPLETADO!*\n\n@${trade.sender.split('@')[0]} y @${m.sender.split('@')[0]} han realizado el trato exitosamente.`, { mentions: [trade.sender, m.sender] });
    }

    // CREAR TRADE
    if (command === 'trade' || command === 'intercambiar') {
      const target = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : null;
      if (!target) return m.reply(`⚠️ Menciona a quién quieres intercambiar.\nEj: ${usedPrefix}trade @user 500 arma_hierro`);
      if (target === m.sender) return m.reply('❌ No puedes hacer trade contigo mismo.');

      const coinsA = parseInt(args[1]) || 0;
      const itemA = args[2] ? args[2].toLowerCase() : null;

      if (user.coins < coinsA) return m.reply('❌ No tienes ese dinero.');
      if (itemA && !user.inventory.includes(itemA)) return m.reply('❌ No tienes ese ítem en tu inventario.');

      const tradeId = m.sender + target; // ID único para esta oferta
      
      global.db.data.trades[tradeId] = {
        sender: m.sender,
        receiver: target,
        coinsA: coinsA,
        itemA: itemA,
        coinsB: 0, // El receptor pondrá esto luego
        itemB: null,
        expira: Date.now() + 60000 // 1 minuto para aceptar
      };

      return client.sendMessage(m.chat, {
        text: `🤝 *OFERTA DE INTERCAMBIO*\n\n*@${m.sender.split('@')[0]}* ofrece:\n💰 ${coinsA} Coins\n📦 ${itemA ? itemA : 'Nada'}\n\n*@${target.split('@')[0]}*, ¿aceptas?\n\n> Para aceptar escribe: *${usedPrefix}aceptartrade @${m.sender.split('@')[0]}*\n> Para rechazar: *${usedPrefix}rechazartrade @${m.sender.split('@')[0]}*`,
        mentions: [m.sender, target]
      }, { quoted: m });
    }
  }
};
