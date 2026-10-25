import fs from 'fs';
import path from 'path';

export default {
  command: ['setwelcome', 'setbienvenida', 'setgoodbye', 'setdespedida', 'rmwelcome', 'rmgoodbye'],
  category: 'group',
  isAdmin: true,
  botAdmin: true,
  desc: 'Configura media (img/video/audio) para bienvenidas y salidas.',

  async run(client, m, args, usedPrefix, command) {
    if (!m.isGroup) return m.reply('⚠️ Solo funciona en grupos.');
    
    const chat = global.db.data.chats[m.chat];
    const isWelcome = command.includes('welcome') || command.includes('bienvenida');
    const isRemove = command.startsWith('rm');
    const typeKey = isWelcome ? 'welcomeMedia' : 'goodbyeMedia';
    const typeName = isWelcome ? 'Bienvenida' : 'Despedida';

    // BORRAR MEDIA
    if (isRemove) {
      if (chat[typeKey] && chat[typeKey].path) {
        try { fs.unlinkSync(chat[typeKey].path); } catch {}
      }
      delete chat[typeKey];
      global.markPartitionDirty('chats');
      return m.reply(`♻️ Media de *${typeName}* eliminado. Se usará la foto de perfil.`);
    }

    // GUARDAR MEDIA
    const q = m.quoted ? m.quoted : m;
    const mime = (q.msg || q).mimetype || '';
    
    if (!/image|video|audio/.test(mime)) {
      return m.reply(`⚠️ Responde a una *imagen, video o audio* con el comando *.${command}* para guardarlo como ${typeName}.\n\n_Ejemplo: Responde a un audio y escribe *${usedPrefix}${command}*_`);
    }

    await m.reply(`⏳ Descargando y guardando media para ${typeName}...`);

    try {
      const buffer = await q.download();
      if (!buffer) throw new Error('No se pudo descargar');

      // Detectar tipo
      let type = 'image';
      let ext = 'jpg';
      if (/video/.test(mime)) { type = 'video'; ext = 'mp4'; }
      if (/audio/.test(mime)) { type = 'audio'; ext = 'mp3'; }

      // Crear carpeta si no existe
      const dir = path.join(process.cwd(), 'media', isWelcome ? 'welcome' : 'goodbye');
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      // Guardar archivo
      const filename = `${m.chat.split('@')[0]}_${Date.now()}.${ext}`;
      const filepath = path.join(dir, filename);
      fs.writeFileSync(filepath, buffer);

      // Guardar en DB
      chat[typeKey] = { type, path: filepath, mime };
      global.markPartitionDirty('chats');

      return m.reply(`✅ *¡Media guardado!*\n\nDesde ahora, cuando alguien ${isWelcome ? 'entre' : 'salga'} del grupo, se enviará este ${type}.`);
    } catch (e) {
      return m.reply(`❌ Error al guardar el media: ${e.message}`);
    }
  }
};
