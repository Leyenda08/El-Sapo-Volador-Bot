export default {
  command: ['duelo', 'pistolas', 'batalla', 'princesa'],
  category: 'juegos',
  desc: 'Desafía a alguien a un duelo o pelea por la princesa.',
  usage: '<@usuario> <apuesta>',

  async run(client, m, args, usedPrefix, command) {
    const chat = global.db.data.chats[m.chat] || {};
    if (!chat.users) chat.users = {};
    
    const user = chat.users[m.sender] || (chat.users[m.sender] = { coins: 0 });
    const target = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : null;
    const moneda = chat.currencyName || 'Coins';

    if (!target) return m.reply(`⚠️ Debes mencionar a tu oponente.\nEj: *${usedPrefix}${command} @usuario 100*`);
    if (target === m.sender) return m.reply('❌ No puedes pelear contra ti mismo.');
    
    const targetUser = chat.users[target] || (chat.users[target] = { coins: 0 });
    
    // Si es batalla por la princesa, no requiere apuesta
    let apuesta = 0;
    const isBatalla = command === 'batalla' || command === 'princesa';
    
    if (!isBatalla) {
      apuesta = parseInt(args[1] || args[0]);
      if (!apuesta || apuesta <= 0) return m.reply('⚠️ Debes apostar monedas para el duelo.');
      if (user.coins < apuesta) return m.reply(`❌ No tienes suficientes ${moneda}.`);
      if (targetUser.coins < apuesta) return m.reply(`❌ Tu oponente no tiene suficientes ${moneda}.`);
    }

    await m.reply(`⏳ *Preparando el combate...*\n@${target.split('@')[0]}, prepárate.`, { mentions: [target] });

    // 3 segundos de tensión
    await new Promise(r => setTimeout(r, 3000));

    let ganador;
    let texto = '';

    if (!isBatalla) {
      // DUELO DE PISTOLAS (50/50)
      const tiro = Math.random() < 0.5;
      ganador = tiro ? m.sender : target;
      const perdedor = tiro ? target : m.sender;
      
      user.coins -= apuesta;
      targetUser.coins -= apuesta;
      
      // El ganador se lleva todo el bote (apuesta x2)
      chat.users[ganador].coins += (apuesta * 2);
      
      texto = `🔫 *¡BANG! ¡BANG!* 🔫\n\n> El humo se disipa...\n\n🏆 El ganador del duelo es: *@${ganador.split('@')[0]}*\n\n💰 Se lleva el bote de *${apuesta * 2} ${moneda}*.\n\n_El perdedor tendrá su revancha._`;
    } else {
      // BATALLA POR LA PRINCESA
      // Usamos el nivel o pura suerte
      const fuerzaUser = (user.level || 1) + Math.floor(Math.random() * 10);
      const fuerzaTarget = (targetUser.level || 1) + Math.floor(Math.random() * 10);
      
      ganador = fuerzaUser >= fuerzaTarget ? m.sender : target;
      
      texto = `⚔️ *¡BATALLA POR LA PRINCESA!* 👑\n\n> Las espadas chocan y la arena se tiñe de gloria...\n\n🏆 El caballero victorioso es: *@${ganador.split('@')[0]}*\n\n👑 Ha ganado el corazón de la princesa y el derecho a presumirlo en el grupo.`;
    }

    global.markPartitionDirty('chats');
    return m.reply(texto, { mentions: [m.sender, target] });
  }
};
