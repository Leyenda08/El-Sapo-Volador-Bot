import chalk from 'chalk';
import { getGroupMeta, getBotId, getBotSettings } from '../../utils/tools.js';
import humanizer from '../../utils/humanizer.js';

export default async (client, m) => {
  // 1. ANTI-DELETE (Interceptar mensajes borrados)
  client.ev.on('messages.update', async (updates) => {
    for (const update of updates) {
      if (update.update?.message === null && update.update?.messageStubType === 1) {
        const chatId = update.key.remoteJid;
        const chat = global.db.data.chats[chatId];
        if (!chat || !chat.antiDelete) continue;

        // Buscar en el caché de mensajes (asumiendo que usas un caché o la DB)
        const cachedMsg = global.msgBuffer?.[chatId]?.find(m => m.key.id === update.key.id);
        if (cachedMsg && cachedMsg.text) {
          const sender = update.key.participant || update.key.remoteJid;
          await client.sendMessage(chatId, {
            text: `🚨 *ANTI-DELETE* 🚨\n\n*@${sender.split('@')[0]}* intentó borrar este mensaje:\n\n> ${cachedMsg.text}`,
            mentions: [sender]
          });
        }
      }
    }
  });

  // 2. ANTI-VIEW-ONCE (Interceptar fotos de una sola vez)
  client.ev.on('messages.upsert', async (chatUpdate) => {
    if (chatUpdate.type !== 'notify') return;
    const msg = chatUpdate.messages[0];
    if (!msg.message) return;
    
    const chatId = msg.key.remoteJid;
    const chat = global.db.data.chats[chatId];
    if (!chat || !chat.antiViewOnce) return;

    const isViewOnce = msg.message.viewOnceMessageV2 || msg.message.viewOnceMessage || msg.message.viewOnceMessageV2Extension;
    if (isViewOnce) {
      const sender = msg.key.participant || msg.key.remoteJid;
      try {
        const m = await client.serializeM(msg);
        const buffer = await m.download();
        if (buffer) {
          await client.sendMessage(chatId, {
            text: `🚨 *ANTI-VIEW-ONCE* 🚨\n*@${sender.split('@')[0]}* envió esto para verse una vez:`,
            mentions: [sender]
          });
          const mime = Object.keys(isViewOnce.message)[0];
          await client.sendMessage(chatId, { [mime.replace('Message', '')]: buffer, mimetype: isViewOnce.message[mime].mimetype });
        }
      } catch (e) {
        console.error('Error en Anti-VV:', e);
      }
    }
  });

  // 3. Lógica original de Bienvenidas y Súper Eventos
  client.ev.removeAllListeners('group-participants.update');
  client.ev.on('group-participants.update', async (anu) => {
    try {
      if (!global.botReady || (Date.now() - (global.bootTime || 0)) < 15000) return;
      const metadata = await getGroupMeta(client, anu.id);
      const chat = global?.db?.data?.chats?.[anu.id];
      const botId = getBotId(client);
      if (getBotSettings(client)?.self ?? false) return;

      for (const p of anu.participants) {
        const jid = typeof p === 'string' ? p : (p.id || p.phoneNumber || String(p));
        const phone = jid.split('@')[0];
        
        if (anu.action === 'add' && chat?.welcome && (!chat.primaryBot || chat.primaryBot === botId)) {
          let caption = chat.sWelcome ? chat.sWelcome : `╭┈──────────◯◝\n┊「 *Bienvenido* 」\n┊➤ *@${phone}*\n╰─────────────────╯`;
          humanizer.safeFire(humanizer.sendGroupEvent(client, anu.id, { text: caption, mentions: [jid] }));
        }
        if ((anu.action === 'remove' || anu.action === 'leave') && chat?.goodbye) {
          let caption = chat.sGoodbye ? chat.sGoodbye : `╭┈──────────◯◝\n┊「 *Hasta pronto* 」\n┊➤ *@${phone}*\n╰─────────────────╯`;
          humanizer.safeFire(humanizer.sendGroupEvent(client, anu.id, { text: caption, mentions: [jid] }));
        }
      }
    } catch (err) {
      console.log(chalk.gray(`[ BOT ] → ${err}`));
    }
  });
};
