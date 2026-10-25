export default {
  command: ['tragaperlas', 'perlas'],
  category: 'juegos',
  desc: 'Juega al tragamonedas de perlas.',

  async run(client, m, args, usedPrefix, command) {
    const chat = global.db.data.chats[m.chat] || {};
    const user = (chat.users && chat.users[m.sender]) || { coins: 0 };
    if (!chat.users) chat.users = {};
    if (!chat.users[m.sender]) chat.users[m.sender] = user;

    const moneda = chat.currencyName || 'Coins';
    const apuesta = parseInt(args[0]);

    if (!apuesta || apuesta <= 0) return m.reply(`⚠️ Debes apostar una cantidad.\nEj: ${usedPrefix}tragaperlas 100`);
    if (user.coins < apuesta) return m.reply(`❌ No tienes suficientes ${moneda}.`);

    const simbolos = ['🦪', '💎', '🐚', '🌊', '⚓', '🏴‍☠️'];
    const r1 = simbolos[Math.floor(Math.random() * simbolos.length)];
    const r2 = simbolos[Math.floor(Math.random() * simbolos.length)];
    const r3 = simbolos[Math.floor(Math.random() * simbolos.length)];

    let premio = 0;
    let msg = '';

    if (r1 === '🦪' && r2 === '🦪' && r3 === '🦪') {
      premio = apuesta * 15;
      msg = '💥 *¡TRIPLE PERLA! ¡JACKPOT!* 💥';
    } else if (r1 === r2 && r2 === r3) {
      premio = apuesta * 5;
      msg = '🔥 *¡TRIPLE! ¡Buen premio!* 🔥';
    } else if (r1 === r2 || r1 === r3 || r2 === r3) {
      premio = Math.floor(apuesta * 1.5);
      msg = '✨ *Dos iguales. Recuperas un poco.* ✨';
    } else {
      msg = '💸 *El mar se llevó tu apuesta...* 💸';
    }

    if (premio > 0) {
      user.coins += (premio - apuesta);
    } else {
      user.coins -= apuesta;
    }
    global.markPartitionDirty('chats');

    const txt = `
🦪 *TRAGA PERLAS* 🦪
┃
┃  ${r1} ┃ ${r2} ┃ ${r3}
┃
┣━━━━━━━━━━━━━━
┃ 💰 *Apuesta:* ${apuesta} ${moneda}
┃ 🏆 *Premio:* ${premio} ${moneda}
┃
┃ ${msg}
╰━━━━━━━━━━━━━━

> 💳 *Saldo:* ${user.coins.toLocaleString()} ${moneda}`;

    return m.reply(txt);
  }
};
