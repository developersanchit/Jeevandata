import { useState } from 'react';
import { FileText, ShieldCheck, CheckCircle2, User, Activity } from 'lucide-react';

type Step = 'LOGIN' | 'PENDING_CONSENT' | 'GRANTED';

export default function HealthRecords() {
  const [step, setStep] = useState<Step>('LOGIN');
  const [abhaId, setAbhaId] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (abhaId.trim()) setStep('PENDING_CONSENT');
  };

  return (
    <div className="flex-grow w-full max-w-3xl mx-auto px-4 sm:px-8 py-12 flex flex-col items-center justify-center">
      
      <div className="w-full bg-white rounded-2xl shadow-xl shadow-emerald-100/40 border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-emerald-600 px-6 py-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <ShieldCheck className="w-32 h-32 text-white" />
          </div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <FileText className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">ABHA Consent Manager</h2>
            <p className="text-emerald-100 mt-2 text-sm font-medium">Securely share health records with verified providers.</p>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-10">
          
          {step === 'LOGIN' && (
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-slate-800">Access Digital Records</h3>
                <p className="text-sm text-slate-500 mt-1">Enter your Ayushman Bharat Health Account address to fetch pending consent requests.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">ABHA Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="w-5 h-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={abhaId}
                    onChange={(e) => setAbhaId(e.target.value)}
                    placeholder="e.g., patientname@abdm"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-800 font-medium"
                  />
                </div>
              </div>

              <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-3.5 rounded-xl hover:bg-emerald-700 active:scale-95 transition-all shadow-md shadow-emerald-200">
                Authenticate via OTP
              </button>
            </form>
          )}

          {step === 'PENDING_CONSENT' && (
            <div className="space-y-6">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <Activity className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-bold text-amber-900 text-sm">New Consent Request</h4>
                  <p className="text-xs text-amber-700 mt-1">A healthcare provider is requesting access to your medical history for emergency treatment.</p>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-5 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <span className="text-sm text-slate-500">Requester</span>
                  <span className="font-bold text-slate-800">Dr. Ram Manohar Lohia Hospital</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <span className="text-sm text-slate-500">Purpose of Request</span>
                  <span className="font-bold text-slate-800">Care Management</span>
                </div>
                <div>
                  <span className="text-sm text-slate-500 block mb-2">Information Requested</span>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1 rounded-full">Diagnostic Reports</span>
                    <span className="bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1 rounded-full">Prescriptions</span>
                    <span className="bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1 rounded-full">Immunization Record</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setStep('LOGIN')}
                  className="flex-1 bg-white border border-slate-200 text-slate-700 font-bold py-3.5 rounded-xl hover:bg-slate-50 active:scale-95 transition-all"
                >
                  Deny
                </button>
                <button 
                  onClick={() => setStep('GRANTED')}
                  className="flex-1 bg-emerald-600 text-white font-bold py-3.5 rounded-xl hover:bg-emerald-700 active:scale-95 transition-all shadow-md shadow-emerald-200"
                >
                  Grant Consent
                </button>
              </div>
            </div>
          )}

          {step === 'GRANTED' && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-800 mb-2">Consent Granted</h3>
              <p className="text-slate-500 mb-8 max-w-sm mx-auto">Your health records have been securely transmitted to the provider via the ABDM gateway.</p>
              
              <button 
                onClick={() => {
                  setStep('LOGIN');
                  setAbhaId('');
                }}
                className="bg-slate-900 text-white font-bold px-8 py-3 rounded-xl hover:bg-slate-800 transition-all"
              >
                Close Session
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
