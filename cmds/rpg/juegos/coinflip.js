export default {
  command: ['coinflip', 'cf', 'moneda'],
  category: 'juegos',
  desc: 'Apuesta monedas al cara o cruz.',

  async run(client, m, args, usedPrefix, command) {
    const chat = global.db.data.chats[m.chat];
    if (!chat.users) chat.users = {};
    const user = chat.users[m.sender] || (chat.users[m.sender] = { coins: 0 });
    
    const monedaName = chat.currencyName || 'Coins';
    const monto = parseInt(args[0]);
    const eleccion = (args[1] || 'cara').toLowerCase();

    if (!monto || monto <= 0) return m.reply(`⚠️ Debes apostar una cantidad.\nEjemplo: *${usedPrefix}cf 100 cara*`);
    if (user.coins < monto) return m.reply(`❌ No tienes suficiente saldo. Tienes *${user.coins} ${monedaName}*.`);
    if (!['cara', 'cruz'].includes(eleccion)) return m.reply(`⚠️ Elige *cara* o *cruz*.`);

    const resultado = Math.random() < 0.5 ? 'cara' : 'cruz';
    
    if (resultado === eleccion) {
      const ganancia = Math.floor(monto * 1.9);
      user.coins += ganancia;
      global.markPartitionDirty('chats');
      return m.reply(`🪙 Salió *${resultado.toUpperCase()}*\n\n🎉 ¡Ganaste! +*${ganancia} ${monedaName}*\n💰 Nuevo saldo: *${user.coins}*`);
    } else {
      user.coins -= monto;
      global.markPartitionDirty('chats');
      return m.reply(`🪙 Salió *${resultado.toUpperCase()}*\n\n💸 Perdiste... -*${monto} ${monedaName}*\n💰 Nuevo saldo: *${user.coins}*`);
    }
  }
};
