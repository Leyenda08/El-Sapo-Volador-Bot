export default {
  command: ['verhijos', 'hijos', 'casarse_hijo'],
  category: 'profile',
  desc: 'Ver a tus hijos, su edad y casarlos.',

  async run(client, m, args, usedPrefix, command) {
    const chat = global.db.data.chats[m.chat] || {};
    if (!chat.users) chat.users = {};
    const user = chat.users[m.sender] || (chat.users[m.sender] = {});

    // 1. VERIFICAR NACIMIENTO AUTOMÁTICO
    if (user.embarazo && Date.now() >= user.embarazo.fin) {
      if (!user.hijos) user.hijos = [];
      
      const bebeId = `bebe_${Date.now()}`;
      const nuevoBebe = {
        id: bebeId,
        nombre: user.embarazo.genero === 'Niño' ? 'Bebé (Niño)' : 'Bebé (Niña)',
        genero: user.embarazo.genero,
        padres: [m.sender, user.embarazo.pareja],
        nacimiento: Date.now(),
        casadoCon: null
      };
      
      user.hijos.push(nuevoBebe);
      
      // Registrar también en el otro padre
      const targetUser = chat.users[user.embarazo.pareja];
      if (targetUser) {
        if (!targetUser.hijos) targetUser.hijos = [];
        targetUser.hijos.push(nuevoBebe);
      }

      await m.reply(`🎉 *¡EL BEBÉ HA NACIDO!* 🎉\n\n> @${m.sender.split('@')[0]} y @${user.embarazo.pareja.split('@')[0]}\n> Han tenido un hermoso *${nuevoBebe.genero}*.\n\n_Usa ${usedPrefix}hijos para verlo._`, { mentions: [m.sender, user.embarazo.pareja] });
      
      delete user.embarazo;
      global.markPartitionDirty('chats');
      return;
    }

    if (user.embarazo) {
      const tiempoRestante = user.embarazo.fin - Date.now();
      const horas = Math.floor(tiempoRestante / (1000 * 60 * 60));
      const minutos = Math.floor((tiempoRestante % (1000 * 60 * 60)) / (1000 * 60));
      return m.reply(`🤰 *Estás embarazada.*\nFaltan *${horas}h y ${minutos}m* para que nazca tu bebé.`);
    }

    // 2. VER HIJOS
    if (command === 'verhijos' || command === 'hijos') {
      if (!user.hijos || user.hijos.length === 0) return m.reply('👶 No tienes hijos aún. Usa .tenerbebe @pareja (deben estar casados).');
      
      let txt = `👨‍👩‍👧 *TUS HIJOS*\n\n`;
      user.hijos.forEach(h => {
        const edadMs = Date.now() - h.nacimiento;
        const edadDias = Math.floor(edadMs / (1000 * 60 * 60 * 24));
        const estadoCivil = h.casadoCon ? `Casado/a con @${h.casadoCon.split('@')[0]}` : 'Soltero/a';
        
        txt += `*${h.nombre}* (${h.genero})\n`;
        txt += `┃ 🎂 Edad: ${edadDias} días (o ${Math.floor(edadMs / (1000 * 60 * 60))} horas)\n`;
        txt += `┃ 💍 ${estadoCivil}\n`;
        txt += `┃ 🆔 ID: \`${h.id}\`\n\n`;
      });
      return m.reply(txt.trim());
    }

    // 3. CASAR A UN HIJO (Cuando cumpla 1 día de edad)
    if (command === 'casarse_hijo') {
      if (!user.hijos || user.hijos.length === 0) return m.reply('❌ No tienes hijos.');
      
      const hijoId = args[0];
      const target = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : null;
      
      if (!hijoId || !target) return m.reply(`⚠️ Uso: ${usedPrefix}casarse_hijo <id_del_hijo> @usuario`);

      const hijo = user.hijos.find(h => h.id === hijoId);
      if (!hijo) return m.reply('❌ ID de hijo no válido.');
      if (hijo.casadoCon) return m.reply('❌ Tu hijo ya está casado.');

      // Verificar edad (Mínimo 1 día para simular crecimiento)
      const edadDias = (Date.now() - hijo.nacimiento) / (1000 * 60 * 60 * 24);
      if (edadDias < 1) {
        return m.reply(`⏳ Tu hijo aún es muy pequeño para casarse.\nDebe tener al menos 1 día de vida. Actualmente tiene ${Math.floor(edadDias * 24)} horas.`);
      }

      // Casarlo
      hijo.casadoCon = target;
      const targetUser = chat.users[target] || (chat.users[target] = {});
      if (!targetUser.marriedTo) targetUser.marriedTo = m.sender; // El padre arregla el matrimonio
      
      global.markPartitionDirty('chats');

      return m.reply(`💍 *¡BODA ARREGLADA!*\n\nTu hijo/a *${hijo.nombre}* se ha casado con *@${target.split('@')[0]}*.\n\n_El padre de la criatura ha pagado la dote._`, { mentions: [target] });
    }
  }
};
