export const activeBattles = new Map();

export function startBattle(chatId, p1, p2, type, prize = null) {
  activeBattles.set(chatId, {
    p1, p2, type, prize,
    hp1: 100, hp2: 100,
    turn: p1,
    timer: null,
    lastAction: Date.now()
  });
  return activeBattles.get(chatId);
}

export function endBattle(chatId) {
  const b = activeBattles.get(chatId);
  if (b && b.timer) clearTimeout(b.timer);
  activeBattles.delete(chatId);
}
