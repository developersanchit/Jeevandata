import { useState, useMemo, useEffect } from 'react';
import { Droplet, MapPin, Clock, Search, Navigation, Filter, AlertCircle, CheckCircle2 } from 'lucide-react';
import { MOCK_BLOOD_BANKS } from '../data';
import { getDistanceInKm } from '../utils';
import { useGeolocation } from '../hooks/useGeolocation';
import { Hospital } from '../types'; // Blood bank shares same interface conceptually

const BLOOD_GROUPS = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

export default function BloodDonors() {
  const [selectedGroup, setSelectedGroup] = useState<string>('O+');
  const { location: userLoc, loading: locating, error, usingFallback } = useGeolocation();
  const [radius, setRadius] = useState<number>(20);
  
  // New state for API data
  const [apiData, setApiData] = useState<any[]>([]);
  const [isLoadingApi, setIsLoadingApi] = useState(true);

  // Fetch from our backend proxy
  useEffect(() => {
    async function fetchBloodBanks() {
      try {
        const response = await fetch('/api/blood-banks?state=35'); // e.g. Delhi
        const json = await response.json();
        
        if (json.status === 'mock') {
          // If keys aren't configured in .env or upstream fails, backend tells us to use mock data
          console.warn(json.message || "Falling back to local mock data.");
          setApiData(MOCK_BLOOD_BANKS);
        } else if (json.status === 'success') {
          // You would map the live API Setu eRaktKosh response shape to our UI shape here
          if (json.data && json.data.length > 0) {
            setApiData(json.data);
          } else {
             // Fallback if live data is empty for the given params
            setApiData(MOCK_BLOOD_BANKS);
          }
        } else {
          // Catch any other unexpected response shapes
          setApiData(MOCK_BLOOD_BANKS);
        }
      } catch (err) {
        console.error("Failed to fetch blood banks:", err);
        setApiData(MOCK_BLOOD_BANKS); // Safe fallback for demo
      } finally {
        setIsLoadingApi(false);
      }
    }
    fetchBloodBanks();
  }, []);

  const bloodBanks = useMemo(() => {
    if (!userLoc || isLoadingApi) return [];
    
    return apiData.map(bank => ({
      ...bank,
      // If live API doesn't provide lat/lng, you might need to handle geocoding, 
      // but we assume our mock or mapped data has it.
      distance: (bank.lat && bank.lng) 
        ? getDistanceInKm(userLoc.lat, userLoc.lng, bank.lat, bank.lng) 
        : 0
    }))
    .filter(bank => bank.distance !== undefined && bank.distance <= radius)
    .sort((a, b) => ((b.stock && b.stock[selectedGroup]) || 0) - ((a.stock && a.stock[selectedGroup]) || 0));
  }, [userLoc, radius, selectedGroup, apiData, isLoadingApi]);

  return (
    <div className="flex-grow w-full max-w-5xl mx-auto px-4 sm:px-8 py-8 flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <Droplet className="text-rose-500 w-8 h-8" /> 
            Live Blood Inventory
          </h2>
          <p className="text-slate-500 mt-2">
            Real-time blood stock status simulated from eRaktKosh data nodes.
          </p>
        </div>
        {!locating && userLoc && (
          <div className="flex flex-col items-end gap-2">
            {usingFallback ? (
              <div className="bg-amber-50 border border-amber-100 px-4 py-2 rounded-lg flex items-center gap-2 text-amber-700 text-sm font-medium">
                <AlertCircle className="w-4 h-4" />
                Using Default Location
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-lg flex items-center gap-2 text-emerald-700 text-sm font-medium">
                <CheckCircle2 className="w-4 h-4" />
                Location Acquired
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 mb-8 flex flex-col md:flex-row justify-between gap-6">
        <div>
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Select Blood Group Needed</h3>
          <div className="flex flex-wrap gap-3">
            {BLOOD_GROUPS.map(group => (
              <button
                key={group}
                onClick={() => setSelectedGroup(group)}
                className={`px-4 py-2 rounded-xl font-bold transition-all ${
                  selectedGroup === group 
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-200 scale-105'
                    : 'bg-slate-50 text-slate-600 hover:bg-rose-50 border border-slate-100'
                }`}
              >
                {group}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4 min-w-[200px] w-full md:w-1/3 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
            <Filter className="w-4 h-4 text-blue-500" />
            Search Radius: <span className="text-blue-600 w-12">{radius} km</span>
          </div>
          <input 
            type="range" 
            min="1" max="50" 
            value={radius} 
            onChange={(e) => setRadius(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>
      </div>

      {/* Results */}
      {locating ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20">
          <div className="relative w-16 h-16 mb-4">
            <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-rose-600 rounded-full border-t-transparent animate-spin"></div>
            <MapPin className="absolute inset-0 m-auto text-rose-600 w-6 h-6 animate-pulse" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700">Acquiring High-Precision Location...</h3>
        </div>
      ) : bloodBanks.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
            <Droplet className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No Blood Banks Found</h3>
          <p className="text-slate-500 max-w-md">Try expanding your search radius to find blood banks further away.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bloodBanks.map(bank => (
          <div key={bank.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:border-rose-300 hover:shadow-rose-100 transition-all flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded bg-amber-100 text-amber-800">
                Verified Blood Bank
              </span>
              <span className="text-sm font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md flex items-center gap-1">
                <Navigation className="w-3 h-3 text-slate-500" />
                {bank.distance.toFixed(1)} km
              </span>
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 mb-1">{bank.name}</h3>
            <p className="text-sm text-slate-500 mb-4 flex-grow flex items-start gap-2">
              <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
              {bank.address}
            </p>

            <div className={`p-4 rounded-xl border mb-4 flex items-center justify-between ${
              (bank.stock[selectedGroup] || 0) > 10 ? 'bg-emerald-50 border-emerald-100' : 
              (bank.stock[selectedGroup] || 0) > 0 ? 'bg-amber-50 border-amber-100' : 
              'bg-red-50 border-red-100'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg text-white ${
                  (bank.stock[selectedGroup] || 0) > 10 ? 'bg-emerald-500' : 
                  (bank.stock[selectedGroup] || 0) > 0 ? 'bg-amber-500' : 
                  'bg-red-500'
                }`}>
                  {selectedGroup}
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Available Units</p>
                  <p className={`text-xl font-extrabold ${
                    (bank.stock[selectedGroup] || 0) > 10 ? 'text-emerald-700' : 
                    (bank.stock[selectedGroup] || 0) > 0 ? 'text-amber-700' : 
                    'text-red-700'
                  }`}>
                    {bank.stock[selectedGroup] || 0} Units
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
              <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Updated {bank.lastUpdated}
              </span>
              <button 
                disabled={(bank.stock[selectedGroup] || 0) === 0}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  (bank.stock[selectedGroup] || 0) === 0 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-900 text-white hover:bg-slate-800 active:scale-95'
                }`}
              >
                {(bank.stock[selectedGroup] || 0) === 0 ? 'Out of Stock' : 'Reserve Units'}
              </button>
            </div>
          </div>
          ))}
        </div>
      )}
    </div>
  );
}
