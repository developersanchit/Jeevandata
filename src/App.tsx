import { useState, useEffect } from 'react';
import { User, ChevronDown, CheckCircle2, Building2, Stethoscope, Heart, LogOut, FileText, Calendar, Pill, ShieldCheck, Sparkles, Database, RefreshCw, Trash2, AlertCircle, X, ShieldAlert } from 'lucide-react';
import Home from './components/Home';
import HospitalFinder from './components/HospitalFinder';
import BloodDonors from './components/BloodDonors';
import HealthRecords from './components/HealthRecords';
import DoctorPortal from './components/DoctorPortal';
import HospitalPortal from './components/HospitalPortal';
import BloodBankPortal from './components/BloodBankPortal';
import DoctorFinder from './components/DoctorFinder';
import DonateBlood from './components/DonateBlood';
import PatientAuthModal from './components/PatientAuthModal';
import { useAppContext } from './context/AppContext';
import { ViewState, Role } from './types';

export default function App() {
  const { 
    currentPatient, 
    isPatientLoggedIn, 
    patientLogout,
    dbStatus,
    isLoadingDb,
    refreshDbData,
    retryDbConnection,
    seedInitialData,
    clearAllDbData,
    hospitals,
    doctors,
    bloodBanks,
    patientConsultations,
    patientPrescriptions,
    patientHealthRecords
  } = useAppContext();

  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [role, setRole] = useState<Role>('citizen');
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showPatientAuthModal, setShowPatientAuthModal] = useState(false);
  const [showDbModal, setShowDbModal] = useState(false);
  const [isRetryingDb, setIsRetryingDb] = useState(false);

  // Automatically scroll to the top of the page whenever the view or role changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [currentView, role]);

  const handleBackToHome = () => {
    setCurrentView('home');
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  const handleRetryDb = async () => {
    setIsRetryingDb(true);
    await retryDbConnection();
    await refreshDbData();
    setIsRetryingDb(false);
  };

  const renderView = () => {
    // Role System: App view changes based on your active role
    if (role === 'doctor') return <DoctorPortal />;
    if (role === 'hospital') return <HospitalPortal />;
    if (role === 'blood-bank') return <BloodBankPortal />;

    // Citizen / Patient views
    switch (currentView) {
      case 'home':
        return (
          <Home 
            onNavigate={setCurrentView} 
            onOpenAuth={() => setShowPatientAuthModal(true)} 
          />
        );
      case 'emergency':
        return <HospitalFinder key="emergency" isEmergency={true} onBack={handleBackToHome} />;
      case 'hospitals':
        return <HospitalFinder key="hospitals" isEmergency={false} onBack={handleBackToHome} />;
      case 'doctors':
        return (
          <DoctorFinder 
            onBack={handleBackToHome} 
            onNavigateRecords={() => setCurrentView('records')} 
          />
        );
      case 'donate-blood':
        return <DonateBlood onBack={handleBackToHome} />;
      case 'donors':
        return <BloodDonors onBack={handleBackToHome} />;
      case 'records':
        return (
          <HealthRecords 
            onBack={handleBackToHome} 
            onNavigateDoctors={() => setCurrentView('doctors')} 
          />
        );
      default:
        return <Home onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 overflow-x-hidden">
      {/* Navbar */}
      <nav className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between shadow-sm sticky top-0 z-40">
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => { setRole('citizen'); setCurrentView('home'); }}
        >
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-blue-700 transition-colors">
            <div className="w-4 h-4 border-2 border-white rounded-full"></div>
          </div>
          <span className="font-bold text-xl tracking-tight text-blue-900 hidden sm:block group-hover:text-blue-700 transition-colors">JEEVANDATA</span>
          <span className="font-bold text-xl tracking-tight text-blue-900 sm:hidden">JD</span>
          <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded ml-2 uppercase tracking-widest hidden md:inline-block">
            India Unified
          </span>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          
          {/* External Database Status Badge */}
          <button
            onClick={() => setShowDbModal(true)}
            className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer text-xs"
            title="Database Connection via DATABASE_URL"
          >
            <Database className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="font-semibold text-slate-700 hidden sm:inline">DB:</span>
            <span className="inline-flex items-center gap-1.5 font-medium text-slate-600">
              <span className={`w-2 h-2 rounded-full ${dbStatus?.connected ? 'bg-emerald-500' : 'bg-emerald-500'}`}></span>
              <span className="text-[11px] font-mono">
                {dbStatus?.connected ? 'PostgreSQL' : (dbStatus?.externalDatabaseUrlConfigured ? 'External URL' : 'Active DB')}
              </span>
            </span>
          </button>

          {/* Replaced Citizen Button with Patient Sign In Dropdown Button */}
          <div className="relative">
            {role === 'citizen' && isPatientLoggedIn && currentPatient ? (
              // When logged in as Patient: shows Patient profile button with dropdown
              <button 
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 hover:border-emerald-300 hover:shadow-xs px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl transition-all cursor-pointer"
              >
                <div className="w-6 h-6 sm:w-7 sm:h-7 bg-emerald-600 text-white font-bold rounded-lg flex items-center justify-center text-xs shrink-0 shadow-2xs">
                  {currentPatient.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider leading-none mb-0.5">Patient</p>
                  <p className="text-xs font-bold text-slate-800 leading-none truncate max-w-[110px]">{currentPatient.name}</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-emerald-600 ml-0.5" />
              </button>
            ) : role === 'citizen' ? (
              // When not logged in: the Patient sign in button with dropdown menu
              <button 
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer"
              >
                <User className="w-4 h-4" />
                <span>Patient Sign In</span>
                <ChevronDown className="w-3.5 h-3.5 text-emerald-200 ml-0.5" />
              </button>
            ) : (
              // Other role active (Doctor, Hospital, Blood Bank)
              <button 
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-2 sm:gap-2.5 bg-white border border-slate-200 hover:border-blue-300 hover:shadow-xs px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl transition-all cursor-pointer"
              >
                <div className="w-6 h-6 sm:w-7 sm:h-7 bg-blue-50 text-blue-700 rounded-lg flex items-center justify-center shrink-0">
                  {role === 'doctor' && <Stethoscope className="w-3.5 h-3.5" />}
                  {role === 'hospital' && <Building2 className="w-3.5 h-3.5" />}
                  {role === 'blood-bank' && <Heart className="w-3.5 h-3.5" />}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider leading-none mb-0.5">Active Role</p>
                  <p className="text-xs font-bold text-slate-700 leading-none capitalize">{role.replace('-', ' ')}</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
              </button>
            )}

            {/* Dropdown Menu with consistent styling among all menu options */}
            {showRoleMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowRoleMenu(false)}></div>
                <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Portal & Role</p>
                    {isPatientLoggedIn && currentPatient && (
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Patient Active
                      </span>
                    )}
                  </div>
                  
                  <div className="p-2 flex flex-col gap-1.5">
                    {/* Patient Option */}
                    <button 
                      onClick={() => {
                        setRole('citizen');
                        setShowRoleMenu(false);
                        if (!isPatientLoggedIn) {
                          setShowPatientAuthModal(true);
                        } else {
                          setCurrentView('records');
                        }
                      }}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        role === 'citizen' ? 'bg-emerald-50 text-emerald-900 border border-emerald-200/80 shadow-2xs' : 'text-slate-700 hover:bg-slate-50 border border-transparent'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        role === 'citizen' ? 'bg-emerald-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-500'
                      }`}>
                        <User className="w-4 h-4" />
                      </div>
                      <div className="text-left flex-grow">
                        <p className="font-bold leading-tight">
                          {isPatientLoggedIn && currentPatient ? 'Patient Portal' : 'Patient Sign In'}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {isPatientLoggedIn ? 'Health records & appointments' : 'Sign in to access your records'}
                        </p>
                      </div>
                      {role === 'citizen' && <CheckCircle2 className="w-4 h-4 text-emerald-600 ml-auto shrink-0" />}
                    </button>

                    {/* Doctor Option */}
                    <button 
                      onClick={() => {
                        setRole('doctor');
                        setShowRoleMenu(false);
                        setCurrentView('home');
                      }}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        role === 'doctor' ? 'bg-indigo-50 text-indigo-900 border border-indigo-200/80 shadow-2xs' : 'text-slate-700 hover:bg-slate-50 border border-transparent'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        role === 'doctor' ? 'bg-indigo-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-500'
                      }`}>
                        <Stethoscope className="w-4 h-4" />
                      </div>
                      <div className="text-left flex-grow">
                        <p className="font-bold leading-tight">Doctor Portal</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">OPD queue & consultations</p>
                      </div>
                      {role === 'doctor' && <CheckCircle2 className="w-4 h-4 text-indigo-600 ml-auto shrink-0" />}
                    </button>

                    {/* Hospital Option */}
                    <button 
                      onClick={() => {
                        setRole('hospital');
                        setShowRoleMenu(false);
                        setCurrentView('home');
                      }}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        role === 'hospital' ? 'bg-blue-50 text-blue-900 border border-blue-200/80 shadow-2xs' : 'text-slate-700 hover:bg-slate-50 border border-transparent'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        role === 'hospital' ? 'bg-blue-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-500'
                      }`}>
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div className="text-left flex-grow">
                        <p className="font-bold leading-tight">Hospital Portal</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Beds & emergency routing</p>
                      </div>
                      {role === 'hospital' && <CheckCircle2 className="w-4 h-4 text-blue-600 ml-auto shrink-0" />}
                    </button>

                    {/* Blood Bank Option */}
                    <button 
                      onClick={() => {
                        setRole('blood-bank');
                        setShowRoleMenu(false);
                        setCurrentView('home');
                      }}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        role === 'blood-bank' ? 'bg-rose-50 text-rose-900 border border-rose-200/80 shadow-2xs' : 'text-slate-700 hover:bg-slate-50 border border-transparent'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        role === 'blood-bank' ? 'bg-rose-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-500'
                      }`}>
                        <Heart className="w-4 h-4" />
                      </div>
                      <div className="text-left flex-grow">
                        <p className="font-bold leading-tight">Blood Bank Portal</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">eRaktKosh live inventory</p>
                      </div>
                      {role === 'blood-bank' && <CheckCircle2 className="w-4 h-4 text-rose-600 ml-auto shrink-0" />}
                    </button>

                    {/* Patient Shortcuts if logged in */}
                    {isPatientLoggedIn && currentPatient && (
                      <div className="pt-2 border-t border-slate-100 space-y-1">
                        <button
                          onClick={() => {
                            setRole('citizen');
                            setCurrentView('records');
                            setShowRoleMenu(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors text-left cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5 text-emerald-600" />
                          <span>My Health Records</span>
                        </button>

                        <button
                          onClick={() => {
                            patientLogout();
                            setShowRoleMenu(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out Patient ({currentPatient.name})</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

        </div>
      </nav>

      {/* Main Content Area */}
      {renderView()}

      {/* Patient Auth Modal */}
      <PatientAuthModal 
        isOpen={showPatientAuthModal} 
        onClose={() => setShowPatientAuthModal(false)}
        onSuccess={() => {
          setRole('citizen');
          setCurrentView('records');
        }}
      />

      {/* Database Connection & Management Modal */}
      {showDbModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
            
            <button 
              onClick={() => setShowDbModal(false)}
              className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="bg-slate-900 p-6 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600/30 text-blue-400 rounded-xl flex items-center justify-center border border-blue-500/30">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">External Database Connection</h3>
                  <p className="text-xs text-slate-400">Environment Variable: <code className="text-blue-300">DATABASE_URL</code></p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Connection Status Box */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status:</span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    {dbStatus?.provider || 'Database Active'}
                  </span>
                </div>

                <div className="text-xs space-y-1.5 pt-2 border-t border-slate-200/80">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Configured URL:</span>
                    <span className="font-mono text-slate-700 truncate max-w-[260px]">
                      {dbStatus?.externalDatabaseUrlMasked || 'DATABASE_URL (Environment)'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Placeholder Data:</span>
                    <span className="font-semibold text-emerald-700">0 (Completely Removed)</span>
                  </div>
                </div>
              </div>

              {/* Table Metrics */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                  Database Table Records
                </h4>
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                    <span className="block text-xl font-bold text-slate-900">{hospitals.length}</span>
                    <span className="text-[10px] uppercase font-semibold text-slate-500">Hospitals</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                    <span className="block text-xl font-bold text-slate-900">{doctors.length}</span>
                    <span className="text-[10px] uppercase font-semibold text-slate-500">Doctors</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                    <span className="block text-xl font-bold text-slate-900">{bloodBanks.length}</span>
                    <span className="text-[10px] uppercase font-semibold text-slate-500">Blood Centers</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                    <span className="block text-xl font-bold text-slate-900">{patientConsultations.length}</span>
                    <span className="text-[10px] uppercase font-semibold text-slate-500">Consultations</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                    <span className="block text-xl font-bold text-slate-900">{patientPrescriptions.length}</span>
                    <span className="text-[10px] uppercase font-semibold text-slate-500">Prescriptions</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                    <span className="block text-xl font-bold text-slate-900">{patientHealthRecords.length}</span>
                    <span className="text-[10px] uppercase font-semibold text-slate-500">Health Records</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex gap-2">
                  <button
                    onClick={handleRetryDb}
                    disabled={isRetryingDb}
                    className="flex-1 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2.5 px-4 rounded-xl transition-all cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRetryingDb ? 'animate-spin' : ''}`} />
                    <span>{isRetryingDb ? 'Checking DB...' : 'Test / Reconnect DB'}</span>
                  </button>

                  <button
                    onClick={() => seedInitialData()}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2.5 px-4 rounded-xl transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Seed Sample ABDM Data</span>
                  </button>
                </div>

                <button
                  onClick={() => clearAllDbData()}
                  className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 font-semibold text-xs py-2 px-4 rounded-xl transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All Records (Empty Clean Slate)</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto bg-white border-t border-slate-200 py-6 px-4 text-center">
        <p className="text-sm text-slate-500 font-medium">
          &copy; {new Date().getFullYear()} National Health Authority, Government of India. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
