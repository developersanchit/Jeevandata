import React, { useState, useMemo, useEffect } from 'react';
import { MapPin, Navigation, Droplet, CheckCircle2, AlertCircle, Heart, ArrowUpRight, Award, ShieldAlert, Filter } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useGeolocation } from '../hooks/useGeolocation';

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

export default function DonateBlood() {
  const { bloodBanks: globalBloodBanks, citizenBloodBalance, addCitizenBloodBalance, updateBloodBankStock } = useAppContext();
  const { location: userLoc, loading: locating, error, usingFallback } = useGeolocation();
  const [radius, setRadius] = useState<number>(15);
  const [isLoadingApi, setIsLoadingApi] = useState(true);
  const [toastMessage, setToastMessage] = useState('');

  // Simulate network request
  useEffect(() => {
    setIsLoadingApi(true);
    const timer = setTimeout(() => {
      setIsLoadingApi(false);
    }, 1200); 
    return () => clearTimeout(timer);
  }, []);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleDonate = (bankId: string, bankName: string) => {
    addCitizenBloodBalance(450); // standard whole blood donation
    // Assume user is O+ for this demo and add to the bank's stock
    updateBloodBankStock(bankId, 'O+', 1);
    showToast(`Donation scheduled at ${bankName}! 450 ML added to your priority balance.`);
  };

  const bloodBanks = useMemo(() => {
    if (!userLoc || isLoadingApi) return [];
    let sorted = globalBloodBanks.map(b => ({
      ...b,
      distance: calculateDistance(userLoc.lat, userLoc.lng, b.lat, b.lng)
    }));
    sorted = sorted.filter(b => b.distance !== undefined && b.distance <= radius);
    return sorted.sort((a, b) => (a.distance || 0) - (b.distance || 0));
  }, [userLoc, radius, isLoadingApi, globalBloodBanks]);

  return (
    <div className="flex-grow flex flex-col bg-slate-50 min-h-full pb-20">
      {/* Header & Balance Dashboard */}
      <div className="bg-rose-900 text-white pt-10 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-rose-600/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/2 w-64 h-64 bg-red-500/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        </div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-rose-500/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-rose-400/30">
                  <Heart className="w-5 h-5 text-rose-100" />
                </div>
                <span className="text-rose-200 font-semibold tracking-wide text-sm uppercase">Donor Priority Program</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">Be a Hero. Earn Priority.</h1>
              <p className="text-rose-200 max-w-xl">Every drop you donate adds to your Blood Balance, ensuring you or your family get prioritized access during emergencies.</p>
            </div>
            
            {!locating && userLoc && (
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 shrink-0 max-w-xs w-full md:w-auto">
                <div className="text-xs text-rose-200 font-medium uppercase tracking-wider mb-2">Your Location</div>
                {error || usingFallback ? (
                  <div className="bg-amber-500/20 border border-amber-500/30 px-4 py-2.5 rounded-xl flex items-center gap-2 text-amber-200 text-sm font-medium">
                    <AlertCircle className="w-4 h-4" /> Default Location
                  </div>
                ) : (
                  <div className="bg-emerald-500/20 border border-emerald-500/30 px-4 py-2.5 rounded-xl flex items-center gap-2 text-emerald-200 text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4" /> Location Acquired
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Balance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-rose-200 text-sm font-semibold uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Droplet className="w-4 h-4" /> Your Blood Balance
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">{citizenBloodBalance}</span>
                  <span className="text-rose-200 font-medium">ML</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
              <p className="text-rose-200 text-sm font-semibold uppercase tracking-wider mb-2 flex items-center gap-2">
                <Award className="w-4 h-4" /> Current Tier
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-amber-300">Gold Donor</span>
              </div>
              <p className="text-xs text-rose-200 mt-2 opacity-80">Top 15% priority access</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 w-full">
        {/* Radius Filter */}
        {!locating && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8 flex flex-col sm:flex-row items-center gap-6">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 shrink-0">
              <Filter className="w-4 h-4 text-slate-400" />
              Find Banks Within: <span className="text-rose-600 font-bold">{radius} km</span>
            </div>
            <input 
              type="range" 
              min="1" max="50" 
              value={radius} 
              onChange={(e) => setRadius(Number(e.target.value))}
              className="flex-grow h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-600 w-full"
            />
          </div>
        )}

        {locating || isLoadingApi ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="relative w-12 h-12 mb-4">
              <div className="absolute inset-0 border-2 border-slate-100 rounded-full"></div>
              <div className="absolute inset-0 border-2 border-rose-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <h3 className="text-base font-semibold text-slate-900">
              {locating ? 'Acquiring Location...' : 'Locating Blood Banks...'}
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              {locating ? 'Connecting to geospatial nodes' : 'Syncing nearby eRaktKosh centers'}
            </p>
          </div>
        ) : bloodBanks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4 text-slate-400">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Blood Banks Found</h3>
            <p className="text-slate-500 text-sm max-w-sm">Try expanding your search radius to find centers further away.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bloodBanks.map(bank => (
              <div 
                key={bank.id}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:border-rose-300 transition-colors flex flex-col"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md border bg-rose-50 text-rose-700 border-rose-200">
                    Verified Center
                  </span>
                  {bank.distance !== undefined && (
                    <span className="text-xs font-semibold text-slate-600 bg-slate-50 px-2 py-1 rounded-md flex items-center gap-1 border border-slate-200">
                      <Navigation className="w-3 h-3 text-slate-400" />
                      {bank.distance.toFixed(1)} km
                    </span>
                  )}
                </div>
                
                <h3 className="text-lg font-bold text-slate-900 leading-tight mb-2">{bank.name}</h3>
                
                <p className="text-xs text-slate-500 mb-6 flex-grow flex items-start gap-2 leading-relaxed">
                  <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-slate-400" />
                  {bank.address}
                </p>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Reward</p>
                    <p className="text-sm font-bold text-emerald-600">+450 ML Balance</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                  </div>
                </div>

                <button 
                  onClick={() => handleDonate(bank.id, bank.name)}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-rose-600 text-white rounded-xl text-sm font-bold hover:bg-rose-700 transition-colors shadow-sm shadow-rose-200"
                >
                  <Heart className="w-4 h-4" />
                  Donate Here
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300 min-w-max border border-slate-800">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-sm font-semibold">{toastMessage}</p>
        </div>
      )}
    </div>
  );
}
