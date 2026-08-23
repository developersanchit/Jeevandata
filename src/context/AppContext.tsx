import React, { createContext, useContext, useState, ReactNode } from 'react';
import { MOCK_HOSPITALS, MOCK_BLOOD_BANKS, MOCK_DOCTORS } from '../data';
import { Hospital, Doctor } from '../types';

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

interface AppContextType {
  hospitals: Hospital[];
  updateHospital: (id: string, data: Partial<Hospital>) => void;
  
  bloodBanks: any[];
  updateBloodBankStock: (id: string, group: string, delta: number) => void;
  
  citizenBloodBalance: number;
  addCitizenBloodBalance: (amount: number) => void;
  
  doctors: Doctor[];
  doctorQueues: Record<string, PatientQueueItem[]>;
  bookAppointment: (doctorId: string) => void;
  updateDoctorQueue: (doctorId: string, queue: PatientQueueItem[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [hospitals, setHospitals] = useState<Hospital[]>(MOCK_HOSPITALS);
  const [bloodBanks, setBloodBanks] = useState(MOCK_BLOOD_BANKS);
  const [citizenBloodBalance, setCitizenBloodBalance] = useState(2300);
  const [doctors, setDoctors] = useState<Doctor[]>(MOCK_DOCTORS);
  
  // Initial mock queue for the first doctor (Dr. Vikram Singh - doc-001)
  const [doctorQueues, setDoctorQueues] = useState<Record<string, PatientQueueItem[]>>({
    'doc-001': [
      { id: 1, name: 'Rahul Verma', age: '45M', time: '10:30 AM', status: 'Waiting', type: 'Post-Op Follow-up', abha: 'rahul.v@abdm', active: true },
      { id: 2, name: 'Priya Patel', age: '32F', time: '11:15 AM', status: 'Scheduled', type: 'Initial Consultation', abha: 'priya99@abdm', active: false },
      { id: 3, name: 'Amit Singh', age: '58M', time: '12:00 PM', status: 'Scheduled', type: 'ECG Report Review', abha: 'amits@abdm', active: false },
    ]
  });

  const updateHospital = (id: string, data: Partial<Hospital>) => {
    setHospitals(prev => prev.map(h => h.id === id ? { ...h, ...data } : h));
  };

  const updateBloodBankStock = (id: string, group: string, delta: number) => {
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
  };

  const addCitizenBloodBalance = (amount: number) => {
    setCitizenBloodBalance(prev => prev + amount);
  };

  const bookAppointment = (doctorId: string) => {
    setDoctorQueues(prev => {
      const currentQueue = prev[doctorId] || [];
      const newId = currentQueue.length > 0 ? Math.max(...currentQueue.map(q => q.id)) + 1 : 1;
      
      const newAppointment: PatientQueueItem = {
        id: newId,
        name: 'You (Citizen)', // Represents the current user
        age: '28M',
        time: 'Just Now',
        status: 'Scheduled',
        type: 'General Consultation',
        abha: 'citizen@abdm',
        active: false
      };
      
      return {
        ...prev,
        [doctorId]: [...currentQueue, newAppointment]
      };
    });
  };

  const updateDoctorQueue = (doctorId: string, queue: PatientQueueItem[]) => {
    setDoctorQueues(prev => ({
      ...prev,
      [doctorId]: queue
    }));
  };

  return (
    <AppContext.Provider value={{
      hospitals,
      updateHospital,
      bloodBanks,
      updateBloodBankStock,
      citizenBloodBalance,
      addCitizenBloodBalance,
      doctors,
      doctorQueues,
      bookAppointment,
      updateDoctorQueue
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
