import { Hospital, Doctor, Patient, ConsultationRecord, Prescription, HealthRecordItem, ConsentRequest } from './types';

// Zero placeholder data by default: all data comes dynamically from the external database
export const MOCK_HOSPITALS: Hospital[] = [];
export const MOCK_BLOOD_BANKS: any[] = [];
export const MOCK_DOCTORS: Doctor[] = [];

export const DEFAULT_PATIENT: Patient | null = null;
export const DEFAULT_CONSULTATIONS: ConsultationRecord[] = [];
export const DEFAULT_PRESCRIPTIONS: Prescription[] = [];
export const DEFAULT_HEALTH_RECORDS: HealthRecordItem[] = [];
export const DEFAULT_CONSENT_REQUESTS: ConsentRequest[] = [];

// Optional verified ABDM registry template for seeding when requested via UI or API
export const VERIFIED_ABDM_SEED_DATA = {
  hospitals: [
    {
      id: 'hfr-001',
      name: 'Safdarjung Hospital',
      type: 'Government',
      address: 'Ansari Nagar East, near AIIMS Metro Station, New Delhi',
      phone: '+91-11-26165060',
      specialties: ['Trauma', 'Cardiology', 'Neurology', 'Orthopedics'],
      services: ['CT Scan', 'Burn Ward', 'ICU', 'MRI', 'X-Ray', '24/7 Pharmacy', 'Ambulance'],
      emergencyServices: true,
      bedsAvailable: 42,
      bloodBank: true,
      lat: 28.5682,
      lng: 77.2069
    },
    {
      id: 'hfr-002',
      name: 'All India Institute of Medical Sciences (AIIMS)',
      type: 'Government',
      address: 'Sri Aurobindo Marg, Ansari Nagar, New Delhi',
      phone: '+91-11-26588500',
      specialties: ['Multispecialty', 'Trauma', 'Oncology', 'Cardiothoracic'],
      services: ['CT Scan', 'ICU', 'MRI', 'X-Ray', '24/7 Pharmacy', 'Ambulance', 'Robotic Surgery', 'Dialysis'],
      emergencyServices: true,
      bedsAvailable: 15,
      bloodBank: true,
      lat: 28.5672,
      lng: 77.2100
    },
    {
      id: 'hfr-003',
      name: 'Sir Ganga Ram Hospital',
      type: 'Trust',
      address: 'Rajinder Nagar, New Delhi',
      phone: '+91-11-25750000',
      specialties: ['Cardiology', 'Gastroenterology', 'Neurology'],
      services: ['CT Scan', 'ICU', 'MRI', 'Dialysis', '24/7 Pharmacy'],
      emergencyServices: true,
      bedsAvailable: 8,
      bloodBank: true,
      lat: 28.6385,
      lng: 77.1895
    }
  ],
  doctors: [
    {
      id: 'doc-001',
      name: 'Dr. Vikram Singh',
      specialty: 'Cardiologist',
      experience: 15,
      qualification: 'MBBS, MD - Cardiology',
      clinic: 'Heart Care Clinic',
      address: 'Connaught Place, New Delhi',
      fee: 1500,
      rating: 4.8,
      availableNext: 'Today, 4:00 PM',
      lat: 28.6304,
      lng: 77.2177
    },
    {
      id: 'doc-002',
      name: 'Dr. Sneha Rao',
      specialty: 'Dermatologist',
      experience: 8,
      qualification: 'MBBS, DDVL',
      clinic: 'Skin Glow Clinic',
      address: 'Rajinder Nagar, New Delhi',
      fee: 800,
      rating: 4.5,
      availableNext: 'Tomorrow, 10:00 AM',
      lat: 28.6385,
      lng: 77.1895
    }
  ],
  blood_banks: [
    {
      id: 'bb-001',
      name: 'Indian Red Cross Society Blood Bank',
      address: '1, Red Cross Road, New Delhi',
      lat: 28.6212,
      lng: 77.2045,
      stock: { 'O+': 145, 'O-': 12, 'A+': 89, 'A-': 5, 'B+': 112, 'B-': 8, 'AB+': 45, 'AB-': 2 },
      lastUpdated: '5 mins ago'
    }
  ]
};
