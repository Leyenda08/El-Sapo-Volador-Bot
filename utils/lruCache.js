export default class LRUCache {
  constructor(maxSize = 500, ttlMs = 0) {
    if (!Number.isFinite(maxSize) || maxSize <= 0) throw new Error('maxSize inválido');
    this.maxSize = maxSize;
    this.ttlMs = ttlMs;
    this.map = new Map();
  }
  get(key) {
    if (!this.map.has(key)) return undefined;
    const e = this.map.get(key);
    if (this.ttlMs > 0 && Date.now() - e.t > this.ttlMs) { this.map.delete(key); return undefined; }
    this.map.delete(key); this.map.set(key, e);
    return e.v;
  }
  set(key, value) {
    if (this.map.has(key)) this.map.delete(key);
    this.map.set(key, { v: value, t: Date.now() });
    if (this.map.size > this.maxSize) {
      const oldest = this.map.keys().next().value;
      this.map.delete(oldest);
    }
  }
  has(key) { return this.get(key) !== undefined; }
  delete(key) { return this.map.delete(key); }
  clear() { this.map.clear(); }
  get size() { return this.map.size; }
  entries() { return this.map.entries(); }
  keys() { return this.map.keys(); }
  values() { return [...this.map.values()].map(e => e.v); }
  forEach(cb) { for (const [k, e] of this.map) cb(e.v, k, this); }
  prune() {
    if (this.ttlMs <= 0) return 0;
    const now = Date.now(); let removed = 0;
    for (const [k, e] of this.map) if (now - e.t > this.ttlMs) { this.map.delete(k); removed++; }
    return removed;
  }
}
export { LRUCache };
