import fs from './fs';
import { activeBattles, startBattle, endBattle } from '../../../utils/battleEngine.js';
import { CLASES, EQUIPO } from '../../../utils/rpgData.js';

export default {
  command: ['batalla', 'atacar', 'defender', 'robar'],
  category: 'juegos',
  desc: 'Combate por turnos por amor o dinero.',

  async run(client, m, args, usedPrefix, command) {
    const chatId = m.chat;
    const chat = global.db.data.chats[chatId] || {};
    if (!chat.users) chat.users = {};
    
    const getStats = (jid) => {
      const u = chat.users[jid] || {};
      const clase = u.clase ? CLASES[u.clase] : { hp: 100, atk: 10, def: 5, spd: 5, crit: 5 };
      let stats = { ...clase };
      if (u.equipped) {
        for (const id of Object.values(u.equipped)) {
          if (id && EQUIPO[id]) {
            const i = EQUIPO[id];
            stats.atk += i.atk; stats.def += i.def; stats.hp += i.hp; stats.spd += i.spd; stats.crit += i.crit;
          }
        }
      }
      return stats;
    };

    if (activeBattles.has(chatId)) {
      const b = activeBattles.get(chatId);
      if (b.turn !== m.sender) return; 

      const atacanteStats = getStats(m.sender);
      const defensorJid = (b.turn === b.p1) ? b.p2 : b.p1;
      const defensorStats = getStats(defensorJid);

      if (command === 'atacar') {
        let dañoBase = atacanteStats.atk - Math.floor(defensorStats.def / 2);
        if (dañoBase < 5) dañoBase = 5;
        let esCritico = Math.random() * 100 < atacanteStats.crit;
        if (esCritico) dañoBase = Math.floor(dañoBase * 1.5);
        const dañoFinal = dañoBase + Math.floor(Math.random() * 10);
        
        if (b.turn === b.p1) b.hp2 -= dañoFinal; else b.hp1 -= dañoFinal;
        
        let msg = `⚔️ @${m.sender.split('@')[0]} ataca e inflige *${dañoFinal} de daño*.`;
        if (esCritico) msg += ` 💥 *¡GOLPE CRÍTICO!*`;
        await m.reply(msg, { mentions: [m.sender] });
        
        b.turn = defensorJid;
        clearTimeout(b.timer);
        b.timer = setTimeout(() => checkTimeout(client, chatId), chat.battleTurnTime || 30000);
        checkWin(client, chatId);
        return;
      }

      if (command === 'defender') {
        const curacion = Math.floor(defensorStats.def / 2) + 10;
        if (b.turn === b.p1) b.hp1 += curacion; else b.hp2 += curacion;
        await m.reply(`🛡️ @${m.sender.split('@')[0]} se defiende y recupera *${curacion} HP*.`, { mentions: [m.sender] });
        b.turn = defensorJid;
        clearTimeout(b.timer);
        b.timer = setTimeout(() => checkTimeout(client, chatId), chat.battleTurnTime || 30000);
        checkWin(client, chatId);
        return;
      }
    }

    if (command === 'batalla' || command === 'robar') {
      const target = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : null;
      if (!target) return m.reply(`⚠️ Menciona a tu rival.`);

      const p1Stats = getStats(m.sender);
      const p2Stats = getStats(target);
      const b = startBattle(chatId, m.sender, target, command);
      b.hp1 = p1Stats.hp;
      b.hp2 = p2Stats.hp;
      
      
      const battleText = `⚔️ *¡COMBATE INICIADO!* ⚔️\n\n@${m.sender.split('@')[0]} (HP: ${b.hp1}) VS @${target.split('@')[0]} (HP: ${b.hp2})\n\n> _Chat bloqueado. Usa ${usedPrefix}atacar o ${usedPrefix}defender._\n\n👉 Turno de: @${m.sender.split('@')[0]}`;
      
      if (chat.battleMedia && chat.battleMedia.path && fs.existsSync(chat.battleMedia.path)) {
        const mediaPayload = { [chat.battleMedia.type]: await fs.promises.readFile(chat.battleMedia.path), mimetype: chat.battleMedia.mime };
        if (chat.battleMedia.type === "video") mediaPayload.gifPlayback = true;
        
        await client.sendMessage(chatId, { ...mediaPayload, caption: battleText, mentions: [m.sender, target] }, { quoted: m });
      } else {
        // GIF por defecto (Pokemon Battle / Espadas)
        const defaultGif = 'https://media.tenor.com/2yT9X40b5dAAAAAC/pokemon-battle.gif';
        await client.sendMessage(chatId, { video: { url: defaultGif }, gifPlayback: true, caption: battleText, mentions: [m.sender, target] }, { quoted: m });
      }


      b.timer = setTimeout(() => checkTimeout(client, chatId), chat.battleTurnTime || 30000);
    }
  }
};

async function checkTimeout(client, chatId) {
  if (!activeBattles.has(chatId)) return;
  const b = activeBattles.get(chatId);
  const loser = b.turn;
  const winner = (b.turn === b.p1) ? b.p2 : b.p1;
  await client.sendMessage(chatId, { text: `⏳ *¡TIEMPO AGOTADO!*\n@${loser.split('@')[0]} no hizo nada y pierde.\n\n🏆 El ganador es @${winner.split('@')[0]}.`, mentions: [loser, winner] });
  endBattle(chatId);
}

async function checkWin(client, chatId) {
  const b = activeBattles.get(chatId);
  if (b.hp1 <= 0 || b.hp2 <= 0) {
    const winner = b.hp1 > 0 ? b.p1 : b.p2;
    const loser = b.hp1 > 0 ? b.p2 : b.p1;
    await client.sendMessage(chatId, { text: `💀 *¡K.O.!*\n@${winner.split('@')[0]} ha derrotado a @${loser.split('@')[0]}.\n\n_El botín y el amor son del vencedor._`, mentions: [winner, loser] });
    endBattle(chatId);
  }
}
