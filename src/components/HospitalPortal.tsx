import { Building2, Bed, Activity, ShieldAlert, Database, CheckCircle2, LogOut, AlertCircle, RefreshCw, Power, Plus, ChevronDown, X, MapPin } from 'lucide-react';
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useAppContext } from '../context/AppContext';

const ALL_FACILITY_SERVICES = [
  'CT Scan', 'Burn Ward', 'ICU', 'MRI', 'X-Ray', 
  '24/7 Pharmacy', 'Ambulance', 'Robotic Surgery', 'Dialysis', 'Neonatal ICU'
];

export default function HospitalPortal() {
  const { isLoggedIn, error, login, logout } = useAuth('hospital');
  const { hospitals, updateHospital, registerHospital } = useAppContext();
  
  const [selectedId, setSelectedId] = useState<string>('');
  const hospital = hospitals.find(h => h.id === selectedId) || hospitals[0];

  const [hfrId, setHfrId] = useState('');
  const [password, setPassword] = useState('');

  // Centre Switcher & Add Centre Modal States
  const [showCentreSwitcher, setShowCentreSwitcher] = useState(false);
  const [showAddCentreModal, setShowAddCentreModal] = useState(false);

  // New Hospital / Centre Registration State
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<'Government' | 'Private' | 'Trust'>('Government');
  const [newAddress, setNewAddress] = useState('');
  const [newPhone, setNewPhone] = useState('+91-11-');
  const [newBeds, setNewBeds] = useState(40);
  const [newEmergency, setNewEmergency] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const toggleService = (service: string) => {
    if (!hospital) return;
    const currentServices = hospital.services || [];
    const newServices = currentServices.includes(service) 
      ? currentServices.filter(s => s !== service) 
      : [...currentServices, service];
    updateHospital(hospital.id, { services: newServices });
  };

  const enableAllServices = () => hospital && updateHospital(hospital.id, { services: [...ALL_FACILITY_SERVICES] });
  const disableAllServices = () => hospital && updateHospital(hospital.id, { services: [] });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(hfrId, password);
  };

  const handleCreateHospital = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setIsSubmitting(true);
    try {
      const created = await registerHospital({
        name: newName.trim(),
        type: newType,
        address: newAddress.trim() || 'New Delhi, India',
        phone: newPhone.trim() || '+91-11-26165060',
        specialties: ['Trauma', 'Emergency Care', 'Cardiology', 'General Medicine'],
        services: ['ICU', 'CT Scan', 'Ambulance', '24/7 Pharmacy', 'X-Ray'],
        emergencyServices: newEmergency,
        bedsAvailable: Number(newBeds) || 0,
        bloodBank: true,
        lat: 28.5682 + (Math.random() - 0.5) * 0.05,
        lng: 77.2069 + (Math.random() - 0.5) * 0.05
      });
      setSelectedId(created.id);
      setShowAddCentreModal(false);
      setNewName('');
      setNewAddress('');
      showToast(`Centre "${created.name}" registered and activated!`);
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Error registering centre');
    }
    setIsSubmitting(false);
  };

  if (!isLoggedIn) {
    return (
      <div className="flex-grow flex items-center justify-center bg-slate-50 px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 text-blue-600 border border-blue-200 shadow-sm">
            <Building2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Hospital Staff Sign In</h2>
          <p className="text-slate-500 mt-2 text-sm leading-relaxed mb-8">Sign in to your hospital administration portal to update real-time bed capacity, critical facilities, and emergency routing.</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Hospital ID or Facility Code (Demo: 1234)</label>
              <input 
                type="text" 
                value={hfrId}
                onChange={(e) => setHfrId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono"
                placeholder="e.g. HOSP-1234 or 1234"
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
              Sign In to Hospital Portal
            </button>
          </form>
        </div>
      </div>
    );
  }

  // If no hospital exists at all in the database, prompt to create the first centre
  if (!hospital) {
    return (
      <div className="flex-grow bg-slate-50 w-full py-12 px-4 sm:px-6">
        <div className="max-w-xl mx-auto bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Add Your First Hospital Centre</h2>
              <p className="text-xs text-slate-500">Register your healthcare facility directly to the database</p>
            </div>
          </div>

          <form onSubmit={handleCreateHospital} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Centre / Hospital Name</label>
              <input 
                type="text"
                required
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="e.g. Safdarjung Hospital"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Centre Type</label>
                <select 
                  value={newType}
                  onChange={e => setNewType(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
                >
                  <option value="Government">Government</option>
                  <option value="Private">Private</option>
                  <option value="Trust">Trust</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Total Available Beds</label>
                <input 
                  type="number"
                  min="0"
                  value={newBeds}
                  onChange={e => setNewBeds(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Address / Street</label>
              <input 
                type="text"
                required
                value={newAddress}
                onChange={e => setNewAddress(e.target.value)}
                placeholder="Hospital location & street"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Emergency Phone</label>
              <input 
                type="text"
                value={newPhone}
                onChange={e => setNewPhone(e.target.value)}
                placeholder="+91-11-..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all shadow-sm text-sm mt-4 cursor-pointer"
            >
              {isSubmitting ? 'Registering Centre...' : 'Add Centre to Database'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow bg-slate-50 w-full pb-12">
      {/* Top Navbar for Hospital with Centre Switcher and Add Centre Button */}
      <div className="bg-slate-900 border-b border-slate-800 sticky top-0 z-20 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500/20 text-blue-400 rounded-lg flex items-center justify-center border border-blue-500/30 shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold leading-tight truncate max-w-[200px] sm:max-w-sm">
                  {hospital.name}
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/30 shrink-0">
                  <CheckCircle2 className="w-3 h-3" /> Live
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-[220px] sm:max-w-md hidden sm:block">
                {hospital.address}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Centre Profile Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowCentreSwitcher(!showCentreSwitcher)}
                className="flex items-center gap-1.5 sm:gap-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg border border-slate-700 cursor-pointer transition-colors"
                title="Switch Active Centre Profile"
              >
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                <span className="font-semibold hidden md:inline">Switch Centre</span>
                <span className="font-semibold md:hidden">Centre</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showCentreSwitcher && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowCentreSwitcher(false)}></div>
                  <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-40 animate-in fade-in zoom-in-95 duration-150 text-slate-900">
                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hospital Centres ({hospitals.length})</p>
                      <button 
                        onClick={() => {
                          setShowCentreSwitcher(false);
                          setShowAddCentreModal(true);
                        }}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add New</span>
                      </button>
                    </div>

                    <div className="p-2 max-h-72 overflow-y-auto space-y-1">
                      {hospitals.map(h => {
                        const isCurrent = h.id === hospital.id;
                        return (
                          <button
                            key={h.id}
                            onClick={() => {
                              setSelectedId(h.id);
                              setShowCentreSwitcher(false);
                              showToast(`Switched profile to "${h.name}"`);
                            }}
                            className={`w-full text-left p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-3 ${
                              isCurrent ? 'bg-blue-50/80 border border-blue-200 text-blue-950 font-semibold' : 'hover:bg-slate-50 text-slate-700 border border-transparent'
                            }`}
                          >
                            <div className="min-w-0">
                              <p className="text-xs font-bold truncate">{h.name}</p>
                              <p className="text-[10px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3 shrink-0" />
                                <span>{h.address}</span>
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                                  {h.type}
                                </span>
                                <span className="text-[10px] text-emerald-600 font-semibold">
                                  {h.bedsAvailable ?? 0} Beds Available
                                </span>
                              </div>
                            </div>

                            {isCurrent && (
                              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Add Centre Button */}
            <button
              onClick={() => setShowAddCentreModal(true)}
              className="flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg border border-blue-500 cursor-pointer transition-colors shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add a Centre</span>
            </button>

            {/* Sign Out Button */}
            <button 
              onClick={logout}
              className="text-xs sm:text-sm font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer ml-1"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {toastMessage && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Main Hospital Management Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Bed Management */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <Bed className="w-5 h-5 text-blue-500" /> Ward Availability
                </h2>
                <p className="text-sm text-slate-500 mt-1">Live capacity for {hospital.name}.</p>
              </div>
              <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                <RefreshCw className="w-3 h-3" /> Live Sync
              </span>
            </div>
            
            <div className="flex-grow flex items-center justify-center p-8 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center gap-8">
                <button 
                  onClick={() => updateHospital(hospital.id, { bedsAvailable: Math.max(0, (hospital.bedsAvailable || 0) - 1) })}
                  className="w-14 h-14 bg-white border border-slate-200 shadow-sm rounded-2xl flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:border-slate-300 active:scale-95 transition-all cursor-pointer"
                >
                  <span className="text-2xl font-medium leading-none">-</span>
                </button>
                <div className="text-center w-24">
                  <span className="block text-5xl font-bold text-slate-900">{hospital.bedsAvailable || 0}</span>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-2 block">Beds</span>
                </div>
                <button 
                  onClick={() => updateHospital(hospital.id, { bedsAvailable: (hospital.bedsAvailable || 0) + 1 })}
                  className="w-14 h-14 bg-white border border-slate-200 shadow-sm rounded-2xl flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:border-slate-300 active:scale-95 transition-all cursor-pointer"
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
            
            <div className={`flex-grow p-8 rounded-xl border flex flex-col justify-center items-center text-center transition-colors ${hospital.emergencyServices ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-200'}`}>
               <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${hospital.emergencyServices ? 'bg-red-100 text-red-600' : 'bg-slate-200 text-slate-400'}`}>
                 <Activity className={`w-8 h-8 ${hospital.emergencyServices ? 'animate-pulse' : ''}`} />
               </div>
               <h3 className={`text-xl font-bold mb-1 ${hospital.emergencyServices ? 'text-red-900' : 'text-slate-600'}`}>
                 {hospital.emergencyServices ? 'Accepting Emergencies' : 'Routing Paused'}
               </h3>
               <p className={`text-sm mb-6 ${hospital.emergencyServices ? 'text-red-700/80' : 'text-slate-500'}`}>
                 {hospital.emergencyServices ? 'Ambulances will be routed to your trauma center based on proximity.' : 'Ambulances will automatically bypass your facility.'}
               </p>
               <button 
                 onClick={() => updateHospital(hospital.id, { emergencyServices: !hospital.emergencyServices })}
                 className={`w-full max-w-[240px] flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm transition-all cursor-pointer ${
                   hospital.emergencyServices 
                   ? 'bg-red-600 text-white hover:bg-red-700 shadow-sm shadow-red-200' 
                   : 'bg-slate-900 text-white hover:bg-slate-800'
                 }`}
               >
                 <Power className="w-4 h-4" />
                 {hospital.emergencyServices ? 'Pause Routing' : 'Activate Routing'}
               </button>
            </div>
          </div>
        </div>

        {/* Diagnostic Services */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <Database className="w-5 h-5 text-indigo-500" /> Critical Facility Services
              </h2>
              <p className="text-sm text-slate-500 mt-1">Check the real-time operational status of equipment and care units.</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={enableAllServices}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                Enable All
              </button>
              <button 
                onClick={disableAllServices}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                Disable All
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {ALL_FACILITY_SERVICES.map(service => {
              const active = (hospital.services || []).includes(service);
              return (
                <button
                  key={service}
                  onClick={() => toggleService(service)}
                  className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    active 
                    ? 'bg-blue-50/50 border-blue-200 text-blue-900' 
                    : 'bg-slate-50 border-slate-200/80 text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <span className="text-xs font-semibold">{service}</span>
                  <div className={`w-3 h-3 rounded-full border ${active ? 'bg-blue-600 border-blue-600' : 'bg-transparent border-slate-300'}`} />
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Add Centre Modal Overlay */}
      {showAddCentreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 text-slate-900">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
            
            <button 
              onClick={() => setShowAddCentreModal(false)}
              className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="bg-slate-900 p-6 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600/30 text-blue-400 rounded-xl flex items-center justify-center border border-blue-500/30">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Add New Healthcare Centre</h3>
                  <p className="text-xs text-slate-400">Register facility directly to the external database</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleCreateHospital} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Centre / Hospital Name</label>
                <input 
                  type="text"
                  required
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="e.g. AIIMS Main Campus or Max Healthcare"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Centre Type</label>
                  <select 
                    value={newType}
                    onChange={e => setNewType(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
                  >
                    <option value="Government">Government</option>
                    <option value="Private">Private</option>
                    <option value="Trust">Trust</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Available Beds</label>
                  <input 
                    type="number"
                    min="0"
                    value={newBeds}
                    onChange={e => setNewBeds(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Full Address / Location</label>
                <input 
                  type="text"
                  required
                  value={newAddress}
                  onChange={e => setNewAddress(e.target.value)}
                  placeholder="Street, District, City"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Emergency Helpline Phone</label>
                <input 
                  type="text"
                  value={newPhone}
                  onChange={e => setNewPhone(e.target.value)}
                  placeholder="+91-11-..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input 
                  type="checkbox"
                  id="emergency-modal"
                  checked={newEmergency}
                  onChange={e => setNewEmergency(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="emergency-modal" className="text-xs font-medium text-slate-700 cursor-pointer">
                  Accept 24/7 Emergency & Trauma Center admissions
                </label>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddCentreModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition-all shadow-sm text-xs cursor-pointer"
                >
                  {isSubmitting ? 'Registering...' : 'Add Centre'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
