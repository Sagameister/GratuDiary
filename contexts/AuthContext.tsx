
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => Promise<boolean>;
  register: (name: string, email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  
  // Load session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('gratuDiary_currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const usersStr = localStorage.getItem('gratuDiary_users');
    const users: any[] = usersStr ? JSON.parse(usersStr) : [];
    
    const foundUser = users.find(u => u.email === email && u.password === pass);
    
    if (foundUser) {
      // Ensure we construct the user object correctly, handling potential missing joinedAt for old data
      const userObj: User = { 
        id: foundUser.id, 
        name: foundUser.name, 
        email: foundUser.email,
        joinedAt: foundUser.joinedAt || new Date().toISOString()
      };
      setUser(userObj);
      localStorage.setItem('gratuDiary_currentUser', JSON.stringify(userObj));
      return true;
    }
    return false;
  };

  const register = async (name: string, email: string, pass: string): Promise<boolean> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const usersStr = localStorage.getItem('gratuDiary_users');
    const users: any[] = usersStr ? JSON.parse(usersStr) : [];
    
    if (users.some(u => u.email === email)) {
      return false; // User exists
    }
    
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password: pass, // In a real app, never store plain text passwords!
      joinedAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('gratuDiary_users', JSON.stringify(users));
    
    // Auto login after register
    const userObj: User = { 
      id: newUser.id, 
      name: newUser.name, 
      email: newUser.email,
      joinedAt: newUser.joinedAt
    };
    setUser(userObj);
    localStorage.setItem('gratuDiary_currentUser', JSON.stringify(userObj));
    
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('gratuDiary_currentUser');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};