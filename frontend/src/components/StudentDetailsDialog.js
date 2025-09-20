import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Users, GraduationCap, Heart } from 'lucide-react';

const StudentDetailsDialog = ({ isOpen, onClose, student }) => {
  if (!student) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'غير محدد';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-TN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getGenderText = (gender) => {
    return gender === 'male' ? 'ذكر' : gender === 'female' ? 'أنثى' : 'غير محدد';
  };

  const getSchoolingTypeText = (type) => {
    switch (type) {
      case 'externe': return 'خارجي';
      case 'demi-pensionnaire': return 'نصف داخلي';
      default: return 'غير محدد';
    }
  };

  const getFamilySituationText = (situation) => {
    switch (situation) {
      case 'married': return 'متزوج';
      case 'divorced': return 'مطلق';
      case 'father_deceased': return 'الأب متوفى';
      case 'mother_deceased': return 'الأم متوفية';
      case 'both_deceased': return 'كلاهما متوفى';
      default: return 'غير محدد';
    }
  };

  const getFinancialSituationText = (situation) => {
    switch (situation) {
      case 'stable': return 'مستقر';
      case 'precarious': return 'هش';
      default: return 'غير محدد';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={onClose}
          />
          
          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 space-x-reverse">
                    <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      {student.photo ? (
                        <img 
                          src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/../uploads/students/${student.photo}`} 
                          alt={student.firstName} 
                          className="w-14 h-14 rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-8 h-8" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{student.firstName} {student.lastName}</h2>
                      <p className="text-primary-100">رقم التسجيل: {student.studentId}</p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-white hover:text-primary-200 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Informations personnelles */}
                  <div className="space-y-6">
                    <div className="bg-secondary-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-secondary-800 mb-4 flex items-center">
                        <User className="w-5 h-5 ml-2" />
                        المعلومات الشخصية
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-secondary-600">الاسم الكامل:</span>
                          <span className="font-medium">{student.firstName} {student.lastName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-secondary-600">تاريخ الميلاد:</span>
                          <span className="font-medium">{formatDate(student.dateOfBirth)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-secondary-600">الجنس:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            student.gender === 'male' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-pink-100 text-pink-800'
                          }`}>
                            {getGenderText(student.gender)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-secondary-600">البريد الإلكتروني:</span>
                          <span className="font-medium">{student.email || 'غير محدد'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-secondary-600">الحالة:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            student.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {student.isActive ? 'نشط' : 'غير نشط'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Informations académiques */}
                    <div className="bg-secondary-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-secondary-800 mb-4 flex items-center">
                        <GraduationCap className="w-5 h-5 ml-2" />
                        المعلومات الأكاديمية
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-secondary-600">الفصل:</span>
                          <span className="font-medium">{student.class?.name || 'غير محدد'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-secondary-600">المستوى:</span>
                          <span className="font-medium">{student.class?.level || 'غير محدد'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-secondary-600">التخصص:</span>
                          <span className="font-medium">{student.class?.specialty?.name || 'غير محدد'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-secondary-600">نوع التمدرس:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            student.schoolingType === 'externe' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {getSchoolingTypeText(student.schoolingType)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Informations familiales */}
                  <div className="space-y-6">
                    {/* Informations parents */}
                    {student.parents && student.parents.length > 0 && (
                      <div className="bg-secondary-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-secondary-800 mb-4 flex items-center">
                          <Users className="w-5 h-5 ml-2" />
                          معلومات الوالدين
                        </h3>
                        <div className="space-y-4">
                          {student.parents.map((parentRef, index) => (
                            <div key={index} className="border-r-4 border-primary-500 pr-4">
                              <h4 className="font-medium text-secondary-700 mb-2">
                                {parentRef.relationship === 'father' ? 'الأب' : 'الأم'}
                              </h4>
                              {parentRef.parent && (
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-secondary-600">الاسم:</span>
                                    <span className="font-medium">
                                      {parentRef.parent.firstName} {parentRef.parent.lastName}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-secondary-600">المهنة:</span>
                                    <span className="font-medium">{parentRef.parent.profession || 'غير محدد'}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-secondary-600">الهاتف:</span>
                                    <span className="font-medium">{parentRef.parent.phone || 'غير محدد'}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-secondary-600">البريد:</span>
                                    <span className="font-medium">{parentRef.parent.email || 'غير محدد'}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Informations familiales générales */}
                    <div className="bg-secondary-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-secondary-800 mb-4 flex items-center">
                        <Heart className="w-5 h-5 ml-2" />
                        الوضع العائلي
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-secondary-600">الوضع العائلي:</span>
                          <span className="font-medium">{getFamilySituationText(student.familySituation)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-secondary-600">الوضع المالي:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            student.financialSituation === 'stable' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-orange-100 text-orange-800'
                          }`}>
                            {getFinancialSituationText(student.financialSituation)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-secondary-600">عدد الأولاد:</span>
                          <span className="font-medium">{student.childrenCount?.boys || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-secondary-600">عدد البنات:</span>
                          <span className="font-medium">{student.childrenCount?.girls || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-secondary-50 px-6 py-4 border-t border-secondary-200">
                <div className="flex justify-end">
                  <button
                    onClick={onClose}
                    className="btn-primary px-6 py-2"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default StudentDetailsDialog;
