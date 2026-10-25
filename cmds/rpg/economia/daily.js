export default {
  command: ['daily', 'diario', 'cobrar'],
  category: 'economia',
  desc: 'Reclama tu recompensa diaria de monedas.',

  async run(client, m, args, usedPrefix, command) {
    const chat = global.db.data.chats[m.chat];
    if (!chat.users) chat.users = {};
    const user = chat.users[m.sender] || (chat.users[m.sender] = { vidas: 2, coins: 0 });

    const ahora = Date.now();
    const ultimaVez = user.lastDaily || 0;
    const cooldown = 24 * 60 * 60 * 1000;

    if (ahora - ultimaVez < cooldown) {
      const tiempoRestante = cooldown - (ahora - ultimaVez);
      const horas = Math.floor(tiempoRestante / (1000 * 60 * 60));
      const minutos = Math.floor((tiempoRestante % (1000 * 60 * 60)) / (1000 * 60));
      return m.reply(`⏳ Ya reclamaste tu recompensa hoy.\nVuelve en *${horas}h y ${minutos}m*.`);
    }

    const nivel = user.level || 1;
    const recompensa = 100 * nivel; 
    const moneda = chat.currencyName || 'Coins';

    user.coins = (user.coins || 0) + recompensa;
    user.lastDaily = ahora;
    global.markPartitionDirty('chats');

    return m.reply(`🎁 *¡Recompensa Diaria!*\n\nHas recibido *${recompensa.toLocaleString()} ${moneda}*.\nTu saldo actual es: *${user.coins.toLocaleString()} ${moneda}*.\n\n_Nivel actual: ${nivel}_`);
  }
};
