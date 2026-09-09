import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, UserRole } from '../features/auth/types/auth.types';
import { authService } from '../features/auth/services/authService';

export type { User, UserRole };

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (usernameOrEmailOrId: string, password: string, rememberMe: boolean, selectedLoginType: 'ADMIN' | 'WORKER') => Promise<User>;
  loginWithGoogle: (email: string, name: string, selectedLoginType: 'ADMIN' | 'WORKER') => Promise<User>;
  loginAsDemo: () => void;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const activeUser = authService.getCurrentUser();
    const isAuth = authService.isAuthenticated();
    if (activeUser && isAuth) {
      setUser(activeUser);
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = async (usernameOrEmailOrId: string, password: string, rememberMe: boolean, selectedLoginType: 'ADMIN' | 'WORKER') => {
    setLoading(true);
    try {
      const loggedUser = await authService.login(usernameOrEmailOrId, password, rememberMe, selectedLoginType);
      setUser(loggedUser);
      setIsAuthenticated(true);
      return loggedUser;
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (email: string, name: string, selectedLoginType: 'ADMIN' | 'WORKER') => {
    setLoading(true);
    try {
      const loggedUser = await authService.googleLogin(email, name, selectedLoginType);
      setUser(loggedUser);
      setIsAuthenticated(true);
      return loggedUser;
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginAsDemo = async () => {
    setLoading(true);
    try {
      const loggedUser = await authService.login('admin@sitesentinel.com', 'Admin@123', true, 'ADMIN');
      setUser(loggedUser);
      setIsAuthenticated(true);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      localStorage.setItem('site_sentinel_logged_out', 'true');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, loginWithGoogle, loginAsDemo, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
