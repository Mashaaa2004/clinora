import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { Appointment, MedicalRecord, Prescription } from '../types';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Calendar, FileText, ClipboardList, User, Plus, X, Download } from 'lucide-react';

export const DoctorDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<{ id: number; name: string } | null>(null);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [newDiagnosis, setNewDiagnosis] = useState('');
  const [newPrescription, setNewPrescription] = useState('');

  useEffect(() => {
    if (profile) {
      fetchAppointments();
    }
  }, [profile]);

  const fetchAppointments = async () => {
    const res = await fetch(`/api/appointments?doctorId=${profile?.id}`);
    const data = await res.json();
    setAppointments(data);
  };

  const fetchPatientData = async (patientId: number, patientName: string) => {
    setSelectedPatient({ id: patientId, name: patientName });
    const recordsRes = await fetch(`/api/medical-records/${patientId}`);
    const recordsData = await recordsRes.json();
    setMedicalRecords(recordsData);

    const presRes = await fetch(`/api/prescriptions/${patientId}`);
    const presData = await presRes.json();
    setPrescriptions(presData);
  };

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !profile) return;
    const res = await fetch('/api/medical-records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientId: selectedPatient.id,
        doctorId: profile.id,
        diagnosis: newDiagnosis,
        date: new Date().toISOString().split('T')[0]
      })
    });
    if (res.ok) {
      setNewDiagnosis('');
      setShowRecordModal(false);
      fetchPatientData(selectedPatient.id, selectedPatient.name);
    }
  };

  const handleAddPrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !profile) return;
    const res = await fetch('/api/prescriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientId: selectedPatient.id,
        doctorId: profile.id,
        prescriptionText: newPrescription,
        date: new Date().toISOString().split('T')[0]
      })
    });
    if (res.ok) {
      setNewPrescription('');
      setShowPrescriptionModal(false);
      fetchPatientData(selectedPatient.id, selectedPatient.name);
    }
  };

  const downloadPDF = () => {
    if (!selectedPatient) return;
    
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.text('TIBBIY KARTA (MEDICAL RECORD)', 105, 15, { align: 'center' });
    
    // Patient Info
    doc.setFontSize(12);
    doc.text(`Bemor: ${selectedPatient.name}`, 20, 30);
    doc.text(`Sana: ${new Date().toLocaleDateString()}`, 150, 30);
    
    doc.line(20, 35, 190, 35);
    
    // Medical Records Table
    doc.setFontSize(14);
    doc.text('TIBBIY KO\'RIKLAR', 20, 45);
    
    const recordsData = medicalRecords.map(r => [r.date, r.doctor_name, r.diagnosis]);
    (doc as any).autoTable({
      startY: 50,
      head: [['Sana', 'Shifokor', 'Tashxis']],
      body: recordsData,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] }
    });
    
    // Prescriptions Table
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.text('RETSEPTLAR', 20, finalY);
    
    const prescriptionsData = prescriptions.map(p => [p.date, p.doctor_name, p.prescription_text]);
    (doc as any).autoTable({
      startY: finalY + 5,
      head: [['Sana', 'Shifokor', 'Retsept']],
      body: prescriptionsData,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129] }
    });
    
    doc.save(`medical_card_${selectedPatient.name.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Appointments List */}
      <div className="lg:col-span-1 space-y-4">
        <h2 className="text-xl font-bold flex items-center space-x-2">
          <Calendar className="text-blue-600" />
          <span>Бугунги беморлар</span>
        </h2>
        <div className="space-y-3">
          {appointments.length === 0 && (
            <p className="text-slate-500 bg-white p-4 rounded-xl border italic">Бугунга навбатлар йўқ</p>
          )}
          {appointments.map((app) => (
            <button
              key={app.id}
              onClick={() => fetchPatientData(app.patient_id, app.patient_name!)}
              className={`w-full text-left p-4 rounded-xl border transition-all ${
                selectedPatient?.id === app.patient_id 
                ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                : 'bg-white text-slate-900 hover:border-blue-300'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold">{app.patient_name}</p>
                  <p className={`text-sm ${selectedPatient?.id === app.patient_id ? 'text-blue-100' : 'text-slate-500'}`}>
                    {app.time}
                  </p>
                </div>
                <User size={20} className={selectedPatient?.id === app.patient_id ? 'text-blue-200' : 'text-slate-300'} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Patient Details */}
      <div className="lg:col-span-2 space-y-6">
        {selectedPatient ? (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border shadow-sm flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{selectedPatient.name}</h2>
                <p className="text-slate-500">Тиббий картаси</p>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={downloadPDF}
                  className="flex items-center space-x-2 bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-900 transition-colors"
                  title="PDF юклаб олиш"
                >
                  <Download size={18} />
                </button>
                <button 
                  onClick={() => setShowRecordModal(true)}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus size={18} />
                  <span>Ташхис</span>
                </button>
                <button 
                  onClick={() => setShowPrescriptionModal(true)}
                  className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus size={18} />
                  <span>Рецепт</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Medical History */}
              <div className="bg-white p-6 rounded-xl border shadow-sm">
                <h3 className="text-lg font-bold mb-4 flex items-center space-x-2">
                  <ClipboardList className="text-blue-600" />
                  <span>Ташхислар тарихи</span>
                </h3>
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  {medicalRecords.map((record) => (
                    <div key={record.id} className="p-4 bg-slate-50 rounded-lg border">
                      <div className="flex justify-between text-xs text-slate-500 mb-2">
                        <span>{record.date}</span>
                        <span className="font-medium">{record.doctor_name}</span>
                      </div>
                      <p className="text-sm text-slate-800">{record.diagnosis}</p>
                    </div>
                  ))}
                  {medicalRecords.length === 0 && <p className="text-slate-400 text-sm italic">Тарих мавжуд эмас</p>}
                </div>
              </div>

              {/* Prescriptions */}
              <div className="bg-white p-6 rounded-xl border shadow-sm">
                <h3 className="text-lg font-bold mb-4 flex items-center space-x-2">
                  <FileText className="text-green-600" />
                  <span>Берилган рецептлар</span>
                </h3>
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  {prescriptions.map((pres) => (
                    <div key={pres.id} className="p-4 bg-green-50 rounded-lg border border-green-100">
                      <div className="flex justify-between text-xs text-green-600 mb-2">
                        <span>{pres.date}</span>
                        <span className="font-medium">{pres.doctor_name}</span>
                      </div>
                      <p className="text-sm text-slate-800 whitespace-pre-wrap">{pres.prescription_text}</p>
                    </div>
                  ))}
                  {prescriptions.length === 0 && <p className="text-slate-400 text-sm italic">Рецептлар мавжуд эмас</p>}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-white rounded-xl border border-dashed p-12">
            <User size={64} className="mb-4 opacity-20" />
            <p className="text-lg">Беморни танланг</p>
          </div>
        )}
      </div>

      {/* Diagnosis Modal */}
      {showRecordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Янги ташхис ёзиш</h2>
              <button onClick={() => setShowRecordModal(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleAddRecord} className="space-y-4">
              <textarea 
                required 
                placeholder="Ташхис ва тавсиялар..." 
                className="w-full p-3 border rounded-lg h-32 focus:ring-2 focus:ring-blue-500 outline-none"
                value={newDiagnosis} onChange={e => setNewDiagnosis(e.target.value)}
              />
              <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold">Сақлаш</button>
            </form>
          </div>
        </div>
      )}

      {/* Prescription Modal */}
      {showPrescriptionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Янги рецепт ёзиш</h2>
              <button onClick={() => setShowPrescriptionModal(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleAddPrescription} className="space-y-4">
              <textarea 
                required 
                placeholder="Дорилар ва қўллаш тартиби..." 
                className="w-full p-3 border rounded-lg h-32 focus:ring-2 focus:ring-green-500 outline-none"
                value={newPrescription} onChange={e => setNewPrescription(e.target.value)}
              />
              <button type="submit" className="w-full py-3 bg-green-600 text-white rounded-lg font-bold">Сақлаш</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
