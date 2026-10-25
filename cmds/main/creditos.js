export default {
  command: ['creditos', 'credits', 'autores', 'about'],
  category: 'main',
  desc: 'Muestra los créditos y agradecimientos del bot.',

  async run(client, m, args, usedPrefix, command) {
    const texto = `
╭━━━━━━━━━━━━━━━━━━━━━━━╮
┃    🌟 *CRÉDITOS* 🌟
╰━━━━━━━━━━━━━━━━━━━━━━━╯

Este bot fue creado y modificado con mucho esfuerzo. Agradecimientos especiales a:

👑 *Creador Original (Base):*
> ocrespoF

🛠️ *Modificaciones y Sistema RPG:*
> ✨ *Leyenda 08* ✨
> (Con asistencia de DeepSeek AI)

⚙️ *Tecnologías Usadas:*
> Node.js & Baileys
> SQLite (Base de Datos)
> yt-dlp (Descargas)

*» ¿Qué tiene este bot?*
> 🛡️ Sistema Anti-Ban (Humanizer)
> 🎮 RPG Completo (Clases, Clanes, Batallas)
> 🏰 Sistema de Matrimonio y Embarazo
> 🎰 Casino y Economía
> 🛠️ Herramientas y Descargas

> _Siéntete libre de explorar, jugar y disfrutar._
> _Prohibida su venta sin permiso del creador._

┈┈┈┈┈┈┈┈┈┈
_𝐘𝐮𝐤𝐢 𝐁𝐨𝐭 · Temporada 2026_`;

    await client.sendMessage(m.chat, {
      video: { url: 'https://media.tenor.com/2yT9X40b5dAAAAAC/pokemon-battle.gif' },
      gifPlayback: true,
      caption: texto,
      mentions: [m.sender]
    }, { quoted: m });
  }
};
