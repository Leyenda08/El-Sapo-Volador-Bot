export default {
  command: ['antidelete', 'antiviewonce', 'antivv'],
  category: 'group',
  isAdmin: true,
  desc: 'Activa o desactiva el Anti-Delete y Anti-ViewOnce.',
  
  async run(client, m, args, usedPrefix, command) {
    if (!m.isGroup) return m.reply('⚠️ Solo funciona en grupos.');
    const chat = global.db.data.chats[m.chat];
    const accion = (args[0] || '').toLowerCase();
    const isDelete = command === 'antidelete';

    if (accion === 'on') {
      if (isDelete) chat.antiDelete = true;
      else chat.antiViewOnce = true;
    } else if (accion === 'off') {
      if (isDelete) chat.antiDelete = false;
      else chat.antiViewOnce = false;
    } else {
      return m.reply(`⚠️ Uso: ${usedPrefix}${command} on/off\nActualmente está: *${(isDelete ? chat.antiDelete : chat.antiViewOnce) ? 'ON' : 'OFF'}*`);
    }

    global.markPartitionDirty('chats');
    return m.reply(`✅ *${isDelete ? 'Anti-Delete' : 'Anti-ViewOnce'}* está ahora *${accion.toUpperCase()}*.`);
  }
};
