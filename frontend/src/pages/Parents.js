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
        setParents(res.data.parents || []);
        setPagination(res.data.pagination || { page: 1, limit: 10, total: 0, pages: 0 });
        console.log('Parents loaded:', res.data.parents?.length || 0);
      } else {
        console.error('Failed to load parents:', res.message);
        setParents([]);
      }
    } catch (e) {
      console.error('Erreur chargement parents:', e);
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

      {/* Liste des parents */}
      <div className="space-y-4">
        {parents.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-secondary-500">لا توجد بيانات أولياء أمور</p>
            <p className="text-sm text-secondary-400 mt-2">عدد أولياء الأمور: {parents.length}</p>
          </div>
        ) : (
          parents.map((parent, index) => (
            <motion.div
              key={parent._id || parent.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Informations du Parent */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <UserCheck className="w-5 h-5 text-primary-600" />
                    <h3 className="text-lg font-semibold text-secondary-800">
                      {parent.relationship === 'father' ? 'معلومات الأب' : 
                       parent.relationship === 'mother' ? 'معلومات الأم' : 'معلومات الوصي'}
                    </h3>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-secondary-600">الاسم الكامل:</span>
                      <p className="font-medium">
                        {parent.firstName || 'غير محدد'} {parent.lastName || ''}
                      </p>
                    </div>
                    {parent.phone && (
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Phone className="w-4 h-4 text-secondary-500" />
                        <span className="text-sm">{parent.phone}</span>
                      </div>
                    )}
                    {parent.email && (
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Mail className="w-4 h-4 text-secondary-500" />
                        <span className="text-sm">{parent.email}</span>
                      </div>
                    )}
                    {parent.address && (parent.address.street || parent.address.city) && (
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <MapPin className="w-4 h-4 text-secondary-500" />
                        <span className="text-sm">
                          {parent.address.street && parent.address.city 
                            ? `${parent.address.street}, ${parent.address.city}`
                            : parent.address.street || parent.address.city
                          }
                        </span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <span className="text-sm text-secondary-600">العلاقة:</span>
                      <span className={`badge ${
                        parent.relationship === 'father' ? 'badge-primary' :
                        parent.relationship === 'mother' ? 'badge-secondary' : 'badge-info'
                      }`}>
                        {parent.relationship === 'father' ? 'أب' :
                         parent.relationship === 'mother' ? 'أم' : 'وصي'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Informations des Enfants */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Users className="w-5 h-5 text-primary-600" />
                    <h3 className="text-lg font-semibold text-secondary-800">الأطفال المسجلين</h3>
                  </div>
                  
                  {/* Liste des enfants */}
                  <div>
                    {parent.children && parent.children.length > 0 ? (
                      <div className="space-y-2">
                        {parent.children.map((child, childIndex) => (
                          <div key={child._id || childIndex} className="flex items-center justify-between p-3 bg-secondary-50 rounded">
                            <div>
                              <span className="font-medium">{child.firstName} {child.lastName}</span>
                              {child.class && (
                                <span className="text-sm text-secondary-600 mr-2"> - {child.class.name || child.class}</span>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 space-x-reverse">
                              <span className={`badge ${child.gender === 'male' ? 'badge-primary' : 'badge-secondary'}`}>
                                {child.gender === 'male' ? 'ذكر' : 'أنثى'}
                              </span>
                              <span className={`badge ${
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
                      <div className="text-sm text-warning-600 bg-warning-50 p-3 rounded">
                        <UserX className="w-4 h-4 inline mr-1" />
                        لا يوجد أطفال مسجلين لهذا الوالد
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
      {parents.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-secondary-600">
            عرض 1 إلى {parents.length} من أصل {parents.length} ولي أمر
          </p>
        </div>
      )}
    </div>
  );
};

export default Parents;
