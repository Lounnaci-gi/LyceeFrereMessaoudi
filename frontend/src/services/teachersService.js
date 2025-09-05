import api from './authService';

export const teachersService = {
  async createTeacher(formData) {
    // formData should be an instance of FormData
    const response = await api.post('/teachers', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async getTeachers({ page = 1, limit = 10, search = '', subject = '', classId = '', status = '' } = {}) {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(limit));
    if (search) params.set('search', search);
    if (subject) params.set('subject', subject);
    if (classId) params.set('class', classId);
    if (status) params.set('status', status);
    const response = await api.get(`/teachers?${params.toString()}`);
    return response.data;
  },

  async getTeacher(id) {
    const response = await api.get(`/teachers/${id}`);
    return response.data;
  },

  async updateTeacher(id, formData) {
    const response = await api.put(`/teachers/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async deleteTeacher(id) {
    const response = await api.delete(`/teachers/${id}`);
    return response.data;
  },

  async getTeacherStats() {
    const response = await api.get('/teachers/stats/overview');
    return response.data;
  }
};

export default teachersService;
