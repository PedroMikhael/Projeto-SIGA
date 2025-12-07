import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id?: number | string;
  matricula?: string | number;
  email: string;
  name: string;
  type: 'student' | 'professor';
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: any, type?: 'student' | 'professor') => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStorageData = () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user_data');

      if (token && storedUser) {
        setIsAuthenticated(true);
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          setUser({ email: 'erro@login.com', name: 'Erro', type: 'student' });
        }
      }
      setLoading(false);
    };

    loadStorageData();
  }, []);

 const login = async (email: string, password: string): Promise<boolean> => {
  try {
    const payload = { email, senha: password };
    const response = await fetch('http://127.0.0.1:8000/api/auth/login/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) return false;

    const data = await response.json();
    const token = data.access;

    localStorage.setItem('token', token);

    let userData: User = {
      email: data.email,
      name: data.nome,
      type: data.type,
      id: data.matricula,
      matricula: data.matricula
    };

    localStorage.setItem('user_data', JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);

    return true;
  } catch (error) {
    console.error("Erro de conexão:", error);
    return false;
  }
};


  const register = async (userData: any, type: 'student' | 'professor' = 'student'): Promise<boolean> => {
    try {
      const endpoint =
        type === 'student'
          ? 'http://127.0.0.1:8000/api/auth/register/student/'
          : 'http://127.0.0.1:8000/api/auth/register/professor/';

      // Validação professor
      if (type === 'professor' && !userData.departamento) {
        throw new Error("O campo 'departamento' é obrigatório");
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erro backend:", errorText);
        throw new Error(errorText);
      }

      return true;
    } catch (error) {
      console.error("Erro requisição:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_data');
    setIsAuthenticated(false);
    setUser(null);
    window.location.href = '/auth';
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
