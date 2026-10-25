export default {
  command: ['casino', 'vegas'],
  category: 'juegos',
  desc: 'Muestra el menú de juegos de apuestas y el saldo.',

  async run(client, m, args, usedPrefix, command) {
    const chat = global.db.data.chats[m.chat] || {};
    const user = (chat.users && chat.users[m.sender]) || { coins: 0 };
    const moneda = chat.currencyName || 'Coins';

    const texto = `
*» 🎰 BIENVENIDO AL CASINO VEGAS 🎰*
> _La suerte está echada, ${m.pushName}._

╭─ 💳 *TU BILLETERA*
┃ 💰 Saldo: *${(user.coins || 0).toLocaleString()} ${moneda}*
╰────────────────────

*» 🃏 JUEGOS DISPONIBLES*

✧ *Cara o Cruz* 🪙
> ${usedPrefix}cf <monto> <cara|cruz>

✧ *Ruleta Rusa* 🎡
> ${usedPrefix}ruleta <monto> <rojo|negro|verde>
> _Paga x2 a color, x14 al verde._

✧ *Dados de la Suerte* 🎲
> ${usedPrefix}dados <monto> <mayor|menor|7>
> _Paga x2 a mayor/menor, x5 al 7 exacto._

✧ *Tragamonedas* 🎰
> ${usedPrefix}slots <monto>

*» ⚠️ Recuerda*
> _La casa siempre gana... o eso dicen._
> _Apuesta con cabeza._
┈┈┈┈┈┈┈┈┈┈
_𝐘𝐮𝐤𝐢 𝐂𝐚𝐬𝐢𝐧𝐨 · Juega responsablemente_`;

    return m.reply(texto.trim());
  }
};
