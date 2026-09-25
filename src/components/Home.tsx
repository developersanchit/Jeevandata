import { Search, ShieldAlert, Droplet, Activity, FileText, Heart } from "lucide-react";
import { ViewState } from "../types";

interface HomeProps {
  onNavigate: (view: ViewState) => void;
}

export default function Home({ onNavigate }: HomeProps) {
  const handleNavigate = (view: ViewState) => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    onNavigate(view);
  };

  return (
    <main className="flex-grow flex flex-col items-center justify-start relative px-4 sm:px-8 py-12 w-full">
      <div className="text-center mb-10 w-full max-w-4xl">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
          Your Health, <span className="text-blue-600 italic">Simplified.</span>
        </h1>
        <p className="text-slate-500 max-w-xl mx-auto text-base sm:text-lg">
          Find nearby hospitals, book trusted doctors, and access emergency services instantly. A complete healthcare companion for you and your family.
        </p>
      </div>

      {/* Search Bar */}
      <div className="w-full max-w-2xl bg-white shadow-2xl shadow-blue-100/50 rounded-2xl border border-slate-100 p-2 flex items-center gap-2 sm:gap-4 group focus-within:ring-2 focus-within:ring-blue-500 transition-all mb-12">
        <div className="pl-2 sm:pl-4 text-slate-400 shrink-0">
          <Search className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <input
          type="text"
          placeholder="Search for hospitals, doctors, or blood banks nearby..."
          className="flex-grow bg-transparent border-none focus:ring-0 text-base sm:text-lg py-3 sm:py-4 placeholder:text-slate-400 outline-none w-full min-w-0"
        />
        <button 
          onClick={() => handleNavigate('hospitals')}
          className="bg-blue-600 text-white font-bold px-4 sm:px-8 py-2 sm:py-3 rounded-xl hover:bg-blue-700 active:scale-95 transition-all shrink-0 cursor-pointer"
        >
          Search
        </button>
      </div>

      <div className="w-full max-w-6xl space-y-12">
        {/* Section 1: Citizen Services */}
        <section>
          <div className="mb-6 flex items-center gap-3">
            <div className="w-2 h-6 bg-blue-600 rounded-full"></div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Essential Health Services</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div 
              onClick={() => handleNavigate('emergency')}
              className="bg-red-50 border border-red-100 p-6 rounded-2xl hover:bg-red-100 transition-colors cursor-pointer group flex flex-col items-start text-left"
            >
              <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center mb-4 text-white shadow-lg shadow-red-200">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-red-900 mb-1 text-lg">Emergency Reporting</h3>
              <p className="text-sm text-red-700/80">Get immediate assistance and secure a bed at the nearest emergency center.</p>
            </div>

            <div 
              onClick={() => handleNavigate('hospitals')}
              className="bg-white border border-slate-200 p-6 rounded-2xl hover:border-blue-400 transition-all cursor-pointer shadow-sm group flex flex-col items-start text-left"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 mb-1 text-lg">Find Hospitals</h3>
              <p className="text-sm text-slate-500">Locate nearby hospitals and view their real-time bed availability.</p>
            </div>

            <div 
              onClick={() => handleNavigate('donors')}
              className="bg-white border border-slate-200 p-6 rounded-2xl hover:border-amber-400 transition-all cursor-pointer shadow-sm group flex flex-col items-start text-left"
            >
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4 text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                <Droplet className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 mb-1 text-lg">Blood Availability</h3>
              <p className="text-sm text-slate-500">Check real-time blood stock and locate nearby blood banks.</p>
            </div>

            <div 
              onClick={() => handleNavigate('doctors')}
              className="bg-white border border-slate-200 p-6 rounded-2xl hover:border-indigo-400 transition-all cursor-pointer shadow-sm group flex flex-col items-start text-left"
            >
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 mb-1 text-lg">Book local Doctors</h3>
              <p className="text-sm text-slate-500">Find trusted local specialists and easily book appointments.</p>
            </div>

            <div 
              onClick={() => handleNavigate('records')}
              className="bg-white border border-slate-200 p-6 rounded-2xl hover:border-emerald-400 transition-all cursor-pointer shadow-sm group flex flex-col items-start text-left"
            >
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 mb-1 text-lg">Health Records</h3>
              <p className="text-sm text-slate-500">Access and manage your digital medical history securely in one place.</p>
            </div>

            <div 
              onClick={() => handleNavigate('donate-blood')}
              className="bg-white border border-slate-200 p-6 rounded-2xl hover:border-rose-400 transition-all cursor-pointer shadow-sm group flex flex-col items-start text-left"
            >
              <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center mb-4 text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 mb-1 text-lg">Donate Blood</h3>
              <p className="text-sm text-slate-500">Schedule donations nearby and earn priority credits for emergencies.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
