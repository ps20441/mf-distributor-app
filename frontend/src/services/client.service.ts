import api from './api';

export interface Client {
  id: string;
  pan: string;
  name: string;
  mobile: string;
  email?: string;
  dateOfBirth?: string;
  kycStatus: string;
  importedFrom?: string;
  distributorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientData {
  pan: string;
  name: string;
  mobile: string;
  email?: string;
  dateOfBirth?: string;
  kycStatus?: string;
}

export const clientService = {
  async getClients(): Promise<{ clients: Client[] }> {
    const response = await api.get('/clients');
    return response.data;
  },

  async getClientById(id: string): Promise<{ client: Client }> {
    const response = await api.get(`/clients/${id}`);
    return response.data;
  },

  async createClient(data: CreateClientData): Promise<{ message: string; client: Client }> {
    const response = await api.post('/clients', data);
    return response.data;
  },

  async updateClient(id: string, data: Partial<CreateClientData>): Promise<{ message: string; client: Client }> {
    const response = await api.put(`/clients/${id}`, data);
    return response.data;
  },

  async deleteClient(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/clients/${id}`);
    return response.data;
  },
};
