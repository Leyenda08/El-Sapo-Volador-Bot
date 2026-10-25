export default {
  command: ['tiempobatalla', 'battletime', 'turnos'],
  category: 'group',
  isAdmin: true,
  desc: 'Configura cuántos segundos dura un turno en batalla.',
  usage: '<segundos>',

  async run(client, m, args, usedPrefix, command) {
    if (!m.isGroup) return m.reply('⚠️ Solo funciona en grupos.');
    const chat = global.db.data.chats[m.chat];
    
    const segundos = parseInt(args[0]);
    if (isNaN(segundos) || segundos < 10 || segundos > 300) {
      const actual = (chat.battleTurnTime || 30000) / 1000;
      return m.reply(`⏱️ *TIEMPO DE TURNO ACTUAL:* ${actual} segundos.\n\nPara cambiarlo, usa un número entre 10 y 300.\n*Ejemplo:* ${usedPrefix}${command} 45`);
    }

    chat.battleTurnTime = segundos * 1000;
    global.markPartitionDirty('chats');
    
    return m.reply(`⚔️ *Tiempo de batalla actualizado.*\nAhora cada jugador tendrá *${segundos} segundos* para usar .atacar o .defender.`);
  }
};
