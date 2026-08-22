import { useState } from 'react';
import { User, ChevronDown, CheckCircle2, Building2, Stethoscope, Heart } from 'lucide-react';
import Home from './components/Home';
import HospitalFinder from './components/HospitalFinder';
import BloodDonors from './components/BloodDonors';
import HealthRecords from './components/HealthRecords';
import DoctorPortal from './components/DoctorPortal';
import HospitalPortal from './components/HospitalPortal';
import DonorProfile from './components/DonorProfile';
import { ViewState, Role } from './types';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [role, setRole] = useState<Role>('citizen');
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const renderView = () => {
    // Fiverr-like Role System: The entire app view changes based on your active role
    if (role === 'doctor') return <DoctorPortal />;
    if (role === 'hospital') return <HospitalPortal />;
    if (role === 'donor') return <DonorProfile />;

    // Citizen views
    switch (currentView) {
      case 'home':
        return <Home onNavigate={setCurrentView} />;
      case 'emergency':
        return <HospitalFinder isEmergency={true} />;
      case 'hospitals':
        return <HospitalFinder isEmergency={false} />;
      case 'donors':
        return <BloodDonors />;
      case 'records':
        return <HealthRecords />;
      default:
        return <Home onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 overflow-x-hidden">
      {/* Navbar */}
      <nav className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between shadow-sm sticky top-0 z-50">
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => { setRole('citizen'); setCurrentView('home'); }}
        >
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-blue-700 transition-colors">
            <div className="w-4 h-4 border-2 border-white rounded-full"></div>
          </div>
          <span className="font-bold text-xl tracking-tight text-blue-900 hidden sm:block group-hover:text-blue-700 transition-colors">HEALTH GATEWAY</span>
          <span className="font-bold text-xl tracking-tight text-blue-900 sm:hidden">HG</span>
          <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded ml-2 uppercase tracking-widest hidden md:inline-block">
            India Unified
          </span>
        </div>
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Profile Role Switcher (Fiverr style) */}
          <div className="relative">
            <button 
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2 sm:gap-3 bg-white border border-slate-200 hover:border-blue-300 hover:shadow-sm px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl transition-all"
            >
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-50 text-blue-700 rounded-lg flex items-center justify-center shrink-0">
                {role === 'citizen' && <User className="w-4 h-4" />}
                {role === 'doctor' && <Stethoscope className="w-4 h-4" />}
                {role === 'hospital' && <Building2 className="w-4 h-4" />}
                {role === 'donor' && <Heart className="w-4 h-4" />}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider leading-none mb-0.5">Profile</p>
                <p className="text-sm font-bold text-slate-700 leading-none capitalize">{role}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 ml-1" />
            </button>

            {showRoleMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowRoleMenu(false)}></div>
                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50">
                  <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Switch Profile View</p>
                  </div>
                  <div className="p-2 flex flex-col gap-1">
                    {(['citizen', 'doctor', 'hospital', 'donor'] as Role[]).map((r) => (
                      <button 
                        key={r}
                        onClick={() => {
                          setRole(r);
                          setShowRoleMenu(false);
                          setCurrentView('home');
                        }}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition-all ${
                          role === r ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        {r === 'citizen' && <User className="w-4 h-4" />}
                        {r === 'doctor' && <Stethoscope className="w-4 h-4" />}
                        {r === 'hospital' && <Building2 className="w-4 h-4" />}
                        {r === 'donor' && <Heart className="w-4 h-4" />}
                        <span className="capitalize">{r}</span>
                        {role === r && <CheckCircle2 className="w-4 h-4 ml-auto" />}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      {renderView()}

      {/* Footer */}
      <footer className="mt-auto bg-white border-t border-slate-200 py-6 px-4 text-center">
        <p className="text-sm text-slate-500 font-medium">
          &copy; {new Date().getFullYear()} National Health Authority, Government of India. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
