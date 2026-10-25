import fs from 'fs';
import path from 'path';

export default {
  command: ['seteventmedia', 'seteventaudio', 'delevent'],
  category: 'group',
  isAdmin: true,
  botAdmin: true,
  desc: 'Configura la imagen/video y audio para los eventos de nivel.',

  async run(client, m, args, usedPrefix, command) {
    if (!m.isGroup) return m.reply('⚠️ Solo funciona en grupos.');
    const chat = global.db.data.chats[m.chat];

    if (command === 'delevent') {
      if (chat.levelEventMedia?.path) try { fs.unlinkSync(chat.levelEventMedia.path); } catch {}
      if (chat.levelEventAudio?.path) try { fs.unlinkSync(chat.levelEventAudio.path); } catch {}
      delete chat.levelEventMedia;
      delete chat.levelEventAudio;
      global.markPartitionDirty('chats');
      return m.reply('♻️ Evento restaurado a los valores por defecto.');
    }

    const q = m.quoted ? m.quoted : m;
    const mime = (q.msg || q).mimetype || '';
    if (!mime) return m.reply('⚠️ Responde a un archivo multimedia con el comando.');

    await m.reply('⏳ Guardando...');

    try {
      const buffer = await q.download();
      const dir = path.join(process.cwd(), 'media', 'events');
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      if (command === 'seteventmedia') {
        if (!/image|video/.test(mime)) return m.reply('❌ Debe ser imagen o video.');
        let type = mime.includes('video') ? 'video' : 'image';
        let ext = type === 'video' ? 'mp4' : 'jpg';
        const filepath = path.join(dir, `event_${m.chat.split('@')[0]}.${ext}`);
        fs.writeFileSync(filepath, buffer);
        chat.levelEventMedia = { type, path: filepath, mime };
        global.markPartitionDirty('chats');
        return m.reply('✅ *Imagen/Video del evento guardada.*');
      }

      if (command === 'seteventaudio') {
        if (!/audio/.test(mime)) return m.reply('❌ Debe ser un audio.');
        const filepath = path.join(dir, `audio_${m.chat.split('@')[0]}.mp3`);
        fs.writeFileSync(filepath, buffer);
        chat.levelEventAudio = { path: filepath };
        global.markPartitionDirty('chats');
        return m.reply('✅ *Música del evento guardada.*');
      }
    } catch (e) {
      return m.reply(`❌ Error: ${e.message}`);
    }
  }
};
