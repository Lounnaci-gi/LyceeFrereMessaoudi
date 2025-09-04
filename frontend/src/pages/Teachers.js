import React from 'react';
import { UserCheck, Plus, Search, Filter } from 'lucide-react';

const Teachers = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">إدارة الأساتذة</h1>
          <p className="text-secondary-600">عرض وإدارة بيانات الأساتذة</p>
        </div>
        <button className="btn-primary flex items-center space-x-2 space-x-reverse">
          <Plus className="w-5 h-5" />
          <span>إضافة أستاذ جديد</span>
        </button>
      </div>

      <div className="card">
        <p className="text-secondary-600">قائمة الأساتذة ستظهر هنا...</p>
      </div>
    </div>
  );
};

export default Teachers;
