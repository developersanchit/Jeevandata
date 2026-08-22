import { Building2, Bed, Activity, ShieldAlert, Database, CheckCircle2, Lock } from 'lucide-react';
import { useState } from 'react';

export default function HospitalPortal() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [beds, setBeds] = useState(42);
  const [emergencyActive, setEmergencyActive] = useState(true);

  if (!isLoggedIn) {
    return (
      <div className="flex-grow w-full max-w-md mx-auto px-4 py-20 flex flex-col items-center justify-center">
        <div className="w-full bg-white rounded-3xl shadow-xl shadow-blue-100/50 border border-slate-200 p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Building2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Facility Login</h2>
          <p className="text-slate-500 mb-8 text-sm">Authenticate via Health Facility Registry (HFR)</p>
          
          <form onSubmit={(e) => { e.preventDefault(); setIsLoggedIn(true); }} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">HFR Facility ID</label>
              <input type="text" required placeholder="e.g. HFR-DL-1092" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Admin Password</label>
              <input type="password" required placeholder="••••••••" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium" />
            </div>
            <button type="submit" className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 active:scale-95 transition-all mt-4">
              <Lock className="w-4 h-4" /> Access Dashboard
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
            <Building2 className="text-blue-500 w-8 h-8" /> 
            Facility Management
          </h2>
          <p className="text-slate-500 mt-2">
            Update live registry status for Safdarjung Hospital.
          </p>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-lg flex items-center gap-2 text-emerald-700 text-sm font-bold">
          <CheckCircle2 className="w-4 h-4" />
          HFR Verified Facility
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-slate-700 font-bold">
              <Bed className="w-5 h-5 text-blue-500" /> Available Beds
            </div>
            <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded uppercase tracking-wider">Live Sync</span>
          </div>
          <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
            <button 
              onClick={() => setBeds(Math.max(0, beds - 1))}
              className="w-12 h-12 rounded-lg bg-white border border-slate-200 shadow-sm flex items-center justify-center text-xl font-bold text-slate-600 hover:bg-slate-50 active:scale-95 transition-all"
            >-</button>
            <div className="text-4xl font-extrabold text-blue-700">{beds}</div>
            <button 
              onClick={() => setBeds(beds + 1)}
              className="w-12 h-12 rounded-lg bg-white border border-slate-200 shadow-sm flex items-center justify-center text-xl font-bold text-slate-600 hover:bg-slate-50 active:scale-95 transition-all"
            >+</button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-slate-700 font-bold">
              <ShieldAlert className="w-5 h-5 text-red-500" /> Emergency Department
            </div>
          </div>
          <div className={`p-4 rounded-xl border transition-all ${emergencyActive ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-900">Routing Status</span>
              <span className={`font-extrabold ${emergencyActive ? 'text-red-600' : 'text-slate-400'}`}>
                {emergencyActive ? 'ACTIVE' : 'INACTIVE'}
              </span>
            </div>
            <p className="text-sm text-slate-500 mb-4">
              {emergencyActive 
                ? 'Your hospital is currently receiving emergency ambulance routing.' 
                : 'Emergency routing is paused. Ambulances will bypass.'}
            </p>
            <button 
              onClick={() => setEmergencyActive(!emergencyActive)}
              className={`w-full py-3 rounded-xl font-bold transition-all ${
                emergencyActive 
                  ? 'bg-red-600 text-white hover:bg-red-700 shadow-md shadow-red-200' 
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              {emergencyActive ? 'Pause Emergency Routing' : 'Activate Emergency Routing'}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Database className="w-5 h-5 text-amber-500" /> Integration Health
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 border border-slate-100 rounded-xl bg-slate-50 flex flex-col justify-between">
            <span className="text-sm font-bold text-slate-600">ABDM HFR Node</span>
            <span className="text-emerald-600 font-bold flex items-center gap-1 mt-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Connected
            </span>
          </div>
          <div className="p-4 border border-slate-100 rounded-xl bg-slate-50 flex flex-col justify-between">
            <span className="text-sm font-bold text-slate-600">eRaktKosh Blood API</span>
            <span className="text-emerald-600 font-bold flex items-center gap-1 mt-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Auto-sync Active
            </span>
          </div>
          <div className="p-4 border border-slate-100 rounded-xl bg-slate-50 flex flex-col justify-between">
            <span className="text-sm font-bold text-slate-600">Ambulance Dispatch</span>
            <span className="text-emerald-600 font-bold flex items-center gap-1 mt-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Connected
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
