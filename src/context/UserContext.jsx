import React, { useState, useEffect } from 'react';
import { UserContext } from './context';

const DEFAULTS = {
  sex: '',
  age: '',
  heightCm: '',
  weightKg: '',
  activityKey: '',
  targetWeightKg: ''
};

export function UserProvider({ children }) {
  // Always start with empty defaults, ignore localStorage for clean start
  const [user, setUser] = useState(DEFAULTS);

  useEffect(() => {
    // Clear any existing stored data to ensure clean start
    localStorage.removeItem('cc:user');
  }, []);

  useEffect(() => {
    // Only save if at least one meaningful field is filled
    if (user.sex || user.age || user.heightCm || user.weightKg) {
      localStorage.setItem('cc:user', JSON.stringify(user));
    }
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}


