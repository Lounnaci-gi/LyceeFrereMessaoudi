import React, { useEffect, useState, useRef } from 'react';
import { Plus, Search, Filter, X, Edit, Trash2, Eye, Printer } from 'lucide-react';
import { studentsService } from '../services/studentsService';
import { parentsService } from '../services/parentsService';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import ConfirmDialog from '../components/ConfirmDialog';
import StudentDetailsDialog from '../components/StudentDetailsDialog';
import StudentCard from '../components/StudentCard';

const Students = () => {
  const { isAuthenticated, loading } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [showForm, setShowForm] = useState(false);
  const [showClassForm, setShowClassForm] = useState(false);
  const [showSpecialtyForm, setShowSpecialtyForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
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
  const [schoolingType, setSchoolingType] = useState('');
  const [specialtySearch, setSpecialtySearch] = useState('');
  const [classSearch, setClassSearch] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, studentId: null });
  const [showStudentDetails, setShowStudentDetails] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showStudentCard, setShowStudentCard] = useState(false);
  const [cardStudent, setCardStudent] = useState(null);
  const formRef = useRef(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    email: '',
    class: '',
    schoolingType: '',
    parents: {
      father: {
        firstName: '',
        lastName: '',
        profession: '',
        phone: '',
        email: ''
      },
      mother: {
        firstName: '',
        lastName: '',
        profession: '',
        phone: '',
        email: ''
      },
      familySituation: '',
      financialSituation: '',
      childrenCount: {
        boys: 0,
        girls: 0
      }
    }
  });

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
      console.log('Fetching students...', { page, limit: pagination.limit, search, classId, gender, schoolingType });
      const res = await studentsService.getStudents({ page, limit: pagination.limit, search, classId, gender, schoolingType });
      console.log('Students response:', res);
      if (res.success) {
        setStudents(res.data.students);
        setPagination(res.data.pagination);
        console.log('Students loaded:', res.data.students.length);
      } else {
        console.error('Failed to load students:', res.message);
      }
    } catch (e) {
      console.error('Erreur chargement élèves:', e);
    }
  };

  useEffect(() => {
    if (loading || !isAuthenticated) return;
    fetchStudents(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, isAuthenticated, search, classId, gender, schoolingType]);

  const onSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const submitFormData = new FormData(form);
    
    try {
      setSubmitting(true);
      
      // Vérifier s'il y a des données parents à sauvegarder
      const hasFatherData = formData.parents?.father?.firstName?.trim() || formData.parents?.father?.lastName?.trim();
      const hasMotherData = formData.parents?.mother?.firstName?.trim() || formData.parents?.mother?.lastName?.trim();
      
      let parentsArray = [];
      
      // Créer le père si on a des données complètes
      if (hasFatherData && formData.parents?.father?.firstName?.trim() && formData.parents?.father?.lastName?.trim()) {
        const fatherData = {
          firstName: formData.parents.father.firstName.trim(),
          lastName: formData.parents.father.lastName.trim(),
          email: formData.parents.father.email?.trim() || `father_${Date.now()}@temp.com`,
          phone: formData.parents.father.phone?.trim() || '00000000',
          relationship: 'father',
          address: {
            street: '',
            city: '',
            postalCode: '',
            country: ''
          }
        };
        
        console.log('Creating father:', fatherData);
        
        try {
          const fatherRes = await parentsService.createParent(fatherData);
          if (fatherRes.success) {
            parentsArray.push({
              parent: fatherRes.data._id,
              relationship: 'father'
            });
          }
        } catch (err) {
          console.error('Erreur création père:', err);
          // Ne pas bloquer la création de l'élève si le parent échoue
        }
      }
      
      // Créer la mère si on a des données complètes
      if (hasMotherData && formData.parents?.mother?.firstName?.trim() && formData.parents?.mother?.lastName?.trim()) {
        const motherData = {
          firstName: formData.parents.mother.firstName.trim(),
          lastName: formData.parents.mother.lastName.trim(),
          email: formData.parents.mother.email?.trim() || `mother_${Date.now()}@temp.com`,
          phone: formData.parents.mother.phone?.trim() || '00000000',
          relationship: 'mother',
          address: {
            street: '',
            city: '',
            postalCode: '',
            country: ''
          }
        };
        
        console.log('Creating mother:', motherData);
        
        try {
          const motherRes = await parentsService.createParent(motherData);
          if (motherRes.success) {
            parentsArray.push({
              parent: motherRes.data._id,
              relationship: 'mother'
            });
          }
        } catch (err) {
          console.error('Erreur création mère:', err);
          // Ne pas bloquer la création de l'élève si le parent échoue
        }
      }
      
      // Ajouter les parents au FormData de l'élève
      if (parentsArray.length > 0) {
        submitFormData.append('parents', JSON.stringify(parentsArray));
      }
      
      console.log('FormData being sent:', Object.fromEntries(submitFormData.entries()));
      
      let res;
      if (editingStudent) {
        // Modification
        res = await studentsService.updateStudent(editingStudent._id, submitFormData);
        if (res.success) {
          setShowForm(false);
          setEditingStudent(null);
          form.reset();
          setPreview(null);
          fetchStudents(pagination.page);
          showSuccess('تم تحديث التلميذ بنجاح');
        } else {
          showError(res.message || 'فشل تحديث التلميذ');
        }
      } else {
        // Création
        res = await studentsService.createStudent(submitFormData);
        if (res.success) {
          setShowForm(false);
          form.reset();
          setPreview(null);
          fetchStudents(pagination.page);
          showSuccess('تم إنشاء التلميذ بنجاح');
        } else {
          showError(res.message || 'فشل إنشاء التلميذ');
        }
      }
    } catch (err) {
      console.error('Erreur complète:', err);
      let errorMessage = 'خطأ في الخادم عند حفظ التلميذ';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.errors) {
        errorMessage = err.response.data.errors.map(e => e.msg).join(', ');
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      showError(errorMessage);
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

  // Fonctions de gestion des actions
  const handleView = async (student) => {
    try {
      // Charger les détails complets de l'élève avec les informations des parents
      let studentWithParents = { ...student };
      
      if (student.parents && student.parents.length > 0) {
        const parentsData = [];
        for (const parentRef of student.parents) {
          try {
            const parentRes = await parentsService.getParent(parentRef.parent);
            if (parentRes.success) {
              parentsData.push({
                ...parentRef,
                parent: parentRes.data
              });
            }
          } catch (err) {
            console.error('Erreur chargement parent:', err);
          }
        }
        studentWithParents.parents = parentsData;
      }
      
      setSelectedStudent(studentWithParents);
      setShowStudentDetails(true);
    } catch (err) {
      console.error('Erreur chargement détails élève:', err);
      showError('خطأ في تحميل تفاصيل التلميذ');
    }
  };

  const handleEdit = async (student) => {
    setEditingStudent(student);
    setShowForm(true);
    
    // Charger les données parents depuis le tableau parents
    let parentsData = {
      father: { firstName: '', lastName: '', profession: '', phone: '', email: '' },
      mother: { firstName: '', lastName: '', profession: '', phone: '', email: '' },
      familySituation: '',
      financialSituation: '',
      childrenCount: { boys: 0, girls: 0 }
    };
    
    if (student.parents && student.parents.length > 0) {
      try {
        // Charger les données de chaque parent
        for (const parentRef of student.parents) {
          const parentRes = await parentsService.getParent(parentRef.parent);
          if (parentRes.success) {
            const parent = parentRes.data;
            if (parentRef.relationship === 'father') {
              parentsData.father = {
                firstName: parent.firstName || '',
                lastName: parent.lastName || '',
                profession: parent.profession || '',
                phone: parent.phone || '',
                email: parent.email || ''
              };
            } else if (parentRef.relationship === 'mother') {
              parentsData.mother = {
                firstName: parent.firstName || '',
                lastName: parent.lastName || '',
                profession: parent.profession || '',
                phone: parent.phone || '',
                email: parent.email || ''
              };
            }
          }
        }
      } catch (err) {
        console.error('Erreur chargement parents:', err);
      }
    }
    
    // Mettre à jour les données du formulaire
    setFormData({
      firstName: student.firstName || '',
      lastName: student.lastName || '',
      dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split('T')[0] : '',
      gender: student.gender || '',
      email: student.email || '',
      class: student.class?._id || '',
      schoolingType: student.schoolingType || '',
      parents: parentsData
    });
    
    // Afficher la photo si elle existe
    if (student.photo) {
      const photoUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/../uploads/students/${student.photo}`;
      setPreview(photoUrl);
    } else {
      setPreview(null);
    }

    // Focus smooth sur le formulaire après un court délai pour permettre le rendu
    setTimeout(() => {
      if (formRef.current) {
        formRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        });
      }
    }, 100);
  };

  const handleDelete = (studentId) => {
    setConfirmDialog({
      isOpen: true,
      studentId: studentId
    });
  };

  const handlePrintCard = async (student) => {
    try {
      // Charger les détails complets de l'élève avec les informations des parents
      let studentWithParents = { ...student };
      
      if (student.parents && student.parents.length > 0) {
        const parentsData = [];
        for (const parentRef of student.parents) {
          try {
            const parentRes = await parentsService.getParent(parentRef.parent);
            if (parentRes.success) {
              parentsData.push({
                ...parentRef,
                parent: parentRes.data
              });
            }
          } catch (err) {
            console.error('Erreur chargement parent:', err);
          }
        }
        studentWithParents.parents = parentsData;
      }
      
      setCardStudent(studentWithParents);
      setShowStudentCard(true);
    } catch (err) {
      console.error('Erreur chargement détails élève pour impression:', err);
      showError('خطأ في تحميل تفاصيل التلميذ للطباعة');
    }
  };

  const printStudentCard = () => {
    // Créer une nouvelle fenêtre pour l'impression
    const printWindow = window.open('', '_blank');
    const printContent = document.getElementById('student-card');
    
    if (printContent) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>بطاقة الطالب - ${cardStudent?.firstName} ${cardStudent?.lastName}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              direction: rtl;
              background: white;
              color: #333;
              line-height: 1.6;
            }
            
            .student-card-id {
              width: 8.6cm;
              height: 5.4cm;
              margin: 20px auto;
              padding: 8px;
              border: 2px solid #2563eb;
              border-radius: 8px;
              background: white;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              direction: rtl;
              position: relative;
            }
            
            .card-header {
              text-align: center;
              margin-bottom: 6px;
              padding-bottom: 4px;
              border-bottom: 1px solid #2563eb;
            }
            
            .school-name {
              font-size: 10px;
              font-weight: bold;
              color: #1e40af;
              margin-bottom: 2px;
            }
            
            .card-type {
              font-size: 8px;
              color: #3b82f6;
              font-weight: 500;
            }
            
            .card-content {
              display: flex;
              gap: 6px;
              margin-bottom: 6px;
            }
            
            .photo-section {
              flex: 0 0 auto;
            }
            
            .student-photo {
              width: 2.2cm;
              height: 2.8cm;
              border: 1px solid #6b7280;
              border-radius: 4px;
              overflow: hidden;
              background: #f3f4f6;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            
            .student-photo img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
            
            .no-photo {
              color: #6b7280;
              text-align: center;
            }
            
            .no-photo-icon {
              font-size: 24px;
            }
            
            .info-section {
              flex: 1;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
            }
            
            .student-name {
              font-size: 11px;
              font-weight: bold;
              color: #111827;
              margin-bottom: 2px;
              line-height: 1.2;
            }
            
            .student-id {
              font-size: 9px;
              color: #2563eb;
              font-weight: bold;
              margin-bottom: 4px;
            }
            
            .info-grid {
              display: grid;
              grid-template-columns: 1fr;
              gap: 2px;
            }
            
            .info-item {
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-size: 7px;
              line-height: 1.1;
            }
            
            .info-label {
              color: #374151;
              font-weight: 500;
              flex: 0 0 auto;
              margin-left: 4px;
            }
            
            .info-value {
              color: #111827;
              font-weight: 400;
              text-align: left;
              flex: 1;
            }
            
            .card-footer {
              border-top: 1px solid #d1d5db;
              padding-top: 4px;
              text-align: center;
            }
            
            .barcode-section {
              margin-bottom: 2px;
            }
            
            .barcode {
              width: 100%;
              height: 12px;
            }
            
            .footer-text {
              font-size: 6px;
              color: #6b7280;
              font-weight: 400;
            }
            
            @media print {
              body {
                margin: 0;
                padding: 0;
              }
              
              .student-card-id {
                margin: 0;
                box-shadow: none;
                border: 1px solid #000;
                width: 8.6cm;
                height: 5.4cm;
                page-break-inside: avoid;
              }
              
              .student-photo {
                width: 2.2cm;
                height: 2.8cm;
              }
              
              .barcode {
                height: 12px;
              }
            }
          </style>
        </head>
        <body>
          ${printContent.outerHTML}
        </body>
        </html>
      `);
      
      printWindow.document.close();
      
      // Attendre que les images se chargent avant d'imprimer
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 1000);
    }
  };

  const confirmDelete = async () => {
    try {
      const res = await studentsService.deleteStudent(confirmDialog.studentId);
      if (res.success) {
        showSuccess('تم حذف التلميذ بنجاح');
        fetchStudents(pagination.page);
      } else {
        showError(res.message || 'فشل حذف التلميذ');
      }
    } catch (err) {
      console.error(err);
      showError('خطأ في الخادم عند حذف التلميذ');
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
        showSuccess('تم إنشاء الفصل بنجاح');
      } else {
        showError(res.message || 'فشل إنشاء الفصل');
      }
    } catch (err) {
      console.error(err);
      showError('خطأ في الخادم عند إنشاء الفصل');
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
        showSuccess('تم إنشاء التخصص بنجاح');
      } else {
        showError(res.message || 'فشل إنشاء التخصص');
      }
    } catch (err) {
      console.error(err);
      showError('خطأ في الخادم عند إنشاء التخصص');
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
          <button className="btn-primary flex items-center space-x-2 space-x-reverse" onClick={() => {
            setShowForm(true);
            setEditingStudent(null);
            setPreview(null);
            setFormData({
              firstName: '',
              lastName: '',
              dateOfBirth: '',
              gender: '',
              email: '',
              class: '',
              schoolingType: '',
              parents: {
                father: {
                  firstName: '',
                  lastName: '',
                  profession: '',
                  phone: '',
                  email: ''
                },
                mother: {
                  firstName: '',
                  lastName: '',
                  profession: '',
                  phone: '',
                  email: ''
                },
                familySituation: '',
                financialSituation: '',
                childrenCount: {
                  boys: 0,
                  girls: 0
                }
              }
            });
          }}>
            <Plus className="w-5 h-5" />
            <span>إضافة تلميذ جديد</span>
          </button>
        </div>
      </div>

      {showForm && (
        <div className="card" ref={formRef}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">{editingStudent ? 'تعديل التلميذ' : 'إضافة تلميذ'}</h2>
            <button className="text-secondary-600 hover:text-secondary-800" onClick={() => {
              setShowForm(false);
              setEditingStudent(null);
              setPreview(null);
              setFormData({
                firstName: '',
                lastName: '',
                dateOfBirth: '',
                gender: '',
                email: '',
                class: '',
                schoolingType: '',
                parents: {
                  father: {
                    firstName: '',
                    lastName: '',
                    profession: '',
                    phone: '',
                    email: ''
                  },
                  mother: {
                    firstName: '',
                    lastName: '',
                    profession: '',
                    phone: '',
                    email: ''
                  },
                  familySituation: '',
                  financialSituation: '',
                  childrenCount: {
                    boys: 0,
                    girls: 0
                  }
                }
              });
            }}>
              <X className="w-5 h-5" />
            </button>
          </div>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={onSubmit}>
            <div>
              <label className="label">الاسم</label>
              <input 
                name="firstName" 
                className="input-field" 
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                required 
              />
            </div>
            <div>
              <label className="label">اللقب</label>
              <input 
                name="lastName" 
                className="input-field" 
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                required 
              />
            </div>
            <div>
              <label className="label">تاريخ الميلاد</label>
              <input 
                type="date" 
                name="dateOfBirth" 
                className="input-field" 
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                required 
              />
            </div>
            <div>
              <label className="label">الجنس</label>
              <select 
                name="gender" 
                className="input-field" 
                value={formData.gender}
                onChange={(e) => setFormData({...formData, gender: e.target.value})}
                required
              >
                <option value="">اختر الجنس</option>
                <option value="male">ذكر</option>
                <option value="female">أنثى</option>
              </select>
            </div>
            <div>
              <label className="label">البريد الإلكتروني (اختياري)</label>
              <input 
                type="email" 
                name="email" 
                className="input-field" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div>
              <label className="label">الفصل</label>
              <select 
                name="class" 
                className="input-field" 
                value={formData.class}
                onChange={(e) => setFormData({...formData, class: e.target.value})}
                required
              >
                <option value="">اختر الفصل</option>
                {classes.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">نوع التمدرس</label>
              <select 
                name="schoolingType" 
                className="input-field" 
                value={formData.schoolingType}
                onChange={(e) => setFormData({...formData, schoolingType: e.target.value})}
                required
              >
                <option value="">اختر نوع التمدرس</option>
                <option value="externe">خارجي</option>
                <option value="demi-pensionnaire">نصف داخلي</option>
              </select>
            </div>
            <div>
              <label className="label">صورة التلميذ</label>
              <input type="file" name="photo" accept="image/*" className="input-field" onChange={onFileChange} />
              {preview && (
                <img src={preview} alt="preview" className="mt-2 h-20 w-20 object-cover rounded" />
              )}
            </div>

            {/* Section Informations Parents */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-secondary-800 mb-4 border-b border-secondary-200 pb-2">
                معلومات الوالدين
              </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Informations Père */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-secondary-700">معلومات الأب</h4>
                <div>
                  <label className="label">اسم الأب</label>
                  <input 
                    name="parents.father.firstName" 
                    className="input-field" 
                    value={formData.parents.father.firstName}
                    onChange={(e) => setFormData({
                      ...formData, 
                      parents: {
                        ...formData.parents,
                        father: {...formData.parents.father, firstName: e.target.value}
                      }
                    })}
                  />
                </div>
                <div>
                  <label className="label">لقب الأب</label>
                  <input 
                    name="parents.father.lastName" 
                    className="input-field" 
                    value={formData.parents.father.lastName}
                    onChange={(e) => setFormData({
                      ...formData, 
                      parents: {
                        ...formData.parents,
                        father: {...formData.parents.father, lastName: e.target.value}
                      }
                    })}
                  />
                </div>
                <div>
                  <label className="label">مهنة الأب</label>
                  <input 
                    name="parents.father.profession" 
                    className="input-field" 
                    value={formData.parents.father.profession}
                    onChange={(e) => setFormData({
                      ...formData, 
                      parents: {
                        ...formData.parents,
                        father: {...formData.parents.father, profession: e.target.value}
                      }
                    })}
                  />
                </div>
                <div>
                  <label className="label">هاتف الأب</label>
                  <input 
                    type="tel" 
                    name="parents.father.phone" 
                    className="input-field" 
                    value={formData.parents.father.phone}
                    onChange={(e) => setFormData({
                      ...formData, 
                      parents: {
                        ...formData.parents,
                        father: {...formData.parents.father, phone: e.target.value}
                      }
                    })}
                  />
                </div>
                <div>
                  <label className="label">بريد الأب الإلكتروني</label>
                  <input 
                    type="email" 
                    name="parents.father.email" 
                    className="input-field" 
                    value={formData.parents.father.email}
                    onChange={(e) => setFormData({
                      ...formData, 
                      parents: {
                        ...formData.parents,
                        father: {...formData.parents.father, email: e.target.value}
                      }
                    })}
                  />
                </div>
              </div>

              {/* Informations Mère */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-secondary-700">معلومات الأم</h4>
                <div>
                  <label className="label">اسم الأم</label>
                  <input 
                    name="parents.mother.firstName" 
                    className="input-field" 
                    value={formData.parents.mother.firstName}
                    onChange={(e) => setFormData({
                      ...formData, 
                      parents: {
                        ...formData.parents,
                        mother: {...formData.parents.mother, firstName: e.target.value}
                      }
                    })}
                  />
                </div>
                <div>
                  <label className="label">لقب الأم</label>
                  <input 
                    name="parents.mother.lastName" 
                    className="input-field" 
                    value={formData.parents.mother.lastName}
                    onChange={(e) => setFormData({
                      ...formData, 
                      parents: {
                        ...formData.parents,
                        mother: {...formData.parents.mother, lastName: e.target.value}
                      }
                    })}
                  />
                </div>
                <div>
                  <label className="label">مهنة الأم</label>
                  <input 
                    name="parents.mother.profession" 
                    className="input-field" 
                    value={formData.parents.mother.profession}
                    onChange={(e) => setFormData({
                      ...formData, 
                      parents: {
                        ...formData.parents,
                        mother: {...formData.parents.mother, profession: e.target.value}
                      }
                    })}
                  />
                </div>
                <div>
                  <label className="label">هاتف الأم</label>
                  <input 
                    type="tel" 
                    name="parents.mother.phone" 
                    className="input-field" 
                    value={formData.parents.mother.phone}
                    onChange={(e) => setFormData({
                      ...formData, 
                      parents: {
                        ...formData.parents,
                        mother: {...formData.parents.mother, phone: e.target.value}
                      }
                    })}
                  />
                </div>
                <div>
                  <label className="label">بريد الأم الإلكتروني</label>
                  <input 
                    type="email" 
                    name="parents.mother.email" 
                    className="input-field" 
                    value={formData.parents.mother.email}
                    onChange={(e) => setFormData({
                      ...formData, 
                      parents: {
                        ...formData.parents,
                        mother: {...formData.parents.mother, email: e.target.value}
                      }
                    })}
                  />
                </div>
              </div>
            </div>

            {/* Informations Familiales */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">الوضع العائلي</label>
                <select 
                  name="parents.familySituation" 
                  className="input-field" 
                  value={formData.parents.familySituation}
                  onChange={(e) => setFormData({
                    ...formData, 
                    parents: {...formData.parents, familySituation: e.target.value}
                  })}
                >
                  <option value="">اختر الوضع العائلي</option>
                  <option value="married">متزوج</option>
                  <option value="divorced">مطلق</option>
                  <option value="father_deceased">الأب متوفى</option>
                  <option value="mother_deceased">الأم متوفية</option>
                  <option value="both_deceased">كلاهما متوفى</option>
                </select>
              </div>
              <div>
                <label className="label">الوضع المالي</label>
                <select 
                  name="parents.financialSituation" 
                  className="input-field" 
                  value={formData.parents.financialSituation}
                  onChange={(e) => setFormData({
                    ...formData, 
                    parents: {...formData.parents, financialSituation: e.target.value}
                  })}
                >
                  <option value="">اختر الوضع المالي</option>
                  <option value="stable">مستقر</option>
                  <option value="precarious">هش</option>
                </select>
              </div>
            </div>

            {/* Nombre d'enfants */}
            <div className="mt-4">
              <h4 className="text-md font-medium text-secondary-700 mb-3">عدد الأطفال</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">عدد الأولاد</label>
                  <input 
                    type="number" 
                    name="parents.childrenCount.boys" 
                    className="input-field" 
                    min="0"
                    value={formData.parents.childrenCount.boys}
                    onChange={(e) => setFormData({
                      ...formData, 
                      parents: {
                        ...formData.parents,
                        childrenCount: {...formData.parents.childrenCount, boys: parseInt(e.target.value) || 0}
                      }
                    })}
                  />
                </div>
                <div>
                  <label className="label">عدد البنات</label>
                  <input 
                    type="number" 
                    name="parents.childrenCount.girls" 
                    className="input-field" 
                    min="0"
                    value={formData.parents.childrenCount.girls}
                    onChange={(e) => setFormData({
                      ...formData, 
                      parents: {
                        ...formData.parents,
                        childrenCount: {...formData.parents.childrenCount, girls: parseInt(e.target.value) || 0}
                      }
                    })}
                  />
                </div>
              </div>
            </div>
            </div>

            <div className="mt-6">
              <div className="md:col-span-2 flex justify-end gap-2 mt-2">
              <button type="button" className="btn-secondary" onClick={() => {
                setShowForm(false);
                setEditingStudent(null);
                setPreview(null);
                setFormData({
                  firstName: '',
                  lastName: '',
                  dateOfBirth: '',
                  gender: '',
                  email: '',
                  class: '',
                  schoolingType: '',
                  parents: {
                    father: {
                      firstName: '',
                      lastName: '',
                      profession: '',
                      phone: '',
                      email: ''
                    },
                    mother: {
                      firstName: '',
                      lastName: '',
                      profession: '',
                      phone: '',
                      email: ''
                    },
                    familySituation: '',
                    financialSituation: '',
                    childrenCount: {
                      boys: 0,
                      girls: 0
                    }
                  }
                });
              }} disabled={submitting}>إلغاء</button>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'جارٍ الحفظ...' : (editingStudent ? 'تحديث' : 'حفظ')}
              </button>
              </div>
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
            <select className="input-field" value={schoolingType} onChange={(e) => setSchoolingType(e.target.value)}>
              <option value="">نوع التمدرس</option>
              <option value="externe">خارجي</option>
              <option value="demi-pensionnaire">نصف داخلي</option>
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
          {students.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-secondary-500">لا توجد تلاميذ</p>
              <p className="text-sm text-secondary-400 mt-2">عدد التلاميذ: {students.length}</p>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>الصورة</th>
                  <th>رقم التسجيل</th>
                  <th>الاسم الكامل</th>
                  <th>الفصل</th>
                  <th>الجنس</th>
                  <th>نوع التمدرس</th>
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
                    <span className={`badge ${
                      s.schoolingType === 'externe' 
                        ? 'badge-info' 
                        : s.schoolingType === 'demi-pensionnaire' 
                        ? 'badge-warning' 
                        : 'badge-secondary'
                    }`}>
                      {s.schoolingType === 'externe' 
                        ? 'خارجي' 
                        : s.schoolingType === 'demi-pensionnaire' 
                        ? 'نصف داخلي' 
                        : 'غير محدد'
                      }
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${s.isActive ? 'badge-success' : 'badge-danger'}`}>
                      {s.isActive ? 'نشط' : 'غير نشط'}
                    </span>
                  </td>
                  <td>
                    <div className="flex space-x-2 space-x-reverse">
                      <button 
                        className="text-primary-600 hover:text-primary-700" 
                        title="عرض" 
                        onClick={() => handleView(s)}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        className="text-green-600 hover:text-green-700" 
                        title="طباعة البطاقة" 
                        onClick={() => handlePrintCard(s)}
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      <button 
                        className="text-secondary-600 hover:text-secondary-700" 
                        title="تعديل" 
                        onClick={() => handleEdit(s)}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        className="text-red-600 hover:text-red-700" 
                        title="حذف" 
                        onClick={() => handleDelete(s._id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                ))}
              </tbody>
            </table>
          )}
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

      {/* Dialogue de confirmation pour la suppression */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, studentId: null })}
        onConfirm={confirmDelete}
        title="تأكيد الحذف"
        message="هل أنت متأكد من حذف هذا التلميذ؟ لا يمكن التراجع عن هذا الإجراء."
        type="error"
        confirmText="حذف"
        cancelText="إلغاء"
      />

      {/* Dialogue des détails de l'élève */}
      <StudentDetailsDialog
        isOpen={showStudentDetails}
        onClose={() => {
          setShowStudentDetails(false);
          setSelectedStudent(null);
        }}
        student={selectedStudent}
      />

      {/* Dialogue de la carte d'étudiant */}
      <StudentCard
        isOpen={showStudentCard}
        onClose={() => {
          setShowStudentCard(false);
          setCardStudent(null);
        }}
        student={cardStudent}
        onPrint={printStudentCard}
      />
    </div>
  );
};

export default Students;
