import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { AppUser, getCurrentUser, login as authLogin, logout as authLogout, seedDefaultUsers } from './auth';

interface AuthContextType {
  user: AppUser | null;
  login: (email: string, password: string) => AppUser | null;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);

  useEffect(() => {
    seedDefaultUsers();
    setUser(getCurrentUser());
  }, []);

  const login = useCallback((email: string, password: string) => {
    const u = authLogin(email, password);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(() => {
    authLogout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
