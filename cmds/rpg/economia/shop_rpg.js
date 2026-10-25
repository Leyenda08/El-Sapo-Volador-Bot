import { CLASES, EQUIPO } from '../../../utils/rpgData.js';

export default {
  command: ['tienda', 'shop', 'comprar', 'equipar', 'moequipo'],
  category: 'economia',
  desc: 'Sistema de tienda y equipamiento RPG.',

  async run(client, m, args, usedPrefix, command) {
    const chat = global.db.data.chats[m.chat] || {};
    if (!chat.users) chat.users = {};
    const user = chat.users[m.sender] || (chat.users[m.sender] = { coins: 0, level: 1, inventory: [], equipped: {} });
    if (!user.inventory) user.inventory = [];
    if (!user.equipped) user.equipped = { arma: null, armadura: null, mascota: null };

    const moneda = chat.currencyName || 'Coins';
    const todosLosItems = { ...EQUIPO, ...(chat.customItems || {}) };
    const targetId = (args[0] || '').toLowerCase();

    // TIENDA
    if (command === 'tienda' || command === 'shop') {
      if (!targetId) return m.reply(`🛒 *CATEGORÍAS DE LA TIENDA*\n\n> ${usedPrefix}tienda armas\n> ${usedPrefix}tienda armaduras\n> ${usedPrefix}tienda mascotas\n> ${usedPrefix}tienda prestigio`);
      
      let txt = `🛒 *TIENDA: ${targetId.toUpperCase()}*\nMoneda: *${moneda}*\n\n`;
      let encontrados = 0;

      for (const [id, item] of Object.entries(todosLosItems)) {
        let matchCat = item.tipo.startsWith(targetId.replace(/s$/, ''));
        if (targetId === 'prestigio' && id.startsWith('prestige_')) matchCat = true;

        if (matchCat) {
          encontrados++;
          txt += `*${item.nombre}* (\`${id}\`)\n`;
          txt += `┃ ⚔️ ${item.atk} | 🛡️ ${item.def} | ❤️ ${item.hp} | 💨 ${item.spd} | 🎯 ${item.crit}%\n`;
          txt += `┃ 💰 ${item.precio} ${moneda} | ⭐ Nvl ${item.nivelReq} ${item.prestigeReq ? '| ✨ Prestigio ' + item.prestigeReq : ''}\n\n`;
        }
      }
      if (encontrados === 0) return m.reply('❌ No hay ítems en esa categoría.');
      txt += `> Comprar: ${usedPrefix}comprar <id>`;
      return m.reply(txt);
    }

    // COMPRAR
    if (command === 'comprar') {
      const item = todosLosItems[targetId];
      if (!item) return m.reply('❌ Ese ítem no existe.');
      if (user.inventory.includes(targetId)) return m.reply('❌ Ya tienes este ítem.');
      if ((user.level || 1) < item.nivelReq) return m.reply(`❌ Necesitas nivel ${item.nivelReq}.`);
      if (item.prestigeReq && (user.prestige || 0) < item.prestigeReq) return m.reply(`❌ Necesitas ser *Prestigio ${item.prestigeReq}* para comprar esto.`);
      if (user.coins < item.precio) return m.reply(`❌ Necesitas ${item.precio} ${moneda}.`);

      user.coins -= item.precio;
      user.inventory.push(targetId);
      global.markPartitionDirty('chats');
      return m.reply(`✅ Has comprado *${item.nombre}*.\nEquípalo con: *${usedPrefix}equipar ${targetId}*`);
    }

    // EQUIPAR
    if (command === 'equipar') {
      if (!user.inventory.includes(targetId)) return m.reply('❌ No tienes ese ítem en tu inventario.');
      const item = EQUIPO[targetId];
      user.equipped[item.tipo] = targetId;
      global.markPartitionDirty('chats');
      return m.reply(`✅ Has equipado *${item.nombre}* en el espacio de ${item.tipo}.`);
    }

    // VER EQUIPO Y STATS
    if (command === 'moequipo') {
      const clase = user.clase ? CLASES[user.clase] : { nombre: '🧑‍🌾 Campesino (Sin clase)', hp: 100, atk: 10, def: 5, spd: 5, crit: 5 };
      let atkTotal = clase.atk, defTotal = clase.def, hpTotal = clase.hp, spdTotal = clase.spd, critTotal = clase.crit;

      let txt = `🛡️ *ESTADÍSTICAS DE ${m.pushName}*\n`;
      txt += `> Clase: *${clase.nombre}*\n`;
      if (user.prestige) txt += `> Rango: *✨ Prestigio ${user.prestige}*\n`;
      txt += `\n*» EQUIPAMIENTO ACTUAL*\n`;

      for (const [tipo, id] of Object.entries(user.equipped)) {
        if (!id) { txt += `✧ ${tipo}: _Vacío_\n`; continue; }
        const item = EQUIPO[id];
        if (item) {
          atkTotal += item.atk; defTotal += item.def; hpTotal += item.hp; spdTotal += item.spd; critTotal += item.crit;
          txt += `✧ ${tipo}: ${item.nombre}\n`;
        }
      }

      txt += `\n*» STATS TOTALES*\n❤️ HP: *${hpTotal}*\n⚔️ ATK: *${atkTotal}*\n🛡️ DEF: *${defTotal}*\n💨 SPD: *${spdTotal}*\n🎯 CRIT: *${critTotal}%*`;
      return m.reply(txt);
    }
  }
};
