import api from './authService';

export const parentsService = {
  async createParent(parentData) {
    const response = await api.post('/parents', parentData);
    return response.data;
  },

  async getParents({ page = 1, limit = 10, search = '', relationship = '' } = {}) {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(limit));
    if (search) params.set('search', search);
    if (relationship) params.set('relationship', relationship);
    const response = await api.get(`/parents?${params.toString()}`);
    return response.data;
  },

  async getParent(id) {
    const response = await api.get(`/parents/${id}`);
    return response.data;
  },

  async updateParent(id, parentData) {
    const response = await api.put(`/parents/${id}`, parentData);
    return response.data;
  },

  async deleteParent(id) {
    const response = await api.delete(`/parents/${id}`);
    return response.data;
  },

  async getParentStats() {
    const response = await api.get('/parents/stats');
    return response.data;
  }
};

export default parentsService;
