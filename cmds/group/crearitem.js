export default {
  command: ['crearitem', 'nuevoitem'],
  category: 'group',
  isAdmin: true,
  desc: 'Crea un nuevo ítem para la tienda del grupo.',
  usage: '<id> <nombre> <tipo> <atk> <def> <hp> <spd> <crit> <precio> <nivel>',

  async run(client, m, args, usedPrefix, command) {
    if (!m.isGroup) return m.reply('⚠️ Solo funciona en grupos.');
    const chat = global.db.data.chats[m.chat];
    if (!chat.customItems) chat.customItems = {};

    if (args.length < 10) {
      return m.reply(`⚠️ *Faltan datos para crear el ítem.*\n\n*Uso:*\n${usedPrefix}crearitem <id> <nombre> <tipo> <atk> <def> <hp> <spd> <crit> <precio> <nivel>\n\n*Ejemplo:*\n${usedPrefix}crearitem perla_magica "🌟 Perla Mágica" arma 50 10 0 5 10 10000 5\n\n_Tipos válidos: arma, armadura, mascota_`);
    }

    const id = args[0].toLowerCase();
    // Unimos las palabras del nombre hasta que encontremos el tipo
    const tipoIndex = args.findIndex(a => ['arma', 'armadura', 'mascota'].includes(a.toLowerCase()));
    if (tipoIndex === -1) return m.reply('❌ Debes especificar el tipo: *arma*, *armadura* o *mascota*.');

    const nombre = args.slice(1, tipoIndex).join(' ').replace(/"/g, '');
    const tipo = args[tipoIndex].toLowerCase();
    const atk = parseInt(args[tipoIndex + 1]) || 0;
    const def = parseInt(args[tipoIndex + 2]) || 0;
    const hp = parseInt(args[tipoIndex + 3]) || 0;
    const spd = parseInt(args[tipoIndex + 4]) || 0;
    const crit = parseInt(args[tipoIndex + 5]) || 0;
    const precio = parseInt(args[tipoIndex + 6]) || 1000;
    const nivelReq = parseInt(args[tipoIndex + 7]) || 1;

    if (chat.customItems[id]) return m.reply('❌ Ya existe un ítem con ese ID.');

    chat.customItems[id] = { nombre, tipo, atk, def, hp, spd, crit, precio, nivelReq };
    global.markPartitionDirty('chats');

    return m.reply(`✅ *¡ÍTEM CREADO CON ÉXITO!*\n\n*Nombre:* ${nombre}\n*Tipo:* ${tipo}\n*Stats:* ATK ${atk} | DEF ${def} | HP ${hp} | SPD ${spd} | CRIT ${crit}%\n*Precio:* ${precio}\n\nYa está disponible en la tienda.`);
  }
};
