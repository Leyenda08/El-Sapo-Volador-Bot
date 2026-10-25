export default {
  command: ['crearclase', 'nuevaclase'],
  category: 'group',
  isAdmin: true,
  desc: 'Crea una nueva clase para el RPG.',
  usage: '<id> <nombre> <hp> <atk> <def> <spd> <crit>',

  async run(client, m, args, usedPrefix, command) {
    if (!m.isGroup) return m.reply('⚠️ Solo funciona en grupos.');
    const chat = global.db.data.chats[m.chat];
    if (!chat.customClasses) chat.customClasses = {};

    if (args.length < 7) {
      return m.reply(`⚠️ *Faltan datos.*\n\n*Uso:*\n${usedPrefix}crearclase <id> <nombre> <hp> <atk> <def> <spd> <crit>\n\n*Ejemplo:*\n${usedPrefix}crearclase semidios "⚡ Semidiós" 200 100 80 50 40`);
    }

    const id = args[0].toLowerCase();
    const nombre = args.slice(1, args.length - 5).join(' ').replace(/"/g, '');
    const hp = parseInt(args[args.length - 5]) || 100;
    const atk = parseInt(args[args.length - 4]) || 10;
    const def = parseInt(args[args.length - 3]) || 10;
    const spd = parseInt(args[args.length - 2]) || 10;
    const crit = parseInt(args[args.length - 1]) || 10;

    if (chat.customClasses[id]) return m.reply('❌ Ya existe una clase con ese ID.');

    chat.customClasses[id] = { nombre, hp, atk, def, spd, crit, desc: 'Clase personalizada por el admin.' };
    global.markPartitionDirty('chats');

    return m.reply(`✅ *¡CLASE CREADA!*\n\n*Nombre:* ${nombre}\n*Stats:* HP ${hp} | ATK ${atk} | DEF ${def} | SPD ${spd} | CRIT ${crit}%\n\nLos usuarios ya pueden elegirla con .clase`);
  }
};
