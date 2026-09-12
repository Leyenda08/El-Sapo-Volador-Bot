// cmds/owner/update.js
// Comando .update BLOQUEADO por seguridad.
// En vez de hacer git pull destructivo, guarda tus cambios y te recuerda usar
// el script `waupdate` desde Termux.

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export default {
  command: ['update', 'actualizar', 'fix'],
  category: 'owner',
  description: 'Bloqueado por seguridad. Usa "waupdate" en Termux.',
  isOwner: true,

  async run(client, m) {
    const BOT_DIR = process.cwd();
    let saved = false;
    let savedMsg = '';

    // 1. Guardar cambios actuales en git (seguro, NO destructivo)
    try {
      await execAsync('git add -A', { cwd: BOT_DIR });
      const msg = `WIP desde .update ${new Date().toISOString().slice(0, 16)}`;
      const { stdout } = await execAsync(`git commit -m "${msg}"`, { cwd: BOT_DIR });
      // Si hay algo que commitear, stdout traerá la línea de "files changed"
      if (stdout.includes('changed') || stdout.includes('insertion')) {
        saved = true;
        savedMsg = stdout.split('\n')[0];
      }
    } catch (_) {
      // "nothing to commit" no es error real, lo ignoramos
    }

    // 2. Comprobar rama actual
    let branch = 'desconocida';
    try {
      const { stdout } = await execAsync('git branch --show-current', { cwd: BOT_DIR });
      branch = stdout.trim();
    } catch {}

    // 3. Responder con instrucciones
    const text = [
      '🔒 *Comando .update BLOQUEADO por seguridad*',
      '',
      'Este comando hacía `git pull` directo y podía *borrar tus cambios custom*:',
      '_humanizer, warmup, LRU, memoryGuard, permisos admin, comando noche._',
      '',
      '✅ *Para actualizar de verdad:*',
      'Abre Termux y ejecuta:',
      '```',
      'waupdate',
      '```',
      '',
      '*Qué hace waupdate:*',
      '1. Guarda tus cambios en la rama `custom`',
      '2. Baja la versión oficial del creador',
      '3. Reaplica tus cambios automáticamente',
      '4. Reinicia el bot',
      '',
      `📂 Rama actual: *${branch}*`,
      saved
        ? `💾 _Cambios guardados: ${savedMsg}_`
        : 'ℹ️ _No había cambios nuevos que guardar._',
    ].join('\n');

    await client.sendMessage(m.chat, { text }, { quoted: m });
  },
};
