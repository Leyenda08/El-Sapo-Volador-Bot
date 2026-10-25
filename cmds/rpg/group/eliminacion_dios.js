export default {
  command: ['eliminacion', 'dios', 'juicio', 'castigo'],
  category: 'group',
  isAdmin: true,
  botAdmin: true,
  desc: 'El Dios del grupo juzga a los inactivos y les quita vidas.',
  usage: '<dias> (por defecto 3)',

  async run(client, m, args, usedPrefix, command) {
    if (!m.isGroup) return m.reply('⚠️ Este ritual solo funciona en grupos.');

    const diasInactividad = parseInt(args[0]) || 3;
    const msInactividad = diasInactividad * 24 * 60 * 60 * 1000;
    const ahora = Date.now();
    const chat = global.db.data.chats[m.chat];

    if (!chat.users) chat.users = {};

    const groupMetadata = await client.groupMetadata(m.chat);
    const participants = groupMetadata.participants;

    let perdedores = [];
    let expulsados = [];
    let sobrevivientes = 0;
    let protegidos = 0;

    await m.reply(`⚡ *EL DIOS HA DESPERTADO* ⚡\n> _Juzgando la inactividad de los últimos *${diasInactividad} días*..._`);

    // Pequeña pausa dramática para el efecto
    await new Promise(r => setTimeout(r, 3000));

    for (const p of participants) {
      const jid = p.id || p.jid || p.phoneNumber;
      if (!jid) continue;
      
      // El bot y los admins están exentos del juicio
      if (jid === (client.user.id.split(':')[0] + '@s.whatsapp.net')) continue;
      if (p.admin === 'admin' || p.admin === 'superadmin') continue;

      const user = chat.users[jid] || (chat.users[jid] = {});
      
      if (user.vidas === undefined) user.vidas = 2;
      if (user.vidas <= 0) continue; // Ya está muerto

      const ultimaActividad = user.lastCmd || user.ultimaVez || 0;
      
      if (ahora - ultimaActividad > msInactividad) {
        // Revisar si tiene escudo
        if (user.shield) {
          user.shield = false; // El escudo absorbe el daño
          protegidos++;
          continue;
        }

        user.vidas -= 1;

        if (user.vidas <= 0) {
          // El Dios lo destierra
          try {
            await client.groupParticipantsUpdate(m.chat, [jid], 'remove');
            expulsados.push(jid);
          } catch (e) {
            perdedores.push(jid);
          }
        } else {
          perdedores.push(jid);
        }
      } else {
        sobrevivientes++;
      }
    }

    global.markPartitionDirty('chats');

    let texto = `*» ⚖️ RESULTADOS DEL JUICIO DIVINO ⚖️*\n\n`;
    texto += `🕊️ *Fieles (Activos):* ${sobrevivientes}\n\n`;

    if (protegidos > 0) {
      texto += `🛡️ *Protegidos por Escudo:* ${protegidos}\n\n`;
    }

    if (perdedores.length > 0) {
      texto += `*» 💔 CASTIGADOS (Pierden 1 vida)*\n> _El Dios les da una última oportunidad._\n\n`;
      perdedores.forEach(jid => { texto += `✧ @${jid.split('@')[0]}\n`; });
      texto += `\n`;
    }

    if (expulsados.length > 0) {
      texto += `*» 🔥 CONDENADOS AL DESTIERRO*\n> _Sus almas se apagaron (0 vidas)._ \n\n`;
      expulsados.forEach(jid => { texto += `✧ @${jid.split('@')[0]}\n`; });
    }

    if (perdedores.length === 0 && expulsados.length === 0) {
      texto += `🎉 *El Dios está complacido. Todos están activos y a salvo.*`;
    }

    texto += `\n\n> _Los mortales pueden ver sus vidas con .perfil_`;

    await client.sendMessage(m.chat, { 
      text: texto, 
      mentions: [...perdedores, ...expulsados] 
    }, { quoted: m });
  }
};
