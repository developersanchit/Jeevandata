export type ViewState = 'home' | 'emergency' | 'hospitals' | 'donors' | 'records' | 'doctor-portal' | 'hospital-portal' | 'donor-profile';
export type Role = 'citizen' | 'doctor' | 'hospital' | 'donor';

export interface Hospital {
  id: string;
  name: string;
  type: 'Government' | 'Private' | 'Trust';
  address: string;
  distance?: number; // Calculated at runtime in km
  phone: string;
  specialties: string[];
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
}
