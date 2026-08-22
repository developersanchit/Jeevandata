import { Stethoscope, FileText, CheckCircle2, Users, Clock, Search, LogOut, ChevronRight, Activity, Calendar, AlertCircle, Plus, FileSignature, Pill, ClipboardList } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function DoctorPortal() {
  const { isLoggedIn, error, login, logout } = useAuth('doctor');
  const [hprId, setHprId] = useState('');
  const [password, setPassword] = useState('');
  
  const [patientAbha, setPatientAbha] = useState('');
  const [requestSent, setRequestSent] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(hprId, password);
  };

  if (!isLoggedIn) {
    return (
      <div className="flex-grow w-full bg-slate-50 flex items-center justify-center p-4 min-h-[calc(100vh-64px)]">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-8 pb-6 border-b border-slate-100 text-center">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Stethoscope className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Doctor Portal</h2>
            <p className="text-slate-500 mt-2 text-sm">Sign in with your HPR ID to continue.</p>
          </div>
          
          <div className="p-8 pt-6">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-medium rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">HPR ID</label>
                <input 
                  type="text" 
                  required 
                  value={hprId}
                  onChange={(e) => setHprId(e.target.value)}
                  placeholder="e.g. 1234-5678-9012" 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all text-sm font-medium placeholder-slate-400" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                <input 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all text-sm font-medium placeholder-slate-400" 
                />
              </div>
              <button type="submit" className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-medium py-3 rounded-xl hover:bg-indigo-700 transition-colors mt-2">
                Secure Login
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow bg-slate-50 w-full pb-12">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight">Dr. Sarah Jenkins</h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Senior Cardiologist | AIIMS Delhi</p>
            </div>
            <span className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 ml-2 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider border border-emerald-200">
              <CheckCircle2 className="w-3 h-3" /> Verified HPR
            </span>
          </div>
          <button 
            onClick={logout}
            className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Quick Actions / Request Records */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-500" /> ABDM Consent Manager
                </h2>
                <p className="text-sm text-slate-500 mt-1">Request digital health records from patients for clinical review.</p>
              </div>
            </div>
            
            {!requestSent ? (
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Search className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={patientAbha}
                    onChange={(e) => setPatientAbha(e.target.value)}
                    placeholder="Enter Patient ABHA Address (e.g. rahul@abdm)"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium transition-all"
                  />
                </div>
                <button 
                  onClick={() => { if(patientAbha) setRequestSent(true); }}
                  className="bg-indigo-600 text-white font-medium px-8 py-3 rounded-xl hover:bg-indigo-700 transition-colors shrink-0 text-sm shadow-sm shadow-indigo-200"
                >
                  Request Access
                </button>
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-emerald-900 text-sm">Request Sent to {patientAbha}</p>
                    <p className="text-xs text-emerald-700 mt-0.5">Waiting for patient to approve via their PHR application.</p>
                  </div>
                </div>
                <button 
                  onClick={() => { setRequestSent(false); setPatientAbha(''); }}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 bg-emerald-100/50 px-4 py-2 rounded-lg transition-colors border border-emerald-200"
                >
                  New Request
                </button>
              </div>
            )}
            
            <div className="mt-6 pt-6 border-t border-slate-100">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Recently Granted Consents</h3>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {['Sneha Rao', 'Vikram Singh', 'Aarti Sharma'].map((name, i) => (
                  <div key={i} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 shrink-0">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold">
                      {name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span className="text-xs font-medium text-slate-700">{name}</span>
                    <FileText className="w-3.5 h-3.5 text-slate-400 ml-2" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Today's Appointments */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Today's Queue</h2>
                <p className="text-sm text-slate-500 mt-1">Oct 24, 2025 • 3 Appointments Remaining</p>
              </div>
              <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">
                View Calendar
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {[
                { name: 'Rahul Verma', age: '45M', time: '10:30 AM', status: 'Waiting', type: 'Post-Op Follow-up', abha: 'rahul.v@abdm', active: true },
                { name: 'Priya Patel', age: '32F', time: '11:15 AM', status: 'Scheduled', type: 'Initial Consultation', abha: 'priya99@abdm', active: false },
                { name: 'Amit Singh', age: '58M', time: '12:00 PM', status: 'Scheduled', type: 'ECG Report Review', abha: 'amits@abdm', active: false }
              ].map((patient, i) => (
                <div key={i} className={`p-6 transition-colors ${patient.active ? 'bg-indigo-50/30' : 'hover:bg-slate-50'}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border ${
                        patient.active ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {patient.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-bold text-slate-900">{patient.name}</h3>
                          <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{patient.age}</span>
                        </div>
                        <p className="text-xs font-medium text-slate-600 mb-2">{patient.type}</p>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1.5 font-medium"><Clock className="w-3.5 h-3.5 text-indigo-500" /> {patient.time}</span>
                          <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> {patient.abha}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 sm:flex-col sm:items-end sm:gap-2">
                       <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        patient.status === 'Waiting' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                        'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {patient.status}
                      </span>
                      {patient.active ? (
                        <button className="text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition-colors mt-1 shadow-sm shadow-indigo-200">
                          Start Consult
                        </button>
                      ) : (
                        <button className="text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 px-4 py-2 rounded-lg transition-colors mt-1">
                          View History
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column / Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          
          <button className="w-full bg-slate-900 text-white font-semibold py-3.5 rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-sm">
            <Plus className="w-5 h-5" /> Write Prescription
          </button>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-sm font-semibold text-slate-900 mb-4">Practice Overview</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-500 font-medium mb-1">Patients Today</p>
                <p className="text-2xl font-bold text-slate-900">14</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-500 font-medium mb-1">Pending Reports</p>
                <p className="text-2xl font-bold text-amber-600">3</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 col-span-2 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1">Active Consents</p>
                  <p className="text-2xl font-bold text-emerald-600">28</p>
                </div>
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Activity className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-sm font-semibold text-slate-900 mb-4">Quick Links</h2>
            <div className="space-y-2">
              <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 text-sm font-medium text-slate-700 transition-colors border border-transparent hover:border-slate-200 group">
                <span className="flex items-center gap-3"><ClipboardList className="w-4 h-4 text-indigo-500" /> Lab Results Queue</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500" />
              </button>
              <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 text-sm font-medium text-slate-700 transition-colors border border-transparent hover:border-slate-200 group">
                <span className="flex items-center gap-3"><FileSignature className="w-4 h-4 text-indigo-500" /> Draft e-Referrals</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500" />
              </button>
              <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 text-sm font-medium text-slate-700 transition-colors border border-transparent hover:border-slate-200 group">
                <span className="flex items-center gap-3"><Pill className="w-4 h-4 text-indigo-500" /> Saved Rx Templates</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

