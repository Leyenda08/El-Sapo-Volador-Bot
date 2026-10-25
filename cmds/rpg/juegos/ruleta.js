export default {
  command: ['ruleta', 'roulette'],
  category: 'juegos',
  desc: 'Apuesta a la ruleta.',
  usage: '<monto> <rojo|negro|verde>',

  async run(client, m, args, usedPrefix, command) {
    const chat = global.db.data.chats[m.chat] || {};
    if (!chat.users) chat.users = {};
    const user = chat.users[m.sender] || (chat.users[m.sender] = { coins: 0 });
    
    const moneda = chat.currencyName || 'Coins';
    const monto = parseInt(args[0]);
    const color = (args[1] || '').toLowerCase();

    if (!monto || monto <= 0) return m.reply(`⚠️ Debes apostar un monto.\nEj: *${usedPrefix}ruleta 100 rojo*`);
    if (user.coins < monto) return m.reply(`❌ Saldo insuficiente. Tienes *${user.coins} ${moneda}*.`);
    if (!['rojo', 'negro', 'verde'].includes(color)) return m.reply(`⚠️ Elige *rojo*, *negro* o *verde*.`);

    await m.reply(`🎡 *Girando la ruleta...*`);

    // Número aleatorio 0-36
    const num = Math.floor(Math.random() * 37);
    const rojos = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
    
    let colorResultado = 'negro';
    if (num === 0) colorResultado = 'verde';
    else if (rojos.includes(num)) colorResultado = 'rojo';

    // Pausa dramática
    await new Promise(r => setTimeout(r, 2500));

    let premio = 0;
    let estado = '';

    if (color === colorResultado) {
      if (color === 'verde') {
        premio = monto * 14;
        estado = '💥 *¡EL CERO VERDE! ¡PAGO MÁXIMO!* 💥';
      } else {
        premio = monto * 2;
        estado = '🎉 *¡COLOR ACERTADO!* 🎉';
      }
      user.coins += premio;
    } else {
      user.coins -= monto;
      estado = '💸 *La bola cayó en tu contra.* 💸';
    }

    global.markPartitionDirty('chats');

    const emojiColor = colorResultado === 'rojo' ? '🔴' : (colorResultado === 'negro' ? '⚫' : '🟢');
    return m.reply(`🎡 La bola cayó en el *${num} ${emojiColor}* (${colorResultado.toUpperCase()})\n\n${estado}\n\n> 💳 Saldo: *${user.coins.toLocaleString()} ${moneda}*`);
  }
};
