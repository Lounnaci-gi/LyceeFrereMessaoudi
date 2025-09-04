import React from 'react';
import { AlertTriangle, Plus, Search, Filter } from 'lucide-react';

const Incidents = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">إدارة الحوادث</h1>
          <p className="text-secondary-600">تسجيل ومتابعة الحوادث السلوكية</p>
        </div>
        <button className="btn-primary flex items-center space-x-2 space-x-reverse">
          <Plus className="w-5 h-5" />
          <span>تسجيل حادث</span>
        </button>
      </div>

      <div className="card">
        <p className="text-secondary-600">قائمة الحوادث ستظهر هنا...</p>
      </div>
    </div>
  );
};

export default Incidents;
