export default {
  command: ['mute', 'silenciar'],
  category: 'group',
  isAdmin: true,
  botAdmin: true,
  desc: 'Silencia a un usuario por un tiempo determinado.',
  usage: '<@usuario> <tiempo> (ej: 10m, 2h, 1d)',

  async run(client, m, args, usedPrefix, command) {
    if (!m.isGroup) return m.reply('⚠️ Solo en grupos.');
    const target = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : (m.quoted ? m.quoted.sender : null);
    const tiempoStr = (args[1] || args[0] || '').toLowerCase();

    if (!target) return m.reply('⚠️ Menciona a quién silenciar.');
    if (!tiempoStr) return m.reply(`⚠️ Indica el tiempo. Ej: ${usedPrefix}mute @user 10m`);

    let ms = 0;
    const num = parseInt(tiempoStr);
    if (tiempoStr.endsWith('m')) ms = num * 60 * 1000;
    else if (tiempoStr.endsWith('h')) ms = num * 60 * 60 * 1000;
    else if (tiempoStr.endsWith('d')) ms = num * 24 * 60 * 60 * 1000;

    if (!ms) return m.reply('❌ Tiempo inválido. Usa m, h o d. Ej: 30m, 2h, 1d.');

    const chat = global.db.data.chats[m.chat];
    if (!chat.users) chat.users = {};
    if (!chat.users[target]) chat.users[target] = {};

    chat.users[target].mutedUntil = Date.now() + ms;
    global.markPartitionDirty('chats');

    try { await client.groupSettingUpdate(m.chat, 'announcement'); } catch (e) {}

    return m.reply(`🔇 @${target.split('@')[0]} ha sido silenciado por *${tiempoStr}*.`, { mentions: [target] });
  }
};
