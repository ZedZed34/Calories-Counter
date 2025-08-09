import { writable } from 'svelte/store';

const DEFAULTS = {
  sex: '',
  age: '',
  heightCm: '',
  weightKg: '',
  activityKey: '',
  targetWeightKg: ''    // target weight goal
};

function createUserStore() {
  // Always start with empty defaults, ignore localStorage for clean start
  let initial = DEFAULTS;
  
  // Clear any existing stored data to ensure clean start
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('cc:user');
  }

  const store = writable(initial);
  
  // Don't save to localStorage until user actually fills out form
  // This prevents default values from being stored
  store.subscribe((v) => {
    // Only save if at least one meaningful field is filled
    if (typeof localStorage !== 'undefined' && (v.sex || v.age || v.heightCm || v.weightKg)) {
      localStorage.setItem('cc:user', JSON.stringify(v));
    }
  });

  return store;
}

export const user = createUserStore();
