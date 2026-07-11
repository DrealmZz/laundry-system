import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type User = { 
  id: number; 
  nama_lengkap: string; 
  username?: string;
  email: string; 
  role: string; 
  alamat?: string;
  no_hp?: string;
  password_reset_required?: boolean;
};
type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  refreshProfile: () => Promise<void>;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Timeout fallback: jika AsyncStorage tidak respond dalam 3 detik,
    // lanjutkan saja agar tidak stuck di splash screen
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    Promise.all([
      AsyncStorage.getItem('token'),
      AsyncStorage.getItem('user'),
    ])
      .then(([t, u]) => {
        if (t) setToken(t);
        if (u) {
          try {
            setUser(JSON.parse(u));
          } catch {
            // Data user corrupt, abaikan
          }
        }
        // Auto-refresh dari server untuk fix corrupted data di AsyncStorage
        if (t) {
          import('../services/api')
            .then(({ api }) => api.getProfile())
            .then((userData) => {
              if (userData) {
                setUser(userData as User);
                AsyncStorage.setItem('user', JSON.stringify(userData));
              }
            })
            .catch(() => {});
        }
      })
      .catch(() => {
        // AsyncStorage error, lanjutkan tanpa data tersimpan
      })
      .finally(() => {
        clearTimeout(timeout);
        setIsLoading(false);
      });

    return () => clearTimeout(timeout);
  }, []);

  const login = async (t: string, u: User) => {
    try {
      await AsyncStorage.setItem('token', t);
      await AsyncStorage.setItem('user', JSON.stringify(u));
    } catch {
      // Simpan di state saja jika storage gagal
    }
    setToken(t);
    setUser(u);
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    } catch {
      // Abaikan error saat hapus
    }
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (updates: Partial<User>) => {
    const updated = { ...user, ...updates } as User;
    try {
      await AsyncStorage.setItem('user', JSON.stringify(updated));
    } catch {
      // Simpan di state saja jika storage gagal
    }
    setUser(updated);
  };

  const refreshProfile = async () => {
    if (!token) return;
    try {
      const { api } = await import('../services/api');
      const userData = await api.getProfile();
      setUser(userData as User);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateProfile, refreshProfile, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
