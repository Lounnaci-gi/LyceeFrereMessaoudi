import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { UserCheck, Plus, Search, Filter, Download, X, Edit, Trash2, Eye } from 'lucide-react';
import { teachersService } from '../services/teachersService';
import { studentsService } from '../services/studentsService';
import { useAuth } from '../contexts/AuthContext';

const Teachers = () => {
  const { isAuthenticated, loading } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    if (loading || !isAuthenticated) return;
    const load = async () => {
      try {
        const [cls] = await Promise.all([
          studentsService.listClasses()
        ]);
        if (cls.success) setClasses(cls.data);
        // TODO: Ajouter le service pour les matières quand il sera disponible
        setSubjects([
          { _id: '1', name: 'الرياضيات', code: 'MATH' },
          { _id: '2', name: 'الفيزياء', code: 'PHY' },
          { _id: '3', name: 'الكيمياء', code: 'CHEM' },
          { _id: '4', name: 'اللغة العربية', code: 'AR' },
          { _id: '5', name: 'اللغة الفرنسية', code: 'FR' },
          { _id: '6', name: 'اللغة الإنجليزية', code: 'EN' },
          { _id: '7', name: 'التاريخ والجغرافيا', code: 'HIST' },
          { _id: '8', name: 'العلوم الطبيعية', code: 'BIO' }
        ]);
      } catch (e) {
        console.error('Erreur chargement données:', e);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, isAuthenticated]);

  const fetchTeachers = async (page = 1) => {
    try {
      const res = await teachersService.getTeachers({ 
        page, 
        limit: pagination.limit, 
        search, 
        subject: subjectFilter, 
        class: classFilter, 
        status: statusFilter 
      });
      if (res.success) {
        setTeachers(res.data.teachers);
        setPagination(res.data.pagination);
      }
    } catch (e) {
      console.error('Erreur chargement enseignants:', e);
    }
  };

  useEffect(() => {
    if (loading || !isAuthenticated) return;
    fetchTeachers(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, isAuthenticated, search, subjectFilter, classFilter, statusFilter]);

  const onSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    try {
      setSubmitting(true);
      let res;
      if (editingTeacher) {
        // Modification
        res = await teachersService.updateTeacher(editingTeacher._id, formData);
        if (res.success) {
          setShowForm(false);
          setEditingTeacher(null);
          form.reset();
          setPreview(null);
          fetchTeachers(pagination.page);
          alert('تم تحديث الأستاذ بنجاح');
        } else {
          alert(res.message || 'فشل تحديث الأستاذ');
        }
      } else {
        // Création
        res = await teachersService.createTeacher(formData);
        if (res.success) {
          setShowForm(false);
          form.reset();
          setPreview(null);
          fetchTeachers(1);
          alert('تم إنشاء الأستاذ بنجاح');
        } else {
          alert(res.message || 'فشل إنشاء الأستاذ');
        }
      }
    } catch (err) {
      console.error(err);
      alert(`خطأ في الخادم عند ${editingTeacher ? 'تحديث' : 'إنشاء'} الأستاذ`);
    } finally {
      setSubmitting(false);
    }
  };

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    } else {
      setPreview(null);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الأستاذ؟')) {
      try {
        const res = await teachersService.deleteTeacher(id);
        if (res.success) {
          fetchTeachers(pagination.page);
          alert('تم حذف الأستاذ بنجاح');
        } else {
          alert(res.message || 'فشل حذف الأستاذ');
        }
      } catch (err) {
        console.error(err);
        alert('خطأ في الخادم عند حذف الأستاذ');
      }
    }
  };

  const handleEdit = (teacher) => {
    setEditingTeacher(teacher);
    setShowForm(true);
    // Charger la prévisualisation de l'image si elle existe
    if (teacher.photo) {
      setPreview(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/../uploads/teachers/${teacher.photo}`);
    }
  };

  const handleView = (teacher) => {
    // TODO: Implémenter la visualisation d'enseignant
    alert(`عرض بيانات الأستاذ: ${teacher.firstName}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">إدارة الأساتذة</h1>
          <p className="text-secondary-600">عرض وإدارة بيانات الأساتذة</p>
        </div>
        <div className="flex space-x-2 space-x-reverse">
          <button className="btn-secondary flex items-center space-x-2 space-x-reverse">
            <Download className="w-5 h-5" />
            <span>تصدير</span>
          </button>
          <button className="btn-primary flex items-center space-x-2 space-x-reverse" onClick={() => {setShowForm(true); setEditingTeacher(null); setPreview(null);}}>
            <Plus className="w-5 h-5" />
            <span>إضافة أستاذ جديد</span>
          </button>
        </div>
      </div>

      {/* Formulaire d'ajout d'enseignant */}
      {showForm && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {editingTeacher ? 'تعديل الأستاذ' : 'إضافة أستاذ جديد'}
            </h2>
            <button className="text-secondary-600 hover:text-secondary-800" onClick={() => {setShowForm(false); setEditingTeacher(null); setPreview(null);}}>
              <X className="w-5 h-5" />
            </button>
          </div>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={onSubmit}>
            <div>
              <label className="label">الاسم الكامل</label>
              <input 
                name="firstName" 
                className="input-field" 
                placeholder="الاسم الكامل" 
                defaultValue={editingTeacher?.firstName || ''}
                required 
              />
            </div>
            <div>
              <label className="label">البريد الإلكتروني</label>
              <input 
                type="email" 
                name="email" 
                className="input-field" 
                defaultValue={editingTeacher?.email || ''}
                required 
              />
            </div>
            <div>
              <label className="label">رقم الهاتف</label>
              <input 
                type="tel" 
                name="phone" 
                className="input-field" 
                defaultValue={editingTeacher?.phone || ''}
              />
            </div>
            <div>
              <label className="label">صورة الأستاذ</label>
              <input type="file" name="photo" accept="image/*" className="input-field" onChange={onFileChange} />
              {preview && (
                <img src={preview} alt="preview" className="mt-2 h-20 w-20 object-cover rounded" />
              )}
            </div>
            <div>
              <label className="label">الشارع</label>
              <input 
                name="address.street" 
                className="input-field" 
                defaultValue={editingTeacher?.address?.street || ''}
              />
            </div>
            <div>
              <label className="label">المدينة</label>
              <input 
                name="address.city" 
                className="input-field" 
                defaultValue={editingTeacher?.address?.city || ''}
              />
            </div>
            <div>
              <label className="label">المادة (اختياري)</label>
              <select name="subjects" className="input-field" multiple>
                {subjects.map((subject) => (
                  <option key={subject._id} value={subject._id}>{subject.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">الفصول (اختياري)</label>
              <select name="classes" className="input-field" multiple>
                {classes.map((cls) => (
                  <option key={cls._id} value={cls._id}>{cls.name}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2 flex justify-end gap-2 mt-2">
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={() => {setShowForm(false); setEditingTeacher(null); setPreview(null);}} 
                disabled={submitting}
              >
                إلغاء
              </button>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'جارٍ الحفظ...' : (editingTeacher ? 'تحديث' : 'حفظ')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filtres et recherche */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
              <input
                type="text"
                placeholder="البحث عن أستاذ..."
                className="input-field pr-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                dir="rtl"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select className="input-field" value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)}>
              <option value="">جميع المواد</option>
              {subjects.map((subject) => (
                <option key={subject._id} value={subject._id}>{subject.name}</option>
              ))}
            </select>
            <select className="input-field" value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
              <option value="">جميع الفصول</option>
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>{cls.name}</option>
              ))}
            </select>
            <select className="input-field" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">جميع الحالات</option>
              <option value="true">نشط</option>
              <option value="false">غير نشط</option>
            </select>
            <button className="btn-secondary flex items-center">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Tableau des enseignants */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>الصورة</th>
                <th>رقم الأستاذ</th>
                <th>الاسم الكامل</th>
                <th>البريد الإلكتروني</th>
                <th>الهاتف</th>
                <th>المواد</th>
                <th>الفصول</th>
                <th>الحالة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((teacher) => (
                <tr key={teacher._id}>
                  <td>
                    {teacher.photo ? (
                      <img src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/../uploads/teachers/${teacher.photo}`} alt={teacher.firstName} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 bg-secondary-200 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium">{teacher.firstName?.charAt(0)}</span>
                      </div>
                    )}
                  </td>
                  <td>{teacher.teacherId}</td>
                  <td>{teacher.firstName}</td>
                  <td>{teacher.email}</td>
                  <td>{teacher.phone || '-'}</td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      {teacher.subjects?.slice(0, 2).map((subject) => (
                        <span key={subject._id} className="badge badge-primary text-xs">
                          {subject.name}
                        </span>
                      ))}
                      {teacher.subjects?.length > 2 && (
                        <span className="badge badge-secondary text-xs">
                          +{teacher.subjects.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      {teacher.classes?.slice(0, 2).map((cls) => (
                        <span key={cls._id} className="badge badge-secondary text-xs">
                          {cls.name}
                        </span>
                      ))}
                      {teacher.classes?.length > 2 && (
                        <span className="badge badge-secondary text-xs">
                          +{teacher.classes.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${teacher.isActive ? 'badge-success' : 'badge-danger'}`}>
                      {teacher.isActive ? 'نشط' : 'غير نشط'}
                    </span>
                  </td>
                  <td>
                    <div className="flex space-x-2 space-x-reverse">
                      <button className="text-primary-600 hover:text-primary-700" title="عرض" onClick={() => handleView(teacher)}>
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-secondary-600 hover:text-secondary-700" title="تعديل" onClick={() => handleEdit(teacher)}>
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-700" title="حذف" onClick={() => handleDelete(teacher._id)}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-secondary-600">
          عرض {(pagination.page - 1) * pagination.limit + 1}
          {' '}إلى{' '}
          {Math.min(pagination.page * pagination.limit, pagination.total)} {' '}من أصل {' '}
          {pagination.total} أستاذ
        </p>
        <div className="flex space-x-2 space-x-reverse">
          <button className="btn-secondary" disabled={pagination.page <= 1} onClick={() => fetchTeachers(pagination.page - 1)}>السابق</button>
          <button className="btn-secondary" disabled>{pagination.page} / {pagination.pages}</button>
          <button className="btn-secondary" disabled={pagination.page >= pagination.pages} onClick={() => fetchTeachers(pagination.page + 1)}>التالي</button>
        </div>
      </div>
    </div>
  );
};

export default Teachers;
