export interface User {
  id: number;
  username: string;
  role: 'admin' | 'doctor' | 'patient';
  name: string;
}

export interface Doctor {
  id: number;
  user_id: number;
  name: string;
  specialization: string;
  phone: string;
}

export interface Patient {
  id: number;
  user_id: number;
  name: string;
  birth_date: string;
  phone: string;
  medical_history: string;
}

export interface Appointment {
  id: number;
  patient_id: number;
  doctor_id: number;
  date: string;
  time: string;
  status: string;
  patient_name?: string;
  doctor_name?: string;
  specialization?: string;
}

export interface MedicalRecord {
  id: number;
  patient_id: number;
  doctor_id: number;
  diagnosis: string;
  date: string;
  doctor_name?: string;
}

export interface Prescription {
  id: number;
  patient_id: number;
  doctor_id: number;
  prescription_text: string;
  date: string;
  doctor_name?: string;
}

export interface Service {
  id: number;
  name: string;
  price: number;
  cost: number;
}

export interface Bill {
  id: number;
  patient_id: number;
  service_id: number;
  date: string;
  amount: number;
  status: 'paid' | 'unpaid';
  service_name?: string;
}

export interface Analytics {
  totalPatients: number;
  totalAppointments: number;
  mostVisitedDoctor: string;
  appointmentsPerDay: { date: string; count: number }[];
}
