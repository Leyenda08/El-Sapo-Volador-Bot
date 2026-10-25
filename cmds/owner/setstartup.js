import fs from 'fs';
import path from 'path';

export default {
  command: ['setstartup', 'delstartup'],
  category: 'owner',
  isOwner: true,
  desc: 'Configura la imagen/GIF de arranque del bot.',
  
  async run(client, m, args, usedPrefix, command) {
    if (!global.db.data.settings) global.db.data.settings = {};
    const botJid = client.user.id.split(':')[0] + '@s.whatsapp.net';
    if (!global.db.data.settings[botJid]) global.db.data.settings[botJid] = {};
    const settings = global.db.data.settings[botJid];

    if (command === 'delstartup') {
      if (settings.startupMedia && settings.startupMedia.path) {
        try { fs.unlinkSync(settings.startupMedia.path); } catch {}
      }
      delete settings.startupMedia;
      global.markPartitionDirty('settings');
      return m.reply('♻️ Banner de arranque eliminado. Se usará el texto por defecto.');
    }

    const q = m.quoted ? m.quoted : m;
    const mime = (q.msg || q).mimetype || '';
    if (!/image|video/.test(mime)) {
      return m.reply(`⚠️ Responde a una *imagen* o *GIF/Video* con el comando *.${command}* para guardarlo como banner de arranque.\n\n_Para quitarlo usa: *${usedPrefix}delstartup*_`);
    }

    await m.reply('⏳ Descargando y guardando banner de arranque...');

    try {
      const buffer = await q.download();
      let type = mime.includes('video') ? 'video' : 'image';
      let ext = type === 'video' ? 'mp4' : 'jpg';

      const dir = path.join(process.cwd(), 'media', 'startup');
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      const filepath = path.join(dir, `startup_banner.${ext}`);
      fs.writeFileSync(filepath, buffer);

      settings.startupMedia = { type, path: filepath, mime };
      global.markPartitionDirty('settings');

      return m.reply(`✅ *¡Banner de arranque guardado!*\n\nDesde ahora, cada vez que el bot se encienda, te enviará este ${type === 'video' ? 'GIF/Video' : 'Imagen'}.`);
    } catch (e) {
      return m.reply(`❌ Error al guardar: ${e.message}`);
    }
  }
};
