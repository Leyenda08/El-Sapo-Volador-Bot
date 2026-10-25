export default {
  command: ['balance', 'bal', 'saldo', 'cartera'],
  category: 'economia',
  desc: 'Muestra tu saldo actual en el grupo.',

  async run(client, m, args, usedPrefix, command) {
    const chat = global.db.data.chats[m.chat];
    if (!chat.users) chat.users = {};
    
    let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : (m.quoted ? m.quoted.sender : m.sender);
    const user = chat.users[who] || { coins: 0 };
    const moneda = chat.currencyName || 'Coins';
    const nombre = who.split('@')[0];

    return m.reply(`💳 *Billetera de @${nombre}*\n\n> 💰 Saldo: *${(user.coins || 0).toLocaleString()} ${moneda}*`, { mentions: [who] });
  }
};
