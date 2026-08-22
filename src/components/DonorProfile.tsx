import { Heart, Droplet, Award, Calendar, History, Lock, LogOut, Download, Share2, Activity, MapPin, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function DonorProfile() {
  const { isLoggedIn, error, login, logout } = useAuth('donor');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(mobile, otp);
  };

  if (!isLoggedIn) {
    return (
      <div className="flex-grow w-full bg-slate-50 flex items-center justify-center p-4 min-h-[calc(100vh-64px)]">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-8 pb-6 border-b border-slate-100 text-center">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Heart className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Donor Access</h2>
            <p className="text-slate-500 mt-2 text-sm">Sign in with eRaktKosh mobile number</p>
          </div>
          
          <div className="p-8 pt-6">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-medium rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Mobile Number</label>
                <input 
                  type="text" 
                  required 
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="Enter 10-digit number" 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-all text-sm font-medium placeholder-slate-400" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">6-Digit OTP</label>
                <input 
                  type="password" 
                  required 
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="••••••" 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-all text-lg tracking-[0.5em] font-medium placeholder-slate-300 text-center" 
                />
              </div>
              <button type="submit" className="w-full flex items-center justify-center gap-2 bg-rose-600 text-white font-medium py-3 rounded-xl hover:bg-rose-700 transition-colors mt-2">
                Verify & Continue
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow bg-slate-50 w-full pb-12">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-rose-600 text-white rounded-lg flex items-center justify-center">
              <Heart className="w-4 h-4 fill-current" />
            </div>
            <h1 className="text-lg font-semibold text-slate-900">Arjun Kumar</h1>
            <span className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 text-xs font-medium border border-amber-200">
              <Award className="w-3.5 h-3.5" /> Gold Tier
            </span>
          </div>
          <button 
            onClick={logout}
            className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Top Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 text-slate-500 mb-3 text-xs font-medium uppercase tracking-wider">
              <Droplet className="w-4 h-4 text-rose-500" /> Total Donated
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold text-slate-900">4.5</span>
              <span className="text-sm text-slate-500 font-medium">Liters</span>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 text-slate-500 mb-3 text-xs font-medium uppercase tracking-wider">
              <Activity className="w-4 h-4 text-blue-500" /> Lives Impacted
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold text-slate-900">12</span>
              <span className="text-sm text-slate-500 font-medium">People (Est)</span>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 text-slate-500 mb-3 text-xs font-medium uppercase tracking-wider">
              <History className="w-4 h-4 text-slate-400" /> Last Donation
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold text-slate-900">4</span>
              <span className="text-sm text-slate-500 font-medium">Months ago</span>
            </div>
          </div>
          <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-200 shadow-sm">
            <div className="flex items-center gap-2 text-emerald-700 mb-3 text-xs font-medium uppercase tracking-wider">
              <Calendar className="w-4 h-4 text-emerald-600" /> Status
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-emerald-900 mt-1">Eligible Now</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-6">
            {/* History Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-base font-semibold text-slate-900">Donation History</h2>
                <button className="text-sm font-medium text-slate-500 hover:text-slate-900 flex items-center gap-2">
                  <Download className="w-4 h-4" /> Export
                </button>
              </div>
              <div className="divide-y divide-slate-100">
                {[
                  { date: 'Oct 12, 2025', location: 'AIIMS Main Blood Bank', amount: '450 ml', type: 'Whole Blood' },
                  { date: 'Jun 05, 2025', location: 'Rotary Blood Bank', amount: '450 ml', type: 'Whole Blood' },
                  { date: 'Jan 22, 2025', location: 'Indian Red Cross', amount: '500 ml', type: 'Plasma' },
                ].map((record, i) => (
                  <div key={i} className="p-6 hover:bg-slate-50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900 mb-1">{record.location}</h3>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {record.date}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 sm:justify-end">
                        <div className="text-left sm:text-right">
                          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-0.5">Type</p>
                          <p className="text-sm font-medium text-slate-900">{record.type}</p>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-0.5">Amount</p>
                          <p className="text-sm font-semibold text-rose-600">{record.amount}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-900 rounded-2xl shadow-sm p-6 text-white">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-4">
                <Share2 className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Share Certificate</h3>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">Inspire others to donate. Share your latest donation certificate on social media.</p>
              <button className="w-full bg-white text-slate-900 font-medium py-2.5 rounded-xl text-sm hover:bg-slate-100 transition-colors">
                Download Latest Card
              </button>
            </div>
            
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
               <h3 className="text-sm font-semibold text-slate-900 mb-4">Upcoming Drives</h3>
               <div className="space-y-4">
                 <div className="flex gap-3 items-start">
                   <div className="w-10 h-10 rounded-lg bg-rose-50 flex flex-col items-center justify-center shrink-0 border border-rose-100">
                     <span className="text-[10px] uppercase font-bold text-rose-500">Oct</span>
                     <span className="text-sm font-bold text-rose-700 leading-none">24</span>
                   </div>
                   <div>
                     <p className="text-sm font-medium text-slate-900">Safdarjung Blood Camp</p>
                     <p className="text-xs text-slate-500 flex items-center gap-1 mt-1"><MapPin className="w-3 h-3"/> 3.2 km away</p>
                   </div>
                 </div>
               </div>
               <button className="w-full mt-6 text-sm font-medium text-rose-600 hover:text-rose-700 bg-rose-50 py-2 rounded-xl transition-colors">
                 Find more near me
               </button>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
