import api from './authService';

export const studentsService = {
  async createStudent(formData) {
    // formData should be an instance of FormData
    const response = await api.post('/students', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async getStudents({ page = 1, limit = 10, search = '', classId = '', gender = '', schoolingType = '' } = {}) {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(limit));
    if (search) params.set('search', search);
    if (classId) params.set('class', classId);
    if (gender) params.set('gender', gender);
    if (schoolingType) params.set('schoolingType', schoolingType);
    const response = await api.get(`/students?${params.toString()}`);
    return response.data;
  },

  async listClasses() {
    const response = await api.get('/classes');
    return response.data;
  },

  async createClass(classData) {
    const response = await api.post('/classes', classData);
    return response.data;
  },

  async listSpecialties() {
    const response = await api.get('/specialties');
    return response.data;
  },

  async createSpecialty(specialtyData) {
    const response = await api.post('/specialties', specialtyData);
    return response.data;
  },

  async getDashboardStats() {
    const response = await api.get('/students/stats');
    return response.data;
  },

  async updateStudent(studentId, formData) {
    const response = await api.put(`/students/${studentId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async deleteStudent(studentId) {
    const response = await api.delete(`/students/${studentId}`);
    return response.data;
  }
};

export default studentsService;

