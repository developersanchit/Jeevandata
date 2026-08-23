import React, { useState } from 'react';
import { Droplet, LogOut, CheckCircle2, ShieldAlert, Activity, Filter, Users, Calendar, Share2, Award, Heart } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const BLOOD_GROUPS = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

export default function BloodBankPortal() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { bloodBanks, updateBloodBankStock } = useAppContext();
  
  // We represent AIIMS Blood Bank as our node
  const bloodBank = bloodBanks.find(b => b.id === 'bb-001');

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
              className="w-full bg-rose-600 text-white font-semibold py-3.5 rounded-xl hover:bg-rose-700 transition-colors shadow-sm shadow-rose-200 mt-2"
            >
              Secure Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!bloodBank) return <div>Blood Bank not found.</div>;

  const bloodStock = bloodBank.stock || {};

  const adjustStock = (group: string, delta: number) => {
    updateBloodBankStock(bloodBank.id, group, delta);
    showToast(`Updated ${group} stock to ${Math.max(0, (bloodStock[group] || 0) + delta)} units`);
  };

  return (
    <div className="flex-grow bg-slate-50 w-full pb-12">
      <div className="bg-slate-900 border-b border-slate-800 sticky top-0 z-10 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-rose-500/20 text-rose-400 rounded-lg flex items-center justify-center border border-rose-500/30">
              <Droplet className="w-4 h-4 fill-current" />
            </div>
            <h1 className="text-lg font-semibold">{bloodBank.name}</h1>
            <span className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/30">
              <CheckCircle2 className="w-3 h-3" /> eRaktKosh Node
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
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 text-slate-500 mb-3 text-xs font-medium uppercase tracking-wider">
              <Droplet className="w-4 h-4 text-rose-500" /> Total Inventory
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold text-slate-900">
                {Object.values(bloodStock).reduce((a: number, b: number) => a + b, 0)}
              </span>
              <span className="text-sm text-slate-500 font-medium">Units</span>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 text-slate-500 mb-3 text-xs font-medium uppercase tracking-wider">
              <Users className="w-4 h-4 text-blue-500" /> Donors Today
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold text-slate-900">14</span>
              <span className="text-sm text-slate-500 font-medium">Walk-ins</span>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 text-slate-500 mb-3 text-xs font-medium uppercase tracking-wider">
              <Activity className="w-4 h-4 text-emerald-500" /> Urgent Requests
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold text-emerald-600">3</span>
              <span className="text-sm text-slate-500 font-medium">Hospitals</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Inventory Manager */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                    <Droplet className="w-5 h-5 text-rose-500 fill-current" /> Live Blood Inventory
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">Updates instantly sync with eRaktKosh network.</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {BLOOD_GROUPS.map(group => {
                  const stock = bloodStock[group] || 0;
                  const isCritical = stock <= 5;
                  
                  return (
                    <div key={group} className={`p-4 rounded-xl border ${
                      isCritical ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <div className="flex justify-between items-center mb-3">
                        <span className={`text-lg font-bold ${isCritical ? 'text-rose-700' : 'text-slate-700'}`}>
                          {group}
                        </span>
                        {isCritical && <span className="flex w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>}
                      </div>
                      
                      <div className="flex items-center justify-between bg-white rounded-lg p-1 border border-slate-200 shadow-sm">
                        <button 
                          onClick={() => adjustStock(group, -1)}
                          className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                        >
                          -
                        </button>
                        <span className="font-bold text-slate-900">{stock}</span>
                        <button 
                          onClick={() => adjustStock(group, 1)}
                          className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Donations Queue */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-base font-semibold text-slate-900">Today's Appointments</h2>
                <button 
                  onClick={() => showToast('Opening walk-in registration form...')}
                  className="text-sm font-medium text-rose-600 hover:text-rose-700 bg-rose-50 px-3 py-1.5 rounded-lg transition-colors"
                >
                  + Add Walk-in
                </button>
              </div>
              <div className="divide-y divide-slate-100">
                {[
                  { name: 'Arjun Kumar', group: 'O+', status: 'Arrived', time: '10:30 AM', type: 'Whole Blood' },
                  { name: 'Priya Sharma', group: 'A-', status: 'Scheduled', time: '11:15 AM', type: 'Platelets' },
                  { name: 'Ravi Singh', group: 'B+', status: 'Scheduled', time: '12:00 PM', type: 'Whole Blood' },
                ].map((donor, i) => (
                  <div key={i} className="p-6 hover:bg-slate-50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 border border-slate-200 flex items-center justify-center font-bold">
                          {donor.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 mb-1">{donor.name}</h3>
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span className="font-semibold text-rose-600">{donor.group}</span>
                            <span>•</span>
                            <span>{donor.type}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {donor.time}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          donor.status === 'Arrived' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                          'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {donor.status}
                        </span>
                        {donor.status === 'Arrived' ? (
                          <button 
                            onClick={() => {
                              showToast(`Recording donation for ${donor.name}...`);
                              adjustStock(donor.group, 1);
                            }}
                            className="text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 px-4 py-2 rounded-lg transition-colors mt-1"
                          >
                            Complete Donation
                          </button>
                        ) : (
                          <button 
                            onClick={() => showToast(`Marking ${donor.name} as arrived...`)}
                            className="text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 px-4 py-2 rounded-lg transition-colors mt-1"
                          >
                            Mark Arrived
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-rose-900 rounded-2xl shadow-sm p-6 text-white">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-4">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Host a Drive</h3>
              <p className="text-rose-200 text-sm mb-6 leading-relaxed">Partner with local organizations and communities to set up a mobile blood donation camp.</p>
              <button 
                onClick={() => showToast('Opening camp scheduling wizard...')}
                className="w-full bg-white text-slate-900 font-medium py-2.5 rounded-xl text-sm hover:bg-slate-100 transition-colors"
              >
                Schedule New Camp
              </button>
            </div>
            
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
               <h3 className="text-sm font-semibold text-slate-900 mb-4">Urgent Hospital Requests</h3>
               <div className="space-y-4">
                 {[
                   { hospital: 'AIIMS Trauma Center', group: 'O-', amount: 4, urgency: 'Critical' },
                   { hospital: 'Safdarjung ER', group: 'AB-', amount: 2, urgency: 'High' }
                 ].map((req, i) => (
                   <div key={i} className="flex gap-3 items-start p-3 rounded-xl border border-rose-100 bg-rose-50/50">
                     <div className="w-10 h-10 rounded-lg bg-white flex flex-col items-center justify-center shrink-0 border border-slate-200 font-bold text-rose-600">
                       {req.group}
                     </div>
                     <div className="flex-grow">
                       <p className="text-sm font-semibold text-slate-900">{req.hospital}</p>
                       <p className="text-xs text-slate-500 mt-1">Needs {req.amount} units</p>
                     </div>
                     <button 
                        onClick={() => showToast(`Dispatching ${req.amount} units of ${req.group} to ${req.hospital}...`)}
                        className="text-xs font-semibold bg-rose-600 text-white px-3 py-1.5 rounded-lg hover:bg-rose-700"
                     >
                       Dispatch
                     </button>
                   </div>
                 ))}
               </div>
            </div>
          </div>
          
        </div>
      </div>

      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <p className="text-sm font-medium">{toastMessage}</p>
        </div>
      )}
    </div>
  );
}
