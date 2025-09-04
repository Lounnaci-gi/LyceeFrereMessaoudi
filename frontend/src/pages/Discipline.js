import React from 'react';
import { Gavel, Plus, Search, Filter } from 'lucide-react';

const Discipline = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">مجالس التأديب</h1>
          <p className="text-secondary-600">إدارة مجالس التأديب والقرارات</p>
        </div>
        <button className="btn-primary flex items-center space-x-2 space-x-reverse">
          <Plus className="w-5 h-5" />
          <span>إنشاء مجلس تأديب</span>
        </button>
      </div>

      <div className="card">
        <p className="text-secondary-600">قائمة مجالس التأديب ستظهر هنا...</p>
      </div>
    </div>
  );
};

export default Discipline;
