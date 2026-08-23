import { useState, useMemo, useEffect } from 'react';
import { Droplet, MapPin, Clock, Search, Navigation, Filter, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { getDistanceInKm } from '../utils';
import { useGeolocation } from '../hooks/useGeolocation';
import { Hospital } from '../types';

const BLOOD_GROUPS = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

export default function BloodDonors() {
  const [selectedGroup, setSelectedGroup] = useState<string>('O+');
  const { location: userLoc, loading: locating, error, usingFallback } = useGeolocation();
  const { bloodBanks: globalBloodBanks } = useAppContext();
  const [radius, setRadius] = useState<number>(20);
  
  const [apiData, setApiData] = useState<any[]>([]);
  const [isLoadingApi, setIsLoadingApi] = useState(true);

  // Simulate network request to mock data
  useEffect(() => {
    setIsLoadingApi(true);
    const timer = setTimeout(() => {
      setApiData(globalBloodBanks);
      setIsLoadingApi(false);
    }, 1200); // 1.2s delay to feel like a real API call
    return () => clearTimeout(timer);
  }, [globalBloodBanks]);

  const bloodBanks = useMemo(() => {
    if (!userLoc || isLoadingApi) return [];
    
    return apiData.map(bank => ({
      ...bank,
      distance: (bank.lat && bank.lng) 
        ? getDistanceInKm(userLoc.lat, userLoc.lng, bank.lat, bank.lng) 
        : 0
    }))
    .filter(bank => bank.distance !== undefined && bank.distance <= radius)
    .sort((a, b) => ((b.stock && b.stock[selectedGroup]) || 0) - ((a.stock && a.stock[selectedGroup]) || 0));
  }, [userLoc, radius, selectedGroup, apiData, isLoadingApi]);

  return (
    <div className="flex-grow bg-slate-50 w-full pb-12">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center">
                <Droplet className="w-5 h-5 fill-current" /> 
              </div>
              Live Blood Inventory
            </h2>
            <p className="text-slate-500 mt-2 text-sm max-w-lg">
              Real-time blood stock status simulated from eRaktKosh data nodes. Select a blood group and adjust your search radius.
            </p>
          </div>
          {!locating && userLoc && (
            <div className="shrink-0">
              {usingFallback ? (
                <div className="bg-amber-50 border border-amber-200 px-4 py-2.5 rounded-xl flex items-center gap-2 text-amber-700 text-sm font-medium">
                  <AlertCircle className="w-4 h-4" /> Default Location Used
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-xl flex items-center gap-2 text-emerald-700 text-sm font-medium">
                  <CheckCircle2 className="w-4 h-4" /> Location Acquired
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-8 flex flex-col lg:flex-row justify-between gap-8">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Select Blood Group Needed</h3>
            <div className="flex flex-wrap gap-2">
              {BLOOD_GROUPS.map(group => (
                <button
                  key={group}
                  onClick={() => setSelectedGroup(group)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    selectedGroup === group 
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {group}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 min-w-[240px] lg:border-l border-slate-100 lg:pl-8">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Filter className="w-4 h-4 text-slate-400" />
              Search Radius: <span className="text-rose-600 font-bold">{radius} km</span>
            </div>
            <input 
              type="range" 
              min="1" max="50" 
              value={radius} 
              onChange={(e) => setRadius(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
            />
          </div>
        </div>

        {/* Results */}
        {locating || isLoadingApi ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="relative w-12 h-12 mb-4">
              <div className="absolute inset-0 border-2 border-slate-100 rounded-full"></div>
              <div className="absolute inset-0 border-2 border-slate-900 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <h3 className="text-base font-semibold text-slate-900">
              {locating ? 'Acquiring Location...' : 'Syncing Live Inventory...'}
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              {locating ? 'Connecting to geospatial nodes' : 'Fetching latest data from eRaktKosh networks'}
            </p>
          </div>
        ) : bloodBanks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4 text-slate-400">
              <Droplet className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Blood Banks Found</h3>
            <p className="text-slate-500 text-sm max-w-sm">Try expanding your search radius to find blood banks further away.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bloodBanks.map(bank => (
            <div key={bank.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col hover:border-slate-300 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                  Verified Bank
                </span>
                <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded-md flex items-center gap-1 border border-slate-200">
                  <Navigation className="w-3 h-3 text-slate-400" />
                  {bank.distance.toFixed(1)} km
                </span>
              </div>
              
              <h3 className="text-base font-semibold text-slate-900 mb-1">{bank.name}</h3>
              <p className="text-xs text-slate-500 mb-5 flex-grow flex items-start gap-2 leading-relaxed">
                <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-400" />
                {bank.address}
              </p>

              <div className={`p-4 rounded-xl border mb-5 flex items-center justify-between ${
                (bank.stock[selectedGroup] || 0) > 10 ? 'bg-emerald-50 border-emerald-100' : 
                (bank.stock[selectedGroup] || 0) > 0 ? 'bg-amber-50 border-amber-100' : 
                'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${
                    (bank.stock[selectedGroup] || 0) > 10 ? 'bg-emerald-100 text-emerald-700' : 
                    (bank.stock[selectedGroup] || 0) > 0 ? 'bg-amber-100 text-amber-700' : 
                    'bg-white border border-slate-200 text-slate-500'
                  }`}>
                    {selectedGroup}
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-0.5">Available Units</p>
                    <p className={`text-xl font-bold ${
                      (bank.stock[selectedGroup] || 0) > 10 ? 'text-emerald-700' : 
                      (bank.stock[selectedGroup] || 0) > 0 ? 'text-amber-700' : 
                      'text-slate-400'
                    }`}>
                      {bank.stock[selectedGroup] || 0} <span className="text-sm font-medium">Units</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Updated {bank.lastUpdated}
                </span>
                <button 
                  disabled={(bank.stock[selectedGroup] || 0) === 0}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                    (bank.stock[selectedGroup] || 0) === 0 
                    ? 'bg-slate-50 text-slate-400 border border-slate-200 cursor-not-allowed'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  {(bank.stock[selectedGroup] || 0) === 0 ? 'Out of Stock' : 'Reserve'}
                </button>
              </div>
            </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
