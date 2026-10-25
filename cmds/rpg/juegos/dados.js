export default {
  command: ['dados', 'dice'],
  category: 'juegos',
  desc: 'Apuesta a la suma de dos dados.',
  usage: '<monto> <mayor|menor|7>',

  async run(client, m, args, usedPrefix, command) {
    const chat = global.db.data.chats[m.chat] || {};
    if (!chat.users) chat.users = {};
    const user = chat.users[m.sender] || (chat.users[m.sender] = { coins: 0 });
    
    const moneda = chat.currencyName || 'Coins';
    const monto = parseInt(args[0]);
    const prediccion = (args[1] || '').toLowerCase();

    if (!monto || monto <= 0) return m.reply(`⚠️ Debes apostar un monto.\nEj: *${usedPrefix}dados 100 mayor*`);
    if (user.coins < monto) return m.reply(`❌ Saldo insuficiente. Tienes *${user.coins} ${moneda}*.`);
    if (!['mayor', 'menor', '7'].includes(prediccion)) return m.reply(`⚠️ Elige *mayor* (8-12), *menor* (2-6) o *7* (exacto).`);

    await m.reply(`🎲 *Lanzando los dados...*`);

    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    const suma = d1 + d2;

    await new Promise(r => setTimeout(r, 2000));

    let premio = 0;
    let estado = '';
    let gano = false;

    if (prediccion === '7' && suma === 7) {
      premio = monto * 5;
      gano = true;
      estado = '💥 *¡SIETE EXACTO! ¡PAGO x5!* 💥';
    } else if (prediccion === 'mayor' && suma > 7 && suma < 13) {
      premio = monto * 2;
      gano = true;
      estado = '🎉 *¡MAYOR! ¡BIEN JUGADO!* 🎉';
    } else if (prediccion === 'menor' && suma < 7 && suma > 1) {
      premio = monto * 2;
      gano = true;
      estado = '🎉 *¡MENOR! ¡BIEN JUGADO!* 🎉';
    } else {
      estado = '💸 *Salió el número equivocado.* 💸';
    }

    if (gano) user.coins += premio;
    else user.coins -= monto;

    global.markPartitionDirty('chats');

    return m.reply(`🎲 *Dado 1:* ${d1}\n🎲 *Dado 2:* ${d2}\n\n*Total:* ${suma}\n\n${estado}\n\n> 💳 Saldo: *${user.coins.toLocaleString()} ${moneda}*`);
  }
};
