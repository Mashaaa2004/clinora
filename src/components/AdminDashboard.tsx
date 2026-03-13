import React, { useState, useEffect } from 'react';
import { Analytics, Doctor, Patient, Appointment, Service, Bill } from '../types';
import { 
  Users, 
  Calendar, 
  Stethoscope, 
  TrendingUp,
  Plus,
  Trash2,
  Search,
  CreditCard,
  UserPlus,
  X,
  FileText
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

export const AdminDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'stats' | 'doctors' | 'patients' | 'appointments' | 'services' | 'reports'>('appointments');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [serviceReport, setServiceReport] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [showAddDoctor, setShowAddDoctor] = useState(false);
  const [newDoctor, setNewDoctor] = useState({
    name: '',
    specialization: '',
    phone: '',
    username: '',
    password: ''
  });

  const [showAddPatient, setShowAddPatient] = useState(false);
  const [newPatient, setNewPatient] = useState({
    name: '',
    birthDate: '',
    phone: '',
    username: '',
    password: ''
  });

  const [showAddService, setShowAddService] = useState(false);
  const [newService, setNewService] = useState({
    name: '',
    price: '',
    cost: ''
  });

  const [selectedPatientForBilling, setSelectedPatientForBilling] = useState<Patient | null>(null);
  const [patientBills, setPatientBills] = useState<Bill[]>([]);
  const [showBillingModal, setShowBillingModal] = useState(false);

  useEffect(() => {
    fetchAnalytics();
    fetchDoctors();
    fetchPatients();
    fetchAppointments();
    fetchServices();
    fetchServiceReport();
  }, []);

  const fetchAnalytics = async () => {
    const res = await fetch('/api/analytics');
    const data = await res.json();
    setAnalytics(data);
  };

  const fetchDoctors = async () => {
    const res = await fetch('/api/doctors');
    const data = await res.json();
    setDoctors(data);
  };

  const fetchPatients = async () => {
    const res = await fetch('/api/patients');
    const data = await res.json();
    setPatients(data);
  };

  const fetchAppointments = async () => {
    const res = await fetch('/api/appointments');
    const data = await res.json();
    setAppointments(data);
  };

  const fetchServices = async () => {
    const res = await fetch('/api/services');
    const data = await res.json();
    setServices(data);
  };

  const fetchServiceReport = async () => {
    const res = await fetch('/api/reports/services');
    const data = await res.json();
    setServiceReport(data);
  };

  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/doctors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newDoctor)
    });
    if (res.ok) {
      setShowAddDoctor(false);
      setNewDoctor({ name: '', specialization: '', phone: '', username: '', password: '' });
      fetchDoctors();
    }
  };

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newPatient, role: 'patient' })
    });
    if (res.ok) {
      setShowAddPatient(false);
      setNewPatient({ name: '', birthDate: '', phone: '', username: '', password: '' });
      fetchPatients();
    }
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newService, price: Number(newService.price) })
    });
    if (res.ok) {
      setShowAddService(false);
      setNewService({ name: '', price: '', cost: '' });
      fetchServices();
    }
  };

  const [serviceToDelete, setServiceToDelete] = useState<number | null>(null);

  const handleDeleteService = async (id: number) => {
    await fetch(`/api/services/${id}`, { method: 'DELETE' });
    setServiceToDelete(null);
    fetchServices();
  };

  const fetchPatientBills = async (patientId: number) => {
    const res = await fetch(`/api/billing/${patientId}`);
    const data = await res.json();
    setPatientBills(data);
  };

  const handleAddBill = async (serviceId: number, price: number) => {
    if (!selectedPatientForBilling) return;
    const res = await fetch('/api/billing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientId: selectedPatientForBilling.id,
        serviceId,
        date: new Date().toISOString().split('T')[0],
        amount: price
      })
    });
    if (res.ok) {
      fetchPatientBills(selectedPatientForBilling.id);
    }
  };

  const [doctorToDelete, setDoctorToDelete] = useState<number | null>(null);

  const handleDeleteDoctor = async (id: number) => {
    await fetch(`/api/doctors/${id}`, { method: 'DELETE' });
    setDoctorToDelete(null);
    fetchDoctors();
  };

  const filteredDoctors = doctors.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    d.specialization.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.phone.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Админ панели</h1>
        <div className="flex space-x-2 bg-white p-1 rounded-lg border shadow-sm">
          <button 
            onClick={() => setActiveSubTab('stats')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeSubTab === 'stats' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            Статистика
          </button>
          <button 
            onClick={() => setActiveSubTab('doctors')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeSubTab === 'doctors' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            Шифокорлар
          </button>
          <button 
            onClick={() => setActiveSubTab('patients')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeSubTab === 'patients' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            Беморлар
          </button>
          <button 
            onClick={() => setActiveSubTab('appointments')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeSubTab === 'appointments' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            Навбатлар
          </button>
          <button 
            onClick={() => setActiveSubTab('services')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeSubTab === 'services' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            Хизматлар
          </button>
          <button 
            onClick={() => {
              setActiveSubTab('reports');
              fetchServiceReport();
            }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeSubTab === 'reports' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            Ҳисоботлар
          </button>
        </div>
      </div>

      {activeSubTab === 'stats' && analytics && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={<Users className="text-blue-600" />} label="Жами беморлар" value={analytics.totalPatients} />
            <StatCard icon={<Calendar className="text-green-600" />} label="Жами навбатлар" value={analytics.totalAppointments} />
            <StatCard icon={<Stethoscope className="text-purple-600" />} label="Энг кўп ташриф" value={analytics.mostVisitedDoctor} />
            <StatCard icon={<TrendingUp className="text-orange-600" />} label="Кунлик ўртача" value={(analytics.totalAppointments / 7).toFixed(1)} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border shadow-sm">
              <h3 className="text-lg font-semibold mb-6">Навбатлар динамикаси</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.appointmentsPerDay}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl border shadow-sm">
              <h3 className="text-lg font-semibold mb-6">Кунлик ташрифлар</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.appointmentsPerDay}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'doctors' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Шифокорни қидириш..." 
                className="w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button 
              onClick={() => setShowAddDoctor(true)}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              <span>Қўшиш</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-700">Исм</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-700">Мутахассислик</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-700">Телефон</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-700 text-right">Амаллар</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredDoctors.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-900">{doc.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{doc.specialization}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{doc.phone}</td>
                    <td className="px-6 py-4 text-sm text-right">
                      <button 
                        onClick={() => setDoctorToDelete(doc.id)}
                        className="text-red-600 hover:text-red-800 p-2"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {doctorToDelete !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Шифокорни ўчириш</h2>
            <p className="text-slate-600 mb-6">Ушбу шифокорни тизимдан ўчиришни тасдиқлайсизми?</p>
            <div className="flex space-x-3">
              <button 
                onClick={() => setDoctorToDelete(null)}
                className="flex-1 py-2 border rounded-lg font-medium hover:bg-slate-50"
              >
                Бекор қилиш
              </button>
              <button 
                onClick={() => handleDeleteDoctor(doctorToDelete)}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700"
              >
                Ўчириш
              </button>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'patients' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Беморни қидириш..." 
                className="w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button 
              onClick={() => setShowAddPatient(true)}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <UserPlus size={20} />
              <span>Рўйхатга олиш</span>
            </button>
          </div>
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-700">Исм</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-700">Туғилган сана</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-700">Телефон</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-700 text-right">Амаллар</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredPatients.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-900">{p.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{p.birth_date}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{p.phone}</td>
                    <td className="px-6 py-4 text-sm text-right">
                      <button 
                        onClick={() => {
                          setSelectedPatientForBilling(p);
                          fetchPatientBills(p.id);
                          setShowBillingModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 p-2"
                        title="Хизматлар ва тўлов"
                      >
                        <CreditCard size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubTab === 'services' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Шифохона хизматлари</h2>
            <button 
              onClick={() => setShowAddService(true)}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              <span>Хизмат қўшиш</span>
            </button>
          </div>
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-700">Хизмат номи</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-700">Нархи (сўм)</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-700 text-right">Амаллар</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {services.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-900">{s.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-mono">{s.price.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-right">
                      <button 
                        onClick={() => setServiceToDelete(s.id)}
                        className="text-red-600 hover:text-red-800 p-2"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Service Delete Confirmation Modal */}
      {serviceToDelete !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Хизматни ўчириш</h2>
            <p className="text-slate-600 mb-6">Ушбу хизматни ўчиришни тасдиқлайсизми?</p>
            <div className="flex space-x-3">
              <button 
                onClick={() => setServiceToDelete(null)}
                className="flex-1 py-2 border rounded-lg font-medium hover:bg-slate-50"
              >
                Бекор қилиш
              </button>
              <button 
                onClick={() => handleDeleteService(serviceToDelete)}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700"
              >
                Ўчириш
              </button>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'reports' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Хизматлар бўйича ҳисобот</h2>
            <button 
              onClick={fetchServiceReport}
              className="text-sm text-blue-600 font-medium hover:underline"
            >
              Янгилаш
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border shadow-sm">
              <h3 className="text-lg font-semibold mb-6">Даромад тақсимоти</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={serviceReport}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [`${value.toLocaleString()} сўм`, 'Даромад']}
                    />
                    <Bar dataKey="paid_revenue" fill="#10b981" radius={[4, 4, 0, 0]} name="Тўланган" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border shadow-sm">
              <h3 className="text-lg font-semibold mb-6">Хизматлар сони</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={serviceReport}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="total_count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Жами хизматлар" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-700">Хизмат номи</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-700">Хизматлар сони</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-700">Тўланган даромад</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-700">Тўланмаган (қарз)</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {serviceReport.map((r, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{r.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{r.total_count}</td>
                    <td className="px-6 py-4 text-sm text-green-600 font-bold font-mono">
                      {r.paid_revenue.toLocaleString()} сўм
                    </td>
                    <td className="px-6 py-4 text-sm text-amber-600 font-mono">
                      {r.unpaid_revenue.toLocaleString()} сўм
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {activeSubTab === 'appointments' && (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Бемор</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Шифокор</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Сана</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Вақт</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {appointments.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-900">{a.patient_name}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{a.doctor_name}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{a.date}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{a.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Patient Modal */}
      {showAddPatient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Янги беморни рўйхатга олиш</h2>
              <button onClick={() => setShowAddPatient(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleAddPatient} className="space-y-4">
              <input 
                type="text" required placeholder="Исм шарифи" 
                className="w-full p-2 border rounded-lg"
                value={newPatient.name} onChange={e => setNewPatient({...newPatient, name: e.target.value})}
              />
              <input 
                type="date" required placeholder="Туғилган сана" 
                className="w-full p-2 border rounded-lg"
                value={newPatient.birthDate} onChange={e => setNewPatient({...newPatient, birthDate: e.target.value})}
              />
              <input 
                type="text" required placeholder="Телефон" 
                className="w-full p-2 border rounded-lg"
                value={newPatient.phone} onChange={e => setNewPatient({...newPatient, phone: e.target.value})}
              />
              <input 
                type="text" required placeholder="Логин" 
                className="w-full p-2 border rounded-lg"
                value={newPatient.username} onChange={e => setNewPatient({...newPatient, username: e.target.value})}
              />
              <input 
                type="password" required placeholder="Парол" 
                className="w-full p-2 border rounded-lg"
                value={newPatient.password} onChange={e => setNewPatient({...newPatient, password: e.target.value})}
              />
              <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold">Сақлаш</button>
            </form>
          </div>
        </div>
      )}

      {/* Add Service Modal */}
      {showAddService && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Янги хизмат қўшиш</h2>
              <button onClick={() => setShowAddService(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleAddService} className="space-y-4">
              <input 
                type="text" required placeholder="Хизмат номи" 
                className="w-full p-2 border rounded-lg"
                value={newService.name} onChange={e => setNewService({...newService, name: e.target.value})}
              />
              <input 
                type="number" required placeholder="Хизмат нархи (бемор учун)" 
                className="w-full p-2 border rounded-lg"
                value={newService.price} onChange={e => setNewService({...newService, price: e.target.value})}
              />
              <input 
                type="number" required placeholder="Хизмат таннархи (Service Cost)" 
                className="w-full p-2 border rounded-lg"
                value={newService.cost} onChange={e => setNewService({...newService, cost: e.target.value})}
              />
              <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold">Сақлаш</button>
            </form>
          </div>
        </div>
      )}

      {/* Billing Modal */}
      {showBillingModal && selectedPatientForBilling && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-bold">Хизматлар ва тўлов</h2>
                <p className="text-sm text-slate-500">Бемор: {selectedPatientForBilling.name}</p>
              </div>
              <button onClick={() => setShowBillingModal(false)}><X size={24} /></button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto pr-2">
              <div>
                <h3 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">Мавжуд хизматлар</h3>
                <div className="space-y-2">
                  {services.map(s => (
                    <button 
                      key={s.id}
                      onClick={() => handleAddBill(s.id, s.price)}
                      className="w-full flex justify-between items-center p-3 border rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-all text-left group"
                    >
                      <div>
                        <p className="text-sm font-medium">{s.name}</p>
                        <p className="text-xs text-slate-500 font-mono">{s.price.toLocaleString()} сўм</p>
                      </div>
                      <Plus size={16} className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">Кўрсатилган хизматлар</h3>
                <div className="space-y-2">
                  {patientBills.map(b => (
                    <div key={b.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border">
                      <div>
                        <p className="text-sm font-medium">{b.service_name}</p>
                        <p className="text-xs text-slate-400">{b.date}</p>
                        <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${b.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                          {b.status === 'paid' ? 'Тўланган' : 'Тўланмаган'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <p className="text-sm font-bold font-mono">{b.amount.toLocaleString()} сўм</p>
                        {b.status === 'unpaid' && (
                          <button 
                            onClick={async () => {
                              await fetch(`/api/billing/${b.id}`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ status: 'paid' })
                              });
                              fetchPatientBills(selectedPatientForBilling.id);
                            }}
                            className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 transition-colors"
                          >
                            Тўланди
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {patientBills.length === 0 && <p className="text-sm text-slate-400 italic py-4 text-center">Ҳали хизматлар қўшилмаган</p>}
                </div>
                
                {patientBills.length > 0 && (
                  <div className="mt-6 pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold">Жами:</span>
                      <span className="text-xl font-black text-blue-600 font-mono">
                        {patientBills.reduce((sum, b) => sum + b.amount, 0).toLocaleString()} сўм
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {showAddDoctor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Янги шифокор қўшиш</h2>
            <form onSubmit={handleAddDoctor} className="space-y-4">
              <input 
                type="text" required placeholder="Исм шарифи" 
                className="w-full p-2 border rounded-lg"
                value={newDoctor.name} onChange={e => setNewDoctor({...newDoctor, name: e.target.value})}
              />
              <input 
                type="text" required placeholder="Мутахассислик" 
                className="w-full p-2 border rounded-lg"
                value={newDoctor.specialization} onChange={e => setNewDoctor({...newDoctor, specialization: e.target.value})}
              />
              <input 
                type="text" required placeholder="Телефон" 
                className="w-full p-2 border rounded-lg"
                value={newDoctor.phone} onChange={e => setNewDoctor({...newDoctor, phone: e.target.value})}
              />
              <input 
                type="text" required placeholder="Логин" 
                className="w-full p-2 border rounded-lg"
                value={newDoctor.username} onChange={e => setNewDoctor({...newDoctor, username: e.target.value})}
              />
              <input 
                type="password" required placeholder="Парол" 
                className="w-full p-2 border rounded-lg"
                value={newDoctor.password} onChange={e => setNewDoctor({...newDoctor, password: e.target.value})}
              />
              <div className="flex space-x-2 pt-4">
                <button type="button" onClick={() => setShowAddDoctor(false)} className="flex-1 py-2 border rounded-lg">Бекор қилиш</button>
                <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-lg">Сақлаш</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number }> = ({ icon, label, value }) => (
  <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center space-x-4">
    <div className="p-3 bg-slate-50 rounded-lg">{icon}</div>
    <div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-xl font-bold text-slate-900">{value}</p>
    </div>
  </div>
);
