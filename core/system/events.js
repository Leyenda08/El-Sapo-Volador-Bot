import chalk from 'chalk';
import { getGroupMeta, getBotId, getBotSettings } from '../../utils/tools.js';
import humanizer from '../../utils/humanizer.js';

function formatWelcomeGoodbyeText(template, { phone, groupName, groupDesc, memberCount }) {
  if (!template) return '';
  const now = new Date();
  const timeFormatted = now.toLocaleString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true,
  });
  return template
    .replace(/@user|\{user\}|\{usuario\}/gi, '@' + phone)
    .replace(/@group|\{group\}|\{grupo\}/gi, groupName || 'el grupo')
    .replace(/@desc|\{desc\}|\{description\}/gi, groupDesc || 'Sin descripción')
    .replace(/@members|\{members\}|\{miembros\}|\{total\}/gi, String(memberCount || 1))
    .replace(/@time|\{time\}|\{hora\}/gi, timeFormatted);
}

export default async (client, m) => {
  client.ev.removeAllListeners('group-participants.update');
  client.ev.on('group-participants.update', async (anu) => {
    try {
      if (!global.botReady || (Date.now() - (global.bootTime || 0)) < 15000) return;
      const metadata = await getGroupMeta(client, anu.id);
      const groupAdmins = metadata?.participants.filter(p => (p.admin === 'admin' || p.admin === 'superadmin')) || [];
      const chat = global?.db?.data?.chats?.[anu.id];
      const botId = getBotId(client);
      const primaryBotId = chat?.primaryBot;
      const memberCount = metadata?.participants?.length || 1;
      const isSelf = getBotSettings(client)?.self ?? false;
      if (isSelf) return;

      for (const p of anu.participants) {
        const jid = typeof p === 'string' ? p : (p.id || p.phoneNumber || String(p));
        const phone = jid.split('@')[0];
        let pp = 'https://cdn.yuki-wabot.my.id/files/2PVh.jpeg';
        try { pp = await client.profilePictureUrl(jid, 'image'); } catch {}

        const botSettings = getBotSettings(client);
        const newsletterJid = (botSettings.newsletter_id && botSettings.newsletter_id.endsWith('@newsletter'))
          ? botSettings.newsletter_id
          : '120363401404146384@newsletter';
        const fakeContext = {
          contextInfo: {
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid, serverMessageId: '100',
              newsletterName: botSettings.nameid || botSettings.namebot || 'YukiBot',
            },
            externalAdReply: {
              title: botSettings.namebot, body: global.dev || '',
              mediaUrl: null, description: null, previewType: 'PHOTO',
              thumbnailUrl: botSettings.icon, sourceUrl: botSettings.link,
              mediaType: 1, renderLargerThumbnail: false,
            },
            mentionedJid: [jid],
          },
        };
        const nowStr = new Date().toLocaleString('es-ES', {
          day: '2-digit', month: '2-digit', year: 'numeric',
          hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true,
        });

        if (anu.action === 'add' && chat?.welcome && (!primaryBotId || primaryBotId === botId)) {
          let caption;
          if (chat.sWelcome && chat.sWelcome.trim()) {
            caption = formatWelcomeGoodbyeText(chat.sWelcome, { phone, groupName: metadata.subject, groupDesc: metadata?.desc || '', memberCount });
          } else {
            caption = '╭┈──────────◯◝\n┊「 *Bienvenido (⁠ ⁠ꈍ⁠ᴗ⁠ꈍ⁠)* 」\n┊︶︶︶︶︶︶︶︶︶︶︶\n┊  *Nombre ›* @' + phone + '\n┊  *Grupo ›* ' + metadata.subject + '\n┊  *Miembros ›* #' + memberCount + '\n┊  *Fecha ›* ' + nowStr + '\n┊┈─────────◯◝\n┊➤ *Usa .menu para ver los comandos.*\n┊➤ *Ahora somos ' + memberCount + ' miembros.*\n┊ ︿︿︿︿︿︿︿︿︿︿︿\n╰─────────────────╯';
          }
          humanizer.safeFire(humanizer.sendGroupEvent(client, anu.id,
            { image: { url: pp }, caption, mentions: [jid], ...fakeContext },
            { skipTyping: true }
          ));
        }

        if ((anu.action === 'remove' || anu.action === 'leave') && chat?.goodbye && (!primaryBotId || primaryBotId === botId)) {
          let caption;
          if (chat.sGoodbye && chat.sGoodbye.trim()) {
            caption = formatWelcomeGoodbyeText(chat.sGoodbye, { phone, groupName: metadata.subject, groupDesc: metadata?.desc || '', memberCount });
          } else {
            caption = '╭┈──────────◯◝\n┊「 *Hasta pronto (⁠╥⁠﹏⁠╥⁠)* 」\n┊︶︶︶︶︶︶︶︶︶︶︶\n┊  *Nombre ›* @' + phone + '\n┊  *Grupo ›* ' + metadata.subject + '\n┊  *Miembros ›* #' + memberCount + '\n┊  *Fecha ›* ' + nowStr + '\n┊┈─────────◯◝\n┊➤ *Ojalá vuelva pronto al grupo.*\n┊➤ *Ahora somos ' + memberCount + ' miembros.*\n┊ ︿︿︿︿︿︿︿︿︿︿︿\n╰─────────────────╯';
          }
          humanizer.safeFire(humanizer.sendGroupEvent(client, anu.id,
            { image: { url: pp }, caption, mentions: [jid], ...fakeContext },
            { skipTyping: true }
          ));
        }

        if (anu.action === 'promote' && chat?.alerts && (!primaryBotId || primaryBotId === botId)) {
          const usuario = anu.author || anu.actor || '';
          const byStr = usuario ? ' por *@' + usuario.split('@')[0] + '*' : '';
          const adminMentions = groupAdmins.map(v => v.id || v.jid).filter(Boolean);
          const mentions = [jid, ...(usuario ? [usuario] : []), ...adminMentions];
          humanizer.safeFire(humanizer.sendGroupAction(client, anu.id,
            { text: '「」 *@' + phone + '* ha sido promovido a Administrador' + byStr + '.', mentions }
          ));
        }

        if (anu.action === 'demote' && chat?.alerts && (!primaryBotId || primaryBotId === botId)) {
          const usuario = anu.author || anu.actor || '';
          const byStr = usuario ? ' por *@' + usuario.split('@')[0] + '*' : '';
          const adminMentions = groupAdmins.map(v => v.id || v.jid).filter(Boolean);
          const mentions = [jid, ...(usuario ? [usuario] : []), ...adminMentions];
          humanizer.safeFire(humanizer.sendGroupAction(client, anu.id,
            { text: '「」 *@' + phone + '* ha sido degradado de Administrador' + byStr + '.', mentions }
          ));
        }

        await humanizer.humanDelay(1500, 3500);
      }
    } catch (err) {
      console.log(chalk.gray('[ BOT  ]  → ' + err));
    }
  });

  if (client._stubHandler) client.ev.off('messages.upsert', client._stubHandler);
  client._stubHandler = async ({ messages }) => {
    const m = messages?.[0];
    if (!m || !m.messageStubType) return;
    const id = m.key?.remoteJid;
    if (!id) return;
    const chat = global.db.data.chats[id];
    const botId = getBotId(client);
    const primaryBotId = chat?.primaryBot;
    if (!chat?.alerts || (primaryBotId && primaryBotId !== botId)) return;
    if (getBotSettings(client)?.self ?? false) return;
    const actor = m.key?.participant || m.participant || m.key?.remoteJid || '';
    const phone = actor.split('@')[0] || '';
    const groupMetadata = await getGroupMeta(client, id);
    const groupAdmins = groupMetadata?.participants?.filter(p => (p.admin === 'admin' || p.admin === 'superadmin')) || [];
    const adminMentions = groupAdmins.map(v => v.id || v.jid).filter(Boolean);
    const mentions = [actor, ...adminMentions].filter(Boolean);
    const send = (text) => humanizer.safeFire(humanizer.sendGroupAction(client, id, { text, mentions }));
    if (m.messageStubType == 21) send('「」 @' + phone + ' cambió el nombre del grupo a *' + (m.messageStubParameters?.[0] || '') + '*');
    if (m.messageStubType == 22) send('「」 @' + phone + ' cambió el icono del grupo.');
    if (m.messageStubType == 23) send('「」 @' + phone + ' restableció el enlace del grupo.');
    if (m.messageStubType == 24) send('「」 @' + phone + ' cambió la descripción del grupo.');
    if (m.messageStubType == 25) send('「」 @' + phone + ' cambió los ajustes del grupo.');
    if (m.messageStubType == 26) send('「」 @' + phone + ' cambió los ajustes de mensajes del grupo.');
  };
  client.ev.on('messages.upsert', client._stubHandler);
};
