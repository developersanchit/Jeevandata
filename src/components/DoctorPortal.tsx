import { Stethoscope, FileText, CheckCircle2, Users, Clock, Search, LogOut, ChevronRight, Activity, Calendar, AlertCircle, Plus, FileSignature, Pill, ClipboardList, ShieldAlert } from 'lucide-react';
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useAppContext, PatientQueueItem } from '../context/AppContext';

export default function DoctorPortal() {
  const { isLoggedIn, error, login, logout } = useAuth('doctor');
  const { doctorQueues, updateDoctorQueue, doctors, registerDoctor } = useAppContext();
  
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const doctor = doctors.find(d => d.id === selectedDoctorId) || doctors[0];
  const doctorId = doctor?.id || 'doc-001';
  const queue = doctorQueues[doctorId] || [];

  const [hprId, setHprId] = useState('');
  const [password, setPassword] = useState('');
  
  const [patientAbha, setPatientAbha] = useState('');
  const [requestSent, setRequestSent] = useState(false);
  const [isSendingConsent, setIsSendingConsent] = useState(false);

  // New Doctor Registration State
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [newName, setNewName] = useState('Dr. Vikram Singh');
  const [newSpecialty, setNewSpecialty] = useState('Cardiologist');
  const [newQual, setNewQual] = useState('MBBS, MD - Cardiology');
  const [newClinic, setNewClinic] = useState('Heart Care Clinic');
  const [newAddress, setNewAddress] = useState('Connaught Place, New Delhi');
  const [newFee, setNewFee] = useState(1200);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [toastMessage, setToastMessage] = useState('');

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const setQueue = (updater: (prev: PatientQueueItem[]) => PatientQueueItem[]) => {
    updateDoctorQueue(doctorId, updater(queue));
  };

  const handleStartConsult = (id: number, name: string) => {
    setQueue(prev => prev.map(p => {
      if (p.id === id) return { ...p, status: 'In Consult' as const };
      return p;
    }));
    showToast(`Started consultation with ${name}`);
  };

  const handleFinishConsult = (id: number) => {
    setQueue(prev => {
      const updated = prev.map(p => {
        if (p.id === id) return { ...p, status: 'Completed' as const, active: false };
        return p;
      });
      // Find next scheduled and make them active waiting
      const nextIdx = updated.findIndex(p => p.status === 'Scheduled');
      if (nextIdx !== -1) {
        updated[nextIdx] = { ...updated[nextIdx], status: 'Waiting' as const, active: true };
      }
      return updated;
    });
    showToast(`Consultation finished. Next patient called.`);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(hprId, password);
  };

  const handleSendConsent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientAbha) return;
    setIsSendingConsent(true);
    setTimeout(() => {
      setIsSendingConsent(false);
      setRequestSent(true);
      setTimeout(() => setRequestSent(false), 3000);
      setPatientAbha('');
    }, 1500);
  };

  const handleRegisterDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    setIsSubmitting(true);
    try {
      const saved = await registerDoctor({
        name: newName,
        specialty: newSpecialty,
        experience: 12,
        qualification: newQual,
        clinic: newClinic,
        address: newAddress,
        fee: Number(newFee),
        rating: 4.9,
        availableNext: 'Today, 2:00 PM',
        lat: 28.6304,
        lng: 77.2177
      });
      setSelectedDoctorId(saved.id);
      setShowRegisterForm(false);
    } catch (err) {
      console.error(err);
    }
    setIsSubmitting(false);
  };

  if (!isLoggedIn) {
    return (
      <div className="flex-grow flex items-center justify-center bg-slate-50 px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 text-blue-600 border border-blue-200 shadow-sm">
            <Stethoscope className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Doctor Sign In</h2>
          <p className="text-slate-500 mt-2 text-sm leading-relaxed mb-8">Sign in with your medical credentials to manage appointments, patient consultations, and health records.</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Doctor ID / License Number (Demo: 1234)</label>
              <input 
                type="text" 
                value={hprId}
                onChange={(e) => setHprId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono"
                placeholder="e.g. DOC-1234 or 1234"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                placeholder="Enter password"
              />
            </div>
            {error && (
              <div className="flex items-center gap-2 text-rose-600 bg-rose-50 p-3 rounded-lg text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
            <button 
              type="submit"
              className="w-full bg-slate-900 text-white font-semibold py-3.5 rounded-xl hover:bg-slate-800 transition-colors shadow-sm mt-2 cursor-pointer"
            >
              Sign In as Doctor
            </button>
          </form>
        </div>
      </div>
    );
  }

  // If no doctor is registered in the database, show registration form
  if (!doctor || showRegisterForm) {
    return (
      <div className="flex-grow bg-slate-50 w-full py-12 px-4 sm:px-6">
        <div className="max-w-xl mx-auto bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Register Doctor Profile</h2>
                <p className="text-xs text-slate-500">Add medical practitioner directly to the connected database</p>
              </div>
            </div>
            {doctor && (
              <button 
                onClick={() => setShowRegisterForm(false)}
                className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
              >
                Cancel
              </button>
            )}
          </div>

          <form onSubmit={handleRegisterDoctor} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Doctor Full Name</label>
              <input 
                type="text"
                required
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="e.g. Dr. Vikram Singh"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Specialty</label>
                <input 
                  type="text"
                  required
                  value={newSpecialty}
                  onChange={e => setNewSpecialty(e.target.value)}
                  placeholder="e.g. Cardiologist"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Fee (₹)</label>
                <input 
                  type="number"
                  min="0"
                  value={newFee}
                  onChange={e => setNewFee(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Qualifications</label>
              <input 
                type="text"
                required
                value={newQual}
                onChange={e => setNewQual(e.target.value)}
                placeholder="e.g. MBBS, MD - Cardiology"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Clinic / Hospital</label>
                <input 
                  type="text"
                  value={newClinic}
                  onChange={e => setNewClinic(e.target.value)}
                  placeholder="e.g. Heart Care Clinic"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Address / Location</label>
                <input 
                  type="text"
                  value={newAddress}
                  onChange={e => setNewAddress(e.target.value)}
                  placeholder="e.g. Connaught Place, New Delhi"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-all shadow-sm text-sm mt-4 cursor-pointer"
            >
              {isSubmitting ? 'Saving to Database...' : 'Register Doctor Profile'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow bg-slate-50 w-full pb-12">
      {/* Top Navbar specifically for Doctor */}
      <div className="bg-slate-900 border-b border-slate-800 sticky top-0 z-10 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500/20 text-blue-400 rounded-lg flex items-center justify-center border border-blue-500/30">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-lg font-semibold leading-tight">{doctor.name}</h1>
              <p className="text-[11px] text-slate-400 hidden sm:block">{doctor.specialty} • {doctor.clinic}</p>
            </div>
            <span className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/30">
              <CheckCircle2 className="w-3 h-3" /> HPR Verified
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={logout}
              className="text-sm font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{queue.length}</div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Patients in Queue</div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">~15 mins</div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Average Consult Time</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">
                {queue.filter(p => p.status === 'Completed').length} Completed
              </div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Today's Sessions</div>
            </div>
          </div>
        </div>

        {toastMessage && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main OPD Queue */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Live OPD Waiting Queue</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Synced with ABDM Token Allocation System</p>
                </div>
                <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
                  {queue.filter(p => p.status !== 'Completed').length} Waiting
                </span>
              </div>

              {queue.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800">No Patients in Waiting Queue</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    When patients book appointments through the portal, their tokens will appear here in real-time.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {queue.map((patient) => (
                    <div 
                      key={patient.id} 
                      className={`p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors ${
                        patient.active ? 'bg-blue-50/40 border-l-4 border-l-blue-600' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl font-bold flex items-center justify-center shrink-0 ${
                          patient.status === 'In Consult' ? 'bg-emerald-100 text-emerald-700' :
                          patient.status === 'Waiting' ? 'bg-amber-100 text-amber-700' :
                          patient.status === 'Completed' ? 'bg-slate-100 text-slate-400' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          #{patient.id}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-900">{patient.name}</h3>
                            <span className="text-xs text-slate-400">({patient.age})</span>
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                              patient.status === 'In Consult' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                              patient.status === 'Waiting' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                              patient.status === 'Completed' ? 'bg-slate-50 text-slate-500 border border-slate-200' :
                              'bg-blue-50 text-blue-600 border border-blue-200'
                            }`}>
                              {patient.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                            <span>{patient.type}</span>
                            <span>•</span>
                            <span className="font-mono text-slate-400">{patient.abha}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        {patient.status === 'Waiting' && (
                          <button 
                            onClick={() => handleStartConsult(patient.id, patient.name)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
                          >
                            Call Patient
                          </button>
                        )}
                        {patient.status === 'In Consult' && (
                          <button 
                            onClick={() => handleFinishConsult(patient.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
                          >
                            Complete Consult
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Consent Gateway Box */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center gap-2 text-indigo-900 font-bold text-base mb-1">
                <ShieldAlert className="w-5 h-5 text-indigo-600" />
                <span>ABDM Patient Consent</span>
              </div>
              <p className="text-xs text-slate-500 mb-6">
                Request secure digital consent to view a patient's historical medical records and test reports.
              </p>

              <form onSubmit={handleSendConsent} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Patient ABHA ID</label>
                  <input 
                    type="text" 
                    value={patientAbha}
                    onChange={(e) => setPatientAbha(e.target.value)}
                    placeholder="e.g. username@abdm"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                {requestSent && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Consent request sent to patient's phone/ABHA app.</span>
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={isSendingConsent || !patientAbha}
                  className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all shadow-sm text-xs cursor-pointer"
                >
                  {isSendingConsent ? 'Sending Notification...' : 'Request Consent Artifact'}
                </button>
              </form>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
