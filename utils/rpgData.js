export const CLASES = {
  guerrero: { nombre: '⚔️ Guerrero', hp: 120, atk: 15, def: 10, spd: 5, crit: 5, desc: 'Alta vida y defensa.' },
  mago: { nombre: '🔮 Mago', hp: 80, atk: 25, def: 5, spd: 8, crit: 15, desc: 'Ataques devastadores.' },
  asesino: { nombre: '🗡️ Asesino', hp: 90, atk: 18, def: 5, spd: 15, crit: 25, desc: 'Muy rápido y letal.' },
  tanque: { nombre: '🛡️ Paladín', hp: 150, atk: 8, def: 20, spd: 2, crit: 2, desc: 'Una fortaleza andante.' },
  arquero: { nombre: '🏹 Arquero', hp: 95, atk: 20, def: 8, spd: 12, crit: 18, desc: 'Equilibrado.' }
};

export const EQUIPO = {
  // ARMAS
  arma_madera: { nombre: '🏏 Espada de Madera', tipo: 'arma', atk: 5, def: 0, hp: 0, spd: 0, crit: 0, precio: 500, nivelReq: 1 },
  arma_hierro: { nombre: '🗡️ Espada de Hierro', tipo: 'arma', atk: 15, def: 0, hp: 0, spd: 0, crit: 2, precio: 2000, nivelReq: 2 },
  arma_magica: { nombre: '🪄 Bastón Mágico', tipo: 'arma', atk: 30, def: 0, hp: 0, spd: 5, crit: 5, precio: 6000, nivelReq: 5 },
  arma_katana: { nombre: '⚔️ Katana Filosa', tipo: 'arma', atk: 45, def: 0, hp: 0, spd: 10, crit: 10, precio: 12000, nivelReq: 8 },
  arma_excalibur: { nombre: '🌟 Excalibur', tipo: 'arma', atk: 80, def: 10, hp: 20, spd: 15, crit: 20, precio: 50000, nivelReq: 15 },
  
  // ARMADURAS
  arm_cuero: { nombre: '🥋 Armadura de Cuero', tipo: 'armadura', atk: 0, def: 10, hp: 20, spd: 2, crit: 0, precio: 1000, nivelReq: 1 },
  arm_hierro: { nombre: '🛡️ Armadura de Hierro', tipo: 'armadura', atk: 0, def: 25, hp: 50, spd: -5, crit: 0, precio: 5000, nivelReq: 4 },
  arm_mago: { nombre: '🧥 Túnica Arcana', tipo: 'armadura', atk: 5, def: 15, hp: 30, spd: 10, crit: 5, precio: 8000, nivelReq: 6 },
  arm_dragon: { nombre: '🐉 Escamas de Dragón', tipo: 'armadura', atk: 10, def: 50, hp: 100, spd: 0, crit: 5, precio: 25000, nivelReq: 10 },
  
  // MASCOTAS
  pet_pollo: { nombre: '🐥 Pollo Asesino', tipo: 'mascota', atk: 5, def: 0, hp: 10, spd: 5, crit: 1, precio: 500, nivelReq: 1 },
  pet_lobo: { nombre: '🐺 Lobo Salvaje', tipo: 'mascota', atk: 15, def: 5, hp: 30, spd: 5, crit: 5, precio: 3000, nivelReq: 3 },
  pet_halcon: { nombre: '🦅 Halcón Sombrío', tipo: 'mascota', atk: 10, def: 0, hp: 10, spd: 20, crit: 10, precio: 6000, nivelReq: 5 },
  pet_fenix: { nombre: '🔥 Fénix Inmortal', tipo: 'mascota', atk: 40, def: 10, hp: 80, spd: 15, crit: 15, precio: 40000, nivelReq: 12 },

  // ÍTEMS DE PRESTIGIO (Súper Exclusivos)
  prestige_arma: { nombre: '🌌 Espada del Vacío', tipo: 'arma', atk: 150, def: 50, hp: 100, spd: 30, crit: 30, precio: 100000, nivelReq: 1, prestigeReq: 1 },
  prestige_arm: { nombre: '👑 Armadura Celestial', tipo: 'armadura', atk: 50, def: 150, hp: 500, spd: 20, crit: 10, precio: 100000, nivelReq: 1, prestigeReq: 1 },
  prestige_pet: { nombre: '🐉 Dragón Ancestral', tipo: 'mascota', atk: 100, def: 100, hp: 200, spd: 50, crit: 25, precio: 150000, nivelReq: 1, prestigeReq: 1 }
};
