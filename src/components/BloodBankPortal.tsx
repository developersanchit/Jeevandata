import React, { useState } from 'react';
import { Droplet, LogOut, CheckCircle2, ShieldAlert, Activity, Filter, Users, Calendar, Share2, Award, Heart, Plus } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const BLOOD_GROUPS = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

export default function BloodBankPortal() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { bloodBanks, updateBloodBankStock, registerBloodBank } = useAppContext();
  
  const [selectedBankId, setSelectedBankId] = useState<string>('');
  const bloodBank = bloodBanks.find(b => b.id === selectedBankId) || bloodBanks[0];

  // Registration state
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [newName, setNewName] = useState('Indian Red Cross Society Blood Bank');
  const [newAddress, setNewAddress] = useState('1, Red Cross Road, New Delhi');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [toastMessage, setToastMessage] = useState('');

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const login = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticated(true);
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  const bloodStock = bloodBank?.stock || { 'O+': 0, 'O-': 0, 'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0, 'AB+': 0, 'AB-': 0 };

  const handleStockUpdate = (group: string, delta: number) => {
    if (!bloodBank) return;
    updateBloodBankStock(bloodBank.id, group, delta);
    showToast(`Updated ${group} stock to ${Math.max(0, (bloodStock[group] || 0) + delta)} units in database`);
  };

  const handleRegisterBank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    setIsSubmitting(true);
    try {
      const saved = await registerBloodBank({
        name: newName,
        address: newAddress,
        lat: 28.6212,
        lng: 77.2045,
        stock: { 'O+': 50, 'O-': 10, 'A+': 40, 'A-': 5, 'B+': 45, 'B-': 8, 'AB+': 20, 'AB-': 4 },
        lastUpdated: 'Just now'
      });
      setSelectedBankId(saved.id);
      setShowRegisterForm(false);
    } catch (err) {
      console.error(err);
    }
    setIsSubmitting(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex-grow flex items-center justify-center bg-slate-50 px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
          <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center mb-6 text-rose-600 border border-rose-200 shadow-sm">
            <Droplet className="w-8 h-8 fill-current" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Blood Bank Portal</h2>
          <p className="text-slate-500 mt-2 text-sm leading-relaxed mb-8">Access the eRaktKosh inventory management system to update live blood stock and manage donor queues.</p>
          
          <form onSubmit={login} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Organization ID (Demo: 1234)</label>
              <input 
                type="text" 
                defaultValue="BB-77291"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Passcode</label>
              <input 
                type="password" 
                defaultValue="password"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-rose-600 text-white font-semibold py-3.5 rounded-xl hover:bg-rose-700 transition-colors shadow-sm shadow-rose-200 mt-2 cursor-pointer"
            >
              Sign In to Blood Center
            </button>
          </form>
        </div>
      </div>
    );
  }

  // If no blood bank exists in database, show registration form
  if (!bloodBank || showRegisterForm) {
    return (
      <div className="flex-grow bg-slate-50 w-full py-12 px-4 sm:px-6">
        <div className="max-w-xl mx-auto bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center text-rose-600">
                <Droplet className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Register Blood Bank Node</h2>
                <p className="text-xs text-slate-500">Connect your center to eRaktKosh database</p>
              </div>
            </div>
            {bloodBank && (
              <button 
                onClick={() => setShowRegisterForm(false)}
                className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
              >
                Cancel
              </button>
            )}
          </div>

          <form onSubmit={handleRegisterBank} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Blood Bank Name</label>
              <input 
                type="text"
                required
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="e.g. Red Cross Blood Center"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Address / Street</label>
              <input 
                type="text"
                required
                value={newAddress}
                onChange={e => setNewAddress(e.target.value)}
                placeholder="Full address"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-3 rounded-xl transition-all shadow-sm text-sm mt-4 cursor-pointer"
            >
              {isSubmitting ? 'Registering...' : 'Register Blood Bank to Database'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const totalInventory = Object.values(bloodStock).reduce((a: number, b: any) => a + (Number(b) || 0), 0);

  return (
    <div className="flex-grow bg-slate-50 w-full pb-12">
      <div className="bg-slate-900 border-b border-slate-800 sticky top-0 z-10 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-rose-500/20 text-rose-400 rounded-lg flex items-center justify-center border border-rose-500/30">
              <Droplet className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h1 className="text-lg font-semibold leading-tight">{bloodBank.name}</h1>
              <p className="text-[11px] text-slate-400 hidden sm:block">{bloodBank.address}</p>
            </div>
            <span className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/30">
              <CheckCircle2 className="w-3 h-3" /> eRaktKosh Node
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowRegisterForm(true)}
              className="hidden sm:flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Center</span>
            </button>
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
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 text-slate-500 mb-3 text-xs font-medium uppercase tracking-wider">
              <Droplet className="w-4 h-4 text-rose-500" /> Total Inventory
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold text-slate-900">
                {totalInventory}
              </span>
              <span className="text-sm text-slate-500 font-medium">Units</span>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 text-slate-500 mb-3 text-xs font-medium uppercase tracking-wider">
              <Users className="w-4 h-4 text-blue-500" /> Registered Center
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold text-slate-900">ABDM</span>
              <span className="text-sm text-slate-500 font-medium">Network</span>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 text-slate-500 mb-3 text-xs font-medium uppercase tracking-wider">
              <Activity className="w-4 h-4 text-emerald-500" /> Database Status
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-emerald-600">Active</span>
              <span className="text-sm text-slate-500 font-medium">Syncing</span>
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
          
          {/* Inventory Manager */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Blood Stock Inventory</h2>
                  <p className="text-xs text-slate-500">Update available units directly to the database</p>
                </div>
                <span className="text-xs bg-rose-50 text-rose-600 border border-rose-200 px-3 py-1 rounded-full font-semibold">
                  Live Stock Sync
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {BLOOD_GROUPS.map(group => {
                  const count = bloodStock[group] || 0;
                  return (
                    <div 
                      key={group}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col items-center text-center"
                    >
                      <span className="text-sm font-bold text-slate-800 mb-1">{group}</span>
                      <span className="text-2xl font-black text-rose-600 my-1">{count}</span>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold mb-3">Units</span>
                      
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleStockUpdate(group, -1)}
                          disabled={count === 0}
                          className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-30 font-bold flex items-center justify-center cursor-pointer"
                        >
                          -
                        </button>
                        <button 
                          onClick={() => handleStockUpdate(group, 1)}
                          className="w-7 h-7 rounded-lg bg-rose-600 text-white hover:bg-rose-700 font-bold flex items-center justify-center cursor-pointer shadow-2xs"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Center Info Card */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base mb-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                <span>eRaktKosh Compliance</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                All inventory updates recorded here are synchronized with the national database repository to facilitate rapid emergency dispatch and citizen reservations.
              </p>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Node ID:</span>
                  <span className="font-mono font-medium">{bloodBank.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Center:</span>
                  <span className="font-medium truncate max-w-[150px]">{bloodBank.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Last Synced:</span>
                  <span className="font-medium">{bloodBank.lastUpdated || 'Just now'}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
