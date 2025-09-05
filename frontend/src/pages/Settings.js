import React from 'react';
import { Settings as SettingsIcon, User, Lock, Bell, Database } from 'lucide-react';

const Settings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-adaptive-primary">الإعدادات</h1>
        <p className="text-adaptive-secondary">إدارة إعدادات النظام والحساب</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title flex items-center space-x-2 space-x-reverse">
              <User className="w-5 h-5" />
              <span>إعدادات الحساب</span>
            </h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-adaptive-label mb-2">
                اسم المستخدم
              </label>
              <input type="text" className="input-field" value="admin" readOnly />
            </div>
            <div>
              <label className="block text-sm font-medium text-adaptive-label mb-2">
                البريد الإلكتروني
              </label>
              <input type="email" className="input-field" value="admin@lycee.com" />
            </div>
            <button className="btn-primary">حفظ التغييرات</button>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title flex items-center space-x-2 space-x-reverse">
              <Lock className="w-5 h-5" />
              <span>تغيير كلمة المرور</span>
            </h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                كلمة المرور الحالية
              </label>
              <input type="password" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                كلمة المرور الجديدة
              </label>
              <input type="password" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                تأكيد كلمة المرور الجديدة
              </label>
              <input type="password" className="input-field" />
            </div>
            <button className="btn-primary">تغيير كلمة المرور</button>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title flex items-center space-x-2 space-x-reverse">
              <Bell className="w-5 h-5" />
              <span>إعدادات الإشعارات</span>
            </h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-secondary-700">إشعارات البريد الإلكتروني</span>
              <input type="checkbox" className="rounded" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-secondary-700">إشعارات الغيابات</span>
              <input type="checkbox" className="rounded" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-secondary-700">إشعارات الحوادث</span>
              <input type="checkbox" className="rounded" />
            </div>
            <button className="btn-primary">حفظ الإعدادات</button>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title flex items-center space-x-2 space-x-reverse">
              <Database className="w-5 h-5" />
              <span>إعدادات النظام</span>
            </h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                اسم المؤسسة
              </label>
              <input type="text" className="input-field" value="ثانوية الإخوة مسعودي" />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                السنة الدراسية
              </label>
              <select className="input-field">
                <option>2024-2025</option>
                <option>2023-2024</option>
              </select>
            </div>
            <button className="btn-primary">حفظ الإعدادات</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
