import fs from 'fs';
import humanizer from './humanizer.js';

export async function checkLevelUp(client, m, user, chat) {
  let leveledUp = false;
  let isMaxLevel = false;
  
  const maxLevel = 50;
  const xpNeeded = (user.level || 1) * 100;

  if (user.exp >= xpNeeded && user.level < maxLevel) {
    user.level += 1;
    user.exp = 0;
    leveledUp = true;
  }

  if (user.level >= maxLevel) {
    isMaxLevel = true;
  }

  if (leveledUp || isMaxLevel) {
    global.markPartitionDirty('chats');
    await triggerSuperEvent(client, m.chat, m.sender, user, isMaxLevel, chat);
  }
}

async function triggerSuperEvent(client, chatId, jid, user, isMaxLevel, chat) {
  // Bloqueo de 15 segundos
  global.eventLock = global.eventLock || new Set();
  global.eventLock.add(chatId);
  
  const defaultImage = 'https://media.tenor.com/2yT9X40b5dAAAAAC/pokemon-battle.gif';
  const defaultAudio = 'https://www.myinstants.com/media/sounds/victory-fanfare.mp3';

  const media = chat.levelEventMedia || { type: 'video', url: defaultImage };
  const audioUrl = chat.levelEventAudio || defaultAudio;

  let text = '';
  if (isMaxLevel) {
    text = `🌟 *¡NIVEL MÁXIMO ALCANZADO!* 🌟\n\n@${jid.split('@')[0]} ha llegado al nivel 50.\n> _Usa .prestigiar para renacer y desbloquear el poder absoluto._`;
  } else {
    text = `🎉 *¡SUBE DE NIVEL!* 🎉\n\n@${jid.split('@')[0]} ha alcanzado el nivel *${user.level}*.\n> _¡Sigue así, gran guerrero!_`;
  }

  try {
    const payload = {};
    if (media.path && fs.existsSync(media.path)) {
      payload[media.type] = await fs.promises.readFile(media.path);
      payload.mimetype = media.mime;
    } else {
      payload[media.type] = { url: media.url || defaultImage };
      if (media.type === 'video') payload.gifPlayback = true;
    }
    
    payload.caption = text;
    payload.mentions = [jid];

    await humanizer.sendGroupEvent(client, chatId, payload);
    await new Promise(r => setTimeout(r, 3000)); 
    
    await client.sendMessage(chatId, {
      audio: { url: audioUrl },
      mimetype: 'audio/mp4',
      ptt: true
    }, { quoted: m });

  } catch (e) {
    console.error("Error en Súper Evento:", e);
  } finally {
    setTimeout(() => global.eventLock.delete(chatId), 15000);
  }
}
