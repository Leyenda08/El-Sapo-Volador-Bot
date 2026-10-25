import fs from './fs';
import path from './path';

export default {
  command: ['crearinteraccion', 'nuevaaccion'],
  category: 'group',
  isAdmin: true,
  desc: 'Crea una nueva acción (puede incluir imagen/GIF/video).',
  usage: '<comando> <emoji> <texto> (responde a un gif/video)',

  async run(client, m, args, usedPrefix, command) {
    if (!m.isGroup) return m.reply('⚠️ Solo funciona en grupos.');
    const chat = global.db.data.chats[m.chat];
    if (!chat.customInteractions) chat.customInteractions = {};

    if (args.length < 3) {
      return m.reply(`⚠️ *Uso:*\n${usedPrefix}crearinteraccion <comando> <emoji> <texto>\n\n*Ejemplo con texto:*\n${usedPrefix}crearinteraccion morder 🧛 "le mordió el cuello a"\n\n*Ejemplo con GIF:*\n(Responde a un GIF) ${usedPrefix}crearinteraccion bofetada 👋 "le dio una bofetada a"`);
    }

    const cmd = args[0].toLowerCase().replace(/\./g, '');
    const emoji = args[1];
    const textoAccion = args.slice(2).join(' ').replace(/"/g, '');

    // Si existía antes, borramos su media vieja
    if (chat.customInteractions[cmd] && chat.customInteractions[cmd].media) {
      try { fs.unlinkSync(chat.customInteractions[cmd].media.path); } catch {}
    }

    let mediaData = null;
    const q = m.quoted ? m.quoted : m;
    const mime = (q.msg || q).mimetype || '';

    if (mime && /image|video/.test(mime)) {
      await m.reply('⏳ Descargando y guardando el GIF/Video...');
      try {
        const buffer = await q.download();
        const dir = path.join(process.cwd(), 'media', 'interactions');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        
        let type = mime.includes('video') ? 'video' : 'image';
        let ext = type === 'video' ? 'mp4' : 'jpg';
        const filepath = path.join(dir, `${cmd}_${m.chat.split('@')[0]}.${ext}`);
        
        fs.writeFileSync(filepath, buffer);
        mediaData = { type, path: filepath, mime };
      } catch (e) {
        console.error("Error guardando media de interacción:", e);
      }
    }

    chat.customInteractions[cmd] = { emoji, textoAccion, media: mediaData };
    global.markPartitionDirty('chats');

    return m.reply(`✅ *¡Interacción Creada!*\n\n*Comando:* ${emoji} ${usedPrefix}${cmd}\n*Formato:* ${mediaData ? 'Con ' + mediaData.type.toUpperCase() : 'Solo texto'}\n\nPrueba usándolo y mencionando a alguien.`);
  }
};
