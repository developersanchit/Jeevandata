import { Stethoscope, FileText, CheckCircle2, Users, Clock, Search, Lock } from 'lucide-react';
import { useState } from 'react';

export default function DoctorPortal() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [patientAbha, setPatientAbha] = useState('');
  const [requestSent, setRequestSent] = useState(false);

  if (!isLoggedIn) {
    return (
      <div className="flex-grow w-full max-w-md mx-auto px-4 py-20 flex flex-col items-center justify-center">
        <div className="w-full bg-white rounded-3xl shadow-xl shadow-indigo-100/50 border border-slate-200 p-8 text-center">
          <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Stethoscope className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Practitioner Login</h2>
          <p className="text-slate-500 mb-8 text-sm">Authenticate via Healthcare Professionals Registry (HPR)</p>
          
          <form onSubmit={(e) => { e.preventDefault(); setIsLoggedIn(true); }} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">HPR ID</label>
              <input type="text" required placeholder="e.g. 1234-5678-9012" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Password</label>
              <input type="password" required placeholder="••••••••" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium" />
            </div>
            <button type="submit" className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-700 active:scale-95 transition-all mt-4">
              <Lock className="w-4 h-4" /> Secure Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow w-full max-w-5xl mx-auto px-4 sm:px-8 py-8 flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <Stethoscope className="text-indigo-500 w-8 h-8" /> 
            Practitioner Portal
          </h2>
          <p className="text-slate-500 mt-2">
            Manage consultations and access verified health records.
          </p>
        </div>
        <div className="bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-lg flex items-center gap-2 text-indigo-700 text-sm font-bold">
          <CheckCircle2 className="w-4 h-4" />
          HPR Verified: Dr. Sharma
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Request Records Module */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-500" /> Request Patient Records
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              Enter a patient's ABHA address to request access to their digital health records via the consent manager.
            </p>
            
            {!requestSent ? (
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="w-5 h-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={patientAbha}
                    onChange={(e) => setPatientAbha(e.target.value)}
                    placeholder="patientname@abdm"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-medium"
                  />
                </div>
                <button 
                  onClick={() => { if(patientAbha) setRequestSent(true); }}
                  className="bg-indigo-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-indigo-700 active:scale-95 transition-all shrink-0"
                >
                  Send Request
                </button>
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-emerald-900 text-sm">Consent Request Sent</p>
                    <p className="text-xs text-emerald-700 mt-0.5">Awaiting patient approval on their device.</p>
                  </div>
                </div>
                <button 
                  onClick={() => { setRequestSent(false); setPatientAbha(''); }}
                  className="text-sm font-bold text-emerald-700 hover:text-emerald-800"
                >
                  Reset
                </button>
              </div>
            )}
          </div>

          {/* Today's Schedule */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-slate-400" /> Today's Consultations
              </h3>
            </div>
            <div className="divide-y divide-slate-100">
              {[
                { name: 'Rahul Verma', time: '10:30 AM', status: 'Waiting', abha: 'rahul.v@abdm' },
                { name: 'Priya Patel', time: '11:15 AM', status: 'In Progress', abha: 'priya99@abdm' },
                { name: 'Amit Singh', time: '12:00 PM', status: 'Scheduled', abha: 'amits@abdm' }
              ].map((patient, i) => (
                <div key={i} className="p-4 sm:p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="font-bold text-slate-900">{patient.name}</p>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {patient.time} &bull; {patient.abha}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    patient.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                    patient.status === 'Waiting' ? 'bg-amber-100 text-amber-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {patient.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-sm">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div>
                <p className="text-slate-400 text-sm">Patients Today</p>
                <p className="text-3xl font-extrabold mt-1">14</p>
              </div>
              <div className="pt-4 border-t border-slate-700">
                <p className="text-slate-400 text-sm">Pending Consents</p>
                <p className="text-3xl font-extrabold mt-1 text-amber-400">2</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
