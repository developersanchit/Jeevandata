import { Search, ShieldAlert, Droplet, Activity, FileText, Heart } from "lucide-react";
import { ViewState } from "../types";

interface HomeProps {
  onNavigate: (view: ViewState) => void;
}

export default function Home({ onNavigate }: HomeProps) {
  return (
    <main className="flex-grow flex flex-col items-center justify-start relative px-4 sm:px-8 py-12 w-full">
      <div className="text-center mb-10 w-full max-w-4xl">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
          Solve for Life. <span className="text-blue-600 italic">Instantly.</span>
        </h1>
        <p className="text-slate-500 max-w-xl mx-auto text-base sm:text-lg">
          Unified healthcare access powered by ABDM, eRaktKosh, and national health registries. Built for a billion citizens.
        </p>
      </div>

      {/* Search Bar */}
      <div className="w-full max-w-2xl bg-white shadow-2xl shadow-blue-100/50 rounded-2xl border border-slate-100 p-2 flex items-center gap-2 sm:gap-4 group focus-within:ring-2 focus-within:ring-blue-500 transition-all mb-12">
        <div className="pl-2 sm:pl-4 text-slate-400 shrink-0">
          <Search className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <input
          type="text"
          placeholder="Search hospitals, doctors, or blood types nearby..."
          className="flex-grow bg-transparent border-none focus:ring-0 text-base sm:text-lg py-3 sm:py-4 placeholder:text-slate-400 outline-none w-full min-w-0"
        />
        <button 
          onClick={() => onNavigate('hospitals')}
          className="bg-blue-600 text-white font-bold px-4 sm:px-8 py-2 sm:py-3 rounded-xl hover:bg-blue-700 active:scale-95 transition-all shrink-0"
        >
          Search
        </button>
      </div>

      <div className="w-full max-w-6xl space-y-12">
        {/* Section 1: Citizen Services */}
        <section>
          <div className="mb-6 flex items-center gap-3">
            <div className="w-2 h-6 bg-blue-600 rounded-full"></div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Citizen Health Services</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div 
              onClick={() => onNavigate('emergency')}
              className="bg-red-50 border border-red-100 p-6 rounded-2xl hover:bg-red-100 transition-colors cursor-pointer group flex flex-col items-start text-left"
            >
              <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center mb-4 text-white shadow-lg shadow-red-200">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-red-900 mb-1 text-lg">Emergency SOS</h3>
              <p className="text-sm text-red-700/80">Instant dispatch & bed booking at nearest trauma centers.</p>
            </div>

            <div 
              onClick={() => onNavigate('hospitals')}
              className="bg-white border border-slate-200 p-6 rounded-2xl hover:border-blue-400 transition-all cursor-pointer shadow-sm group flex flex-col items-start text-left"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 mb-1 text-lg">Hospital Finder</h3>
              <p className="text-sm text-slate-500">Live facility registry via ABDM HFR data nodes.</p>
            </div>

            <div 
              onClick={() => onNavigate('doctors')}
              className="bg-white border border-slate-200 p-6 rounded-2xl hover:border-indigo-400 transition-all cursor-pointer shadow-sm group flex flex-col items-start text-left"
            >
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 mb-1 text-lg">Book Doctors</h3>
              <p className="text-sm text-slate-500">Find local verified doctors and book appointments.</p>
            </div>

            <div 
              onClick={() => onNavigate('donors')}
              className="bg-white border border-slate-200 p-6 rounded-2xl hover:border-amber-400 transition-all cursor-pointer shadow-sm group flex flex-col items-start text-left"
            >
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4 text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                <Droplet className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 mb-1 text-lg">Live Blood Bank</h3>
              <p className="text-sm text-slate-500">Real-time blood stock status via eRaktKosh APIs.</p>
            </div>

            <div 
              onClick={() => onNavigate('records')}
              className="bg-white border border-slate-200 p-6 rounded-2xl hover:border-emerald-400 transition-all cursor-pointer shadow-sm group flex flex-col items-start text-left"
            >
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 mb-1 text-lg">Health Records</h3>
              <p className="text-sm text-slate-500">Secure ABHA consent flow for instant digital history.</p>
            </div>

            <div 
              onClick={() => onNavigate('donate-blood')}
              className="bg-white border border-slate-200 p-6 rounded-2xl hover:border-rose-400 transition-all cursor-pointer shadow-sm group flex flex-col items-start text-left"
            >
              <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center mb-4 text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 mb-1 text-lg">Donate Blood</h3>
              <p className="text-sm text-slate-500">Donate locally and earn priority balance for emergencies.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
