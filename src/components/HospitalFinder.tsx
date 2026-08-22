import { useState, useMemo } from 'react';
import { MapPin, Navigation, Phone, ShieldAlert, Activity, Filter, CheckCircle2, AlertCircle } from 'lucide-react';
import { Hospital } from '../types';
import { MOCK_HOSPITALS } from '../data';
import { getDistanceInKm } from '../utils';
import { useGeolocation } from '../hooks/useGeolocation';

const AVAILABLE_SERVICES = [
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

interface HospitalFinderProps {
  isEmergency?: boolean;
}

export default function HospitalFinder({ isEmergency = false }: HospitalFinderProps) {
  const { location: userLoc, loading: locating, error, usingFallback } = useGeolocation();
  const [radius, setRadius] = useState<number>(15);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  const toggleService = (service: string) => {
    setSelectedServices(prev => 
      prev.includes(service) ? prev.filter(s => s !== service) : [...prev, service]
    );
  };

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

    if (selectedServices.length > 0) {
      sorted = sorted.filter(h => 
        selectedServices.every(service => h.services?.includes(service))
      );
    }

    return sorted;
  }, [userLoc, isEmergency, radius, selectedServices]);

  return (
    <div className="flex-grow bg-slate-50 w-full pb-12">
      
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
              {isEmergency ? (
                <>
                  <div className="w-10 h-10 bg-red-100 text-red-600 rounded-xl flex items-center justify-center">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  Emergency Routing
                </>
              ) : (
                <>
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                    <Activity className="w-5 h-5" />
                  </div>
                  Hospital Finder
                </>
              )}
            </h2>
            <p className="text-slate-500 mt-2 text-sm max-w-lg">
              {isEmergency 
                ? 'Locating nearest trauma centers with available beds and active emergency departments.' 
                : 'Verified facilities via ABDM Health Facility Registry dataset.'}
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
        {!locating && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8 flex flex-col gap-6">
            {/* Services Filter */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-slate-400" />
                Required Services
              </h3>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_SERVICES.map(service => {
                  const isSelected = selectedServices.includes(service);
                  return (
                    <button
                      key={service}
                      onClick={() => toggleService(service)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                        isSelected 
                          ? 'bg-blue-50 border-blue-200 text-blue-700' 
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300'
                      }`}
                    >
                      {service}
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Radius Filter */}
            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-6 max-w-2xl">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 shrink-0">
                <Filter className="w-4 h-4 text-slate-400" />
                Search Radius: <span className="text-blue-600 font-bold">{radius} km</span>
              </div>
              <input 
                type="range" 
                min="1" max="50" 
                value={radius} 
                onChange={(e) => setRadius(Number(e.target.value))}
                className="flex-grow h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900 w-full"
              />
            </div>
          </div>
        )}

        {locating ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="relative w-12 h-12 mb-4">
              <div className="absolute inset-0 border-2 border-slate-100 rounded-full"></div>
              <div className="absolute inset-0 border-2 border-slate-900 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <h3 className="text-base font-semibold text-slate-900">Acquiring Location...</h3>
            <p className="text-sm text-slate-500 mt-1">Connecting to geospatial nodes</p>
          </div>
        ) : hospitals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4 text-slate-400">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No facilities found</h3>
            <p className="text-slate-500 text-sm max-w-sm">Try expanding your search radius to find hospitals further away.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hospitals.map(hospital => (
              <div 
                key={hospital.id}
                className={`bg-white rounded-2xl p-6 shadow-sm border transition-colors ${
                  isEmergency ? 'border-red-100 hover:border-red-300' : 'border-slate-200 hover:border-slate-300'
                } flex flex-col`}
              >
                <div className="flex justify-between items-start mb-4">
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md border ${
                    hospital.type === 'Government' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                    hospital.type === 'Trust' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                    'bg-slate-50 text-slate-700 border-slate-200'
                  }`}>
                    {hospital.type}
                  </span>
                  {hospital.distance !== undefined && (
                    <span className="text-xs font-semibold text-slate-600 bg-slate-50 px-2 py-1 rounded-md flex items-center gap-1 border border-slate-200">
                      <Navigation className="w-3 h-3 text-slate-400" />
                      {hospital.distance.toFixed(1)} km
                    </span>
                  )}
                </div>
                
                <h3 className="text-base font-semibold text-slate-900 mb-1 leading-tight">{hospital.name}</h3>
                <p className="text-xs text-slate-500 mb-4 flex-grow flex items-start gap-2 leading-relaxed">
                  <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-400" />
                  {hospital.address}
                </p>

                {hospital.services && hospital.services.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {hospital.services.slice(0, 4).map(service => (
                      <span key={service} className="text-[10px] font-medium text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                        {service}
                      </span>
                    ))}
                    {hospital.services.length > 4 && (
                      <span className="text-[10px] font-medium text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded">
                        +{hospital.services.length - 4} more
                      </span>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                    <p className="text-[10px] uppercase text-slate-500 font-semibold tracking-wider mb-1">Beds Avail</p>
                    <p className={`text-xl font-bold ${hospital.bedsAvailable > 10 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {hospital.bedsAvailable}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center flex flex-col items-center justify-center">
                    <p className="text-[10px] uppercase text-slate-500 font-semibold tracking-wider mb-1">Emergency</p>
                    <p className={`text-xs font-bold ${hospital.emergencyServices ? 'text-slate-900' : 'text-slate-400'}`}>
                      {hospital.emergencyServices ? '24x7 Active' : 'Closed'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 mt-auto">
                  <a href={`tel:${hospital.phone}`} className="flex-1 bg-white border border-slate-200 text-slate-700 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors">
                    <Phone className="w-4 h-4 text-slate-400" />
                    Call
                  </a>
                  <button className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isEmergency ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-slate-900 text-white hover:bg-slate-800'
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
    </div>
  );
}
