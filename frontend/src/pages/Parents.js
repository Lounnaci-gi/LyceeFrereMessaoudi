import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Filter, Download, Eye, Phone, Mail, MapPin, UserCheck, UserX } from 'lucide-react';
import { parentsService } from '../services/parentsService';
import { studentsService } from '../services/studentsService';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

const Parents = () => {
  const { isAuthenticated, loading } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [parents, setParents] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [search, setSearch] = useState('');
  const [relationshipFilter, setRelationshipFilter] = useState('');

  useEffect(() => {
    if (loading || !isAuthenticated) return;
    fetchParents(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, isAuthenticated, search, relationshipFilter]);

  const fetchParents = async (page = 1) => {
    try {
      console.log('Fetching parents...', { page, limit: pagination.limit, search, relationshipFilter });
      
      // Utiliser le service parents pour récupérer les parents
      const res = await parentsService.getParents({ 
        page, 
        limit: pagination.limit, 
        search, 
        relationship: relationshipFilter
      });
      
      console.log('Parents response:', res);
      
      if (res.success) {
        const parentsData = res.data.parents || [];
        setParents(parentsData);
        setPagination(res.data.pagination || { page: 1, limit: 10, total: 0, pages: 0 });
        console.log('Parents loaded:', parentsData.length);
        
        // Afficher un message de succès si des parents sont trouvés
        if (parentsData.length > 0) {
          showSuccess(`تم تحميل ${parentsData.length} ولي أمر بنجاح`);
        }
      } else {
        console.error('Failed to load parents:', res.message);
        showError(res.message || 'فشل في تحميل قائمة أولياء الأمور');
        setParents([]);
      }
    } catch (e) {
      console.error('Erreur chargement parents:', e);
      showError('خطأ في الاتصال بالخادم');
      setParents([]);
    }
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">إدارة أولياء الأمور</h1>
          <p className="text-secondary-600">عرض معلومات أولياء الأمور وأطفالهم</p>
        </div>
        <div className="flex space-x-2 space-x-reverse">
          <button className="btn-secondary flex items-center space-x-2 space-x-reverse">
            <Download className="w-5 h-5" />
            <span>تصدير</span>
          </button>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
              <input
                type="text"
                placeholder="البحث عن ولي أمر أو تلميذ..."
                className="input-field pr-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                dir="rtl"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select 
              className="input-field" 
              value={relationshipFilter} 
              onChange={(e) => setRelationshipFilter(e.target.value)}
            >
              <option value="">نوع العلاقة</option>
              <option value="father">أب</option>
              <option value="mother">أم</option>
              <option value="guardian">وصي</option>
            </select>
            <button className="btn-secondary flex items-center">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      {parents.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="card text-center">
            <div className="text-2xl font-bold text-primary-600">{parents.length}</div>
            <div className="text-sm text-secondary-600">إجمالي أولياء الأمور</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-secondary-600">
              {parents.filter(p => p.relationship === 'father').length}
            </div>
            <div className="text-sm text-secondary-600">آباء</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-secondary-600">
              {parents.filter(p => p.relationship === 'mother').length}
            </div>
            <div className="text-sm text-secondary-600">أمهات</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-secondary-600">
              {parents.reduce((total, parent) => total + (parent.children?.length || 0), 0)}
            </div>
            <div className="text-sm text-secondary-600">إجمالي الأطفال</div>
          </div>
        </div>
      )}

      {/* Liste des parents */}
      <div className="space-y-4">
        {parents.length === 0 ? (
          <div className="card text-center py-12">
            <Users className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-secondary-700 mb-2">لا توجد بيانات أولياء أمور</h3>
            <p className="text-secondary-500 mb-4">
              {search || relationshipFilter 
                ? 'لم يتم العثور على أولياء أمور يطابقون معايير البحث' 
                : 'لم يتم تسجيل أي ولي أمر بعد'
              }
            </p>
            {search || relationshipFilter ? (
              <button 
                onClick={() => {
                  setSearch('');
                  setRelationshipFilter('');
                }}
                className="btn-secondary"
              >
                إعادة تعيين الفلاتر
              </button>
            ) : null}
          </div>
        ) : (
          parents.map((parent, index) => (
            <motion.div
              key={parent._id || parent.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card hover:shadow-lg transition-shadow duration-200"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Informations du Parent */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <UserCheck className="w-5 h-5 text-primary-600" />
                      <h3 className="text-lg font-semibold text-secondary-800">
                        {parent.relationship === 'father' ? 'معلومات الأب' : 
                         parent.relationship === 'mother' ? 'معلومات الأم' : 'معلومات الوصي'}
                      </h3>
                    </div>
                    <span className={`badge ${
                      parent.relationship === 'father' ? 'badge-primary' :
                      parent.relationship === 'mother' ? 'badge-secondary' : 'badge-info'
                    }`}>
                      {parent.relationship === 'father' ? 'أب' :
                       parent.relationship === 'mother' ? 'أم' : 'وصي'}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <span className="text-sm text-secondary-600 w-20">الاسم:</span>
                      <span className="font-medium text-secondary-800">
                        {parent.firstName || 'غير محدد'} {parent.lastName || ''}
                      </span>
                    </div>
                    
                    {parent.phone && (
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Phone className="w-4 h-4 text-secondary-500" />
                        <span className="text-sm text-secondary-700">{parent.phone}</span>
                      </div>
                    )}
                    
                    {parent.email && (
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Mail className="w-4 h-4 text-secondary-500" />
                        <span className="text-sm text-secondary-700">{parent.email}</span>
                      </div>
                    )}
                    
                    {parent.address && (parent.address.street || parent.address.city) && (
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <MapPin className="w-4 h-4 text-secondary-500" />
                        <span className="text-sm text-secondary-700">
                          {parent.address.street && parent.address.city 
                            ? `${parent.address.street}, ${parent.address.city}`
                            : parent.address.street || parent.address.city
                          }
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Informations des Enfants */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Users className="w-5 h-5 text-primary-600" />
                      <h3 className="text-lg font-semibold text-secondary-800">الأطفال المسجلين</h3>
                    </div>
                    <span className="badge badge-info">
                      {parent.children?.length || 0} طفل
                    </span>
                  </div>
                  
                  {/* Liste des enfants */}
                  <div>
                    {parent.children && parent.children.length > 0 ? (
                      <div className="space-y-2">
                        {parent.children.map((child, childIndex) => (
                          <div key={child._id || childIndex} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg border">
                            <div className="flex-1">
                              <div className="font-medium text-secondary-800">
                                {child.firstName} {child.lastName}
                              </div>
                              {child.class && (
                                <div className="text-sm text-secondary-600">
                                  {child.class.name || child.class} - {child.class.level || ''}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 space-x-reverse">
                              <span className={`badge text-xs ${child.gender === 'male' ? 'badge-primary' : 'badge-secondary'}`}>
                                {child.gender === 'male' ? 'ذكر' : 'أنثى'}
                              </span>
                              <span className={`badge text-xs ${
                                child.schoolingType === 'externe' 
                                  ? 'badge-info' 
                                  : child.schoolingType === 'demi-pensionnaire' 
                                  ? 'badge-warning' 
                                  : 'badge-secondary'
                              }`}>
                                {child.schoolingType === 'externe' 
                                  ? 'خارجي' 
                                  : child.schoolingType === 'demi-pensionnaire' 
                                  ? 'نصف داخلي' 
                                  : 'غير محدد'
                                }
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 bg-warning-50 rounded-lg border border-warning-200">
                        <UserX className="w-8 h-8 text-warning-500 mx-auto mb-2" />
                        <p className="text-sm text-warning-600">لا يوجد أطفال مسجلين لهذا الوالد</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Pagination */}
      {parents.length > 0 && pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-secondary-600">
            عرض {((pagination.page - 1) * pagination.limit) + 1} إلى {Math.min(pagination.page * pagination.limit, pagination.total)} من أصل {pagination.total} ولي أمر
          </p>
          <div className="flex items-center space-x-2 space-x-reverse">
            <button
              onClick={() => fetchParents(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              السابق
            </button>
            <span className="text-sm text-secondary-600">
              صفحة {pagination.page} من {pagination.pages}
            </span>
            <button
              onClick={() => fetchParents(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              التالي
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Parents;
