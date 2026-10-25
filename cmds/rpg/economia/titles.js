const CATALOGO_TITULOS = [
  { id: 'rey', nombre: '👑 Rey Absoluto', precio: 10000 },
  { id: 'leyenda', nombre: '🐉 Leyenda Viva', precio: 8000 },
  { id: 'mvp', nombre: '🏆 MVP del Grupo', precio: 5000 },
  { id: 'sombra', nombre: '🥷 Sombra Nocturna', precio: 3000 },
  { id: 'millonario', nombre: '💰 Millonario', precio: 2000 },
  { id: 'novato', nombre: '🥚 Novato Prometedor', precio: 500 }
];

export default {
  command: ['titulos', 'titles', 'comprartitulo', 'buytitle', 'usartitulo', 'usetitle', 'mytitles'],
  category: 'economia',
  desc: 'Compra o equipa títulos para tu perfil.',
  usage: '<ver | comprar <id> | usar <id>>',

  async run(client, m, args, usedPrefix, command) {
    const chat = global.db.data.chats[m.chat];
    if (!chat.users) chat.users = {};
    const user = chat.users[m.sender] || (chat.users[m.sender] = { coins: 0, inventory: [] });
    if (!user.inventory) user.inventory = [];
    
    const moneda = chat.currencyName || 'Coins';
    const targetId = (args[0] || '').toLowerCase();

    if (['titulos', 'titles'].includes(command)) {
      let texto = `👑 *TIENDA DE TÍTULOS*\nMoneda actual: *${moneda}*\n\n`;
      CATALOGO_TITULOS.forEach((t, i) => {
        texto += `*${i + 1}.* ${t.nombre}\n┃ 🆔 ID: \`${t.id}\`\n┃ 💰 Precio: *${t.precio.toLocaleString()} ${moneda}*\n\n`;
      });
      texto += `*» Cómo comprar:*\n> ${usedPrefix}comprartitulo <id>\n\n*» Cómo equipar:*\n> ${usedPrefix}usartitulo <id>`;
      return m.reply(texto);
    }

    if (command === 'mytitles') {
      if (user.inventory.length === 0) return m.reply('🎒 No tienes títulos comprados aún.');
      let texto = `🎒 *Tu Inventario de Títulos*\n\n`;
      user.inventory.forEach(id => {
        const t = CATALOGO_TITULOS.find(x => x.id === id);
        if (t) texto += `✧ ${t.nombre} (\`${t.id}\`)\n`;
      });
      texto += `\n*Título equipado:* \`${user.title || 'Ninguno'}\`\n\n> Equipar: ${usedPrefix}usartitulo <id>`;
      return m.reply(texto);
    }

    if (command === 'comprartitulo' || command === 'buytitle') {
      if (!targetId) return m.reply(`⚠️ Dime el ID del título. Usa *${usedPrefix}titulos* para verlos.`);
      const t = CATALOGO_TITULOS.find(x => x.id === targetId);
      if (!t) return m.reply('❌ Ese título no existe.');
      if (user.inventory.includes(t.id)) return m.reply('❌ Ya tienes este título.');
      if (user.coins < t.precio) return m.reply(`❌ Necesitas *${t.precio} ${moneda}* y tienes *${user.coins}*.`);

      user.coins -= t.precio;
      user.inventory.push(t.id);
      global.markPartitionDirty('chats');
      return m.reply(`✅ *¡Compra exitosa!*\nHas adquirido: ${t.nombre}\n\n_Equípalo con:_ *${usedPrefix}usartitulo ${t.id}*`);
    }

    if (command === 'usartitulo' || command === 'usetitle') {
      if (!targetId) return m.reply(`⚠️ Dime el ID del título.`);
      if (targetId === 'ninguno' || targetId === 'quitar') {
        user.title = null;
        global.markPartitionDirty('chats');
        return m.reply('✅ Has desequipado tu título.');
      }
      if (!user.inventory.includes(targetId)) return m.reply('❌ No tienes ese título.');
      
      const t = CATALOGO_TITULOS.find(x => x.id === targetId);
      user.title = t.nombre;
      global.markPartitionDirty('chats');
      return m.reply(`👑 *¡Título Equipado!*\nAhora te verán como: ${t.nombre}`);
    }
  }
};
