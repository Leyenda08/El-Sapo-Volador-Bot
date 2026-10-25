import fs from 'fs';

const accionesBase = {
  besar: ['le dio un beso apasionado a', 'besó tiernamente a'],
  abrazar: ['le dio un abrazo reconfortante a', 'se aferró a'],
  acariciar: ['acarició el cabello de', 'le hizo cariñitos a'],
  golpear: ['le metió un puñetazo en la cara a', 'le dio una paliza a'],
  matar: ['eliminó sin piedad a', 'fulminó a']
};

export default {
  command: ['besar', 'abrazar', 'acariciar', 'golpear', 'matar'],
  category: 'reactions',
  desc: 'Interacciones sociales con otros usuarios.',

  async run(client, m, args, usedPrefix, command) {
    const target = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : null;
    if (!target) return m.reply(`⚠️ Debes mencionar a alguien.\nEjemplo: *${usedPrefix}${command} @usuario*`);
    if (target === m.sender) return m.reply('❌ Hazlo con otra persona, no contigo mismo.');

    const chat = global.db.data.chats[m.chat];
    
    // 1. VERIFICAR SI ES UNA INTERACCIÓN CREADA POR EL ADMIN
    if (chat && chat.customInteractions && chat.customInteractions[command]) {
      const inter = chat.customInteractions[command];
      const texto = `${inter.emoji} *@${m.sender.split('@')[0]}* ${inter.textoAccion} *@${target.split('@')[0]}* ${inter.emoji}`;
      
      // Si tiene media guardada
      if (inter.media && fs.existsSync(inter.media.path)) {
        const payload = {
          [inter.media.type]: await fs.promises.readFile(inter.media.path),
          mimetype: inter.media.mime,
          caption: texto,
          mentions: [m.sender, target]
        };
        
        // Si es video (GIF), activar gifPlayback
        if (inter.media.type === 'video') payload.gifPlayback = true;
        
        return client.sendMessage(m.chat, payload, { quoted: m });
      } else {
        // Solo texto
        return m.reply(texto, { mentions: [m.sender, target] });
      }
    }

    // 2. SI ES UNA ACCIÓN BASE (Besar, abrazar, etc.)
    const listaAcciones = accionesBase[command];
    if (!listaAcciones) return;

    const accionRandom = listaAcciones[Math.floor(Math.random() * listaAcciones.length)];
    const emojis = { besar: '💋', abrazar: '🫂', acariciar: '🫳', golpear: '👊', matar: '🔪' };
    const emoji = emojis[command] || '✨';

    return m.reply(`${emoji} *@${m.sender.split('@')[0]}* ${accionRandom} *@${target.split('@')[0]}* ${emoji}`, { mentions: [m.sender, target] });
  }
};
