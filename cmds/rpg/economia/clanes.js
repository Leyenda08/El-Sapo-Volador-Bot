export default {
  command: ['clan', 'crearclan', 'invitarclan', 'salirclan', 'donarclan', 'topclanes'],
  category: 'economia',
  desc: 'Sistema de clanes y gremios.',
  usage: '<crear | invitar | salir | donar | top>',

  async run(client, m, args, usedPrefix, command) {
    if (!global.db.data.clanes) global.db.data.clanes = {};
    const chat = global.db.data.chats[m.chat] || {};
    const user = chat.users?.[m.sender] || {};
    
    const clanes = global.db.data.clanes;
    let myClanId = Object.keys(clanes).find(id => clanes[id].miembros.includes(m.sender));

    // CREAR CLAN
    if (command === 'crearclan') {
      if (myClanId) return m.reply('❌ Ya estás en un clan. Sal de él primero.');
      const nombre = args.join(' ');
      if (!nombre) return m.reply(`⚠️ Uso: ${usedPrefix}crearclan <nombre>\nCosto: 50,000 Coins.`);
      if (user.coins < 50000) return m.reply('❌ Necesitas 50,000 Coins para fundar un clan.');

      const id = 'clan_' + Date.now();
      clanes[id] = { nombre, lider: m.sender, miembros: [m.sender], nivel: 1, banco: 0 };
      user.coins -= 50000;
      global.markPartitionDirty('chats');
      global.markPartitionDirty('clanes');

      return m.reply(`🏰 *¡CLAN FUNDADO!*\n\n*Nombre:* ${nombre}\n*Líder:* @${m.sender.split('@')[0]}\n\n_Invita a gente con: ${usedPrefix}clan invitar @usuario_`, { mentions: [m.sender] });
    }

    // INVITAR
    if (command === 'invitarclan') {
      if (!myClanId) return m.reply('❌ No tienes un clan.');
      if (clanes[myClanId].lider !== m.sender) return m.reply('❌ Solo el líder puede invitar.');
      const target = m.mentionedJid?.[0];
      if (!target) return m.reply('⚠️ Menciona a quién quieres invitar.');
      if (clanes[myClanId].miembros.includes(target)) return m.reply('❌ Ya está en tu clan.');

      clanes[myClanId].miembros.push(target);
      global.markPartitionDirty('clanes');
      return m.reply(`✅ @${target.split('@')[0]} ha sido añadido al clan *${clanes[myClanId].nombre}*.`, { mentions: [target] });
    }

    // DONAR
    if (command === 'donarclan') {
      if (!myClanId) return m.reply('❌ No estás en un clan.');
      const monto = parseInt(args[0]);
      if (!monto || monto <= 0) return m.reply('⚠️ Dime cuánto quieres donar al banco del clan.');
      if (user.coins < monto) return m.reply('❌ No tienes ese dinero.');

      user.coins -= monto;
      clanes[myClanId].banco += monto;
      
      // Subir de nivel si el banco llega a X cantidad
      if (clanes[myClanId].banco >= clanes[myClanId].nivel * 100000) {
        clanes[myClanId].nivel += 1;
        return m.reply(`🎉 *¡TU CLAN HA SUBIDO DE NIVEL!* Ahora es nivel *${clanes[myClanId].nivel}*.`);
      }
      
      global.markPartitionDirty('chats');
      global.markPartitionDirty('clanes');
      return m.reply(`💰 Has donado *${monto}* al clan. Banco actual: *${clanes[myClanId].banco}*.`);
    }

    // TOP CLANES
    if (command === 'topclanes') {
      const sorted = Object.values(clanes).sort((a, b) => b.nivel - a.nivel || b.banco - a.banco).slice(0, 10);
      let txt = `🏆 *TOP 10 CLANES*\n\n`;
      sorted.forEach((c, i) => {
        txt += `*${i + 1}.* ${c.nombre}\n┃ Nivel: ${c.nivel} | Miembros: ${c.miembros.length} | Banco: ${c.banco}\n\n`;
      });
      return m.reply(txt || 'No hay clanes aún.');
    }

    // INFO DEL CLAN
    if (command === 'clan') {
      if (!myClanId) return m.reply('❌ No estás en un clan. Crea uno con .crearclan');
      const c = clanes[myClanId];
      return m.reply(`🏰 *INFORMACIÓN DEL CLAN*\n\n*Nombre:* ${c.nombre}\n*Líder:* @${c.lider.split('@')[0]}\n*Nivel:* ${c.nivel}\n*Miembros:* ${c.miembros.length}\n*Banco:* ${c.banco} Coins`, { mentions: [c.lider] });
    }
  }
};
