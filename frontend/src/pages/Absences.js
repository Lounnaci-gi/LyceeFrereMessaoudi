import React from 'react';
import { Calendar, Plus, Search, Filter } from 'lucide-react';

const Absences = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">إدارة الغيابات</h1>
          <p className="text-secondary-600">تسجيل ومتابعة غيابات التلاميذ</p>
        </div>
        <button className="btn-primary flex items-center space-x-2 space-x-reverse">
          <Plus className="w-5 h-5" />
          <span>تسجيل غياب</span>
        </button>
      </div>

      <div className="card">
        <p className="text-secondary-600">قائمة الغيابات ستظهر هنا...</p>
      </div>
    </div>
  );
};

export default Absences;
