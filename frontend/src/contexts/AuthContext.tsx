import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Tipagem robusta para o usuário
interface User {
  id?: number | string; // Importante para matrícula
  email: string;
  name: string;
  type: 'student' | 'professor';
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // 1. Ao iniciar, recupera os dados salvos
  useEffect(() => {
    const loadStorageData = () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user_data');
      
      if (token && storedUser) {
        setIsAuthenticated(true);
        try {
            setUser(JSON.parse(storedUser));
        } catch {
            // Se o JSON estiver corrompido
            setUser({ email: 'erro@login.com', name: 'Erro', type: 'student' });
        }
      }
      setLoading(false);
    };

    loadStorageData();
  }, []);

  // 2. Login atualizado para capturar NOME e ID
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const payload = { email, senha: password };

      const response = await fetch('http://127.0.0.1:8000/api/auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        
        const token = data.access || data.access_token || data.token;
        localStorage.setItem('token', token);

        // --- LÓGICA DE CAPTURA DE DADOS ---
        // Tenta pegar os dados vindos do backend (data.user ou direto na raiz)
        // Se o backend não mandar nada, usamos o email como fallback temporário
        
        let userData: User = {
            email: email,
            name: 'Aluno', // Valor padrão
            type: 'student',
            id: 1 // Valor padrão
        };

        // Cenário 1: Backend manda um objeto 'user' (Ideal)
        if (data.user) {
            userData = {
                email: data.user.email || email,
                name: data.user.nome || data.user.name || 'Aluno',
                id: data.user.id || data.user.pk,
                type: 'student'
            };
        } 
        // Cenário 2: Backend manda dados na raiz da resposta
        else if (data.nome || data.name) {
            userData = {
                email: email,
                name: data.nome || data.name,
                id: data.id || data.pk || 1,
                type: 'student'
            };
        }
        // Cenário 3: Fallback (Backend não mandou nome)
        else {
             // Usa a parte antes do @ como nome
             userData.name = email.split('@')[0];
        }

        console.log("DADOS SALVOS:", userData); // Para debug

        // Salva os dados completos no navegador
        localStorage.setItem('user_data', JSON.stringify(userData));
        
        setIsAuthenticated(true);
        setUser(userData);
        
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Erro de conexão:", error);
      return false;
    }
  };

  const register = async (userData: any): Promise<boolean> => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/register/student/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      return response.ok;
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