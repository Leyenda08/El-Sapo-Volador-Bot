export default {
  command: ['tienda', 'shop', 'buy', 'comprar'],
  category: 'economia',
  desc: 'Compra vidas o escudos en el grupo.',
  usage: '<vida|escudo>',

  async run(client, m, args, usedPrefix, command) {
    const chat = global.db.data.chats[m.chat];
    if (!chat.users) chat.users = {};
    const user = chat.users[m.sender] || (chat.users[m.sender] = { coins: 0, vidas: 2 });
    const moneda = chat.currencyName || 'Coins';

    const accion = (args[0] || '').toLowerCase();

    if (command === 'tienda' || command === 'shop' || !accion) {
      return m.reply(`🛒 *TIENDA DEL GRUPO*\n\nMoneda actual: *${moneda}*\n\n┃ ❤️ *Comprar Vida* (5000 ${moneda})\n┃ Usa: *${usedPrefix}comprar vida*\n┃ _Recuperas 1 vida si estás en 1/2._\n\n┃ 🛡️ *Comprar Escudo* (3000 ${moneda})\n┃ Usa: *${usedPrefix}comprar escudo*\n┃ _Te protege de perder 1 vida en la próxima masacre._`);
    }

    if (accion === 'vida') {
      if (user.coins < 5000) return m.reply(`❌ Necesitas 5000 ${moneda}.`);
      if (user.vidas >= 2) return m.reply(`❌ Ya tienes el máximo de vidas (2/2).`);
      
      user.coins -= 5000;
      user.vidas += 1;
      global.markPartitionDirty('chats');
      return m.reply(`✅ *¡Has comprado una vida!*\nAhora tienes ❤️ ${user.vidas}/2`);
    }

    if (accion === 'escudo') {
      if (user.coins < 3000) return m.reply(`❌ Necesitas 3000 ${moneda}.`);
      if (user.shield) return m.reply(`❌ Ya tienes un escudo activo.`);
      
      user.coins -= 3000;
      user.shield = true;
      global.markPartitionDirty('chats');
      return m.reply(`✅ *¡Has comprado un Escudo!* 🛡️\nTe protegerá de la próxima masacre.`);
    }
  }
};
