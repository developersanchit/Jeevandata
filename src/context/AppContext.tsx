import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { 
  Hospital, 
  Doctor, 
  Patient, 
  ConsultationRecord, 
  Prescription, 
  HealthRecordItem, 
  ConsentRequest 
} from '../types';
import { VERIFIED_ABDM_SEED_DATA } from '../data';

export interface PatientQueueItem {
  id: number;
  name: string;
  age: string;
  time: string;
  status: 'Waiting' | 'Scheduled' | 'In Consult' | 'Completed';
  type: string;
  abha: string;
  active: boolean;
}

export interface DbStatusInfo {
  connected: boolean;
  provider: string;
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

interface AppContextType {
  hospitals: Hospital[];
  updateHospital: (id: string, data: Partial<Hospital>) => Promise<void>;
  registerHospital: (data: Omit<Hospital, 'id'>) => Promise<Hospital>;
  
  bloodBanks: any[];
  updateBloodBankStock: (id: string, group: string, delta: number) => Promise<void>;
  registerBloodBank: (data: any) => Promise<any>;
  
  citizenBloodBalance: number;
  addCitizenBloodBalance: (amount: number) => void;
  
  doctors: Doctor[];
  doctorQueues: Record<string, PatientQueueItem[]>;
  bookAppointment: (doctorId: string) => Promise<void>;
  updateDoctorQueue: (doctorId: string, queue: PatientQueueItem[]) => Promise<void>;
  registerDoctor: (data: Omit<Doctor, 'id'>) => Promise<Doctor>;

  // Patient / Citizen System
  currentPatient: Patient | null;
  isPatientLoggedIn: boolean;
  isLoadingAuth: boolean;
  patientLogin: (identifier: string) => Promise<boolean>;
  patientLogout: () => void;
  patientConsultations: ConsultationRecord[];
  patientPrescriptions: Prescription[];
  patientHealthRecords: HealthRecordItem[];
  consentRequests: ConsentRequest[];
  handleConsentAction: (id: string, action: 'GRANTED' | 'DENIED') => Promise<void>;
  bookPatientConsultation: (doctor: Doctor, date?: string, time?: string, type?: 'In-Clinic' | 'Online Video') => Promise<ConsultationRecord>;
  cancelPatientConsultation: (id: string) => Promise<void>;
  addHealthRecord: (record: Omit<HealthRecordItem, 'id'>) => Promise<void>;
  deleteHealthRecord: (id: string) => Promise<void>;

  // Database Connection & Management
  dbStatus: DbStatusInfo | null;
  isLoadingDb: boolean;
  refreshDbData: () => Promise<void>;
  retryDbConnection: () => Promise<void>;
  seedInitialData: () => Promise<void>;
  clearAllDbData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Real database state - zero placeholder data
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [bloodBanks, setBloodBanks] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [citizenBloodBalance, setCitizenBloodBalance] = useState<number>(0);
  const [doctorQueues, setDoctorQueues] = useState<Record<string, PatientQueueItem[]>>({});
  
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(() => {
    const saved = localStorage.getItem('session_patient_profile');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return null;
  });

  const [patientConsultations, setPatientConsultations] = useState<ConsultationRecord[]>([]);
  const [patientPrescriptions, setPatientPrescriptions] = useState<Prescription[]>([]);
  const [patientHealthRecords, setPatientHealthRecords] = useState<HealthRecordItem[]>([]);
  const [consentRequests, setConsentRequests] = useState<ConsentRequest[]>([]);
  
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(false);
  const [isLoadingDb, setIsLoadingDb] = useState<boolean>(true);
  const [dbStatus, setDbStatus] = useState<DbStatusInfo | null>(null);

  // ----------------------------------------------------------------
  // FETCH FROM DATABASE
  // ----------------------------------------------------------------
  const fetchDbStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/db-status');
      if (res.ok) {
        const data = await res.json();
        setDbStatus(data);
      }
    } catch (err) {
      console.error('[Client] Failed to check database status:', err);
    }
  }, []);

  const fetchHospitals = useCallback(async () => {
    try {
      const res = await fetch('/api/hospitals');
      if (res.ok) {
        const data = await res.json();
        setHospitals(data || []);
      }
    } catch (err) {
      console.error('[Client] Failed to fetch hospitals:', err);
    }
  }, []);

  const fetchDoctors = useCallback(async () => {
    try {
      const res = await fetch('/api/doctors');
      if (res.ok) {
        const data = await res.json();
        setDoctors(data || []);
      }
    } catch (err) {
      console.error('[Client] Failed to fetch doctors:', err);
    }
  }, []);

  const fetchBloodBanks = useCallback(async () => {
    try {
      const res = await fetch('/api/blood-banks');
      if (res.ok) {
        const data = await res.json();
        setBloodBanks(data || []);
      }
    } catch (err) {
      console.error('[Client] Failed to fetch blood banks:', err);
    }
  }, []);

  const fetchPatientData = useCallback(async (patientId: string) => {
    try {
      const [consRes, rxRes, hrRes, crRes] = await Promise.all([
        fetch(`/api/consultations?patientId=${encodeURIComponent(patientId)}`),
        fetch(`/api/prescriptions?patientId=${encodeURIComponent(patientId)}`),
        fetch(`/api/health-records?patientId=${encodeURIComponent(patientId)}`),
        fetch(`/api/consent-requests?patientId=${encodeURIComponent(patientId)}`)
      ]);

      if (consRes.ok) setPatientConsultations(await consRes.json());
      if (rxRes.ok) setPatientPrescriptions(await rxRes.json());
      if (hrRes.ok) setPatientHealthRecords(await hrRes.json());
      if (crRes.ok) setConsentRequests(await crRes.json());
    } catch (err) {
      console.error('[Client] Error fetching patient database records:', err);
    }
  }, []);

  const refreshDbData = useCallback(async () => {
    setIsLoadingDb(true);
    await Promise.all([
      fetchHospitals(),
      fetchDoctors(),
      fetchBloodBanks(),
      fetchDbStatus()
    ]);
    if (currentPatient) {
      await fetchPatientData(currentPatient.id);
    }
    setIsLoadingDb(false);
  }, [fetchHospitals, fetchDoctors, fetchBloodBanks, fetchDbStatus, currentPatient, fetchPatientData]);

  // Initial load
  useEffect(() => {
    refreshDbData();
  }, []);

  // When patient changes, fetch their records
  useEffect(() => {
    if (currentPatient) {
      localStorage.setItem('session_patient_profile', JSON.stringify(currentPatient));
      localStorage.setItem('session_patient', currentPatient.abhaId);
      fetchPatientData(currentPatient.id);
    } else {
      localStorage.removeItem('session_patient_profile');
      localStorage.removeItem('session_patient');
      setPatientConsultations([]);
      setPatientPrescriptions([]);
      setPatientHealthRecords([]);
      setConsentRequests([]);
    }
  }, [currentPatient, fetchPatientData]);

  // ----------------------------------------------------------------
  // PATIENT AUTH
  // ----------------------------------------------------------------
  const patientLogin = async (identifier: string): Promise<boolean> => {
    setIsLoadingAuth(true);
    try {
      const res = await fetch('/api/patients/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier })
      });

      if (res.ok) {
        const patient: Patient = await res.json();
        setCurrentPatient(patient);
        setIsLoadingAuth(false);
        fetchDbStatus();
        return true;
      }
    } catch (err) {
      console.error('[Client] Patient login error:', err);
    }
    setIsLoadingAuth(false);
    return false;
  };

  const patientLogout = () => {
    setCurrentPatient(null);
  };

  // ----------------------------------------------------------------
  // CONSULTATIONS & QUEUES
  // ----------------------------------------------------------------
  const bookPatientConsultation = async (
    doctor: Doctor, 
    date = 'Tomorrow', 
    time = doctor.availableNext || '11:00 AM',
    type: 'In-Clinic' | 'Online Video' = 'In-Clinic'
  ): Promise<ConsultationRecord> => {
    const newRecord: Partial<ConsultationRecord> = {
      patientId: currentPatient?.id,
      doctorId: doctor.id,
      doctorName: doctor.name,
      specialty: doctor.specialty,
      clinicOrHospital: `${doctor.clinic}, ${doctor.address}`,
      date,
      time,
      status: 'Upcoming',
      type,
      tokenNumber: Math.floor(Math.random() * 15) + 1,
      meetingLink: type === 'Online Video' ? 'https://telehealth.abdm.gov.in/room/' + doctor.id : undefined,
      consultationNotes: `Scheduled appointment with ${doctor.name} for specialist consultation.`
    };

    let createdRecord: ConsultationRecord = {
      id: `cons-${Date.now().toString().slice(-5)}`,
      ...newRecord
    } as ConsultationRecord;

    try {
      const res = await fetch('/api/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRecord)
      });
      if (res.ok) {
        createdRecord = await res.json();
      }
    } catch (err) {
      console.error('[Client] Save consultation error:', err);
    }

    setPatientConsultations(prev => [createdRecord, ...prev]);

    // Also update doctor's waiting queue in the database
    const currentQueue = doctorQueues[doctor.id] || [];
    const newQueueItem: PatientQueueItem = {
      id: currentQueue.length > 0 ? Math.max(...currentQueue.map(q => q.id)) + 1 : 1,
      name: currentPatient?.name || 'Citizen Patient',
      age: `${currentPatient?.age || 30} yrs`,
      time: time,
      status: 'Scheduled',
      type: `${doctor.specialty} Consultation`,
      abha: currentPatient?.abhaId || 'citizen@abdm',
      active: false
    };

    const updatedQueue = [...currentQueue, newQueueItem];
    setDoctorQueues(prev => ({ ...prev, [doctor.id]: updatedQueue }));

    try {
      await fetch(`/api/doctor-queues/${doctor.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queue: updatedQueue })
      });
    } catch (err) {
      console.error('[Client] Doctor queue update error:', err);
    }

    fetchDbStatus();
    return createdRecord;
  };

  const cancelPatientConsultation = async (id: string) => {
    setPatientConsultations(prev => prev.map(c => c.id === id ? { ...c, status: 'Cancelled' as const } : c));
    try {
      await fetch(`/api/consultations/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Cancelled' })
      });
      fetchDbStatus();
    } catch (err) {
      console.error('[Client] Cancel consultation error:', err);
    }
  };

  const handleConsentAction = async (id: string, action: 'GRANTED' | 'DENIED') => {
    setConsentRequests(prev => prev.map(cr => cr.id === id ? { ...cr, status: action } : cr));
    try {
      await fetch(`/api/consent-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action })
      });
      fetchDbStatus();
    } catch (err) {
      console.error('[Client] Consent action error:', err);
    }
  };

  const addHealthRecord = async (record: Omit<HealthRecordItem, 'id'>) => {
    const payload = {
      ...record,
      patientId: currentPatient?.id
    };

    try {
      const res = await fetch('/api/health-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const saved = await res.json();
        setPatientHealthRecords(prev => [saved, ...prev]);
        fetchDbStatus();
        return;
      }
    } catch (err) {
      console.error('[Client] Save health record error:', err);
    }

    // Fallback local update
    const localRecord: HealthRecordItem = {
      ...record,
      id: `hr-${Date.now().toString().slice(-5)}`
    };
    setPatientHealthRecords(prev => [localRecord, ...prev]);
  };

  const deleteHealthRecord = async (id: string) => {
    setPatientHealthRecords(prev => prev.filter(r => r.id !== id));
    try {
      await fetch(`/api/health-records/${id}`, { method: 'DELETE' });
      fetchDbStatus();
    } catch (err) {
      console.error('[Client] Delete health record error:', err);
    }
  };

  // ----------------------------------------------------------------
  // HOSPITALS & BLOOD BANKS & DOCTORS MUTATIONS
  // ----------------------------------------------------------------
  const updateHospital = async (id: string, data: Partial<Hospital>) => {
    setHospitals(prev => prev.map(h => h.id === id ? { ...h, ...data } : h));
    try {
      await fetch(`/api/hospitals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      fetchDbStatus();
    } catch (err) {
      console.error('[Client] Update hospital error:', err);
    }
  };

  const registerHospital = async (data: Omit<Hospital, 'id'>): Promise<Hospital> => {
    const res = await fetch('/api/hospitals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const saved = await res.json();
    setHospitals(prev => [...prev, saved]);
    fetchDbStatus();
    return saved;
  };

  const registerDoctor = async (data: Omit<Doctor, 'id'>): Promise<Doctor> => {
    const res = await fetch('/api/doctors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const saved = await res.json();
    setDoctors(prev => [...prev, saved]);
    fetchDbStatus();
    return saved;
  };

  const registerBloodBank = async (data: any): Promise<any> => {
    const res = await fetch('/api/blood-banks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const saved = await res.json();
    setBloodBanks(prev => [...prev, saved]);
    fetchDbStatus();
    return saved;
  };

  const updateBloodBankStock = async (id: string, group: string, delta: number) => {
    setBloodBanks(prev => prev.map(b => {
      if (b.id === id) {
        return {
          ...b,
          stock: {
            ...b.stock,
            [group]: Math.max(0, (b.stock[group] || 0) + delta)
          }
        };
      }
      return b;
    }));

    try {
      await fetch(`/api/blood-banks/${id}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ group, delta })
      });
      fetchDbStatus();
    } catch (err) {
      console.error('[Client] Update blood stock error:', err);
    }
  };

  const addCitizenBloodBalance = (amount: number) => {
    setCitizenBloodBalance(prev => prev + amount);
  };

  const bookAppointment = async (doctorId: string) => {
    const doc = doctors.find(d => d.id === doctorId);
    if (doc) {
      await bookPatientConsultation(doc);
    }
  };

  const updateDoctorQueue = async (doctorId: string, queue: PatientQueueItem[]) => {
    setDoctorQueues(prev => ({
      ...prev,
      [doctorId]: queue
    }));
    try {
      await fetch(`/api/doctor-queues/${doctorId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queue })
      });
    } catch (err) {
      console.error('[Client] Update doctor queue error:', err);
    }
  };

  // ----------------------------------------------------------------
  // DATABASE RETRY & SEED ACTIONS
  // ----------------------------------------------------------------
  const retryDbConnection = async () => {
    try {
      const res = await fetch('/api/db/retry', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setDbStatus(data.status);
      }
    } catch (err) {
      console.error('[Client] Retry DB error:', err);
    }
  };

  const seedInitialData = async () => {
    setIsLoadingDb(true);
    try {
      const res = await fetch('/api/db/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(VERIFIED_ABDM_SEED_DATA)
      });
      if (res.ok) {
        await refreshDbData();
      }
    } catch (err) {
      console.error('[Client] Seed error:', err);
    }
    setIsLoadingDb(false);
  };

  const clearAllDbData = async () => {
    setIsLoadingDb(true);
    try {
      const res = await fetch('/api/db/clear', { method: 'POST' });
      if (res.ok) {
        setHospitals([]);
        setDoctors([]);
        setBloodBanks([]);
        setPatientConsultations([]);
        setPatientPrescriptions([]);
        setPatientHealthRecords([]);
        setConsentRequests([]);
        await fetchDbStatus();
      }
    } catch (err) {
      console.error('[Client] Clear error:', err);
    }
    setIsLoadingDb(false);
  };

  return (
    <AppContext.Provider value={{
      hospitals,
      updateHospital,
      registerHospital,
      bloodBanks,
      updateBloodBankStock,
      registerBloodBank,
      citizenBloodBalance,
      addCitizenBloodBalance,
      doctors,
      doctorQueues,
      bookAppointment,
      updateDoctorQueue,
      registerDoctor,
      
      // Patient system
      currentPatient,
      isPatientLoggedIn: !!currentPatient,
      isLoadingAuth,
      patientLogin,
      patientLogout,
      patientConsultations,
      patientPrescriptions,
      patientHealthRecords,
      consentRequests,
      handleConsentAction,
      bookPatientConsultation,
      cancelPatientConsultation,
      addHealthRecord,
      deleteHealthRecord,

      // Database Control
      dbStatus,
      isLoadingDb,
      refreshDbData,
      retryDbConnection,
      seedInitialData,
      clearAllDbData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
