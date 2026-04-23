import {
  createContext,
  ReactNode,
  useContext,
  useMemo,
  useState,
} from 'react';

import { api } from '@/src/services/barberAxisApi';
import type { User } from '@/src/types/barberAxis';

type AuthContextType = {
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: {
    name: string;
    email: string;
    password?: string;
  }) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  async function signIn(email: string, password: string) {
    const authenticatedUser = await api.login(email, password);
    setUser(authenticatedUser);
  }

  async function signUp(name: string, email: string, password: string) {
    const registeredUser = await api.register(name, email, password);
    setUser(registeredUser);
  }

  async function signOut() {
    setUser(null);
  }

  async function updateProfile(updates: {
    name: string;
    email: string;
    password?: string;
  }) {
    setUser((currentUser) => {
      if (!currentUser) {
        return currentUser;
      }

      return {
        ...currentUser,
        name: updates.name,
        email: updates.email,
        password: updates.password?.trim() ? updates.password : currentUser.password,
      };
    });
  }

  const value = useMemo(
    () => ({
      user,
      signIn,
      signUp,
      signOut,
      updateProfile,
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider.');
  }

  return context;
}
