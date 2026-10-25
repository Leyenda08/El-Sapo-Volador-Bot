export default {
  command: ['castigarclan', 'destruirclan'],
  category: 'owner',
  isOwner: true, // Solo el dueño del bot puede usar este castigo supremo
  desc: 'Castiga a un clan entero por faltas graves.',
  usage: '<accion> @miembro (ej: .castigarclan banco @juan)',

  async run(client, m, args, usedPrefix, command) {
    const target = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : (m.quoted ? m.quoted.sender : null);
    if (!target) return m.reply(`⚠️ Menciona a un miembro del clan o responde a su mensaje.\n\n*Acciones:*\n> ${usedPrefix}castigarclan banco @user (Vacía el banco)\n> ${usedPrefix}castigarclan nivel @user (Baja 1 nivel)\n> ${usedPrefix}castigarclan destruir @user (Elimina el clan)`);

    if (!global.db.data.clanes) global.db.data.clanes = {};
    const clanes = global.db.data.clanes;

    // Buscar a qué clan pertenece el usuario
    const clanId = Object.keys(clanes).find(id => clanes[id].miembros.includes(target));
    if (!clanId) return m.reply(`❌ @${target.split('@')[0]} no pertenece a ningún clan.`, { mentions: [target] });

    const clan = clanes[clanId];
    const accion = (args[0] || '').toLowerCase();

    // ACCIÓN: VACIAR BANCO
    if (accion === 'banco') {
      const dineroRobado = clan.banco;
      clan.banco = 0;
      global.markPartitionDirty('clanes');
      return m.reply(`⚡ *¡CASTIGO DIVINO AL CLAN ${clan.nombre.toUpperCase()}!* ⚡\n\nEl Dios ha vaciado las arcas del clan.\n> 💸 Se han confiscado *${dineroRobado.toLocaleString()} Coins*.`);
    }

    // ACCIÓN: BAJAR NIVEL
    if (accion === 'nivel') {
      if (clan.nivel > 1) {
        clan.nivel -= 1;
        clan.banco = 0; // También pierden el banco por la vergüenza
        global.markPartitionDirty('clanes');
        return m.reply(`⚡ *¡CASTIGO DIVINO!* ⚡\n\nEl clan *${clan.nombre}* ha sido humillado y desciende al nivel *${clan.nivel}*.\n> _Su banco ha sido saqueado._`);
      } else {
        return m.reply(`❌ El clan *${clan.nombre}* ya está en el nivel más bajo. Usa *destruir* si quieres eliminarlo.`);
      }
    }

    // ACCIÓN: DESTRUIR CLAN
    if (accion === 'destruir' || accion === 'disolver') {
      delete clanes[clanId];
      global.markPartitionDirty('clanes');
      return m.reply(`☠️ *¡EL CLAN ${clan.nombre.toUpperCase()} HA SIDO DESTRUIDO!* ☠️\n\nEl Dios ha borrado su nombre de la historia. Todos sus miembros ahora están solos.`);
    }

    return m.reply('❌ Acción no válida. Usa: *banco*, *nivel* o *destruir*.');
  }
};
