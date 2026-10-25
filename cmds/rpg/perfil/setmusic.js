import fs from 'fs';
import path from 'path';

export default {
  command: ['setmusic', 'setmusica', 'delmusic', 'delmusica'],
  category: 'profile',
  desc: 'Configura una nota de voz para tu perfil.',

  async run(client, m, args, usedPrefix, command) {
    const user = global.db.data.users[m.sender];
    const isDel = command.startsWith('del');

    // Borrar música
    if (isDel) {
      if (user.music && fs.existsSync(user.music)) {
        try { fs.unlinkSync(user.music); } catch {}
      }
      delete user.music;
      global.markPartitionDirty('users');
      return m.reply('✅ *Música de perfil eliminada.*');
    }

    // Guardar música (debe responder a un audio)
    const q = m.quoted ? m.quoted : m;
    const mime = (q.msg || q).mimetype || '';
    
    if (!/audio/.test(mime)) {
      return m.reply('⚠️ Responde a una *nota de voz* o *audio* con el comando *.setmusic* para guardarlo en tu perfil.\n\n_(Intenta que dure menos de 1 minuto para que no pese mucho)._');
    }

    const seconds = (q.msg || q).seconds || 0;
    if (seconds > 60) {
      return m.reply('❌ El audio es muy largo. Máximo 60 segundos para el perfil.');
    }

    await m.reply('⏳ Descargando y guardando tu nota de voz...');
    
    try {
      const buffer = await q.download();
      const dir = path.join(process.cwd(), 'media', 'music');
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      
      const filepath = path.join(dir, `${m.sender.split('@')[0]}.mp3`);
      fs.writeFileSync(filepath, buffer);
      
      user.music = filepath;
      global.markPartitionDirty('users');
      
      return m.reply('✅ *¡Música guardada!*\n\nAhora, cuando uses *.profile*, sonará tu nota de voz después de la foto.');
    } catch (e) {
      return m.reply('❌ Error al guardar el audio: ' + e.message);
    }
  }
};
