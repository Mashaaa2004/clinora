import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { Doctor, Appointment, MedicalRecord, Prescription, Bill, Service } from '../types';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { 
  Stethoscope, 
  Calendar, 
  FileText, 
  Search,
  Clock,
  CheckCircle2,
  Plus,
  PlusCircle,
  CreditCard,
  ClipboardList
} from 'lucide-react';

export const PatientDashboard: React.FC<{ activeTab: string }> = ({ activeTab }) => {
  const { profile } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');

  useEffect(() => {
    fetchDoctors();
    fetchServices();
    if (profile) {
      fetchAppointments();
      fetchMedicalRecords();
      fetchPrescriptions();
      fetchBills();
    }
  }, [profile]);

  const fetchBills = async () => {
    const res = await fetch(`/api/billing/${profile?.id}`);
    const data = await res.json();
    setBills(data);
  };

  const fetchServices = async () => {
    const res = await fetch('/api/services');
    const data = await res.json();
    setServices(data);
  };

  const fetchDoctors = async () => {
    const res = await fetch('/api/doctors');
    const data = await res.json();
    setDoctors(data);
  };

  const fetchAppointments = async () => {
    const res = await fetch(`/api/appointments?patientId=${profile?.id}`);
    const data = await res.json();
    setAppointments(data);
  };

  const fetchMedicalRecords = async () => {
    const res = await fetch(`/api/medical-records/${profile?.id}`);
    const data = await res.json();
    setMedicalRecords(data);
  };

  const fetchPrescriptions = async () => {
    const res = await fetch(`/api/prescriptions/${profile?.id}`);
    const data = await res.json();
    setPrescriptions(data);
  };

  const [bookingSuccess, setBookingSuccess] = useState(false);

  const downloadPDF = () => {
    if (!profile) return;
    
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.text('TIBBIY KARTA (MEDICAL RECORD)', 105, 15, { align: 'center' });
    
    // Patient Info
    doc.setFontSize(12);
    doc.text(`Bemor: ${profile.name}`, 20, 30);
    doc.text(`Tug'ilgan sana: ${profile.birthDate || 'N/A'}`, 20, 38);
    doc.text(`Telefon: ${profile.phone || 'N/A'}`, 20, 46);
    doc.text(`Sana: ${new Date().toLocaleDateString()}`, 150, 30);
    
    doc.line(20, 52, 190, 52);
    
    // Medical Records Table
    doc.setFontSize(14);
    doc.text('TIBBIY KO\'RIKLAR', 20, 62);
    
    const recordsData = medicalRecords.map(r => [r.date, r.doctor_name, r.diagnosis]);
    (doc as any).autoTable({
      startY: 67,
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
    
    doc.save(`medical_card_${profile.name.replace(/\s+/g, '_')}.pdf`);
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !selectedDoctor) return;
    const res = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientId: profile.id,
        doctorId: selectedDoctor.id,
        date: bookingDate,
        time: bookingTime
      })
    });
    if (res.ok) {
      setBookingSuccess(true);
      fetchAppointments();
      setTimeout(() => {
        setShowBookingModal(false);
        setBookingSuccess(false);
      }, 2000);
    }
  };

  const filteredDoctors = doctors.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    d.specialization.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {activeTab === 'dashboard' && (
        <div className="space-y-8">
          <div className="bg-blue-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-2">Хуш келибсиз, {profile?.name}!</h2>
              <p className="text-blue-100 opacity-90">Соғлиғингиз биз учун муҳим. Навбат олинг ёки тиббий тарихингизни кўринг.</p>
            </div>
            <Plus className="absolute -right-8 -bottom-8 text-blue-500 opacity-20" size={200} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border shadow-sm">
              <h3 className="text-lg font-bold mb-4 flex items-center space-x-2">
                <Calendar className="text-blue-600" />
                <span>Яқинлашаётган навбатлар</span>
              </h3>
              <div className="space-y-3">
                {appointments.slice(0, 3).map(app => (
                  <div key={app.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border">
                    <div>
                      <p className="font-semibold text-slate-900">{app.doctor_name}</p>
                      <p className="text-xs text-slate-500">{app.specialization}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-blue-600">{app.date}</p>
                      <p className="text-xs text-slate-500">{app.time}</p>
                    </div>
                  </div>
                ))}
                {appointments.length === 0 && <p className="text-slate-400 text-sm italic">Навбатлар йўқ</p>}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border shadow-sm">
              <h3 className="text-lg font-bold mb-4 flex items-center space-x-2">
                <FileText className="text-green-600" />
                <span>Сўнгги рецептлар</span>
              </h3>
              <div className="space-y-3">
                {prescriptions.slice(0, 3).map(pres => (
                  <div key={pres.id} className="p-3 bg-green-50 rounded-lg border border-green-100">
                    <p className="text-sm font-medium text-slate-900 truncate">{pres.prescription_text}</p>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-green-600">{pres.doctor_name}</span>
                      <span className="text-xs text-slate-400">{pres.date}</span>
                    </div>
                  </div>
                ))}
                {prescriptions.length === 0 && <p className="text-slate-400 text-sm italic">Рецептлар йўқ</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'book_appointment' && (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl border shadow-sm">
          <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
            <PlusCircle className="text-blue-600" />
            <span>Шифокор қабулига навбат олиш</span>
          </h2>
          
          {bookingSuccess ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 size={40} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Муваффақиятли!</h3>
              <p className="text-slate-600">Сизнинг навбатингиз муваффақиятли рўйхатга олинди.</p>
              <button 
                onClick={() => setBookingSuccess(false)}
                className="mt-4 text-blue-600 font-medium hover:underline"
              >
                Яна навбат олиш
              </button>
            </div>
          ) : (
            <form onSubmit={handleBooking} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Шифокорни танланг</label>
                <select 
                  required
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50"
                  value={selectedDoctor?.id || ''}
                  onChange={(e) => {
                    const doc = doctors.find(d => d.id === parseInt(e.target.value));
                    setSelectedDoctor(doc || null);
                  }}
                >
                  <option value="">Шифокорни танланг...</option>
                  {doctors.map(doc => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name} ({doc.specialization})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Санани танланг</label>
                  <input 
                    type="date" 
                    required 
                    className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Вақтни танланг</label>
                  <select 
                    required 
                    className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50"
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                  >
                    <option value="">Вақтни танланг...</option>
                    <option value="09:00">09:00</option>
                    <option value="10:00">10:00</option>
                    <option value="11:00">11:00</option>
                    <option value="12:00">12:00</option>
                    <option value="14:00">14:00</option>
                    <option value="15:00">15:00</option>
                    <option value="16:00">16:00</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center space-x-2"
              >
                <span>Навбатни тасдиқлаш</span>
              </button>
            </form>
          )}
        </div>
      )}

      {activeTab === 'doctors_list' && (
        <div className="space-y-6">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Шифокор ёки мутахассислик бўйича қидириш..." 
              className="w-full pl-10 pr-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map(doc => (
              <div key={doc.id} className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4">
                  <Stethoscope size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">{doc.name}</h3>
                <p className="text-blue-600 font-medium text-sm mb-4">{doc.specialization}</p>
                <p className="text-slate-500 text-sm mb-6 flex items-center">
                  <Clock size={14} className="mr-1" /> 09:00 - 17:00
                </p>
                <button 
                  onClick={() => {
                    setSelectedDoctor(doc);
                    setShowBookingModal(true);
                  }}
                  className="w-full py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Навбат олиш
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'my_appointments' && (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Шифокор</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Мутахассислик</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Сана</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Вақт</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Ҳолат</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {appointments.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-900 font-medium">{a.doctor_name}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{a.specialization}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{a.date}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{a.time}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle2 size={12} className="mr-1" /> Тасдиқланган
                    </span>
                  </td>
                </tr>
              ))}
              {appointments.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">Сизда фаол навбатлар йўқ</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'medical_history' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-slate-900">Тиббий карта</h2>
            <button 
              onClick={downloadPDF}
              className="flex items-center space-x-2 bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-900 transition-colors"
            >
              <FileText size={18} />
              <span>Юклаб олиш (PDF)</span>
            </button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:grid-cols-1">
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="text-xl font-bold mb-6 flex items-center space-x-2">
              <ClipboardList className="text-blue-600" />
              <span>Тиббий кўриклар</span>
            </h3>
            <div className="space-y-4">
              {medicalRecords.map(record => (
                <div key={record.id} className="p-4 bg-slate-50 rounded-lg border">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-bold text-slate-900">{record.doctor_name}</span>
                    <span className="text-xs text-slate-500">{record.date}</span>
                  </div>
                  <p className="text-sm text-slate-700">{record.diagnosis}</p>
                </div>
              ))}
              {medicalRecords.length === 0 && <p className="text-slate-400 italic">Тарих мавжуд эмас</p>}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="text-xl font-bold mb-6 flex items-center space-x-2">
              <FileText className="text-green-600" />
              <span>Рецептлар</span>
            </h3>
            <div className="space-y-4">
              {prescriptions.map(pres => (
                <div key={pres.id} className="p-4 bg-green-50 rounded-lg border border-green-100">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-bold text-green-700">{pres.doctor_name}</span>
                    <span className="text-xs text-slate-500">{pres.date}</span>
                  </div>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{pres.prescription_text}</p>
                </div>
              ))}
              {prescriptions.length === 0 && <p className="text-slate-400 italic">Рецептлар мавжуд эмас</p>}
            </div>
          </div>
        </div>
      </div>
      )}

      {activeTab === 'services_list' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900">Шифохона хизматлари ва нархлари</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map(service => (
              <div key={service.id} className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                  <ClipboardList size={24} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{service.name}</h3>
                <p className="text-2xl font-black text-blue-600 font-mono">
                  {service.price.toLocaleString()} <span className="text-sm font-normal text-slate-500">сўм</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'billing' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h2 className="text-2xl font-bold text-slate-900">Тўловлар тарихи</h2>
            <div className="flex flex-wrap gap-3">
              <div className="bg-amber-50 px-4 py-2 rounded-lg border border-amber-100">
                <span className="text-xs text-amber-600 font-bold uppercase tracking-wider block">Тўланиши керак</span>
                <span className="text-lg font-bold text-amber-700">
                  {bills.filter(b => b.status === 'unpaid').reduce((sum, b) => sum + b.amount, 0).toLocaleString()} сўм
                </span>
              </div>
              <div className="bg-green-50 px-4 py-2 rounded-lg border border-green-100">
                <span className="text-xs text-green-600 font-bold uppercase tracking-wider block">Тўланган</span>
                <span className="text-lg font-bold text-green-700">
                  {bills.filter(b => b.status === 'paid').reduce((sum, b) => sum + b.amount, 0).toLocaleString()} сўм
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-700">Хизмат номи</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-700">Сана</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-700">Нархи</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-700">Ҳолати</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {bills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-900 font-medium">{bill.service_name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{bill.date}</td>
                    <td className="px-6 py-4 text-sm text-slate-900 font-bold">{bill.amount.toLocaleString()} сўм</td>
                    <td className="px-6 py-4 text-sm">
                      {bill.status === 'paid' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle2 size={12} className="mr-1" /> Тўланган
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                          <Clock size={12} className="mr-1" /> Тўланмаган
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {bills.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">Тўловлар тарихи мавжуд эмас</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && selectedDoctor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold mb-2">Навбат олиш</h2>
            {bookingSuccess ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={32} />
                </div>
                <p className="text-lg font-bold text-slate-900">Муваффақиятли!</p>
                <p className="text-slate-500 text-sm">Навбат муваффақиятли олинди.</p>
              </div>
            ) : (
              <>
                <p className="text-slate-500 mb-6">Шифокор: <span className="font-bold text-blue-600">{selectedDoctor.name}</span></p>
                
                <form onSubmit={handleBooking} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Санани танланг</label>
                <input 
                  type="date" required 
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  value={bookingDate} onChange={e => setBookingDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Вақтни танланг</label>
                <select 
                  required 
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  value={bookingTime} onChange={e => setBookingTime(e.target.value)}
                >
                  <option value="">Танланг...</option>
                  <option value="09:00">09:00</option>
                  <option value="10:00">10:00</option>
                  <option value="11:00">11:00</option>
                  <option value="14:00">14:00</option>
                  <option value="15:00">15:00</option>
                  <option value="16:00">16:00</option>
                </select>
              </div>
              <div className="flex space-x-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowBookingModal(false)} 
                  className="flex-1 py-3 border rounded-xl font-semibold hover:bg-slate-50 transition-colors"
                >
                  Бекор қилиш
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                >
                  Тасдиқлаш
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )}
</div>
);
};



