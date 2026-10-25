export default {
  command: ['profile', 'perfil', 'me'],
  category: 'profile',
  desc: 'Muestra tu tarjeta de jugador con vidas, nivel y clan.',

  async run(client, m, args, usedPrefix, command, text) {
    const chat = global.db.data.chats[m.chat];
    if (!chat || !chat.users) return m.reply('⚠️ Este grupo no tiene datos registrados.');

    let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : (m.quoted ? m.quoted.sender : m.sender);
    const user = chat.users[who] || { vidas: 2, exp: 0, coins: 0 };

    const pushname = (await client.getName(who, m.chat)) || who.split('@')[0];
    const vidas = user.vidas !== undefined ? user.vidas : 2;
    const nivel = user.level || 1;
    const exp = user.exp || 0;
    const coins = user.coins || 0;
    const titulo = user.title || 'Recluta';
    const currencyName = chat.currencyName || 'Coins';
    const prestigio = user.prestige ? `✨ Prestigio ${user.prestige}` : '';

    // Datos del Clan
    let clanText = 'Ninguno';
    if (global.db.data.clanes) {
      const clanes = global.db.data.clanes;
      const clanId = Object.keys(clanes).find(id => clanes[id].miembros.includes(who));
      if (clanId) {
        const c = clanes[clanId];
        const rango = c.lider === who ? '👑 Líder' : '🛡️ Miembro';
        clanText = `[${c.nombre}] (${rango})`;
      }
    }

    // Datos Familiares
    const haremSize = user.harem ? user.harem.length : 0;
    const dueño = user.marriedTo ? `@${user.marriedTo.split('@')[0]}` : 'Libre';
    const hijos = user.hijos && user.hijos.length > 0 ? user.hijos.map(h => `👶 ${h.nombre}`).join(', ') : 'Ninguno';

    // Corazones y progreso
    let corazones = '';
    for (let i = 0; i < 2; i++) corazones += (i < vidas) ? '❤️' : '🖤';
    
    const xpNeeded = nivel * 100;
    const porcentaje = Math.min(100, Math.floor((exp / xpNeeded) * 100));
    const bloquesLlenos = Math.floor(porcentaje / 10);
    const progressBar = `[${'█'.repeat(bloquesLlenos)}${'░'.repeat(10 - bloquesLlenos)}] ${porcentaje}%`;

    const perfilText = `
*» 🎮 Perfil de Jugador*
> _Progreso independiente dentro de este grupo._

👤 *Usuario:* @${who.split('@')[0]} _(${pushname})_
🎖️ *Título:* \`${titulo}\` ${prestigio}
🏰 *Clan:* ${clanText}
♥ *Vidas:* ${corazones} \`${vidas}/2\`
⭐ *Nivel:* \`${nivel}\`
📈 *Progreso:* ${progressBar}
🪙 *Monedas:* \`${coins.toLocaleString()} ${currencyName}\`

*» 👨‍👩‍👧 Familia*
💍 *Pertenece a:* ${dueño}
👥 *Harén:* ${haremSize} parejas
👶 *Hijos:* ${hijos}

┈┈┈┈┈┈┈┈┈┈
_𝐘𝐮𝐤𝐢 𝐁𝐨𝐭 · temporada semanal · progreso por grupo_`;

    const pp = await client.profilePictureUrl(who, 'image').catch(() => 'https://cdn.yuki-wabot.my.id/files/2PVh.jpeg');

    await client.sendMessage(m.chat, {
      image: { url: pp },
      caption: perfilText,
      mentions: [who, ...(user.marriedTo ? [user.marriedTo] : [])]
    }, { quoted: m });
  }
};
