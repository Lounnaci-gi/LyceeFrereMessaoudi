import React, { useEffect, useRef } from 'react';
import { Printer, X } from 'lucide-react';
import JsBarcode from 'jsbarcode';
import './StudentCard.css';

const StudentCard = ({ student, isOpen, onClose, onPrint }) => {
  const barcodeRef = useRef(null);

  const formatDate = (dateString) => {
    if (!dateString) return 'غير محدد';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-TN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getGenderText = (gender) => {
    return gender === 'male' ? 'ذكر' : gender === 'female' ? 'أنثى' : 'غير محدد';
  };

  // Générer le code-barres
  useEffect(() => {
    if (barcodeRef.current && student?.studentId) {
      try {
        JsBarcode(barcodeRef.current, student.studentId, {
          format: "CODE128",
          width: 1,
          height: 20,
          displayValue: false,
          margin: 0
        });
      } catch (error) {
        console.error('Erreur génération code-barres:', error);
      }
    }
  }, [student?.studentId]);

  if (!student) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">بطاقة الطالب</h2>
            <div className="flex space-x-2 space-x-reverse">
              <button
                onClick={onPrint}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-2 rounded-lg flex items-center space-x-2 space-x-reverse transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة</span>
              </button>
              <button
                onClick={onClose}
                className="text-white hover:text-primary-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Card Content */}
        <div className="p-6">
          {/* Printable Card - Format carte d'identité 8.6cm x 5.4cm */}
          <div id="student-card" className="student-card-id">
            {/* Header */}
            <div className="card-header">
              <div className="school-name">معهد الأخوة مسعودي</div>
              <div className="card-type">بطاقة الطالب</div>
            </div>

            {/* Main Content */}
            <div className="card-content">
              {/* Left Side - Photo */}
              <div className="photo-section">
                <div className="student-photo">
                  {student.photo ? (
                    <img 
                      src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/../uploads/students/${student.photo}`} 
                      alt={`${student.firstName} ${student.lastName}`}
                    />
                  ) : (
                    <div className="no-photo">
                      <div className="no-photo-icon">👤</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Side - Info */}
              <div className="info-section">
                <div className="student-name">{student.firstName} {student.lastName}</div>
                <div className="student-id">رقم: {student.studentId}</div>
                
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">تاريخ الميلاد:</span>
                    <span className="info-value">{formatDate(student.dateOfBirth)}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">الجنس:</span>
                    <span className="info-value">{getGenderText(student.gender)}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">الفصل:</span>
                    <span className="info-value">{student.class?.name || 'غير محدد'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">المستوى:</span>
                    <span className="info-value">{student.class?.level || 'غير محدد'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer with Barcode */}
            <div className="card-footer">
              <div className="barcode-section">
                <svg ref={barcodeRef} className="barcode"></svg>
              </div>
              <div className="footer-text">
                معهد الأخوة مسعودي - {new Date().getFullYear()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentCard;
