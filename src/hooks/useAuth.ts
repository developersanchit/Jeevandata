import { useState, useEffect } from 'react';

export function useAuth(role: 'doctor' | 'hospital' | 'donor') {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState('');

  // Check for existing session on mount
  useEffect(() => {
    const session = localStorage.getItem(`session_${role}`);
    if (session) {
      setIsLoggedIn(true);
    }
  }, [role]);

  const login = (id: string, password: string) => {
    setError('');
    if (!id || !password) {
      setError('Please fill in all fields.');
      return false;
    }

    const users = JSON.parse(localStorage.getItem('mock_users') || '{}');
    const userKey = `${role}_${id}`;
    
    if (users[userKey]) {
      // User exists, verify password
      if (users[userKey].password === password) {
        localStorage.setItem(`session_${role}`, id);
        setIsLoggedIn(true);
        return true;
      } else {
        setError('Incorrect credentials. Please try again.');
        return false;
      }
    } else {
      // First time logging in with this ID: Auto-register for hackathon demo
      users[userKey] = { id, password };
      localStorage.setItem('mock_users', JSON.stringify(users));
      localStorage.setItem(`session_${role}`, id);
      setIsLoggedIn(true);
      return true;
    }
  };

  const logout = () => {
    localStorage.removeItem(`session_${role}`);
    setIsLoggedIn(false);
  };

  return { isLoggedIn, error, login, logout };
}
