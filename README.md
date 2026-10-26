# 🐸 El Sapo Volador Bot (Edición RPG)

Un bot de WhatsApp potente, modificado y expandido para ser un **RPG social completo**, con sistema anti-ban integrado y minijuegos.

---

## 🚨 ¿Quién eres tú? (Lee esto primero)

Para que no te pierdas, identifica tu caso:

*   **Caso 1: Soy el Creador (o quiero serlo) y quiero alojar el bot en mi propio Termux/Servidor.**
    *   Si quieres tener tu propia copia del bot, con tu propia sesión de WhatsApp y tus propios datos, ve a la **Guía de Instalación desde Cero** (más abajo).
*   **Caso 2: Solo quiero usar el bot en mi grupo de WhatsApp.**
    *   Si solo quieres jugar con tus amigos en un grupo, **NO necesitas instalar nada**. Solo pídele al creador que agregue el bot a tu grupo y le dé permisos de administrador.

---

## ⚠️ Aviso Importante: Versión Custom vs. Versión Original

Este repositorio (**El Sapo Volador Bot**) es una **versión modificada y expandida** del bot original creado por **[ocrespoF](https://github.com/ocrespoF/BOT)**.

Aquí hemos añadido un sistema anti-ban, un RPG completo, clanes, economía y decenas de funciones nuevas. **Si buscas la versión limpia (Vanilla), sin juegos y sin modificaciones, te recomendamos descargar la versión original directamente desde el repositorio oficial de ocrespoF.**

---

## 🚀 Características Principales

*   🛡️ **Sistema Anti-Ban:** Incluye Humanizer (delays aleatorios), Warm-up (espera al arrancar) y LRU Cache para proteger tu cuenta.
*   🎮 **RPG Completo:** Clases (Guerrero, Mago, etc.), Equipamiento (Armas, Armaduras, Mascotas), Batallas por turnos y Jefes Globales.
*   💖 **Sistema Social:** Matrimonios, Harem, Embarazo (con temporizador), Adopción de hijos y sistema de Clanes.
*   💰 **Economía:** Monedas personalizables por grupo, Daily, Casino (Slots, Ruleta, Dados).
*   🏰 **Administración:** Sistema de Warns, Juicio Divino (quita vidas a inactivos), Anti-Delete, Anti-ViewOnce.

---

## 🔄 ¿Ya tienes la versión original y quieres pasar a la Custom sin perder tus datos?

Si ya tienes el bot original funcionando y quieres implementar nuestras funciones sin perder tu sesión de WhatsApp ni la base de datos de tus usuarios, sigue estos pasos:

**Opción A: La forma más fácil (Migrar sesión y base de datos)**

1. Descarga esta versión Custom siguiendo los pasos de instalación de abajo (en una carpeta nueva).
2. Una vez instalada, copia tu carpeta **`Sessions`** de tu bot viejo y pégala dentro de la carpeta de este bot nuevo. *(Esto evita que tengas que escanear el QR de nuevo).*
3. Copia tu archivo **`database.db`** (y `database.db-wal` si existe) del bot viejo a la carpeta del bot nuevo. *(Esto conserva a todos tus usuarios, niveles y dinero).*
4. Enciende este bot nuevo con `node index.js`. ¡Listo! Tendrás todas las funciones nuevas con tus datos viejos.

**Opción B: La forma manual (Inyectar el código en tu bot actual)**

1. Abre la carpeta de tu bot original.
2. Copia la carpeta **`cmds/rpg`** de este repositorio y pégala dentro de `cmds/` en tu bot original.
3. Copia los archivos de la carpeta **`utils/`** (como `humanizer.js`, `battleEngine.js`, etc.) a tu carpeta `utils/`.
4. Reemplaza tu archivo **`core/system/middleware.js`** por el de este repositorio (es el que tiene el anti-ban y la lógica del RPG).
5. Modifica tu `index.js` agregando las importaciones del `warmup` y `memoryGuard` (puedes guiarte por el `index.js` de este repositorio).

---

## 📱 Guía de Instalación desde Cero (Para nuevos creadores)

Sigue estos pasos al pie de la letra si quieres tener tu propia copia del bot funcionando en Termux.

### 1. Requisitos Previos

Necesitas tener instalada la aplicación **Termux** (descárgala desde F-Droid, la de Play Store está desactualizada).
Abre Termux y actualiza los paquetes:

```bash
pkg update -y && pkg upgrade -y
 ```
---
### 2. Instalar las herramientas necesarias

El bot necesita Git, Node.js (versión 22 o superior), y FFmpeg para los stickers y audios.

```bash
pkg install -y git nodejs ffmpeg
 ```
---
### 3. Descargar el Bot (Clonar el repositorio)

Copia y pega este comando para descargar el código a tu teléfono:

```bash
git clone https://github.com/Leyenda08/El-Sapo-Volador.git
cd El-Sapo-Volador
```
---
### 4. Instalar las dependencias

El bot necesita descargar unas librerías internas para funcionar. Esto puede tardar unos minutos.

```bash
npm install
```
---
### 5. Iniciar el bot y vincular WhatsApp
Inicia el bot:

```bash
node index.js

```
Aparecerá un Código QR en la pantalla. Escanéalo desde tu WhatsApp (Ajustes > Dispositivos vinculados > Vincular dispositivo).

Opcional: Si prefieres usar un código de 8 dígitos, detén el proceso (Ctrl+C) e inicia con: ``` node index.js code```  y pon tu número.

---
### 6. Mantener el bot encendido 24/7 (Recomendado)

Si cierras Termux, el bot se apagará. Para que se quede encendido en segundo plano, instala PM2:

```bash
npm install -g pm2
pm2 start index.js --name "sapo-bot"
pm2 save
```
Para ver los logs (errores o mensajes) usa: ```pm2 logs sapo-bot  ```

---

⚠️ **Advertencia para creadores:** Para que el bot funcione correctamente (juicios, antilink, etc.), debe ser **Administrador** en los grupos donde lo agregues. Además, usa el comando `.humanizer velocidad normal` en tu chat privado para activar el sistema anti-ban y evitar que WhatsApp te banee.

---

## 🏆 Créditos y Agradecimientos

*   **Creador Original (Base Vanilla):** [ocrespoF](https://github.com/ocrespoF/BOT) por el núcleo base del bot.
*   **Modificaciones y Sistemas RPG:** Creados por **Leyenda 08** (con asistencia de **DeepSeek AI**).
*   **Librerías:** Baileys, Node.js, SQLite, yt-dlp.

---
_Hecho con ❤️ para la comunidad. Prohibida su venta sin autorización._
