export type ViewState = 'home' | 'emergency' | 'hospitals' | 'donors' | 'records' | 'doctor-portal' | 'hospital-portal' | 'blood-bank-portal' | 'doctors' | 'donate-blood';
export type Role = 'citizen' | 'doctor' | 'hospital' | 'blood-bank';

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  experience: number;
  qualification: string;
  clinic: string;
  address: string;
  fee: number;
  rating: number;
  availableNext: string;
  distance?: number;
  lat: number;
  lng: number;
}

export interface Hospital {
  id: string;
  name: string;
  type: 'Government' | 'Private' | 'Trust';
  address: string;
  distance?: number; // Calculated at runtime in km
  phone: string;
  specialties: string[];
  services: string[];
  emergencyServices: boolean;
  bedsAvailable: number;
  bloodBank: boolean;
  lat: number;
  lng: number;
}

export interface BloodBank {
  id: string;
  name: string;
  address: string;
  distance?: number;
  lat: number;
  lng: number;
  stock: Record<string, number>; // e.g., { 'O+': 12, 'A+': 5 }
  lastUpdated: string;
}

export interface ConsentRequest {
  id: string;
  requester: string;
  purpose: string;
  infoTypes: string[];
  status: 'PENDING' | 'GRANTED' | 'DENIED';
  date?: string;
  expiresIn?: string;
}

export interface Patient {
  id: string;
  name: string;
  abhaId: string;
  abhaNumber: string;
  phone: string;
  gender: string;
  age: number;
  dob: string;
  bloodGroup: string;
  address: string;
  emergencyContact: string;
}

export interface ConsultationRecord {
  id: string;
  patientId?: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  clinicOrHospital: string;
  date: string;
  time: string;
  status: 'Upcoming' | 'In Progress' | 'Completed' | 'Cancelled';
  type: 'Online Video' | 'In-Clinic';
  tokenNumber: number;
  meetingLink?: string;
  consultationNotes?: string;
  prescriptionId?: string;
}

export interface MedicineItem {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface Prescription {
  id: string;
  patientId?: string;
  doctorName: string;
  doctorSpecialty: string;
  doctorRegNo: string;
  clinicOrHospital: string;
  date: string;
  diagnosis: string;
  medicines: MedicineItem[];
  advice: string;
  followUpDate?: string;
}

export interface HealthRecordMetric {
  label: string;
  value: string;
  unit?: string;
  status: 'normal' | 'attention' | 'high';
}

export interface HealthRecordItem {
  id: string;
  patientId?: string;
  title: string;
  category: 'Diagnostic Lab Report' | 'Discharge Summary' | 'Immunization' | 'Prescription' | 'Radiology / Scan';
  issuedBy: string;
  date: string;
  verified: boolean;
  fileType: string;
  summary: string;
  doctorName?: string;
  metrics?: HealthRecordMetric[];
}

