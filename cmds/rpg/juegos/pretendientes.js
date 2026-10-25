export default {
  command: ['pretender', 'combateamor', 'pokebatalla'],
  category: 'juegos',
  desc: 'Pelea un duelo por el amor de alguien.',
  usage: '<@rival> <@princesa/principe>',

  async run(client, m, args, usedPrefix, command) {
    const chat = global.db.data.chats[m.chat] || {};
    if (!chat.users) chat.users = {};

    const rival = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : null;
    const target = m.mentionedJid && m.mentionedJid[1] ? m.mentionedJid[1] : null;

    if (!rival || !target) {
      return m.reply(`⚠️ Debes mencionar a tu rival y a la persona por la que pelean.\n*Ejemplo:* ${usedPrefix}pretender @rival @amor`);
    }
    if (rival === m.sender || target === m.sender) return m.reply('❌ No puedes pelear contra ti mismo o por ti mismo.');

    const userA = chat.users[m.sender] || (chat.users[m.sender] = {});
    const userB = chat.users[rival] || (chat.users[rival] = {});
    const userC = chat.users[target] || (chat.users[target] = {});

    if (userC.marriedTo) return m.reply(`💔 @${target.split('@')[0]} ya está casado/a con alguien más.`, { mentions: [target] });

    await m.reply(`⚔️ *¡COMBATE DE PRETENDIENTES INICIADO!* ⚔️\n\n> *@${m.sender.split('@')[0]}* VS *@${rival.split('@')[0]}*\n> _El premio: El corazón de @${target.split('@')[0]}_`, { mentions: [m.sender, rival, target] });

    // Simulador de combate Pokémon
    let hpA = 100;
    let hpB = 100;
    let log = `*» 📜 REGISTRO DE BATALLA*\n\n`;
    let turno = 1;

    // Ataques aleatorios
    const ataques = ['un golpe de fuego', 'un rayo congelante', 'una patada voladora', 'un ataque sorpresa', 'un poderoso rayo solar', 'un puñetazo eléctrico'];

    while (hpA > 0 && hpB > 0 && turno <= 5) {
      const ataqueA = ataques[Math.floor(Math.random() * ataques.length)];
      const dañoA = Math.floor(Math.random() * 30) + 10;
      hpB -= dañoA;
      log += `*Turno ${turno}:* @${m.sender.split('@')[0]} usa ${ataqueA}. (Daño: ${dañoA})\n`;

      if (hpB <= 0) break;

      const ataqueB = ataques[Math.floor(Math.random() * ataques.length)];
      const dañoB = Math.floor(Math.random() * 30) + 10;
      hpA -= dañoB;
      log += `*Turno ${turno}:* @${rival.split('@')[0]} usa ${ataqueB}. (Daño: ${dañoB})\n`;
      
      turno++;
    }

    // Pausa dramática
    await new Promise(r => setTimeout(r, 3000));

    let ganador;
    if (hpA > hpB) {
      ganador = m.sender;
      log += `\n💥 *¡@${rival.split('@')[0]} ha caído!*\n`;
    } else {
      ganador = rival;
      log += `\n💥 *¡@${m.sender.split('@')[0]} ha caído!*\n`;
    }

    // Se casan
    chat.users[ganador].marriedTo = target;
    chat.users[target].marriedTo = ganador;
    global.markPartitionDirty('chats');

    log += `\n🏆 *¡EL GANADOR ES @${ganador.split('@')[0]}!* 🏆\n\n💍 Por derecho de batalla, se ha casado con *@${target.split('@')[0]}*.`;

    return m.reply(log, { mentions: [m.sender, rival, target] });
  }
};
