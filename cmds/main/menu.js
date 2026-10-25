import fs from 'fs';
import { registry } from '../../core/system/commandLoader.js';

export default {
  command: ['menu', 'comandos'],
  category: 'main',
  desc: 'Muestra el menú principal.',

  async run(client, m, args, usedPrefix, command) {
    const chatData = global.db.data.chats[m.chat] || {};
    const user = (chatData.users && chatData.users[m.sender]) || { level: 1, coins: 0 };
    const moneda = chatData.currencyName || 'Coins';
    const pushname = m.pushName || 'Usuario';
    const botname = global.config?.namebot || 'El Sapo Volador';

    let ppPayload = { image: { url: 'https://cdn.yuki-wabot.my.id/files/2PVh.jpeg' } };
    if (user.menuMedia && user.menuMedia.path && fs.existsSync(user.menuMedia.path)) {
      ppPayload = { [user.menuMedia.type]: await fs.promises.readFile(user.menuMedia.path), mimetype: user.menuMedia.mime };
      if (user.menuMedia.type === 'video') ppPayload.gifPlayback = true;
    } else {
      const profilePic = await client.profilePictureUrl(m.sender, 'image').catch(() => null);
      if (profilePic) ppPayload = { image: { url: profilePic } };
    }

    const categorias = {};
    const entries = Array.from(registry.comandos.entries());
    
    entries.forEach(([cmdName, cmdData]) => {
      const cat = cmdData.category || 'otros';
      if (!categorias[cat]) categorias[cat] = new Set();
      categorias[cat].add(cmdName);
    });

    // Iconos actualizados para separar el RPG
    const iconos = {
      economia: '🪙 RPG: ECONOMÍA', 
      juegos: '🎰 RPG: JUEGOS', 
      profile: '🎮 RPG: PERFIL', 
      group: '🛡️ ADMINISTRACIÓN', 
      downloads: '📥 DESCARGAS', 
      herramientas: '🛠️ HERRAMIENTAS',
      stickers: '🖼️ STICKERS', 
      main: '📱 PRINCIPAL', 
      owner: '👑 DUEÑO', 
      reactions: '🎭 REACCIONES', 
      academia: '📚 ACADEMIA', 
      anime: '🌸 ANIME'
    };

    let menuText = `
┏━━━━━━━━━━━━━━━━━━━━━━━┓
┃    🤖 *${botname.toUpperCase()}* 🤖
┗━━━━━━━━━━━━━━━━━━━━━━━┛
┏━ 👤 *USUARIO* ━━━━━━━━━━┓
┃ ✨ *Nombre:* ${pushname}
┃ ⭐ *Nivel:* ${user.level || 1}
┃ 🪙 *Saldo:* ${(user.coins || 0).toLocaleString()} ${moneda}
┃ 🛡️ *Rol:* ${m.isAdmin ? 'Administrador' : 'Usuario'}
┗━━━━━━━━━━━━━━━━━━━━━━━┛
`;

    for (const [cat, cmdsSet] of Object.entries(categorias)) {
      if ((cat === 'group' || cat === 'owner') && !m.isAdmin && !m.isOwner) continue;
      const tituloCat = iconos[cat] || `📁 ${cat.toUpperCase()}`;
      menuText += `┏━ ${tituloCat} ━━━━━━━┓\n`;
      
      const arrayCmds = Array.from(cmdsSet).sort();
      for (let i = 0; i < arrayCmds.length; i += 4) {
        const chunk = arrayCmds.slice(i, i + 4).map(c => `▸ ${c}`).join('  ');
        menuText += `┃ ${chunk}\n`;
      }
      menuText += `┗━━━━━━━━━━━━━━━━━━━━━━━┛\n`;
    }

    menuText += `\n_💡 Usa ${usedPrefix}help <comando> para ver qué hace._`;

    await client.sendMessage(m.chat, { ...ppPayload, caption: menuText.trim(), mentions: [m.sender] }, { quoted: m });
  }
};
