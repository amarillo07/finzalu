// Drop-in replacement for the window.storage API used inside Claude artifacts.
// Everything here is 100% local to this device/browser — nothing is sent
// anywhere, there is no login and no server, so it works fully offline and
// each person who installs the app on their own phone only ever sees their
// own data.
//
// Uses localStorage (simple + synchronous under the hood) wrapped in
// Promises so the rest of the app code doesn't need to change at all.

const PREFIX = "finanzas_mx::";

export const storage = {
  async get(key) {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (raw === null) throw new Error("not found");
    return { key, value: raw, shared: false };
  },

  async set(key, value) {
    window.localStorage.setItem(PREFIX + key, value);
    return { key, value, shared: false };
  },

  async delete(key) {
    window.localStorage.removeItem(PREFIX + key);
    return { key, deleted: true, shared: false };
  },

  async list(prefix = "") {
    const keys = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith(PREFIX + prefix)) keys.push(k.slice(PREFIX.length));
    }
    return { keys, prefix, shared: false };
  },
};
