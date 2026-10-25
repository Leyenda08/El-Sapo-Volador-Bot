export default {
  command: ['setfrase', 'frase', 'bio'],
  category: 'profile',
  desc: 'Establece una frase única para tu perfil.',
  usage: '<texto>',

  async run(client, m, args, usedPrefix, command, text) {
    const user = global.db.data.users[m.sender];

    if (!text) {
      return m.reply(`⚠️ Escribe la frase que quieres que aparezca en tu perfil.\n\n*Ejemplo:* ${usedPrefix}setfrase El éxito es la suma de pequeños esfuerzos.`);
    }

    if (text.length > 100) {
      return m.reply(`❌ La frase es muy larga. Máximo 100 caracteres.`);
    }

    user.frase = text;
    global.markPartitionDirty('users');

    return m.reply(`✅ *Frase guardada con éxito.*\n\n> "${text}"\n\nMírala en tu perfil con *${usedPrefix}profile*`);
  }
};
