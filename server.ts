import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database("hospital.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT, -- 'admin', 'doctor', 'patient'
    name TEXT
  );

  CREATE TABLE IF NOT EXISTS doctors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    name TEXT,
    specialization TEXT,
    phone TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS patients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    name TEXT,
    birth_date TEXT,
    phone TEXT,
    medical_history TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER,
    doctor_id INTEGER,
    date TEXT,
    time TEXT,
    status TEXT DEFAULT 'pending',
    FOREIGN KEY(patient_id) REFERENCES patients(id),
    FOREIGN KEY(doctor_id) REFERENCES doctors(id)
  );

  CREATE TABLE IF NOT EXISTS medical_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER,
    doctor_id INTEGER,
    diagnosis TEXT,
    date TEXT,
    FOREIGN KEY(patient_id) REFERENCES patients(id),
    FOREIGN KEY(doctor_id) REFERENCES doctors(id)
  );

  CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    price REAL,
    cost REAL
  );

  CREATE TABLE IF NOT EXISTS billing (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER,
    service_id INTEGER,
    date TEXT,
    amount REAL,
    status TEXT DEFAULT 'unpaid',
    FOREIGN KEY(patient_id) REFERENCES patients(id),
    FOREIGN KEY(service_id) REFERENCES services(id)
  );
`);

// Seed initial services if empty
const servicesCount = db.prepare("SELECT COUNT(*) as count FROM services").get().count;
if (servicesCount === 0) {
  const initialServices = [
    { name: "Умумий қон таҳлили", price: 25000 },
    { name: "УЗИ (Қорин бўшлиғи)", price: 45000 },
    { name: "ЭКГ", price: 30000 },
    { name: "Рентген", price: 50000 },
    { name: "Терапевт кўриги", price: 40000 }
  ];
  const insertService = db.prepare("INSERT INTO services (name, price) VALUES (?, ?)");
  initialServices.forEach(s => insertService.run(s.name, s.price));
}

// Seed Admin if not exists
const adminExists = db.prepare("SELECT * FROM users WHERE username = ?").get("admin");
if (!adminExists) {
  db.prepare("INSERT INTO users (username, password, role, name) VALUES (?, ?, ?, ?)").run(
    "admin",
    "admin123",
    "admin",
    "Бош Маъмур"
  );
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Auth Endpoints
  app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE username = ? AND password = ?").get(username, password);
    if (user) {
      let profile = null;
      if (user.role === 'doctor') {
        profile = db.prepare("SELECT * FROM doctors WHERE user_id = ?").get(user.id);
      } else if (user.role === 'patient') {
        profile = db.prepare("SELECT * FROM patients WHERE user_id = ?").get(user.id);
      }
      res.json({ user, profile });
    } else {
      res.status(401).json({ error: "Нотўғри фойдаланувчи номи ёки парол" });
    }
  });

  app.post("/api/register", (req, res) => {
    const { username, password, name, role, birthDate, phone, specialization } = req.body;
    try {
      const result = db.prepare("INSERT INTO users (username, password, role, name) VALUES (?, ?, ?, ?)").run(
        username,
        password,
        role,
        name
      );
      const userId = result.lastInsertRowid;

      if (role === 'patient') {
        db.prepare("INSERT INTO patients (user_id, name, birth_date, phone, medical_history) VALUES (?, ?, ?, ?, ?)").run(
          userId,
          name,
          birthDate,
          phone,
          ""
        );
      } else if (role === 'doctor') {
        db.prepare("INSERT INTO doctors (user_id, name, specialization, phone) VALUES (?, ?, ?, ?)").run(
          userId,
          name,
          specialization,
          phone
        );
      }
      res.json({ success: true });
    } catch (e) {
      res.status(400).json({ error: "Бу фойдаланувчи номи аллақачон мавжуд" });
    }
  });

  // Doctors
  app.get("/api/doctors", (req, res) => {
    const doctors = db.prepare("SELECT * FROM doctors").all();
    res.json(doctors);
  });

  app.post("/api/doctors", (req, res) => {
    const { name, specialization, phone, username, password } = req.body;
    const userResult = db.prepare("INSERT INTO users (username, password, role, name) VALUES (?, ?, ?, ?)").run(
      username,
      password,
      'doctor',
      name
    );
    db.prepare("INSERT INTO doctors (user_id, name, specialization, phone) VALUES (?, ?, ?, ?)").run(
      userResult.lastInsertRowid,
      name,
      specialization,
      phone
    );
    res.json({ success: true });
  });

  app.delete("/api/doctors/:id", (req, res) => {
    const doctor = db.prepare("SELECT user_id FROM doctors WHERE id = ?").get(req.params.id);
    if (doctor) {
      db.prepare("DELETE FROM doctors WHERE id = ?").run(req.params.id);
      db.prepare("DELETE FROM users WHERE id = ?").run(doctor.user_id);
    }
    res.json({ success: true });
  });

  // Patients
  app.get("/api/patients", (req, res) => {
    const patients = db.prepare("SELECT * FROM patients").all();
    res.json(patients);
  });

  // Appointments
  app.get("/api/appointments", (req, res) => {
    const { patientId, doctorId } = req.query;
    let query = `
      SELECT a.*, p.name as patient_name, d.name as doctor_name, d.specialization 
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN doctors d ON a.doctor_id = d.id
    `;
    const params = [];
    if (patientId) {
      query += " WHERE a.patient_id = ?";
      params.push(patientId);
    } else if (doctorId) {
      query += " WHERE a.doctor_id = ?";
      params.push(doctorId);
    }
    const appointments = db.prepare(query).all(...params);
    res.json(appointments);
  });

  app.post("/api/appointments", (req, res) => {
    const { patientId, doctorId, date, time } = req.body;
    db.prepare("INSERT INTO appointments (patient_id, doctor_id, date, time) VALUES (?, ?, ?, ?)").run(
      patientId,
      doctorId,
      date,
      time
    );
    res.json({ success: true });
  });

  // Medical Records & Prescriptions
  app.get("/api/medical-records/:patientId", (req, res) => {
    const records = db.prepare(`
      SELECT mr.*, d.name as doctor_name 
      FROM medical_records mr
      JOIN doctors d ON mr.doctor_id = d.id
      WHERE mr.patient_id = ?
    `).all(req.params.patientId);
    res.json(records);
  });

  app.post("/api/medical-records", (req, res) => {
    const { patientId, doctorId, diagnosis, date } = req.body;
    db.prepare("INSERT INTO medical_records (patient_id, doctor_id, diagnosis, date) VALUES (?, ?, ?, ?)").run(
      patientId,
      doctorId,
      diagnosis,
      date
    );
    res.json({ success: true });
  });

  app.get("/api/prescriptions/:patientId", (req, res) => {
    const prescriptions = db.prepare(`
      SELECT p.*, d.name as doctor_name 
      FROM prescriptions p
      JOIN doctors d ON p.doctor_id = d.id
      WHERE p.patient_id = ?
    `).all(req.params.patientId);
    res.json(prescriptions);
  });

  app.post("/api/prescriptions", (req, res) => {
    const { patientId, doctorId, prescriptionText, date } = req.body;
    db.prepare("INSERT INTO prescriptions (patient_id, doctor_id, prescription_text, date) VALUES (?, ?, ?, ?)").run(
      patientId,
      doctorId,
      prescriptionText,
      date
    );
    res.json({ success: true });
  });

  // Services API
  app.get("/api/services", (req, res) => {
    const services = db.prepare("SELECT * FROM services").all();
    res.json(services);
  });

  app.post("/api/services", (req, res) => {
    const { name, price, cost } = req.body;
    db.prepare("INSERT INTO services (name, price, cost) VALUES (?, ?, ?)").run(name, price, cost);
    res.json({ success: true });
  });

  app.delete("/api/services/:id", (req, res) => {
    db.prepare("DELETE FROM services WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Billing API
  app.get("/api/billing/:patientId", (req, res) => {
    const bills = db.prepare(`
      SELECT b.*, s.name as service_name 
      FROM billing b
      JOIN services s ON b.service_id = s.id
      WHERE b.patient_id = ?
    `).all(req.params.patientId);
    res.json(bills);
  });

  app.post("/api/billing", (req, res) => {
    const { patientId, serviceId, date, amount } = req.body;
    db.prepare("INSERT INTO billing (patient_id, service_id, date, amount) VALUES (?, ?, ?, ?)").run(
      patientId,
      serviceId,
      date,
      amount
    );
    res.json({ success: true });
  });

  app.patch("/api/billing/:id", (req, res) => {
    const { status } = req.body;
    db.prepare("UPDATE billing SET status = ? WHERE id = ?").run(status, req.params.id);
    res.json({ success: true });
  });

  // Analytics
  app.get("/api/analytics", (req, res) => {
    const totalPatients = db.prepare("SELECT COUNT(*) as count FROM patients").get().count;
    const totalAppointments = db.prepare("SELECT COUNT(*) as count FROM appointments").get().count;
    const mostVisitedDoctor = db.prepare(`
      SELECT d.name, COUNT(a.id) as count 
      FROM doctors d 
      JOIN appointments a ON d.id = a.doctor_id 
      GROUP BY d.id 
      ORDER BY count DESC 
      LIMIT 1
    `).get();
    
    const appointmentsPerDay = db.prepare(`
      SELECT date, COUNT(*) as count 
      FROM appointments 
      GROUP BY date 
      ORDER BY date ASC 
      LIMIT 7
    `).all();

    res.json({
      totalPatients,
      totalAppointments,
      mostVisitedDoctor: mostVisitedDoctor ? mostVisitedDoctor.name : "Йўқ",
      appointmentsPerDay
    });
  });

  // Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const PORT = 3000;
  app.get("/api/reports/services", (req, res) => {
    const report = db.prepare(`
      SELECT 
        s.name, 
        COUNT(b.id) as total_count, 
        SUM(CASE WHEN b.status = 'paid' THEN b.amount ELSE 0 END) as paid_revenue,
        SUM(CASE WHEN b.status = 'unpaid' THEN b.amount ELSE 0 END) as unpaid_revenue
      FROM services s
      LEFT JOIN billing b ON s.id = b.service_id
      GROUP BY s.id
      ORDER BY paid_revenue DESC
    `).all();
    res.json(report);
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
