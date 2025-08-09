import { writable } from 'svelte/store';

const DEFAULTS = {
  sex: 'male',
  age: 27,
  heightCm: 171,
  weightKg: 75,
  activityKey: 'moderate',
  cutPct: 0.20,
  bulkPct: 0.10
};

function createUserStore() {
  let initial = DEFAULTS;
  if (typeof localStorage !== 'undefined') {
    try {
      const saved = JSON.parse(localStorage.getItem('cc:user') || 'null');
      if (saved) initial = { ...DEFAULTS, ...saved };
    } catch {}
  }

  const store = writable(initial);
  store.subscribe((v) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('cc:user', JSON.stringify(v));
    }
  });

  return store;
}

export const user = createUserStore();
