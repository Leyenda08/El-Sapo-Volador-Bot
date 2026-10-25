export default {
  command: ['eventoxp', 'evento', 'dobleexp'],
  category: 'group',
  isAdmin: true,
  desc: 'Inicia un evento de multiplicador de XP en el grupo.',
  usage: '<multiplicador> <tiempo> (ej: 2 24h)',

  async run(client, m, args, usedPrefix, command) {
    if (!m.isGroup) return m.reply('⚠️ Solo funciona en grupos.');
    const chat = global.db.data.chats[m.chat] || {};

    // Detener evento
    if (args[0] === 'stop' || args[0] === 'off') {
      delete chat.xpEvent;
      global.markPartitionDirty('chats');
      return m.reply('🛑 *Evento de XP detenido.* Los usuarios vuelven a la normalidad.');
    }

    const multi = parseInt(args[0]);
    const tiempoStr = (args[1] || '').toLowerCase();

    if (!multi || multi < 2 || multi > 5 || !tiempoStr) {
      return m.reply(`⚠️ *Uso correcto:*\n${usedPrefix}eventoxp <multiplicador> <tiempo>\n\n*Ejemplos:*\n> ${usedPrefix}eventoxp 2 24h (Doble XP por 1 día)\n> ${usedPrefix}eventoxp 3 7d (Triple XP por 1 semana)\n> ${usedPrefix}eventoxp stop (Detener evento)`);
    }

    // Calcular milisegundos
    let ms = 0;
    const num = parseInt(tiempoStr);
    if (tiempoStr.endsWith('h')) ms = num * 60 * 60 * 1000;
    else if (tiempoStr.endsWith('d')) ms = num * 24 * 60 * 60 * 1000;
    else if (tiempoStr.endsWith('m')) ms = num * 60 * 1000;
    else return m.reply('❌ Tiempo inválido. Usa *m* (minutos), *h* (horas) o *d* (días). Ej: 24h');

    chat.xpEvent = {
      multiplier: multi,
      expiresAt: Date.now() + ms
    };
    global.markPartitionDirty('chats');

    return m.reply(`🌟 *¡EVENTO GLOBAL INICIADO!* 🌟\n\n> Todos los usuarios de este grupo recibirán *x${multi} de XP* por cada mensaje.\n> ⏳ *Duración:* ${tiempoStr}\n> _¡Aprovechen para subir de nivel!_`);
  }
};
