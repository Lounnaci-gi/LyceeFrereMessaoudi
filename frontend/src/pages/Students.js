import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Search, Filter, Download, X } from 'lucide-react';
import { studentsService } from '../services/studentsService';
import { useAuth } from '../contexts/AuthContext';

const Students = () => {
  const { isAuthenticated, loading } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [showClassForm, setShowClassForm] = useState(false);
  const [showSpecialtyForm, setShowSpecialtyForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittingClass, setSubmittingClass] = useState(false);
  const [submittingSpecialty, setSubmittingSpecialty] = useState(false);
  const [preview, setPreview] = useState(null);
  const [classes, setClasses] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [search, setSearch] = useState('');
  const [classId, setClassId] = useState('');
  const [gender, setGender] = useState('');
  const [specialtySearch, setSpecialtySearch] = useState('');
  const [classSearch, setClassSearch] = useState('');

  useEffect(() => {
    if (loading || !isAuthenticated) return;
    const load = async () => {
      try {
        const [cls, spec] = await Promise.all([
          studentsService.listClasses(),
          studentsService.listSpecialties()
        ]);
        if (cls.success) setClasses(cls.data);
        if (spec.success) setSpecialties(spec.data);
      } catch (e) {
        console.error('Erreur chargement classes/spécialités:', e);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, isAuthenticated]);

  const fetchStudents = async (page = 1) => {
    try {
      const res = await studentsService.getStudents({ page, limit: pagination.limit, search, classId, gender });
      if (res.success) {
        setStudents(res.data.students);
        setPagination(res.data.pagination);
      }
    } catch (e) {
      console.error('Erreur chargement élèves:', e);
    }
  };

  useEffect(() => {
    if (loading || !isAuthenticated) return;
    fetchStudents(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, isAuthenticated, search, classId, gender]);

  const onSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    try {
      setSubmitting(true);
      const res = await studentsService.createStudent(formData);
      if (res.success) {
        setShowForm(false);
        form.reset();
        setPreview(null);
        // TODO: refresh list later when list API is wired
        alert('تم إنشاء التلميذ بنجاح');
      } else {
        alert(res.message || 'فشل إنشاء التلميذ');
      }
    } catch (err) {
      console.error(err);
      alert('خطأ في الخادم عند إنشاء التلميذ');
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

  const onSubmitClass = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const classData = {
      name: formData.get('name'),
      level: formData.get('level'),
      academicYear: formData.get('academicYear'),
      specialty: formData.get('specialty') || null,
      capacity: parseInt(formData.get('capacity')) || 30
    };
    
    try {
      setSubmittingClass(true);
      const res = await studentsService.createClass(classData);
      if (res.success) {
        setShowClassForm(false);
        form.reset();
        // Recharger la liste des classes
        const cls = await studentsService.listClasses();
        if (cls.success) setClasses(cls.data);
        alert('تم إنشاء الفصل بنجاح');
      } else {
        alert(res.message || 'فشل إنشاء الفصل');
      }
    } catch (err) {
      console.error(err);
      alert('خطأ في الخادم عند إنشاء الفصل');
    } finally {
      setSubmittingClass(false);
    }
  };

  const onSubmitSpecialty = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const specialtyData = {
      name: formData.get('name'),
      code: formData.get('code'),
      description: formData.get('description') || null
    };
    
    try {
      setSubmittingSpecialty(true);
      const res = await studentsService.createSpecialty(specialtyData);
      if (res.success) {
        setShowSpecialtyForm(false);
        form.reset();
        setSpecialtySearch('');
        // Recharger la liste des spécialités
        const spec = await studentsService.listSpecialties();
        if (spec.success) setSpecialties(spec.data);
        alert('تم إنشاء التخصص بنجاح');
      } else {
        alert(res.message || 'فشل إنشاء التخصص');
      }
    } catch (err) {
      console.error(err);
      alert('خطأ في الخادم عند إنشاء التخصص');
    } finally {
      setSubmittingSpecialty(false);
    }
  };

  // Fonctions de filtrage
  const filteredSpecialties = specialties.filter(specialty => 
    specialty.name.toLowerCase().includes(specialtySearch.toLowerCase()) ||
    specialty.code.toLowerCase().includes(specialtySearch.toLowerCase())
  );

  const filteredClasses = classes.filter(cls => 
    cls.name.toLowerCase().includes(classSearch.toLowerCase()) ||
    cls.level.toLowerCase().includes(classSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">إدارة التلاميذ</h1>
          <p className="text-secondary-600">عرض وإدارة بيانات التلاميذ</p>
        </div>
        <div className="flex space-x-2 space-x-reverse">
          <button className="btn-secondary flex items-center space-x-2 space-x-reverse" onClick={() => setShowSpecialtyForm(true)}>
            <Plus className="w-5 h-5" />
            <span>إضافة تخصص جديد</span>
          </button>
          <button className="btn-secondary flex items-center space-x-2 space-x-reverse" onClick={() => setShowClassForm(true)}>
            <Plus className="w-5 h-5" />
            <span>إضافة فصل جديد</span>
          </button>
          <button className="btn-primary flex items-center space-x-2 space-x-reverse" onClick={() => setShowForm(true)}>
            <Plus className="w-5 h-5" />
            <span>إضافة تلميذ جديد</span>
          </button>
        </div>
      </div>

      {showForm && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">إضافة تلميذ</h2>
            <button className="text-secondary-600 hover:text-secondary-800" onClick={() => setShowForm(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={onSubmit}>
            <div>
              <label className="label">الاسم</label>
              <input name="firstName" className="input-field" required />
            </div>
            <div>
              <label className="label">اللقب</label>
              <input name="lastName" className="input-field" required />
            </div>
            <div>
              <label className="label">تاريخ الميلاد</label>
              <input type="date" name="dateOfBirth" className="input-field" required />
            </div>
            <div>
              <label className="label">الجنس</label>
              <select name="gender" className="input-field" required>
                <option value="male">ذكر</option>
                <option value="female">أنثى</option>
              </select>
            </div>
            <div>
              <label className="label">البريد الإلكتروني (اختياري)</label>
              <input type="email" name="email" className="input-field" />
            </div>
            <div>
              <label className="label">الفصل</label>
              <select name="class" className="input-field" required>
                <option value="">اختر الفصل</option>
                {classes.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">صورة التلميذ</label>
              <input type="file" name="photo" accept="image/*" className="input-field" onChange={onFileChange} />
              {preview && (
                <img src={preview} alt="preview" className="mt-2 h-20 w-20 object-cover rounded" />
              )}
            </div>
            <div className="md:col-span-2 flex justify-end gap-2 mt-2">
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)} disabled={submitting}>إلغاء</button>
              <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'جارٍ الحفظ...' : 'حفظ'}</button>
            </div>
          </form>
        </div>
      )}

      {showClassForm && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">إضافة فصل جديد</h2>
            <button className="text-secondary-600 hover:text-secondary-800" onClick={() => setShowClassForm(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Liste des classes existantes */}
          <div className="mb-6">
            <h3 className="text-md font-medium text-secondary-700 mb-3">الفصول الموجودة</h3>
            <div className="relative mb-3">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
              <input
                type="text"
                placeholder="البحث في الفصول..."
                className="input-field pr-10"
                value={classSearch}
                onChange={(e) => setClassSearch(e.target.value)}
                dir="rtl"
              />
            </div>
            <div className="max-h-40 overflow-y-auto border border-secondary-200 rounded-lg p-3">
              {filteredClasses.length > 0 ? (
                <div className="space-y-2">
                  {filteredClasses.map((cls) => (
                    <div key={cls._id} className="flex justify-between items-center p-2 bg-secondary-50 rounded hover:bg-secondary-100">
                      <div>
                        <span className="font-medium">{cls.name}</span>
                        <span className="text-sm text-secondary-600 mr-2"> - {cls.level}</span>
                        {cls.specialty && (
                          <span className="text-sm text-primary-600">({cls.specialty.name})</span>
                        )}
                      </div>
                      <span className="text-sm text-secondary-500">السعة: {cls.capacity}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-secondary-500 text-center py-4">لا توجد فصول</p>
              )}
            </div>
          </div>

          <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={onSubmitClass}>
            <div>
              <label className="label">اسم الفصل</label>
              <input name="name" className="input-field" required />
            </div>
            <div>
              <label className="label">المستوى</label>
              <select name="level" className="input-field" required>
                <option value="">اختر المستوى</option>
                <option value="1ère année">السنة الأولى</option>
                <option value="2ème année">السنة الثانية</option>
                <option value="3ème année">السنة الثالثة</option>
              </select>
            </div>
            <div>
              <label className="label">السنة الأكاديمية</label>
              <input name="academicYear" className="input-field" placeholder="2024-2025" required />
            </div>
            <div>
              <label className="label">التخصص (اختياري)</label>
              <select name="specialty" className="input-field">
                <option value="">بدون تخصص</option>
                {specialties.map((s) => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">السعة</label>
              <input type="number" name="capacity" className="input-field" min="1" max="50" defaultValue="30" />
            </div>
            <div className="md:col-span-2 flex justify-end gap-2 mt-2">
              <button type="button" className="btn-secondary" onClick={() => {setShowClassForm(false); setClassSearch('');}} disabled={submittingClass}>إلغاء</button>
              <button type="submit" className="btn-primary" disabled={submittingClass}>{submittingClass ? 'جارٍ الحفظ...' : 'حفظ'}</button>
            </div>
          </form>
        </div>
      )}

      {showSpecialtyForm && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">إضافة تخصص جديد</h2>
            <button className="text-secondary-600 hover:text-secondary-800" onClick={() => setShowSpecialtyForm(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Liste des spécialités existantes */}
          <div className="mb-6">
            <h3 className="text-md font-medium text-secondary-700 mb-3">التخصصات الموجودة</h3>
            <div className="relative mb-3">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
              <input
                type="text"
                placeholder="البحث في التخصصات..."
                className="input-field pr-10"
                value={specialtySearch}
                onChange={(e) => setSpecialtySearch(e.target.value)}
                dir="rtl"
              />
            </div>
            <div className="max-h-40 overflow-y-auto border border-secondary-200 rounded-lg p-3">
              {filteredSpecialties.length > 0 ? (
                <div className="space-y-2">
                  {filteredSpecialties.map((specialty) => (
                    <div key={specialty._id} className="flex justify-between items-center p-2 bg-secondary-50 rounded hover:bg-secondary-100">
                      <div>
                        <span className="font-medium">{specialty.name}</span>
                        <span className="text-sm text-secondary-600 mr-2"> - {specialty.code}</span>
                        {specialty.description && (
                          <div className="text-sm text-secondary-500 mt-1">{specialty.description}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-secondary-500 text-center py-4">لا توجد تخصصات</p>
              )}
            </div>
          </div>

          <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={onSubmitSpecialty}>
            <div>
              <label className="label">اسم التخصص</label>
              <input name="name" className="input-field" required />
            </div>
            <div>
              <label className="label">رمز التخصص</label>
              <input name="code" className="input-field" required />
            </div>
            <div className="md:col-span-2">
              <label className="label">وصف التخصص (اختياري)</label>
              <textarea name="description" className="input-field" rows="3" />
            </div>
            <div className="md:col-span-2 flex justify-end gap-2 mt-2">
              <button type="button" className="btn-secondary" onClick={() => {setShowSpecialtyForm(false); setSpecialtySearch('');}} disabled={submittingSpecialty}>إلغاء</button>
              <button type="submit" className="btn-primary" disabled={submittingSpecialty}>{submittingSpecialty ? 'جارٍ الحفظ...' : 'حفظ'}</button>
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
                placeholder="البحث عن تلميذ..."
                className="input-field pr-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                dir="rtl"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select className="input-field" value={classId} onChange={(e) => setClassId(e.target.value)}>
              <option value="">جميع الفصول</option>
              {classes.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
            <select className="input-field" value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value="">الجنس</option>
              <option value="male">ذكر</option>
              <option value="female">أنثى</option>
            </select>
            <button className="btn-secondary flex items-center">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Tableau des élèves */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>الصورة</th>
                <th>رقم التسجيل</th>
                <th>الاسم الكامل</th>
                <th>الفصل</th>
                <th>الجنس</th>
                <th>الحالة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s._id}>
                  <td>
                    {s.photo ? (
                      <img src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/../uploads/students/${s.photo}`} alt={s.firstName} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 bg-secondary-200 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium">{s.firstName?.charAt(0)}</span>
                      </div>
                    )}
                  </td>
                  <td>{s.studentId}</td>
                  <td>{s.firstName} {s.lastName}</td>
                  <td>{s.class?.name || ''}</td>
                  <td>
                    <span className={`badge ${s.gender === 'male' ? 'badge-primary' : 'badge-secondary'}`}>
                      {s.gender === 'male' ? 'ذكر' : 'أنثى'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${s.isActive ? 'badge-success' : 'badge-danger'}`}>
                      {s.isActive ? 'نشط' : 'غير نشط'}
                    </span>
                  </td>
                  <td>
                    <div className="flex space-x-2 space-x-reverse">
                      <button className="text-primary-600 hover:text-primary-700">عرض</button>
                      <button className="text-secondary-600 hover:text-secondary-700">تعديل</button>
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
          {pagination.total} تلميذ
        </p>
        <div className="flex space-x-2 space-x-reverse">
          <button className="btn-secondary" disabled={pagination.page <= 1} onClick={() => fetchStudents(pagination.page - 1)}>السابق</button>
          <button className="btn-secondary" disabled>{pagination.page} / {pagination.pages}</button>
          <button className="btn-secondary" disabled={pagination.page >= pagination.pages} onClick={() => fetchStudents(pagination.page + 1)}>التالي</button>
        </div>
      </div>
    </div>
  );
};

export default Students;
