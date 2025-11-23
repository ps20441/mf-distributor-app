import api from './api';

export interface RegisterData {
  name: string;
  arn: string;
  mobile: string;
  email?: string;
  password: string;
  euin?: string;
}

export interface LoginData {
  mobile: string;
  password: string;
}

export interface Distributor {
  id: string;
  name: string;
  arn: string;
  mobile: string;
  email?: string;
  euin?: string;
  createdAt: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  distributor: Distributor;
}

export const authService = {
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  async getProfile(): Promise<{ distributor: Distributor }> {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
  },
};
