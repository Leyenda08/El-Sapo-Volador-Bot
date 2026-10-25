export default {
  command: ['raidboss', 'invocarjefe', 'atacarjefe'],
  category: 'juegos',
  desc: 'Invoca un jefe global para pelear en equipo.',
  isAdmin: true,

  async run(client, m, args, usedPrefix, command) {
    const chat = global.db.data.chats[m.chat] || {};
    if (!chat.raid) chat.raid = null;

    if (command === 'raidboss' || command === 'invocarjefe') {
      if (chat.raid && chat.raid.active) return m.reply('❌ Ya hay un jefe activo en este grupo.');
      
      const jefes = [
        { nombre: '🐉 Dragón Ancestral', hp: 5000, recompensa: 10000 },
        { nombre: '👹 Ogro Mutante', hp: 3000, recompensa: 5000 },
        { nombre: '🐙 Kraken del Abismo', hp: 7000, recompensa: 15000 }
      ];
      
      const jefeRandom = jefes[Math.floor(Math.random() * jefes.length)];
      
      chat.raid = {
        active: true,
        nombre: jefeRandom.nombre,
        hpMax: jefeRandom.hp,
        hpActual: jefeRandom.hp,
        recompensa: jefeRandom.recompensa,
        participantes: []
      };
      global.markPartitionDirty('chats');

      // Temporizador de 2 minutos para matarlo
      setTimeout(() => {
        if (chat.raid && chat.raid.active) {
          chat.raid.active = false;
          global.markPartitionDirty('chats');
          client.sendMessage(m.chat, { text: `☠️ *¡El jefe ${chat.raid.nombre} ha escapado!* El tiempo se ha agotado.` });
        }
      }, 120000);

      return m.reply(`🚨 *¡ALERTA DE JEFE GLOBAL!* 🚨\n\nUn *${jefeRandom.nombre}* (HP: ${jefeRandom.hp}) ha aparecido en el grupo.\n\n> ¡Todos tienen 2 minutos para atacarlo!\n> Escriban *${usedPrefix}atacarjefe* para hacer daño.`);
    }

    if (command === 'atacarjefe') {
      if (!chat.raid || !chat.raid.active) return m.reply('❌ No hay ningún jefe activo ahora mismo.');

      // Daño basado en el nivel
      const user = chat.users[m.sender] || {};
      const nivel = user.level || 1;
      const daño = (nivel * 10) + Math.floor(Math.random() * 50);
      
      chat.raid.hpActual -= daño;
      if (!chat.raid.participantes.includes(m.sender)) chat.raid.participantes.push(m.sender);

      if (chat.raid.hpActual <= 0) {
        chat.raid.active = false;
        // Repartir recompensa
        const totalGanadores = chat.raid.participantes.length;
        const pago = Math.floor(chat.raid.recompensa / totalGanadores);

        chat.raid.participantes.forEach(jid => {
          if (chat.users[jid]) chat.users[jid].coins += pago;
        });

        const jefeNombre = chat.raid.nombre;
        global.markPartitionDirty('chats');

        return client.sendMessage(m.chat, {
          text: `💀 *¡EL JEFE HA SIDO DERROTADO!* 💀\n\nEl *${jefeNombre}* ha caído.\n\n> 🎁 Recompensa total: *${chat.raid.recompensa} Coins*\n> 💰 Cada participante ha recibido *${pago} Coins*.\n\n*Participantes:*\n${chat.raid.participantes.map(p => `@${p.split('@')[0]}`).join('\n')}`,
          mentions: chat.raid.participantes
        }, { quoted: m });
      } else {
        global.markPartitionDirty('chats');
        return m.reply(`⚔️ @${m.sender.split('@')[0]} atacó al jefe e infligió *${daño} de daño*.\n\n*HP del Jefe:* ${chat.raid.hpActual} / ${chat.raid.hpMax}`, { mentions: [m.sender] });
      }
    }
  }
};
