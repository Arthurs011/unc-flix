import "@testing-library/jest-dom";

// Node's experimental localStorage can shadow jsdom's and be non-functional
// (it logs "--localstorage-file was provided without a valid path"), so pin a
// dependable in-memory implementation for every test.
const memory = new Map<string, string>();
const memoryStorage: Storage = {
  getItem: (k) => (memory.has(k) ? memory.get(k)! : null),
  setItem: (k, v) => {
    memory.set(k, String(v));
  },
  removeItem: (k) => {
    memory.delete(k);
  },
  clear: () => {
    memory.clear();
  },
  key: (i) => Array.from(memory.keys())[i] ?? null,
  get length() {
    return memory.size;
  },
};
Object.defineProperty(globalThis, "localStorage", {
  value: memoryStorage,
  configurable: true,
  writable: true,
});

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});
