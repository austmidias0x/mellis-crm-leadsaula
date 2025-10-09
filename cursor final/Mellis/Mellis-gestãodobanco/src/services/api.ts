import type { Lead, LeadsResponse, LeadsStats, LeadsFilters } from '../types/lead';

const API_BASE_URL = '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

export const api = {
  auth: {
    login: async (password: string): Promise<string> => {
      console.log('API: Chamando /api/auth/login...');
      try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password }),
        });
        console.log('API: Status da resposta:', response.status);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('API: Erro na resposta:', errorData);
          throw new Error(errorData.error || 'Failed to login');
        }
        
        const data = await response.json();
        console.log('API: Token recebido com sucesso');
        return data.token;
      } catch (error) {
        console.error('API: Erro na requisição:', error);
        throw error;
      }
    },

    verify: async (): Promise<boolean> => {
      const response = await fetch(`${API_BASE_URL}/auth/verify`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Invalid token');
      const data = await response.json();
      return data.valid;
    },
  },

  leads: {
    getAll: async (filters: LeadsFilters = {}): Promise<LeadsResponse> => {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });

      const response = await fetch(`${API_BASE_URL}/leads?${params}`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch leads');
      return response.json();
    },

    getById: async (id: number): Promise<Lead> => {
      const response = await fetch(`${API_BASE_URL}/leads/${id}`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch lead');
      return response.json();
    },

    getStats: async (): Promise<LeadsStats> => {
      const response = await fetch(`${API_BASE_URL}/leads/stats`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },

    updateStatus: async (id: number, status: string): Promise<Lead> => {
      const response = await fetch(`${API_BASE_URL}/leads/${id}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('Failed to update lead status');
      return response.json();
    },

    exportCsv: async (filters: LeadsFilters = {}): Promise<void> => {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });

      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/leads/export/csv?${params}`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      if (!response.ok) throw new Error('Failed to export CSV');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    },
  },
};

