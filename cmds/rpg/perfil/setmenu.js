import fs from './fs';
import path from './path';

export default {
  command: ['setmenu', 'delmenu'],
  category: 'profile',
  desc: 'Configura la imagen/GIF que aparece al usar .menu.',
  usage: '[responde a un gif/foto] o [delmenu @user]',

  async run(client, m, args, usedPrefix, command) {
    const chat = global.db.data.chats[m.chat] || {};
    if (!chat.users) chat.users = {};

    // COMANDO PARA ADMINS: Borrar menú a alguien
    if (command === 'delmenu') {
      const isAdmin = m.isAdmin || m.isOwner;
      if (!isAdmin) return m.reply('❌ Solo los administradores pueden usar este comando.');
      
      const target = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : (m.quoted ? m.quoted.sender : null);
      if (!target) return m.reply('⚠️ Menciona al usuario al que le quitarás la imagen del menú.');
      
      const targetUser = chat.users[target] || {};
      if (!targetUser.menuMedia) return m.reply('❌ Ese usuario no tiene una imagen personalizada.');

      if (targetUser.menuMedia.path) {
        try { fs.unlinkSync(targetUser.menuMedia.path); } catch {}
      }
      delete targetUser.menuMedia;
      global.markPartitionDirty('chats');

      return m.reply(`🧹 Se ha eliminado el menú personalizado de @${target.split('@')[0]}. Volverá a usar la foto de perfil normal.`, { mentions: [target] });
    }

    // COMANDO PARA USUARIOS: Poner su imagen
    if (command === 'setmenu') {
      const user = chat.users[m.sender] || (chat.users[m.sender] = {});
      const q = m.quoted ? m.quoted : m;
      const mime = (q.msg || q).mimetype || '';

      if ((args[0] || '').toLowerCase() === 'del') {
        if (user.menuMedia && user.menuMedia.path) {
          try { fs.unlinkSync(user.menuMedia.path); } catch {}
        }
        delete user.menuMedia;
        global.markPartitionDirty('chats');
        return m.reply('♻️ Has eliminado tu imagen de menú personalizada.');
      }

      if (!/image|video/.test(mime)) {
        return m.reply(`⚠️ *¿Cómo usarlo?*\nResponde a una *foto*, *GIF* o *video corto* con el comando *${usedPrefix}setmenu*.\n\nPara borrarlo, escribe *${usedPrefix}setmenu del*`);
      }

      await m.reply('⏳ Descargando y guardando tu imagen para el menú...');

      try {
        const buffer = await q.download();
        let type = mime.includes('video') ? 'video' : 'image';
        let ext = type === 'video' ? 'mp4' : 'jpg';

        const dir = path.join(process.cwd(), 'media', 'menus');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        const filepath = path.join(dir, `menu_${m.sender.split('@')[0]}.${ext}`);
        fs.writeFileSync(filepath, buffer);

        user.menuMedia = { type, path: filepath, mime };
        global.markPartitionDirty('chats');

        return m.reply(`✅ *¡Menú personalizado guardado!*\n\nEscribe *${usedPrefix}menu* para verlo.`);
      } catch (e) {
        return m.reply(`❌ Error al guardar: ${e.message}`);
      }
    }
  }
};
