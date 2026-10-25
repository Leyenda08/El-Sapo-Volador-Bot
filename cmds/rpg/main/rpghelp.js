export default {
  command: ['rpghelp', 'ayudarpg', 'manual'],
  category: 'main',
  desc: 'Muestra el manual completo de cómo jugar el RPG.',

  async run(client, m, args, usedPrefix, command) {
    const texto = `
*» 🎮 MANUAL DEL REINO (RPG)*
> _Bienvenido a la guía definitiva, ${m.pushName}._

*» 👑 EL HARÉN Y EL AMOR*
✧ *${usedPrefix}harem* - Ver todas tus parejas.
✧ *${usedPrefix}casarse @user* - Proponer matrimonio (puedes tener varias).
✧ *${usedPrefix}traicion* - Traicionar a tu pareja, robarle sus monedas y huir.
✧ *${usedPrefix}robar @princesa* - Iniciar una batalla por el amor de alguien.

*» ⚔️ COMBATE POR TURNOS*
Cuando inicies un combate (ej. ${usedPrefix}robar @user o ${usedPrefix}duelo @user 100):
1. Tendrás *30 segundos* para actuar en cada turno.
2. Usa *${usedPrefix}atacar* o *${usedPrefix}defender*.
3. Si no haces nada en 30s, pierdes el turno.
4. Si ambos se quedan quietos, la batalla termina en empate.
> _El chat se bloqueará temporalmente durante la pelea._

*» 🛡️ EQUIPAMIENTO*
✧ *${usedPrefix}tienda* - Ver armas, armaduras, escudos y mascotas.
✧ *${usedPrefix}comprar <item>* - Comprar un objeto.
✧ *${usedPrefix}equipar <item>* - Equipar un objeto para subir tus estadísticas (ATK, DEF, HP).
✧ *${usedPrefix}moequipo* - Ver tu equipo actual y estadísticas totales.

*» 💰 ECONOMÍA Y APUESTAS*
✧ *${usedPrefix}daily* - Cobrar tu recompensa diaria.
✧ *${usedPrefix}slots / .ruleta / .dados* - Juegos de apuestas.

*» ⚖️ SUPERVIVENCIA*
✧ *${usedPrefix}juicio* - (Solo admins) Castiga a los inactivos.
✧ *${usedPrefix}perfil* - Ver tu tarjeta de jugador.

┈┈┈┈┈┈┈┈┈┈
_𝐘𝐮𝐤𝐢 𝐑𝐏𝐆 · El destino está en tus manos_`;
    return m.reply(texto.trim());
  }
};
