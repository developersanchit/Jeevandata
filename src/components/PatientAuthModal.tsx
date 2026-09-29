import React, { useState } from 'react';
import { User, ShieldCheck, ArrowRight, CheckCircle2, X, Lock } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface PatientAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialMessage?: string;
}

export default function PatientAuthModal({ isOpen, onClose, onSuccess, initialMessage }: PatientAuthModalProps) {
  const { patientLogin } = useAppContext();
  const [identifier, setIdentifier] = useState('');
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError('Please enter your mobile number or ABHA address');
      return;
    }
    setError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOtpStep(true);
      setOtp('4821'); // Simulated OTP auto-fill preview
    }, 700);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      setError('Please enter the verification code');
      return;
    }
    setLoading(true);
    try {
      const ok = await patientLogin(identifier);
      setLoading(false);
      if (ok) {
        if (onSuccess) onSuccess();
        onClose();
      } else {
        setError('Unable to authenticate with database. Please try again.');
      }
    } catch (err: any) {
      setLoading(false);
      setError(err?.message || 'Authentication failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Banner */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-6 text-white relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white border border-white/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest bg-emerald-500/40 px-2 py-0.5 rounded text-emerald-100">
                ABDM Patient Portal
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">Citizen & Patient Sign In</h2>
            </div>
          </div>
          <p className="text-xs text-emerald-100 leading-relaxed">
            {initialMessage || 'Access your official health records, consult with trusted doctors, and view digital prescriptions in one secure place.'}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">

          {!otpStep ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Mobile Number or ABHA Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. 9876543210 or username@abdm"
                    className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  We'll send an authentication OTP to verify your Ayushman Bharat identity.
                </p>
              </div>

              {error && (
                <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-100">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Proceed with OTP</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4 animate-in fade-in slide-in-from-right-2">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Enter 4-Digit OTP
                  </label>
                  <button 
                    type="button" 
                    onClick={() => setOtpStep(false)}
                    className="text-xs text-emerald-600 hover:underline cursor-pointer"
                  >
                    Change number
                  </button>
                </div>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 4821"
                  className="w-full text-center text-xl tracking-widest font-mono py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
                <p className="text-[11px] text-slate-400 mt-1.5 text-center">
                  Demo auto-filled: enter <strong>4821</strong> or click verify below.
                </p>
              </div>

              {error && (
                <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-100">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition-all shadow-sm shadow-emerald-200 flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify & Open Patient Portal</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Privacy Note */}
          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-2 border-t border-slate-100">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Encrypted via ABDM Gateway • 100% Patient Consent Owned</span>
          </div>

        </div>
      </div>
    </div>
  );
}
