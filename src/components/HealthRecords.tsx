import React, { useState } from 'react';
import { FileText, ShieldCheck, CheckCircle2, User, Activity, ArrowLeft } from 'lucide-react';

type Step = 'LOGIN' | 'PENDING_CONSENT' | 'GRANTED';

interface HealthRecordsProps {
  onBack?: () => void;
}

export default function HealthRecords({ onBack }: HealthRecordsProps) {
  const [step, setStep] = useState<Step>('LOGIN');
  const [abhaId, setAbhaId] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (abhaId.trim()) setStep('PENDING_CONSENT');
  };

  return (
    <div className="flex-grow w-full bg-slate-50 flex flex-col items-center justify-center p-4 min-h-[calc(100vh-64px)] py-8">
      {onBack && (
        <div className="w-full max-w-2xl mb-4 flex items-center justify-start">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 px-3.5 py-1.5 rounded-xl shadow-xs transition-all cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Home</span>
          </button>
        </div>
      )}
      
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-900 px-6 py-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <ShieldCheck className="w-32 h-32 text-white" />
          </div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-14 h-14 bg-white/10 rounded-xl border border-white/20 flex items-center justify-center mb-4 backdrop-blur-sm">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">ABHA Consent Manager</h2>
            <p className="text-slate-400 mt-1.5 text-sm font-medium">Securely share health records with verified providers.</p>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-10">
          
          {step === 'LOGIN' && (
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-lg font-semibold text-slate-900">Access Digital Records</h3>
                <p className="text-sm text-slate-500 mt-1">Enter your Ayushman Bharat Health Account address.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">ABHA Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={abhaId}
                    onChange={(e) => setAbhaId(e.target.value)}
                    placeholder="e.g., patientname@abdm"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm text-slate-900 font-medium placeholder-slate-400 transition-all"
                  />
                </div>
              </div>

              <button type="submit" className="w-full bg-emerald-600 text-white font-medium py-3 rounded-xl hover:bg-emerald-700 transition-colors">
                Authenticate via OTP
              </button>
            </form>
          )}

          {step === 'PENDING_CONSENT' && (
            <div className="space-y-6">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <Activity className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-semibold text-amber-900 text-sm">New Consent Request</h4>
                  <p className="text-xs text-amber-700 mt-1">A healthcare provider is requesting access to your medical history for emergency treatment.</p>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-5 space-y-4 bg-white shadow-sm">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <span className="text-sm text-slate-500 font-medium">Requester</span>
                  <span className="font-semibold text-slate-900 text-sm">Dr. Ram Manohar Lohia Hospital</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <span className="text-sm text-slate-500 font-medium">Purpose of Request</span>
                  <span className="font-semibold text-slate-900 text-sm">Care Management</span>
                </div>
                <div>
                  <span className="text-sm text-slate-500 font-medium block mb-3">Information Requested</span>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-slate-100 text-slate-700 text-[11px] font-semibold px-3 py-1.5 rounded-md border border-slate-200">Diagnostic Reports</span>
                    <span className="bg-slate-100 text-slate-700 text-[11px] font-semibold px-3 py-1.5 rounded-md border border-slate-200">Prescriptions</span>
                    <span className="bg-slate-100 text-slate-700 text-[11px] font-semibold px-3 py-1.5 rounded-md border border-slate-200">Immunization Record</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setStep('LOGIN')}
                  className="flex-1 bg-white border border-slate-200 text-slate-700 font-medium py-3 rounded-xl hover:bg-slate-50 transition-colors text-sm"
                >
                  Deny
                </button>
                <button 
                  onClick={() => setStep('GRANTED')}
                  className="flex-1 bg-emerald-600 text-white font-medium py-3 rounded-xl hover:bg-emerald-700 transition-colors text-sm"
                >
                  Grant Consent
                </button>
              </div>
            </div>
          )}

          {step === 'GRANTED' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Consent Granted</h3>
              <p className="text-slate-500 mb-8 max-w-sm mx-auto text-sm leading-relaxed">Your health records have been securely transmitted to the provider via the ABDM gateway.</p>
              
              <button 
                onClick={() => {
                  setStep('LOGIN');
                  setAbhaId('');
                }}
                className="bg-slate-900 text-white font-medium px-8 py-2.5 rounded-xl hover:bg-slate-800 transition-colors text-sm"
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
