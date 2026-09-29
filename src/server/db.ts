import { Pool, QueryResult } from 'pg';
import fs from 'fs';
import path from 'path';

export interface DatabaseStatus {
  connected: boolean;
  provider: 'PostgreSQL (External)' | 'Persistent Database Store';
  externalDatabaseUrlConfigured: boolean;
  externalDatabaseUrlMasked: string | null;
  connectionError: string | null;
  tables: {
    hospitals: number;
    doctors: number;
    blood_banks: number;
    patients: number;
    consultations: number;
    prescriptions: number;
    health_records: number;
    consent_requests: number;
  };
}

// In-memory / file-backed persistent store for resilience when external database is cold-starting or unavailable
interface LocalStore {
  hospitals: any[];
  doctors: any[];
  blood_banks: any[];
  patients: any[];
  consultations: any[];
  prescriptions: any[];
  health_records: any[];
  consent_requests: any[];
  doctor_queues: Record<string, any[]>;
}

const LOCAL_DB_FILE = path.join(process.cwd(), 'data', 'db_store.json');

class DatabaseService {
  private pool: Pool | null = null;
  private isPostgresConnected = false;
  private lastError: string | null = null;
  private localStore: LocalStore = {
    hospitals: [],
    doctors: [],
    blood_banks: [],
    patients: [],
    consultations: [],
    prescriptions: [],
    health_records: [],
    consent_requests: [],
    doctor_queues: {}
  };

  constructor() {
    this.ensureLocalStoreDir();
    this.loadLocalStore();
  }

  private ensureLocalStoreDir() {
    const dir = path.dirname(LOCAL_DB_FILE);
    if (!fs.existsSync(dir)) {
      try {
        fs.mkdirSync(dir, { recursive: true });
      } catch (e) {
        // ignore
      }
    }
  }

  private loadLocalStore() {
    try {
      if (fs.existsSync(LOCAL_DB_FILE)) {
        const raw = fs.readFileSync(LOCAL_DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        this.localStore = {
          hospitals: parsed.hospitals || [],
          doctors: parsed.doctors || [],
          blood_banks: parsed.blood_banks || [],
          patients: parsed.patients || [],
          consultations: parsed.consultations || [],
          prescriptions: parsed.prescriptions || [],
          health_records: parsed.health_records || [],
          consent_requests: parsed.consent_requests || [],
          doctor_queues: parsed.doctor_queues || {}
        };
      }
    } catch (e) {
      console.error('[DB] Failed reading local store fallback:', e);
    }
  }

  private saveLocalStore() {
    try {
      this.ensureLocalStoreDir();
      fs.writeFileSync(LOCAL_DB_FILE, JSON.stringify(this.localStore, null, 2), 'utf-8');
    } catch (e) {
      console.error('[DB] Failed writing to local store:', e);
    }
  }

  public getMaskedUrl(): string | null {
    const rawUrl = process.env.DATABASE_URL || process.env.EXTERNAL_DATABASE_URL;
    if (!rawUrl) return null;
    try {
      const parsed = new URL(rawUrl);
      const maskedPass = parsed.password ? '••••••••' : '';
      return `${parsed.protocol}//${parsed.username}:${maskedPass}@${parsed.host}${parsed.pathname}`;
    } catch {
      return 'postgresql://configured-in-environment';
    }
  }

  public async init(): Promise<void> {
    const rawUrl = process.env.DATABASE_URL || process.env.EXTERNAL_DATABASE_URL;
    if (!rawUrl) {
      console.log('[DB] No DATABASE_URL provided. Initialized clean persistent database store.');
      return;
    }

    console.log(`[DB] Connecting to external database: ${this.getMaskedUrl()}`);

    try {
      // Connect to PostgreSQL with SSL support for cloud providers (Render, Supabase, Neon, AWS RDS)
      this.pool = new Pool({
        connectionString: rawUrl,
        ssl: {
          rejectUnauthorized: false
        },
        connectionTimeoutMillis: 5000,
        idleTimeoutMillis: 30000,
        max: 10
      });

      this.pool.on('error', (err) => {
        console.error('[DB Pool Error]', err.message);
        this.isPostgresConnected = false;
        this.lastError = err.message;
      });

      // Test connection
      const client = await this.pool.connect();
      try {
        await client.query('SELECT NOW()');
        this.isPostgresConnected = true;
        this.lastError = null;
        console.log('[DB] Successfully connected to external PostgreSQL database!');
        await this.createPostgresTables(client);
      } finally {
        client.release();
      }
    } catch (err: any) {
      this.isPostgresConnected = false;
      this.lastError = err.message || 'Connection failed';
      console.warn(`[DB] External PostgreSQL database connection check failed (${this.lastError}).`);
      console.warn('[DB] Operating in resilient persistent storage mode. Database will auto-retry connecting.');
    }
  }

  public async retryConnect(): Promise<boolean> {
    await this.init();
    return this.isPostgresConnected;
  }

  private async createPostgresTables(client: any) {
    const schemaSql = `
      CREATE TABLE IF NOT EXISTS hospitals (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(64) NOT NULL,
        address TEXT NOT NULL,
        phone VARCHAR(64) NOT NULL,
        specialties JSONB NOT NULL DEFAULT '[]'::jsonb,
        services JSONB NOT NULL DEFAULT '[]'::jsonb,
        emergency_services BOOLEAN NOT NULL DEFAULT true,
        beds_available INT NOT NULL DEFAULT 0,
        blood_bank BOOLEAN NOT NULL DEFAULT false,
        lat DOUBLE PRECISION NOT NULL,
        lng DOUBLE PRECISION NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS doctors (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        specialty VARCHAR(128) NOT NULL,
        experience INT NOT NULL DEFAULT 1,
        qualification VARCHAR(255) NOT NULL,
        clinic VARCHAR(255) NOT NULL,
        address TEXT NOT NULL,
        fee INT NOT NULL DEFAULT 500,
        rating DOUBLE PRECISION NOT NULL DEFAULT 5.0,
        available_next VARCHAR(64) NOT NULL,
        lat DOUBLE PRECISION NOT NULL,
        lng DOUBLE PRECISION NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS blood_banks (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        address TEXT NOT NULL,
        lat DOUBLE PRECISION NOT NULL,
        lng DOUBLE PRECISION NOT NULL,
        stock JSONB NOT NULL DEFAULT '{}'::jsonb,
        last_updated VARCHAR(64) NOT NULL DEFAULT 'Just now',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS patients (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        abha_id VARCHAR(128) UNIQUE NOT NULL,
        abha_number VARCHAR(64),
        phone VARCHAR(64) NOT NULL,
        gender VARCHAR(32) NOT NULL DEFAULT 'Other',
        age INT NOT NULL DEFAULT 30,
        dob VARCHAR(64),
        blood_group VARCHAR(16) NOT NULL DEFAULT 'O+',
        address TEXT,
        emergency_contact VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS consultations (
        id VARCHAR(64) PRIMARY KEY,
        patient_id VARCHAR(64),
        doctor_id VARCHAR(64) NOT NULL,
        doctor_name VARCHAR(255) NOT NULL,
        specialty VARCHAR(128) NOT NULL,
        clinic_or_hospital VARCHAR(255) NOT NULL,
        date VARCHAR(64) NOT NULL,
        time VARCHAR(64) NOT NULL,
        status VARCHAR(32) NOT NULL DEFAULT 'Upcoming',
        type VARCHAR(32) NOT NULL DEFAULT 'In-Clinic',
        token_number INT NOT NULL DEFAULT 1,
        meeting_link TEXT,
        consultation_notes TEXT,
        prescription_id VARCHAR(64),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS prescriptions (
        id VARCHAR(64) PRIMARY KEY,
        patient_id VARCHAR(64),
        doctor_name VARCHAR(255) NOT NULL,
        doctor_specialty VARCHAR(128) NOT NULL,
        doctor_reg_no VARCHAR(64),
        clinic_or_hospital VARCHAR(255) NOT NULL,
        date VARCHAR(64) NOT NULL,
        diagnosis TEXT NOT NULL,
        medicines JSONB NOT NULL DEFAULT '[]'::jsonb,
        advice TEXT,
        follow_up_date VARCHAR(64),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS health_records (
        id VARCHAR(64) PRIMARY KEY,
        patient_id VARCHAR(64),
        title VARCHAR(255) NOT NULL,
        category VARCHAR(128) NOT NULL,
        issued_by VARCHAR(255) NOT NULL,
        doctor_name VARCHAR(255),
        date VARCHAR(64) NOT NULL,
        verified BOOLEAN NOT NULL DEFAULT true,
        file_type VARCHAR(64) NOT NULL,
        summary TEXT,
        metrics JSONB NOT NULL DEFAULT '[]'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS consent_requests (
        id VARCHAR(64) PRIMARY KEY,
        patient_id VARCHAR(64),
        requester VARCHAR(255) NOT NULL,
        purpose TEXT NOT NULL,
        info_types JSONB NOT NULL DEFAULT '[]'::jsonb,
        status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
        date VARCHAR(64) NOT NULL,
        expires_in VARCHAR(64) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS doctor_queues (
        doctor_id VARCHAR(64) PRIMARY KEY,
        queue JSONB NOT NULL DEFAULT '[]'::jsonb,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await client.query(schemaSql);
    console.log('[DB] PostgreSQL schema checked and ready.');
  }

  // ----------------------------------------------------------------
  // HOSPITALS
  // ----------------------------------------------------------------
  public async getHospitals(): Promise<any[]> {
    if (this.isPostgresConnected && this.pool) {
      try {
        const res = await this.pool.query('SELECT * FROM hospitals ORDER BY created_at ASC');
        return res.rows.map(r => ({
          id: r.id,
          name: r.name,
          type: r.type,
          address: r.address,
          phone: r.phone,
          specialties: typeof r.specialties === 'string' ? JSON.parse(r.specialties) : r.specialties,
          services: typeof r.services === 'string' ? JSON.parse(r.services) : r.services,
          emergencyServices: r.emergency_services,
          bedsAvailable: r.beds_available,
          bloodBank: r.blood_bank,
          lat: r.lat,
          lng: r.lng
        }));
      } catch (e: any) {
        console.error('[DB] Postgres getHospitals failed, falling back:', e.message);
      }
    }
    return this.localStore.hospitals;
  }

  public async saveHospital(hospital: any): Promise<any> {
    const id = hospital.id || `hfr-${Date.now().toString().slice(-4)}`;
    const fullHospital = { ...hospital, id };

    if (this.isPostgresConnected && this.pool) {
      try {
        await this.pool.query(
          `INSERT INTO hospitals (id, name, type, address, phone, specialties, services, emergency_services, beds_available, blood_bank, lat, lng)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
           ON CONFLICT (id) DO UPDATE SET
             name = EXCLUDED.name,
             type = EXCLUDED.type,
             address = EXCLUDED.address,
             phone = EXCLUDED.phone,
             specialties = EXCLUDED.specialties,
             services = EXCLUDED.services,
             emergency_services = EXCLUDED.emergency_services,
             beds_available = EXCLUDED.beds_available,
             blood_bank = EXCLUDED.blood_bank,
             lat = EXCLUDED.lat,
             lng = EXCLUDED.lng`,
          [
            fullHospital.id,
            fullHospital.name,
            fullHospital.type,
            fullHospital.address,
            fullHospital.phone,
            JSON.stringify(fullHospital.specialties || []),
            JSON.stringify(fullHospital.services || []),
            fullHospital.emergencyServices ?? true,
            fullHospital.bedsAvailable ?? 0,
            fullHospital.bloodBank ?? false,
            fullHospital.lat,
            fullHospital.lng
          ]
        );
      } catch (e: any) {
        console.error('[DB] Postgres saveHospital failed:', e.message);
      }
    }

    const idx = this.localStore.hospitals.findIndex(h => h.id === id);
    if (idx >= 0) {
      this.localStore.hospitals[idx] = { ...this.localStore.hospitals[idx], ...fullHospital };
    } else {
      this.localStore.hospitals.push(fullHospital);
    }
    this.saveLocalStore();
    return fullHospital;
  }

  public async updateHospital(id: string, updates: any): Promise<any> {
    const existing = (await this.getHospitals()).find(h => h.id === id);
    if (!existing) return null;
    const merged = { ...existing, ...updates };
    return this.saveHospital(merged);
  }

  // ----------------------------------------------------------------
  // DOCTORS
  // ----------------------------------------------------------------
  public async getDoctors(): Promise<any[]> {
    if (this.isPostgresConnected && this.pool) {
      try {
        const res = await this.pool.query('SELECT * FROM doctors ORDER BY created_at ASC');
        return res.rows.map(r => ({
          id: r.id,
          name: r.name,
          specialty: r.specialty,
          experience: r.experience,
          qualification: r.qualification,
          clinic: r.clinic,
          address: r.address,
          fee: r.fee,
          rating: r.rating,
          availableNext: r.available_next,
          lat: r.lat,
          lng: r.lng
        }));
      } catch (e: any) {
        console.error('[DB] Postgres getDoctors failed, falling back:', e.message);
      }
    }
    return this.localStore.doctors;
  }

  public async saveDoctor(doctor: any): Promise<any> {
    const id = doctor.id || `doc-${Date.now().toString().slice(-4)}`;
    const fullDoctor = { ...doctor, id };

    if (this.isPostgresConnected && this.pool) {
      try {
        await this.pool.query(
          `INSERT INTO doctors (id, name, specialty, experience, qualification, clinic, address, fee, rating, available_next, lat, lng)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
           ON CONFLICT (id) DO UPDATE SET
             name = EXCLUDED.name,
             specialty = EXCLUDED.specialty,
             experience = EXCLUDED.experience,
             qualification = EXCLUDED.qualification,
             clinic = EXCLUDED.clinic,
             address = EXCLUDED.address,
             fee = EXCLUDED.fee,
             rating = EXCLUDED.rating,
             available_next = EXCLUDED.available_next,
             lat = EXCLUDED.lat,
             lng = EXCLUDED.lng`,
          [
            fullDoctor.id,
            fullDoctor.name,
            fullDoctor.specialty,
            fullDoctor.experience ?? 1,
            fullDoctor.qualification,
            fullDoctor.clinic,
            fullDoctor.address,
            fullDoctor.fee ?? 500,
            fullDoctor.rating ?? 5.0,
            fullDoctor.availableNext || 'Today, 2:00 PM',
            fullDoctor.lat,
            fullDoctor.lng
          ]
        );
      } catch (e: any) {
        console.error('[DB] Postgres saveDoctor failed:', e.message);
      }
    }

    const idx = this.localStore.doctors.findIndex(d => d.id === id);
    if (idx >= 0) {
      this.localStore.doctors[idx] = { ...this.localStore.doctors[idx], ...fullDoctor };
    } else {
      this.localStore.doctors.push(fullDoctor);
    }
    this.saveLocalStore();
    return fullDoctor;
  }

  // ----------------------------------------------------------------
  // BLOOD BANKS
  // ----------------------------------------------------------------
  public async getBloodBanks(): Promise<any[]> {
    if (this.isPostgresConnected && this.pool) {
      try {
        const res = await this.pool.query('SELECT * FROM blood_banks ORDER BY created_at ASC');
        return res.rows.map(r => ({
          id: r.id,
          name: r.name,
          address: r.address,
          lat: r.lat,
          lng: r.lng,
          stock: typeof r.stock === 'string' ? JSON.parse(r.stock) : r.stock,
          lastUpdated: r.last_updated
        }));
      } catch (e: any) {
        console.error('[DB] Postgres getBloodBanks failed:', e.message);
      }
    }
    return this.localStore.blood_banks;
  }

  public async saveBloodBank(bb: any): Promise<any> {
    const id = bb.id || `bb-${Date.now().toString().slice(-4)}`;
    const fullBB = {
      ...bb,
      id,
      stock: bb.stock || { 'O+': 0, 'O-': 0, 'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0, 'AB+': 0, 'AB-': 0 },
      lastUpdated: bb.lastUpdated || 'Just now'
    };

    if (this.isPostgresConnected && this.pool) {
      try {
        await this.pool.query(
          `INSERT INTO blood_banks (id, name, address, lat, lng, stock, last_updated)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (id) DO UPDATE SET
             name = EXCLUDED.name,
             address = EXCLUDED.address,
             lat = EXCLUDED.lat,
             lng = EXCLUDED.lng,
             stock = EXCLUDED.stock,
             last_updated = EXCLUDED.last_updated`,
          [
            fullBB.id,
            fullBB.name,
            fullBB.address,
            fullBB.lat,
            fullBB.lng,
            JSON.stringify(fullBB.stock),
            fullBB.lastUpdated
          ]
        );
      } catch (e: any) {
        console.error('[DB] Postgres saveBloodBank failed:', e.message);
      }
    }

    const idx = this.localStore.blood_banks.findIndex(b => b.id === id);
    if (idx >= 0) {
      this.localStore.blood_banks[idx] = { ...this.localStore.blood_banks[idx], ...fullBB };
    } else {
      this.localStore.blood_banks.push(fullBB);
    }
    this.saveLocalStore();
    return fullBB;
  }

  public async updateBloodStock(id: string, group: string, delta: number): Promise<any> {
    const banks = await this.getBloodBanks();
    const bb = banks.find(b => b.id === id);
    if (!bb) return null;
    const currentStock = bb.stock || {};
    const newCount = Math.max(0, (currentStock[group] || 0) + delta);
    const updatedStock = { ...currentStock, [group]: newCount };
    const updatedBB = { ...bb, stock: updatedStock, lastUpdated: 'Just now' };
    return this.saveBloodBank(updatedBB);
  }

  // ----------------------------------------------------------------
  // PATIENTS
  // ----------------------------------------------------------------
  public async getPatient(identifier: string): Promise<any | null> {
    const clean = identifier.trim().toLowerCase();

    if (this.isPostgresConnected && this.pool) {
      try {
        const res = await this.pool.query(
          `SELECT * FROM patients WHERE LOWER(id) = $1 OR LOWER(abha_id) = $1 OR phone = $2 LIMIT 1`,
          [clean, identifier.trim()]
        );
        if (res.rows.length > 0) {
          const r = res.rows[0];
          return {
            id: r.id,
            name: r.name,
            abhaId: r.abha_id,
            abhaNumber: r.abha_number,
            phone: r.phone,
            gender: r.gender,
            age: r.age,
            dob: r.dob,
            bloodGroup: r.blood_group,
            address: r.address,
            emergencyContact: r.emergency_contact
          };
        }
      } catch (e: any) {
        console.error('[DB] Postgres getPatient failed:', e.message);
      }
    }

    return this.localStore.patients.find(
      p => p.id?.toLowerCase() === clean || p.abhaId?.toLowerCase() === clean || p.phone === identifier.trim()
    ) || null;
  }

  public async savePatient(patient: any): Promise<any> {
    const id = patient.id || `pat-${Date.now().toString().slice(-4)}`;
    const fullPatient = { ...patient, id };

    if (this.isPostgresConnected && this.pool) {
      try {
        await this.pool.query(
          `INSERT INTO patients (id, name, abha_id, abha_number, phone, gender, age, dob, blood_group, address, emergency_contact)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
           ON CONFLICT (id) DO UPDATE SET
             name = EXCLUDED.name,
             abha_id = EXCLUDED.abha_id,
             abha_number = EXCLUDED.abha_number,
             phone = EXCLUDED.phone,
             gender = EXCLUDED.gender,
             age = EXCLUDED.age,
             dob = EXCLUDED.dob,
             blood_group = EXCLUDED.blood_group,
             address = EXCLUDED.address,
             emergency_contact = EXCLUDED.emergency_contact`,
          [
            fullPatient.id,
            fullPatient.name,
            fullPatient.abhaId,
            fullPatient.abhaNumber,
            fullPatient.phone,
            fullPatient.gender || 'Other',
            fullPatient.age || 30,
            fullPatient.dob || '',
            fullPatient.bloodGroup || 'O+',
            fullPatient.address || '',
            fullPatient.emergencyContact || ''
          ]
        );
      } catch (e: any) {
        console.error('[DB] Postgres savePatient failed:', e.message);
      }
    }

    const idx = this.localStore.patients.findIndex(p => p.id === id || p.abhaId === fullPatient.abhaId);
    if (idx >= 0) {
      this.localStore.patients[idx] = { ...this.localStore.patients[idx], ...fullPatient };
    } else {
      this.localStore.patients.push(fullPatient);
    }
    this.saveLocalStore();
    return fullPatient;
  }

  // ----------------------------------------------------------------
  // CONSULTATIONS
  // ----------------------------------------------------------------
  public async getConsultations(patientId?: string): Promise<any[]> {
    if (this.isPostgresConnected && this.pool) {
      try {
        let sql = 'SELECT * FROM consultations';
        const params: any[] = [];
        if (patientId) {
          sql += ' WHERE patient_id = $1';
          params.push(patientId);
        }
        sql += ' ORDER BY created_at DESC';
        const res = await this.pool.query(sql, params);
        return res.rows.map(r => ({
          id: r.id,
          patientId: r.patient_id,
          doctorId: r.doctor_id,
          doctorName: r.doctor_name,
          specialty: r.specialty,
          clinicOrHospital: r.clinic_or_hospital,
          date: r.date,
          time: r.time,
          status: r.status,
          type: r.type,
          tokenNumber: r.token_number,
          meetingLink: r.meeting_link,
          consultationNotes: r.consultation_notes,
          prescriptionId: r.prescription_id
        }));
      } catch (e: any) {
        console.error('[DB] Postgres getConsultations failed:', e.message);
      }
    }

    if (patientId) {
      return this.localStore.consultations.filter(c => !c.patientId || c.patientId === patientId);
    }
    return this.localStore.consultations;
  }

  public async saveConsultation(cons: any): Promise<any> {
    const id = cons.id || `cons-${Date.now().toString().slice(-5)}`;
    const full = { ...cons, id };

    if (this.isPostgresConnected && this.pool) {
      try {
        await this.pool.query(
          `INSERT INTO consultations (id, patient_id, doctor_id, doctor_name, specialty, clinic_or_hospital, date, time, status, type, token_number, meeting_link, consultation_notes, prescription_id)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
           ON CONFLICT (id) DO UPDATE SET
             status = EXCLUDED.status,
             consultation_notes = EXCLUDED.consultation_notes,
             prescription_id = EXCLUDED.prescription_id`,
          [
            full.id,
            full.patientId || null,
            full.doctorId,
            full.doctorName,
            full.specialty,
            full.clinicOrHospital,
            full.date,
            full.time,
            full.status || 'Upcoming',
            full.type || 'In-Clinic',
            full.tokenNumber || 1,
            full.meetingLink || null,
            full.consultationNotes || null,
            full.prescriptionId || null
          ]
        );
      } catch (e: any) {
        console.error('[DB] Postgres saveConsultation failed:', e.message);
      }
    }

    const idx = this.localStore.consultations.findIndex(c => c.id === id);
    if (idx >= 0) {
      this.localStore.consultations[idx] = { ...this.localStore.consultations[idx], ...full };
    } else {
      this.localStore.consultations.unshift(full);
    }
    this.saveLocalStore();
    return full;
  }

  public async updateConsultationStatus(id: string, status: string): Promise<any> {
    const all = await this.getConsultations();
    const item = all.find(c => c.id === id);
    if (!item) return null;
    return this.saveConsultation({ ...item, status });
  }

  // ----------------------------------------------------------------
  // PRESCRIPTIONS
  // ----------------------------------------------------------------
  public async getPrescriptions(patientId?: string): Promise<any[]> {
    if (this.isPostgresConnected && this.pool) {
      try {
        let sql = 'SELECT * FROM prescriptions';
        const params: any[] = [];
        if (patientId) {
          sql += ' WHERE patient_id = $1';
          params.push(patientId);
        }
        sql += ' ORDER BY created_at DESC';
        const res = await this.pool.query(sql, params);
        return res.rows.map(r => ({
          id: r.id,
          patientId: r.patient_id,
          doctorName: r.doctor_name,
          doctorSpecialty: r.doctor_specialty,
          doctorRegNo: r.doctor_reg_no,
          clinicOrHospital: r.clinic_or_hospital,
          date: r.date,
          diagnosis: r.diagnosis,
          medicines: typeof r.medicines === 'string' ? JSON.parse(r.medicines) : r.medicines,
          advice: r.advice,
          followUpDate: r.follow_up_date
        }));
      } catch (e: any) {
        console.error('[DB] Postgres getPrescriptions failed:', e.message);
      }
    }

    if (patientId) {
      return this.localStore.prescriptions.filter(p => !p.patientId || p.patientId === patientId);
    }
    return this.localStore.prescriptions;
  }

  public async savePrescription(rx: any): Promise<any> {
    const id = rx.id || `rx-${Date.now().toString().slice(-4)}`;
    const full = { ...rx, id };

    if (this.isPostgresConnected && this.pool) {
      try {
        await this.pool.query(
          `INSERT INTO prescriptions (id, patient_id, doctor_name, doctor_specialty, doctor_reg_no, clinic_or_hospital, date, diagnosis, medicines, advice, follow_up_date)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
           ON CONFLICT (id) DO UPDATE SET
             diagnosis = EXCLUDED.diagnosis,
             medicines = EXCLUDED.medicines,
             advice = EXCLUDED.advice,
             follow_up_date = EXCLUDED.follow_up_date`,
          [
            full.id,
            full.patientId || null,
            full.doctorName,
            full.doctorSpecialty,
            full.doctorRegNo || '',
            full.clinicOrHospital,
            full.date,
            full.diagnosis,
            JSON.stringify(full.medicines || []),
            full.advice || '',
            full.followUpDate || ''
          ]
        );
      } catch (e: any) {
        console.error('[DB] Postgres savePrescription failed:', e.message);
      }
    }

    const idx = this.localStore.prescriptions.findIndex(p => p.id === id);
    if (idx >= 0) {
      this.localStore.prescriptions[idx] = { ...this.localStore.prescriptions[idx], ...full };
    } else {
      this.localStore.prescriptions.unshift(full);
    }
    this.saveLocalStore();
    return full;
  }

  // ----------------------------------------------------------------
  // HEALTH RECORDS
  // ----------------------------------------------------------------
  public async getHealthRecords(patientId?: string): Promise<any[]> {
    if (this.isPostgresConnected && this.pool) {
      try {
        let sql = 'SELECT * FROM health_records';
        const params: any[] = [];
        if (patientId) {
          sql += ' WHERE patient_id = $1';
          params.push(patientId);
        }
        sql += ' ORDER BY created_at DESC';
        const res = await this.pool.query(sql, params);
        return res.rows.map(r => ({
          id: r.id,
          patientId: r.patient_id,
          title: r.title,
          category: r.category,
          issuedBy: r.issued_by,
          doctorName: r.doctor_name,
          date: r.date,
          verified: r.verified,
          fileType: r.file_type,
          summary: r.summary,
          metrics: typeof r.metrics === 'string' ? JSON.parse(r.metrics) : r.metrics
        }));
      } catch (e: any) {
        console.error('[DB] Postgres getHealthRecords failed:', e.message);
      }
    }

    if (patientId) {
      return this.localStore.health_records.filter(r => !r.patientId || r.patientId === patientId);
    }
    return this.localStore.health_records;
  }

  public async saveHealthRecord(record: any): Promise<any> {
    const id = record.id || `hr-${Date.now().toString().slice(-5)}`;
    const full = { ...record, id };

    if (this.isPostgresConnected && this.pool) {
      try {
        await this.pool.query(
          `INSERT INTO health_records (id, patient_id, title, category, issued_by, doctor_name, date, verified, file_type, summary, metrics)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
           ON CONFLICT (id) DO UPDATE SET
             title = EXCLUDED.title,
             summary = EXCLUDED.summary,
             metrics = EXCLUDED.metrics`,
          [
            full.id,
            full.patientId || null,
            full.title,
            full.category,
            full.issuedBy,
            full.doctorName || null,
            full.date,
            full.verified ?? true,
            full.fileType,
            full.summary || '',
            JSON.stringify(full.metrics || [])
          ]
        );
      } catch (e: any) {
        console.error('[DB] Postgres saveHealthRecord failed:', e.message);
      }
    }

    const idx = this.localStore.health_records.findIndex(r => r.id === id);
    if (idx >= 0) {
      this.localStore.health_records[idx] = { ...this.localStore.health_records[idx], ...full };
    } else {
      this.localStore.health_records.unshift(full);
    }
    this.saveLocalStore();
    return full;
  }

  public async deleteHealthRecord(id: string): Promise<boolean> {
    if (this.isPostgresConnected && this.pool) {
      try {
        await this.pool.query('DELETE FROM health_records WHERE id = $1', [id]);
      } catch (e: any) {
        console.error('[DB] Postgres deleteHealthRecord failed:', e.message);
      }
    }
    this.localStore.health_records = this.localStore.health_records.filter(r => r.id !== id);
    this.saveLocalStore();
    return true;
  }

  // ----------------------------------------------------------------
  // CONSENT REQUESTS
  // ----------------------------------------------------------------
  public async getConsentRequests(patientId?: string): Promise<any[]> {
    if (this.isPostgresConnected && this.pool) {
      try {
        let sql = 'SELECT * FROM consent_requests';
        const params: any[] = [];
        if (patientId) {
          sql += ' WHERE patient_id = $1';
          params.push(patientId);
        }
        sql += ' ORDER BY created_at DESC';
        const res = await this.pool.query(sql, params);
        return res.rows.map(r => ({
          id: r.id,
          patientId: r.patient_id,
          requester: r.requester,
          purpose: r.purpose,
          infoTypes: typeof r.info_types === 'string' ? JSON.parse(r.info_types) : r.info_types,
          status: r.status,
          date: r.date,
          expiresIn: r.expires_in
        }));
      } catch (e: any) {
        console.error('[DB] Postgres getConsentRequests failed:', e.message);
      }
    }

    if (patientId) {
      return this.localStore.consent_requests.filter(cr => !cr.patientId || cr.patientId === patientId);
    }
    return this.localStore.consent_requests;
  }

  public async saveConsentRequest(cr: any): Promise<any> {
    const id = cr.id || `cr-${Date.now().toString().slice(-4)}`;
    const full = { ...cr, id };

    if (this.isPostgresConnected && this.pool) {
      try {
        await this.pool.query(
          `INSERT INTO consent_requests (id, patient_id, requester, purpose, info_types, status, date, expires_in)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (id) DO UPDATE SET
             status = EXCLUDED.status`,
          [
            full.id,
            full.patientId || null,
            full.requester,
            full.purpose,
            JSON.stringify(full.infoTypes || []),
            full.status || 'PENDING',
            full.date,
            full.expiresIn || '24 Hours'
          ]
        );
      } catch (e: any) {
        console.error('[DB] Postgres saveConsentRequest failed:', e.message);
      }
    }

    const idx = this.localStore.consent_requests.findIndex(c => c.id === id);
    if (idx >= 0) {
      this.localStore.consent_requests[idx] = { ...this.localStore.consent_requests[idx], ...full };
    } else {
      this.localStore.consent_requests.unshift(full);
    }
    this.saveLocalStore();
    return full;
  }

  public async updateConsentStatus(id: string, status: string): Promise<any> {
    const list = await this.getConsentRequests();
    const item = list.find(c => c.id === id);
    if (!item) return null;
    return this.saveConsentRequest({ ...item, status });
  }

  // ----------------------------------------------------------------
  // DOCTOR QUEUES
  // ----------------------------------------------------------------
  public async getDoctorQueue(doctorId: string): Promise<any[]> {
    if (this.isPostgresConnected && this.pool) {
      try {
        const res = await this.pool.query('SELECT queue FROM doctor_queues WHERE doctor_id = $1', [doctorId]);
        if (res.rows.length > 0) {
          const q = res.rows[0].queue;
          return typeof q === 'string' ? JSON.parse(q) : q;
        }
      } catch (e: any) {
        console.error('[DB] Postgres getDoctorQueue failed:', e.message);
      }
    }
    return this.localStore.doctor_queues[doctorId] || [];
  }

  public async updateDoctorQueue(doctorId: string, queue: any[]): Promise<any[]> {
    if (this.isPostgresConnected && this.pool) {
      try {
        await this.pool.query(
          `INSERT INTO doctor_queues (doctor_id, queue, updated_at)
           VALUES ($1, $2, CURRENT_TIMESTAMP)
           ON CONFLICT (doctor_id) DO UPDATE SET
             queue = EXCLUDED.queue,
             updated_at = CURRENT_TIMESTAMP`,
          [doctorId, JSON.stringify(queue)]
        );
      } catch (e: any) {
        console.error('[DB] Postgres updateDoctorQueue failed:', e.message);
      }
    }
    this.localStore.doctor_queues[doctorId] = queue;
    this.saveLocalStore();
    return queue;
  }

  // ----------------------------------------------------------------
  // SEED INITIAL VERIFIED ABDM DATA (Optional user action)
  // ----------------------------------------------------------------
  public async seedSampleData(dataset: {
    hospitals?: any[];
    doctors?: any[];
    blood_banks?: any[];
    patients?: any[];
    consultations?: any[];
    prescriptions?: any[];
    health_records?: any[];
    consent_requests?: any[];
  }): Promise<{ message: string; counts: Record<string, number> }> {
    const counts: Record<string, number> = {};

    if (dataset.hospitals) {
      for (const h of dataset.hospitals) await this.saveHospital(h);
      counts.hospitals = dataset.hospitals.length;
    }
    if (dataset.doctors) {
      for (const d of dataset.doctors) await this.saveDoctor(d);
      counts.doctors = dataset.doctors.length;
    }
    if (dataset.blood_banks) {
      for (const b of dataset.blood_banks) await this.saveBloodBank(b);
      counts.blood_banks = dataset.blood_banks.length;
    }
    if (dataset.patients) {
      for (const p of dataset.patients) await this.savePatient(p);
      counts.patients = dataset.patients.length;
    }
    if (dataset.consultations) {
      for (const c of dataset.consultations) await this.saveConsultation(c);
      counts.consultations = dataset.consultations.length;
    }
    if (dataset.prescriptions) {
      for (const r of dataset.prescriptions) await this.savePrescription(r);
      counts.prescriptions = dataset.prescriptions.length;
    }
    if (dataset.health_records) {
      for (const hr of dataset.health_records) await this.saveHealthRecord(hr);
      counts.health_records = dataset.health_records.length;
    }
    if (dataset.consent_requests) {
      for (const cr of dataset.consent_requests) await this.saveConsentRequest(cr);
      counts.consent_requests = dataset.consent_requests.length;
    }

    return {
      message: 'ABDM Verified sample records successfully populated into database.',
      counts
    };
  }

  // ----------------------------------------------------------------
  // CLEAR ALL DATA
  // ----------------------------------------------------------------
  public async clearAll(): Promise<void> {
    if (this.isPostgresConnected && this.pool) {
      try {
        await this.pool.query(`
          TRUNCATE TABLE hospitals, doctors, blood_banks, patients, consultations, prescriptions, health_records, consent_requests, doctor_queues;
        `);
      } catch (e: any) {
        console.error('[DB] Postgres truncate failed:', e.message);
      }
    }
    this.localStore = {
      hospitals: [],
      doctors: [],
      blood_banks: [],
      patients: [],
      consultations: [],
      prescriptions: [],
      health_records: [],
      consent_requests: [],
      doctor_queues: {}
    };
    this.saveLocalStore();
  }

  // ----------------------------------------------------------------
  // STATUS
  // ----------------------------------------------------------------
  public async getStatus(): Promise<DatabaseStatus> {
    const hospitals = await this.getHospitals();
    const doctors = await this.getDoctors();
    const bloodBanks = await this.getBloodBanks();
    const consultations = await this.getConsultations();
    const prescriptions = await this.getPrescriptions();
    const healthRecords = await this.getHealthRecords();
    const consentRequests = await this.getConsentRequests();

    const rawUrl = process.env.DATABASE_URL || process.env.EXTERNAL_DATABASE_URL;

    return {
      connected: this.isPostgresConnected,
      provider: this.isPostgresConnected ? 'PostgreSQL (External)' : 'Persistent Database Store',
      externalDatabaseUrlConfigured: !!rawUrl,
      externalDatabaseUrlMasked: this.getMaskedUrl(),
      connectionError: this.isPostgresConnected ? null : this.lastError,
      tables: {
        hospitals: hospitals.length,
        doctors: doctors.length,
        blood_banks: bloodBanks.length,
        patients: this.localStore.patients.length,
        consultations: consultations.length,
        prescriptions: prescriptions.length,
        health_records: healthRecords.length,
        consent_requests: consentRequests.length
      }
    };
  }
}

export const db = new DatabaseService();
