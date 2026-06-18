import React, { useState, useEffect } from 'react';
import { UserContext } from './context';

const STORAGE_KEY = 'cc:user';

const DEFAULTS = {
  sex: '',
  age: '',
  heightCm: '',
  weightKg: '',
  activityKey: '',
  targetWeightKg: ''
};

function loadFromStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to ensure all keys exist
      return { ...DEFAULTS, ...parsed };
    }
  } catch {
    // Corrupt data — ignore and start fresh
  }
  return DEFAULTS;
}

export function UserProvider({ children }) {
  const [user, setUser] = useState(loadFromStorage);

  useEffect(() => {
    // Only persist if at least one meaningful field is filled
    const hasData = user.sex || user.age || user.heightCm || user.weightKg;
    if (hasData) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    }
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}
