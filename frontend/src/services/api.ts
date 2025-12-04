export const API_BASE_URL = 'http://127.0.0.1:8000/api';

export const api = {
  // Função genérica para requisições
  request: async (endpoint: string, method: string, body?: any) => {
    const headers = {
      'Content-Type': 'application/json',
    };

    const config: RequestInit = {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro na requisição');
      }
      
      return data;
    } catch (error: any) {
      console.error("API Error:", error);
      throw error;
    }
  }
};