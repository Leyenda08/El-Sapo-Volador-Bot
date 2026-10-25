export default {
  command: ['apelar', 'reportar'],
  category: 'profile',
  desc: 'Apela un baneo o reporta a un usuario.',

  async run(client, m, args, usedPrefix, command) {
    const ownerJid = global.config?.owner?.[0] + '@s.whatsapp.net';
    if (!ownerJid) return;

    if (command === 'apelar') {
      const razon = args.join(' ');
      if (!razon) return m.reply(`⚠️ Escribe las razones por las que crees que fuiste baneado injustamente.\nEj: ${usedPrefix}apelar No hice nada malo, fue un malentendido.`);
      
      const texto = `🚨 *APELACIÓN DE BANEO*\n\n👤 *Usuario:* @${m.sender.split('@')[0]}\n📝 *Razón:* ${razon}\n\n_Para perdonarlo, responde a este mensaje con .unban @${m.sender.split('@')[0]}_`;
      await client.sendMessage(ownerJid, { text: texto, mentions: [m.sender] });
      return m.reply('✅ Tu apelación ha sido enviada al dueño del bot. Espera su decisión.');
    }

    if (command === 'reportar') {
      const target = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : null;
      const razon = args.slice(1).join(' ');
      if (!target || !razon) return m.reply(`⚠️ Uso: ${usedPrefix}reportar @usuario <razón>`);

      const texto = `🚨 *REPORTE DE USUARIO*\n\n👤 *Reportado:* @${target.split('@')[0]}\n🗣️ *Por:* @${m.sender.split('@')[0]}\n📝 *Razón:* ${razon}`;
      await client.sendMessage(ownerJid, { text: texto, mentions: [target, m.sender] });
      return m.reply('✅ Reporte enviado al dueño. Se tomarán medidas.');
    }
  }
};
