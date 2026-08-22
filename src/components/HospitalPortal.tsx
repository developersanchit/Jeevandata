import { Building2, Bed, Activity, ShieldAlert, Database, CheckCircle2, LogOut, AlertCircle, RefreshCw, Power } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const ALL_FACILITY_SERVICES = [
  'CT Scan',
  'Burn Ward',
  'ICU',
  'MRI',
  'X-Ray',
  '24/7 Pharmacy',
  'Ambulance',
  'Robotic Surgery',
  'Dialysis',
  'Neonatal ICU'
];

export default function HospitalPortal() {
  const { isLoggedIn, error, login, logout } = useAuth('hospital');
  const [hfrId, setHfrId] = useState('');
  const [password, setPassword] = useState('');
  
  const [beds, setBeds] = useState(42);
  const [emergencyActive, setEmergencyActive] = useState(true);
  const [activeServices, setActiveServices] = useState<string[]>(['CT Scan', 'ICU', 'X-Ray', '24/7 Pharmacy', 'Ambulance']);

  const toggleService = (service: string) => {
    setActiveServices(prev => 
      prev.includes(service) ? prev.filter(s => s !== service) : [...prev, service]
    );
  };

  const enableAllServices = () => setActiveServices([...ALL_FACILITY_SERVICES]);
  const disableAllServices = () => setActiveServices([]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(hfrId, password);
  };

  if (!isLoggedIn) {
    return (
      <div className="flex-grow w-full bg-slate-50 flex items-center justify-center p-4 min-h-[calc(100vh-64px)]">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-8 pb-6 border-b border-slate-100 text-center">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Facility Access</h2>
            <p className="text-slate-500 mt-2 text-sm">Authenticate via Health Facility Registry</p>
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
                <label className="block text-sm font-medium text-slate-700 mb-1.5">HFR Facility ID</label>
                <input 
                  type="text" 
                  required 
                  value={hfrId}
                  onChange={(e) => setHfrId(e.target.value)}
                  placeholder="e.g. HFR-DL-1092" 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-sm font-medium placeholder-slate-400" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Admin Password</label>
                <input 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-sm font-medium placeholder-slate-400" 
                />
              </div>
              <button type="submit" className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-medium py-3 rounded-xl hover:bg-blue-700 transition-colors mt-2">
                Access Dashboard
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow bg-slate-50 w-full pb-12">
      <div className="bg-slate-900 border-b border-slate-800 sticky top-0 z-10 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500/20 text-blue-400 rounded-lg flex items-center justify-center border border-blue-500/30">
              <Building2 className="w-4 h-4" />
            </div>
            <h1 className="text-lg font-semibold">Safdarjung Hospital</h1>
            <span className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/30">
              <CheckCircle2 className="w-3 h-3" /> Verified
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Bed Management */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <Bed className="w-5 h-5 text-blue-500" /> Ward Availability
                </h2>
                <p className="text-sm text-slate-500 mt-1">Update live bed capacity for emergency routing.</p>
              </div>
              <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                <RefreshCw className="w-3 h-3 animate-spin-slow" /> Live Sync
              </span>
            </div>
            
            <div className="flex-grow flex items-center justify-center p-8 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center gap-8">
                <button 
                  onClick={() => setBeds(Math.max(0, beds - 1))}
                  className="w-14 h-14 bg-white border border-slate-200 shadow-sm rounded-2xl flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:border-slate-300 active:scale-95 transition-all"
                >
                  <span className="text-2xl font-medium leading-none">-</span>
                </button>
                <div className="text-center w-24">
                  <span className="block text-5xl font-bold text-slate-900">{beds}</span>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-2 block">Beds</span>
                </div>
                <button 
                  onClick={() => setBeds(beds + 1)}
                  className="w-14 h-14 bg-white border border-slate-200 shadow-sm rounded-2xl flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:border-slate-300 active:scale-95 transition-all"
                >
                  <span className="text-2xl font-medium leading-none">+</span>
                </button>
              </div>
            </div>
          </div>

          {/* Emergency Status */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
             <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-red-500" /> Emergency Routing
                </h2>
                <p className="text-sm text-slate-500 mt-1">Control active status for ambulance diversion.</p>
              </div>
            </div>
            
            <div className={`flex-grow p-8 rounded-xl border flex flex-col justify-center items-center text-center transition-colors ${emergencyActive ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-200'}`}>
               <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${emergencyActive ? 'bg-red-100 text-red-600' : 'bg-slate-200 text-slate-400'}`}>
                 <Activity className={`w-8 h-8 ${emergencyActive ? 'animate-pulse' : ''}`} />
               </div>
               <h3 className={`text-xl font-bold mb-1 ${emergencyActive ? 'text-red-900' : 'text-slate-600'}`}>
                 {emergencyActive ? 'Accepting Emergencies' : 'Routing Paused'}
               </h3>
               <p className={`text-sm mb-6 ${emergencyActive ? 'text-red-700/80' : 'text-slate-500'}`}>
                 {emergencyActive ? 'Ambulances will be routed to your trauma center based on proximity.' : 'Ambulances will automatically bypass your facility.'}
               </p>
               <button 
                 onClick={() => setEmergencyActive(!emergencyActive)}
                 className={`w-full max-w-[240px] flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm transition-all ${
                   emergencyActive 
                   ? 'bg-red-600 text-white hover:bg-red-700 shadow-sm shadow-red-200' 
                   : 'bg-slate-900 text-white hover:bg-slate-800'
                 }`}
               >
                 <Power className="w-4 h-4" />
                 {emergencyActive ? 'Pause Routing' : 'Activate Routing'}
               </button>
            </div>
          </div>
        </div>

        {/* Services Management */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-500" /> Facility Services
              </h2>
              <p className="text-sm text-slate-500 mt-1">Manage available diagnostic and treatment services.</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={enableAllServices}
                className="flex-1 sm:flex-none px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-semibold transition-colors border border-indigo-200"
              >
                Enable All
              </button>
              <button
                onClick={disableAllServices}
                className="flex-1 sm:flex-none px-4 py-2 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-semibold transition-colors border border-slate-200"
              >
                Disable All
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {ALL_FACILITY_SERVICES.map(service => {
              const isEnabled = activeServices.includes(service);
              return (
                <button
                  key={service}
                  onClick={() => toggleService(service)}
                  className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left flex justify-between items-center border ${
                    isEnabled 
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm' 
                    : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  <span className="truncate pr-2">{service}</span>
                  <div className={`w-3 h-3 rounded-full shrink-0 border ${
                    isEnabled ? 'bg-indigo-500 border-indigo-600' : 'bg-slate-100 border-slate-300'
                  }`} />
                </button>
              );
            })}
          </div>
        </div>


      </div>
    </div>
  );
}
