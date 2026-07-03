import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// 1. Updated User Interface (Matches your Java Backend)
export interface User {
  id: number;          
  fullName: string;    
  email: string;
  phoneNumber?: string;
  address?: string;
  pincode?: string;
  walletBalance?: number;
  role?: 'CUSTOMER' | 'PROVIDER';
}

// 2. Updated Context Type (Includes 'logout')
interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  logout: () => void;      
  isAuthenticated: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 3. Load User from LocalStorage on App Start
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setCurrentUser(parsedUser);
      } catch (e) {
        console.error("Failed to parse user data", e);
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  // 4. THE LOGOUT FUNCTION (This fixes your blank screen)
  const logout = () => {
    localStorage.removeItem('user');
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    setCurrentUser,
    logout,
    isAuthenticated: !!currentUser
  };

  return (
    <AppContext.Provider value={value}>
      {!isLoading && children}
    </AppContext.Provider>
  );
}

// 5. Custom Hook
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}