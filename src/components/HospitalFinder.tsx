import { useState, useMemo } from 'react';
import { MapPin, Navigation, Phone, ShieldAlert, Activity, Filter, CheckCircle2, AlertCircle } from 'lucide-react';
import { Hospital } from '../types';
import { MOCK_HOSPITALS } from '../data';
import { getDistanceInKm } from '../utils';
import { useGeolocation } from '../hooks/useGeolocation';

interface HospitalFinderProps {
  isEmergency?: boolean;
}

export default function HospitalFinder({ isEmergency = false }: HospitalFinderProps) {
  const { location: userLoc, loading: locating, error, usingFallback } = useGeolocation();
  const [radius, setRadius] = useState<number>(15);

  const hospitals = useMemo(() => {
    if (!userLoc) return [];
    
    let sorted = MOCK_HOSPITALS.map(h => ({
      ...h,
      distance: getDistanceInKm(userLoc.lat, userLoc.lng, h.lat, h.lng)
    }))
    .filter(h => h.distance !== undefined && h.distance <= radius)
    .sort((a, b) => (a.distance || 0) - (b.distance || 0));

    if (isEmergency) {
      sorted = sorted.filter(h => h.emergencyServices && h.bedsAvailable > 0);
    }

    return sorted;
  }, [userLoc, isEmergency, radius]);

  return (
    <div className="flex-grow w-full max-w-5xl mx-auto px-4 sm:px-8 py-8 flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            {isEmergency ? (
              <><ShieldAlert className="text-red-500 w-8 h-8" /> Emergency Routing</>
            ) : (
              <><Activity className="text-blue-500 w-8 h-8" /> Hospital Finder</>
            )}
          </h2>
          <p className="text-slate-500 mt-2">
            {isEmergency ? 'Locating nearest trauma centers with available beds.' : 'Verified facilities via ABDM HFR dataset.'}
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

      {/* Radius Filter */}
      {!locating && (
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-700 shrink-0">
            <Filter className="w-4 h-4 text-blue-500" />
            Search Radius: <span className="text-blue-600 w-12">{radius} km</span>
          </div>
          <input 
            type="range" 
            min="1" max="50" 
            value={radius} 
            onChange={(e) => setRadius(Number(e.target.value))}
            className="flex-grow h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 w-full"
          />
        </div>
      )}

      {locating ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20">
          <div className="relative w-16 h-16 mb-4">
            <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            <MapPin className="absolute inset-0 m-auto text-blue-600 w-6 h-6 animate-pulse" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700">Acquiring High-Precision Location...</h3>
          <p className="text-sm text-slate-400 mt-2">Connecting to geospatial nodes</p>
        </div>
      ) : hospitals.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No facilities found</h3>
          <p className="text-slate-500 max-w-md">Try expanding your search radius to find hospitals further away.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hospitals.map(hospital => (
            <div 
              key={hospital.id}
              className={`bg-white rounded-2xl p-6 shadow-sm border transition-all ${
                isEmergency ? 'border-red-100 hover:shadow-red-100/50 hover:border-red-300' : 'border-slate-200 hover:shadow-blue-100 hover:border-blue-300'
              } flex flex-col`}
            >
              <div className="flex justify-between items-start mb-4">
                <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded ${
                  hospital.type === 'Government' ? 'bg-emerald-100 text-emerald-800' : 
                  hospital.type === 'Trust' ? 'bg-amber-100 text-amber-800' : 
                  'bg-blue-100 text-blue-800'
                }`}>
                  {hospital.type}
                </span>
                {hospital.distance !== undefined && (
                  <span className="text-sm font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md flex items-center gap-1">
                    <Navigation className="w-3 h-3 text-slate-500" />
                    {hospital.distance.toFixed(1)} km
                  </span>
                )}
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 mb-1">{hospital.name}</h3>
              <p className="text-sm text-slate-500 mb-4 flex-grow flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                {hospital.address}
              </p>

              <div className="grid grid-cols-2 gap-2 mb-6">
                <div className="bg-slate-50 p-2 rounded border border-slate-100">
                  <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider mb-1">Beds Avail</p>
                  <p className={`text-lg font-extrabold ${hospital.bedsAvailable > 10 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {hospital.bedsAvailable}
                  </p>
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-100">
                  <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider mb-1">Emergency</p>
                  <p className="text-sm font-bold text-slate-700 mt-1">
                    {hospital.emergencyServices ? '24x7 Active' : 'Closed'}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-auto">
                <a href={`tel:${hospital.phone}`} className="flex-1 bg-slate-900 text-white flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors">
                  <Phone className="w-4 h-4" />
                  Call
                </a>
                <button className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                  isEmergency ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                }`}>
                  <Navigation className="w-4 h-4" />
                  Route
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
