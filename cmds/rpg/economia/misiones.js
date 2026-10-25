export default {
  command: ['misiones', 'mision', 'reclamar', 'crearmision'],
  category: 'economia',
  isAdmin: false, // El comando para crear verifica internamente si es admin
  desc: 'Sistema de misiones diarias.',
  usage: '<ver | reclamar <id> | crear>',

  async run(client, m, args, usedPrefix, command) {
    const chat = global.db.data.chats[m.chat] || {};
    if (!chat.users) chat.users = {};
    const user = chat.users[m.sender] || (chat.users[m.sender] = { coins: 0, stats: {} });
    
    const moneda = chat.currencyName || 'Coins';
    const accion = (args[0] || '').toLowerCase();
    const targetId = args[1];

    // CREAR MISIÓN (Solo Admin)
    if (command === 'crearmision') {
      if (!m.isAdmin) return m.reply('❌ Solo los administradores pueden crear misiones.');
      if (!chat.customMissions) chat.customMissions = [];
      
      // Uso: .crearmision "Nombre" <objetivo_msgs> <recompensa_coins> <recompensa_xp>
      const nombre = args[0] ? args[0].replace(/"/g, '') : 'Misión sin nombre';
      const meta = parseInt(args[1]);
      const rCoins = parseInt(args[2]);
      const rXp = parseInt(args[3]) || 0;

      if (!meta || !rCoins) return m.reply(`⚠️ *Uso correcto:*\n${usedPrefix}crearmision "Nombre de la mision" <mensajes_meta> <coins> <xp>\n\n*Ejemplo:*\n${usedPrefix}crearmision "Hablador" 50 5000 1000`);

      const id = 'm' + (chat.customMissions.length + 1);
      chat.customMissions.push({ id, nombre, meta, rCoins, rXp });
      global.markPartitionDirty('chats');

      return m.reply(`✅ *¡Misión creada!*\n👤 *Nombre:* ${nombre}\n🎯 *Objetivo:* Enviar ${meta} mensajes.\n🎁 *Recompensa:* ${rCoins} ${moneda} + ${rXp} XP.`);
    }

    // VER MISIONES
    if (command === 'misiones' || command === 'mision') {
      let txt = `📜 *TABLÓN DE MISIONES*\n\n`;
      const misionesBase = chat.customMissions || [];
      
      if (misionesBase.length === 0) {
        txt += `_No hay misiones activas en este grupo._\n> Los admins pueden crear una con ${usedPrefix}crearmision`;
      } else {
        const today = new Date().toISOString().split('T')[0];
        const msgsHoy = user.stats?.[today]?.msgs || 0;

        misionesBase.forEach(mis => {
          const progreso = Math.min(msgsHoy, mis.meta);
          const completado = progreso >= mis.meta ? '✅' : '⏳';
          txt += `${completado} *${mis.nombre}* (\`${mis.id}\`)\n`;
          txt += `┃ 🎯 Progreso: ${progreso}/${mis.meta} msgs hoy.\n`;
          txt += `┃ 🎁 Pago: ${mis.rCoins} ${moneda} + ${mis.rXp} XP\n\n`;
        });
        txt += `> Para reclamar: *${usedPrefix}misiones reclamar <id>*`;
      }
      return m.reply(txt);
    }

    // RECLAMAR MISIÓN
    if (command === 'reclamar' || accion === 'reclamar') {
      const idBuscar = (command === 'reclamar' ? args[0] : targetId) || '';
      const misionesBase = chat.customMissions || [];
      const mis = misionesBase.find(x => x.id === idBuscar);

      if (!mis) return m.reply('❌ Esa misión no existe. Revisa el tablón con .misiones.');

      const today = new Date().toISOString().split('T')[0];
      const msgsHoy = user.stats?.[today]?.msgs || 0;

      if (!user.completedMissions) user.completedMissions = [];
      if (user.completedMissions.includes(`${today}_${mis.id}`)) {
        return m.reply('❌ Ya has reclamado esta misión hoy. Vuelve mañana.');
      }

      if (msgsHoy < mis.meta) {
        return m.reply(`⏳ Aún no completas la misión.\nTe faltan *${mis.meta - msgsHoy} mensajes* por enviar hoy.`);
      }

      // Dar recompensa
      user.coins += mis.rCoins;
      user.exp += mis.rXp;
      user.completedMissions.push(`${today}_${mis.id}`);
      global.markPartitionDirty('chats');

      return m.reply(`🎉 *¡MISIÓN COMPLETADA!*\nHas reclamado: *${mis.nombre}*\n\n> 🪙 +${mis.rCoins} ${moneda}\n> ⭐ +${mis.rXp} XP`);
    }
  }
};
