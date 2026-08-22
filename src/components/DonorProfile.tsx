import { Heart, Droplet, Award, Calendar, History, ArrowRight, Lock } from 'lucide-react';
import { useState } from 'react';

export default function DonorProfile() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  if (!isLoggedIn) {
    return (
      <div className="flex-grow w-full max-w-md mx-auto px-4 py-20 flex flex-col items-center justify-center">
        <div className="w-full bg-white rounded-3xl shadow-xl shadow-rose-100/50 border border-slate-200 p-8 text-center">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Heart className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Donor Login</h2>
          <p className="text-slate-500 mb-8 text-sm">Access your eRaktKosh linked profile via OTP</p>
          
          <form onSubmit={(e) => { e.preventDefault(); setIsLoggedIn(true); }} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Mobile Number or ABHA</label>
              <input type="text" required placeholder="Enter number..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none font-medium" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">6-Digit OTP</label>
              <input type="text" required placeholder="••••••" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none font-medium tracking-widest text-lg" />
            </div>
            <button type="submit" className="w-full flex items-center justify-center gap-2 bg-rose-600 text-white font-bold py-3.5 rounded-xl hover:bg-rose-700 active:scale-95 transition-all mt-4">
              <Lock className="w-4 h-4" /> Verify & Access Profile
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow w-full max-w-5xl mx-auto px-4 sm:px-8 py-8 flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <Heart className="text-rose-500 w-8 h-8" /> 
            Donor Profile
          </h2>
          <p className="text-slate-500 mt-2">
            Track your life-saving contributions and eligibility status.
          </p>
        </div>
        <div className="bg-rose-50 border border-rose-100 px-4 py-2 rounded-lg flex items-center gap-2 text-rose-700 text-sm font-bold">
          <Award className="w-4 h-4" />
          Gold Tier Donor
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 text-slate-500 mb-2 font-semibold text-sm uppercase tracking-wider">
            <Droplet className="w-4 h-4 text-rose-500" /> Total Donated
          </div>
          <div className="text-3xl font-extrabold text-slate-900">4.5<span className="text-lg text-slate-500 font-medium ml-1">Liters</span></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 text-slate-500 mb-2 font-semibold text-sm uppercase tracking-wider">
            <Heart className="w-4 h-4 text-rose-500" /> Lives Saved (Est)
          </div>
          <div className="text-3xl font-extrabold text-slate-900">12<span className="text-lg text-slate-500 font-medium ml-1">People</span></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 text-slate-500 mb-2 font-semibold text-sm uppercase tracking-wider">
            <History className="w-4 h-4 text-blue-500" /> Last Donation
          </div>
          <div className="text-3xl font-extrabold text-slate-900">4<span className="text-lg text-slate-500 font-medium ml-1">Months ago</span></div>
        </div>
        <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 text-emerald-700 mb-2 font-semibold text-sm uppercase tracking-wider">
            <Calendar className="w-4 h-4 text-emerald-600" /> Next Eligible
          </div>
          <div className="text-2xl font-extrabold text-emerald-900 mt-1">Eligible Now</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Donation History</h3>
          <button className="text-blue-600 text-sm font-bold hover:text-blue-700 flex items-center gap-1">
            Download Certificate <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="divide-y divide-slate-100">
          {[
            { date: 'Oct 12, 2025', location: 'AIIMS Main Blood Bank', amount: '450 ml', type: 'Whole Blood' },
            { date: 'Jun 05, 2025', location: 'Rotary Blood Bank', amount: '450 ml', type: 'Whole Blood' },
            { date: 'Jan 22, 2025', location: 'Indian Red Cross Society', amount: '500 ml', type: 'Plasma' },
          ].map((record, i) => (
            <div key={i} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="font-bold text-slate-900">{record.location}</p>
                <p className="text-sm text-slate-500 mt-1">{record.date}</p>
              </div>
              <div className="flex gap-4 sm:text-right">
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">Type</p>
                  <p className="font-semibold text-slate-700">{record.type}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">Amount</p>
                  <p className="font-bold text-emerald-600">{record.amount}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
