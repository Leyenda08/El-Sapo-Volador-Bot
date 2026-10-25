import fs from 'fs';
import path from 'path';

export default {
  command: ['setbattleimage', 'setduelo', 'batalla_img', 'delbattleimage'],
  category: 'group',
  isAdmin: true,
  botAdmin: true,
  desc: 'Configura una imagen o GIF para el inicio de las batallas.',
  usage: '[responde a un gif/imagen] o [del]',

  async run(client, m, args, usedPrefix, command) {
    if (!m.isGroup) return m.reply('⚠️ Solo funciona en grupos.');
    const chat = global.db.data.chats[m.chat];

    // BORRAR IMAGEN
    if (command === 'delbattleimage' || (args[0] || '').toLowerCase() === 'del') {
      if (chat.battleMedia && chat.battleMedia.path) {
        try { fs.unlinkSync(chat.battleMedia.path); } catch {}
      }
      delete chat.battleMedia;
      global.markPartitionDirty('chats');
      return m.reply('♻️ Imagen de batalla eliminada. Se usará el GIF por defecto.');
    }

    // GUARDAR IMAGEN/GIF
    const q = m.quoted ? m.quoted : m;
    const mime = (q.msg || q).mimetype || '';
    
    if (!/image|video/.test(mime)) {
      return m.reply(`⚠️ Responde a una *imagen* o *GIF/Video corto* con el comando *.${command}*.\n\nPara quitarlo usa: *${usedPrefix}${command} del*`);
    }

    await m.reply(`⏳ Descargando y guardando imagen de batalla...`);

    try {
      const buffer = await q.download();
      if (!buffer) throw new Error('No se pudo descargar');

      let type = 'image';
      let ext = 'jpg';
      if (/video/.test(mime)) { type = 'video'; ext = 'mp4'; }

      const dir = path.join(process.cwd(), 'media', 'battle');
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      const filename = `battle_${m.chat.split('@')[0]}.${ext}`;
      const filepath = path.join(dir, filename);
      fs.writeFileSync(filepath, buffer);

      chat.battleMedia = { type, path: filepath, mime };
      global.markPartitionDirty('chats');

      return m.reply(`✅ *¡Imagen de batalla guardada!*\n\nDesde ahora, cuando alguien inicie un combate en este grupo, se mostrará este ${type === 'video' ? 'GIF/Video' : 'Imagen'}.`);
    } catch (e) {
      return m.reply(`❌ Error al guardar el media: ${e.message}`);
    }
  }
};
