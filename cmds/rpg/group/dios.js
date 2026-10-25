export default {
  command: ['dios', 'divino', 'bendecir', 'castigar'],
  category: 'group',
  isAdmin: true,
  desc: 'Poderes divinos del administrador para dar o quitar recursos.',
  usage: '<accion> <cantidad> <recurso> @usuario',

  async run(client, m, args, usedPrefix, command) {
    if (!m.isGroup) return m.reply('⚠️ El Dios solo puede manifestarse en grupos.');

    const chat = global.db.data.chats[m.chat] || {};
    if (!chat.users) chat.users = {};
    
    const target = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : (m.quoted ? m.quoted.sender : null);
    if (!target) return m.reply(`⚠️ *El Dios necesita un objetivo.*\nMenciona a alguien o responde a su mensaje.\n\n*Ejemplo:*\n${usedPrefix}${command} dar 1000 monedas @usuario`);
    if (target === m.sender) return m.reply('❌ No puedes usar tu poder divino sobre ti mismo.');
    if (target === client.user.id.split(':')[0] + '@s.whatsapp.net') return m.reply('❌ No puedes atacar al Dios mismo (el bot).');

    const user = chat.users[target] || (chat.users[target] = { coins: 0, exp: 0, vidas: 2, level: 1 });
    const moneda = chat.currencyName || 'Coins';
    const pushname = user.name || target.split('@')[0];

    // CASTIGO SUPREMO (Quitar todo o quitar vida)
    if (command === 'castigar') {
      user.coins = 0;
      user.exp = 0;
      if (user.vidas > 0) user.vidas -= 1;
      global.markPartitionDirty('chats');
      
      return client.sendMessage(m.chat, { 
        text: `⚡ *¡EL DIOS HA HABLADO!* ⚡\n\nUn rayo cae del cielo sobre *@${target.split('@')[0]}*.\n\n> 💸 Ha perdido todas sus ${moneda}.\n> 💥 Ha perdido toda su experiencia.\n> 🖤 Ha perdido una vida (Vidas restantes: ${user.vidas}).`, 
        mentions: [target] 
      }, { quoted: m });
    }

    // BENDICIÓN SUPREMA (Dar regalos aleatorios)
    if (command === 'bendecir') {
      const regaloCoins = Math.floor(Math.random() * 5000) + 1000;
      const regaloExp = Math.floor(Math.random() * 500) + 100;
      
      user.coins += regaloCoins;
      user.exp += regaloExp;
      global.markPartitionDirty('chats');
      
      return client.sendMessage(m.chat, { 
        text: `✨ *¡EL DIOS HA SIDO MISERICORDIOSO!* ✨\n\nUna luz celestial envuelve a *@${target.split('@')[0]}*.\n\n> 🎁 Ha recibido *${regaloCoins.toLocaleString()} ${moneda}*.\n> 🌟 Ha recibido *${regaloExp} XP*.`, 
        mentions: [target] 
      }, { quoted: m });
    }

    // COMANDOS MANUALES: dar / quitar
    if (command === 'dios' || command === 'divino') {
      const accion = (args[0] || '').toLowerCase(); // dar o quitar
      const cantidad = parseInt(args[1]);
      const recurso = (args[2] || '').toLowerCase(); // monedas, exp, vida

      if (!['dar', 'quitar'].includes(accion) || isNaN(cantidad) || cantidad <= 0) {
        return m.reply(`⚡ *COMANDOS DEL DIOS*\n\n*1. Bendecir (Aleatorio):*\n> ${usedPrefix}bendecir @usuario\n\n*2. Castigar (Quitar todo y una vida):*\n> ${usedPrefix}castigar @usuario\n\n*3. Dar/Quitar manualmente:*\n> ${usedPrefix}dios dar 500 monedas @usuario\n> ${usedPrefix}dios quitar 100 exp @usuario\n> ${usedPrefix}dios dar 1 vida @usuario`);
      }

      const esDar = accion === 'dar';

      if (recurso.includes('moneda') || recurso.includes('coin') || recurso.includes('dinero')) {
        if (esDar) user.coins += cantidad; else user.coins = Math.max(0, user.coins - cantidad);
        global.markPartitionDirty('chats');
        return m.reply(`⚡ El Dios ha *${esDar ? 'otorgado' : 'arrebatado'}* *${cantidad.toLocaleString()} ${moneda}* a @${target.split('@')[0]}.`, { mentions: [target] });
      }

      if (recurso.includes('exp') || recurso.includes('xp')) {
        if (esDar) user.exp += cantidad; else user.exp = Math.max(0, user.exp - cantidad);
        global.markPartitionDirty('chats');
        return m.reply(`⚡ El Dios ha *${esDar ? 'otorgado' : 'arrebatado'}* *${cantidad} XP* a @${target.split('@')[0]}.`, { mentions: [target] });
      }

      if (recurso.includes('vida')) {
        if (esDar) {
          if (user.vidas >= 2) return m.reply('❌ Esa persona ya tiene el máximo de vidas (2).');
          user.vidas += cantidad;
        } else {
          user.vidas = Math.max(0, user.vidas - cantidad);
        }
        global.markPartitionDirty('chats');
        return m.reply(`⚡ El Dios ha *${esDar ? 'restaurado' : 'drenado'}* vidas de @${target.split('@')[0]}.\n> Vidas actuales: ${user.vidas}/2`, { mentions: [target] });
      }

      return m.reply('❌ Recurso divino no reconocido. Usa: *monedas*, *exp*, o *vida*.');
    }
  }
};
