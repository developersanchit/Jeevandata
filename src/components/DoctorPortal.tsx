import { Stethoscope, FileText, CheckCircle2, Users, Clock, Search, LogOut, ChevronRight, Activity, Calendar, AlertCircle, Plus, FileSignature, Pill, ClipboardList, ShieldAlert } from 'lucide-react';
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useAppContext, PatientQueueItem } from '../context/AppContext';

export default function DoctorPortal() {
  const { isLoggedIn, error, login, logout } = useAuth('doctor');
  const { doctorQueues, updateDoctorQueue } = useAppContext();
  
  // Representing Dr. Vikram Singh
  const doctorId = 'doc-001';
  const queue = doctorQueues[doctorId] || [];

  const [hprId, setHprId] = useState('');
  const [password, setPassword] = useState('');
  
  const [patientAbha, setPatientAbha] = useState('');
  const [requestSent, setRequestSent] = useState(false);
  const [isSendingConsent, setIsSendingConsent] = useState(false);

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

  return (
    <div className="flex-grow bg-slate-50 w-full pb-12">
      {/* Top Navbar specifically for Doctor */}
      <div className="bg-slate-900 border-b border-slate-800 sticky top-0 z-10 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500/20 text-blue-400 rounded-lg flex items-center justify-center border border-blue-500/30">
              <Stethoscope className="w-4 h-4" />
            </div>
            <h1 className="text-lg font-semibold">Dr. Vikram Singh</h1>
            <span className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/30">
              <CheckCircle2 className="w-3 h-3" /> HPR Verified
            </span>
          </div>
          <button 
            onClick={logout}
            className="text-sm font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 mb-1">Total Patients Today</p>
              <h3 className="text-3xl font-bold text-slate-900">{queue.length}</h3>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 mb-1">Consultations Done</p>
              <h3 className="text-3xl font-bold text-slate-900">
                {queue.filter(q => q.status === 'Completed').length}
              </h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 mb-1">Waiting in Queue</p>
              <h3 className="text-3xl font-bold text-slate-900">
                {queue.filter(q => q.status === 'Waiting' || q.status === 'Scheduled').length}
              </h3>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          
          {/* Main Queue Management */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Today's Queue</h2>
                  <p className="text-sm text-slate-500">Manage walk-ins and scheduled appointments</p>
                </div>
                <button className="hidden sm:flex text-sm font-medium text-blue-600 hover:text-blue-700 items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                  <Plus className="w-4 h-4" /> Add Walk-in
                </button>
              </div>
              
              <div className="divide-y divide-slate-100">
                {queue.map((patient) => (
                  <div 
                    key={patient.id} 
                    className={`p-6 transition-all ${patient.active ? 'bg-blue-50/30' : 'hover:bg-slate-50'}`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 ${
                          patient.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                          patient.status === 'In Consult' ? 'bg-blue-600 text-white shadow-md shadow-blue-200' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {patient.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-base font-bold text-slate-900">{patient.name}</h3>
                            <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                              {patient.age}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-slate-500">
                            <span className="flex items-center gap-1 font-medium text-slate-700">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              {patient.time}
                            </span>
                            <span className="hidden sm:inline">•</span>
                            <span>{patient.type}</span>
                            <span className="hidden sm:inline">•</span>
                            <span className="font-mono text-xs">{patient.abha}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                          patient.status === 'Waiting' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                          patient.status === 'In Consult' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                          patient.status === 'Completed' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                          'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {patient.status}
                        </span>
                        
                        {patient.status === 'Waiting' && (
                          <button 
                            onClick={() => handleStartConsult(patient.id, patient.name)}
                            className="text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 px-4 py-2 rounded-lg transition-colors w-full sm:w-auto"
                          >
                            Start Consult
                          </button>
                        )}
                        {patient.status === 'In Consult' && (
                          <button 
                            onClick={() => handleFinishConsult(patient.id)}
                            className="text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg shadow-sm shadow-emerald-200 transition-colors w-full sm:w-auto flex items-center justify-center gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Finish
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Active Consultation Panel */}
                    {patient.status === 'In Consult' && (
                      <div className="mt-6 ml-16 border border-blue-100 bg-white rounded-xl p-4 shadow-sm animate-in fade-in slide-in-from-top-2">
                        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                          <button className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold border border-blue-100 whitespace-nowrap">
                            <ClipboardList className="w-3.5 h-3.5" /> E-Prescription
                          </button>
                          <button className="flex items-center gap-2 px-3 py-2 bg-slate-50 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold border border-slate-200 whitespace-nowrap transition-colors">
                            <FileSignature className="w-3.5 h-3.5" /> Request Lab Test
                          </button>
                          <button className="flex items-center gap-2 px-3 py-2 bg-slate-50 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold border border-slate-200 whitespace-nowrap transition-colors">
                            <Activity className="w-3.5 h-3.5" /> View Vitals
                          </button>
                        </div>
                        
                        <div className="space-y-3">
                           <div className="relative">
                             <Pill className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                             <input type="text" placeholder="Add medication..." className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                           </div>
                           <div className="relative">
                             <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                             <input type="text" placeholder="Clinical notes (will sync to ABHA)" className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                           </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {queue.length === 0 && (
                  <div className="p-12 text-center text-slate-500">
                    No patients in queue for today.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* ABHA Consent Request */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">ABHA Records</h3>
                  <p className="text-xs text-slate-500">Request patient history</p>
                </div>
              </div>
              
              <form onSubmit={handleSendConsent} className="space-y-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    value={patientAbha}
                    onChange={e => setPatientAbha(e.target.value)}
                    placeholder="Enter ABHA Address" 
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={!patientAbha || isSendingConsent || requestSent}
                  className="w-full bg-slate-900 text-white font-medium py-2.5 rounded-xl text-sm hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center justify-center h-10"
                >
                  {isSendingConsent ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : requestSent ? (
                    <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Request Sent</span>
                  ) : (
                    'Request Consent'
                  )}
                </button>
              </form>
              <p className="text-[11px] text-slate-400 mt-3 text-center">Patient must approve via PHR app (e.g. ABHA app)</p>
            </div>
            
            {/* Recent Notifications */}
            <div className="bg-slate-900 rounded-2xl shadow-sm p-6 text-white border border-slate-800">
               <h3 className="text-sm font-semibold mb-4 text-slate-300">System Alerts</h3>
               <div className="space-y-4">
                 <div className="flex gap-3 items-start">
                   <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                   <div>
                     <p className="text-sm font-medium">New Guidelines Published</p>
                     <p className="text-xs text-slate-400 mt-1">NMC has updated the e-prescription format requirements for Schedule H drugs.</p>
                   </div>
                 </div>
                 <div className="flex gap-3 items-start">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                   <div>
                     <p className="text-sm font-medium">Consent Approved</p>
                     <p className="text-xs text-slate-400 mt-1">Amit Singh (ABHA: amits@abdm) has approved your record access request.</p>
                   </div>
                 </div>
               </div>
            </div>

          </div>
        </div>
      </div>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <p className="text-sm font-medium">{toastMessage}</p>
        </div>
      )}
    </div>
  );
}
