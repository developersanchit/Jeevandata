import React, { useState, useMemo, useEffect } from 'react';
import { MapPin, Navigation, Calendar, User, Search, Filter, CheckCircle2, AlertCircle, Star, ArrowLeft } from 'lucide-react';
import { Doctor } from '../types';
import { useGeolocation } from '../hooks/useGeolocation';
import { useAppContext } from '../context/AppContext';
import PatientAuthModal from './PatientAuthModal';

// Calculate distance between two coordinates in km using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

const AVAILABLE_SPECIALTIES = ['Cardiologist', 'Dermatologist', 'Pediatrician', 'Orthopedic', 'Gynecologist', 'General Physician'];

interface DoctorFinderProps {
  onBack?: () => void;
  onNavigateRecords?: (tab?: 'records' | 'consultations' | 'prescriptions') => void;
}

export default function DoctorFinder({ onBack, onNavigateRecords }: DoctorFinderProps) {
  const { doctors: globalDoctors, bookAppointment, isPatientLoggedIn, bookPatientConsultation, seedInitialData } = useAppContext();
  const { location: userLoc, loading: locating, error, usingFallback } = useGeolocation();
  const [radius, setRadius] = useState<number>(15);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [isLoadingApi, setIsLoadingApi] = useState(true);
  const [bookedDoctorId, setBookedDoctorId] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingDoctorToBook, setPendingDoctorToBook] = useState<Doctor | null>(null);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Simulate network request to fetch doctors
  useEffect(() => {
    setIsLoadingApi(true);
    const timer = setTimeout(() => {
      setIsLoadingApi(false);
    }, 350); // Snappy lookup delay
    return () => clearTimeout(timer);
  }, []);

  const handleBook = (doctor: Doctor) => {
    if (!isPatientLoggedIn) {
      setPendingDoctorToBook(doctor);
      setShowAuthModal(true);
      return;
    }

    bookPatientConsultation(doctor);
    setBookedDoctorId(doctor.id);
    showToast(`Appointment scheduled with ${doctor.name}! Added to your Consultations.`);
    setTimeout(() => setBookedDoctorId(null), 4000);
  };

  const handleAuthSuccess = () => {
    if (pendingDoctorToBook) {
      bookPatientConsultation(pendingDoctorToBook);
      setBookedDoctorId(pendingDoctorToBook.id);
      showToast(`Signed in & appointment scheduled with ${pendingDoctorToBook.name}!`);
      setPendingDoctorToBook(null);
      setTimeout(() => setBookedDoctorId(null), 4000);
    }
  };


  const doctors = useMemo(() => {
    if (!userLoc) return [];
    
    let sorted = globalDoctors.map(d => ({
      ...d,
      distance: calculateDistance(userLoc.lat, userLoc.lng, d.lat, d.lng)
    }));

    // Filter by radius
    sorted = sorted.filter(d => d.distance !== undefined && d.distance <= radius);

    // Filter by specialty
    if (selectedSpecialty) {
      sorted = sorted.filter(d => d.specialty === selectedSpecialty);
    }

    // Sort by distance
    return sorted.sort((a, b) => (a.distance || 0) - (b.distance || 0));
  }, [userLoc, globalDoctors, radius, selectedSpecialty]);

  return (
    <div className="flex-grow flex flex-col bg-slate-50 min-h-full pb-20">
      {/* Header */}
      <div className="bg-indigo-900 text-white pt-10 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/2 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        </div>
        
        <div className="max-w-6xl mx-auto relative z-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          <div>
            {onBack && (
              <button
                onClick={onBack}
                className="inline-flex items-center gap-2 text-sm font-semibold text-white/90 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 px-3.5 py-1.5 rounded-xl backdrop-blur-sm transition-all mb-4 cursor-pointer group shadow-2xs"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                <span>Back to Home</span>
              </button>
            )}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-indigo-400/30">
                <Search className="w-5 h-5 text-indigo-100" />
              </div>
              <span className="text-indigo-200 font-semibold tracking-wide text-sm uppercase">Medical Professionals</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">Book Local Doctors</h1>
            <p className="text-indigo-200 max-w-xl">Find verified specialists near you and schedule instant appointments.</p>
          </div>
          
          {/* Location Status */}
          {!locating && userLoc && (
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 shrink-0 max-w-xs w-full md:w-auto">
              <div className="text-xs text-indigo-200 font-medium uppercase tracking-wider mb-2">Your Location</div>
              {error || usingFallback ? (
                <div className="bg-amber-500/20 border border-amber-500/30 px-4 py-2.5 rounded-xl flex items-center gap-2 text-amber-200 text-sm font-medium">
                  <AlertCircle className="w-4 h-4" /> Default Location Used
                </div>
              ) : (
                <div className="bg-emerald-500/20 border border-emerald-500/30 px-4 py-2.5 rounded-xl flex items-center gap-2 text-emerald-200 text-sm font-medium">
                  <CheckCircle2 className="w-4 h-4" /> Location Acquired
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 w-full">
        {/* Filters */}
        {!locating && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8 flex flex-col gap-6">
            {/* Specialty Filter */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Star className="w-4 h-4 text-slate-400" />
                Specialty
              </h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedSpecialty(null)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                    selectedSpecialty === null 
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  All Specialists
                </button>
                {AVAILABLE_SPECIALTIES.map(specialty => {
                  const isSelected = selectedSpecialty === specialty;
                  return (
                    <button
                      key={specialty}
                      onClick={() => setSelectedSpecialty(specialty)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                        isSelected 
                          ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300'
                      }`}
                    >
                      {specialty}
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Radius Filter */}
            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-6 max-w-2xl">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 shrink-0">
                <Filter className="w-4 h-4 text-slate-400" />
                Search Radius: <span className="text-indigo-600 font-bold">{radius} km</span>
              </div>
              <input 
                type="range" 
                min="1" max="50" 
                value={radius} 
                onChange={(e) => setRadius(Number(e.target.value))}
                className="flex-grow h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900 w-full"
              />
            </div>
          </div>
        )}

        {locating || isLoadingApi ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="relative w-12 h-12 mb-4">
              <div className="absolute inset-0 border-2 border-slate-100 rounded-full"></div>
              <div className="absolute inset-0 border-2 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <h3 className="text-base font-semibold text-slate-900">
              {locating ? 'Acquiring Location...' : 'Fetching Medical Professionals...'}
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              {locating ? 'Connecting to geospatial nodes' : 'Syncing practitioner registry'}
            </p>
          </div>
        ) : globalDoctors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-slate-200 p-8 shadow-xs max-w-lg mx-auto">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4 text-indigo-600 border border-indigo-100">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">No Doctors in Connected Database</h3>
            <p className="text-slate-500 text-xs max-w-sm mb-6 leading-relaxed">
              All placeholder data has been removed. Doctors can register via the Doctor Portal or you can initialize the ABDM Healthcare Professional Registry with sample verified practitioners.
            </p>
            <button
              onClick={() => seedInitialData()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
            >
              Populate ABDM Doctors Sample Data
            </button>
          </div>
        ) : doctors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4 text-slate-400">
              <User className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No doctors in this radius</h3>
            <p className="text-slate-500 text-sm max-w-sm">Try expanding your search radius or changing the specialty filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map(doctor => (
              <div 
                key={doctor.id}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:border-indigo-300 transition-colors flex flex-col"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md border bg-indigo-50 text-indigo-700 border-indigo-200">
                    {doctor.specialty}
                  </span>
                  {doctor.distance !== undefined && (
                    <span className="text-xs font-semibold text-slate-600 bg-slate-50 px-2 py-1 rounded-md flex items-center gap-1 border border-slate-200">
                      <Navigation className="w-3 h-3 text-slate-400" />
                      {doctor.distance.toFixed(1)} km
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold shrink-0 border border-slate-200">
                    {doctor.name.split(' ').slice(1).map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-tight">{doctor.name}</h3>
                    <p className="text-xs text-slate-500">{doctor.qualification}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-500 mb-4 flex-grow flex items-start gap-2 leading-relaxed mt-2">
                  <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-400" />
                  {doctor.clinic}, {doctor.address}
                </p>

                <div className="grid grid-cols-3 gap-2 mb-6">
                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 text-center">
                    <p className="text-[10px] uppercase text-slate-500 font-semibold tracking-wider mb-1">Exp</p>
                    <p className="text-sm font-bold text-slate-900">{doctor.experience} Yrs</p>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 text-center">
                    <p className="text-[10px] uppercase text-slate-500 font-semibold tracking-wider mb-1">Rating</p>
                    <p className="text-sm font-bold text-slate-900 flex items-center justify-center gap-1">
                      {doctor.rating} <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    </p>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 text-center">
                    <p className="text-[10px] uppercase text-slate-500 font-semibold tracking-wider mb-1">Fee</p>
                    <p className="text-sm font-bold text-slate-900">₹{doctor.fee}</p>
                  </div>
                </div>

                <div className="bg-emerald-50 text-emerald-700 px-3 py-2 rounded-xl text-xs font-medium mb-4 flex items-center justify-center gap-2 border border-emerald-100">
                  <Calendar className="w-3.5 h-3.5" />
                  Next Available: {doctor.availableNext}
                </div>

                <button 
                  onClick={() => handleBook(doctor)}
                  disabled={bookedDoctorId === doctor.id}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-colors shadow-sm cursor-pointer ${
                    bookedDoctorId === doctor.id
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}>
                  {bookedDoctorId === doctor.id ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Appointment Booked!
                    </>
                  ) : (
                    <>
                      <Calendar className="w-4 h-4" />
                      Book Appointment
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Patient Auth Modal if guest clicks book */}
      <PatientAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        initialMessage="Sign in with your patient account to confirm and save this appointment to your consultations."
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white px-6 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <p className="text-sm font-medium">{toastMessage}</p>
          {onNavigateRecords && (
            <button
              onClick={() => onNavigateRecords('consultations')}
              className="text-xs font-bold text-indigo-300 hover:text-white underline ml-2 cursor-pointer"
            >
              View Consultations
            </button>
          )}
        </div>
      )}
    </div>
  );
}
