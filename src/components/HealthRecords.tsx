import React, { useState } from 'react';
import { 
  FileText, 
  Calendar, 
  Pill, 
  ShieldCheck, 
  Activity, 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  User, 
  Download, 
  Plus, 
  Search, 
  Video, 
  MapPin, 
  AlertCircle, 
  X, 
  Share2, 
  Printer, 
  ChevronRight,
  LogOut,
  Stethoscope,
  HeartPulse,
  BadgeCheck,
  Building2
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import PatientAuthModal from './PatientAuthModal';
import { HealthRecordItem, ConsultationRecord, Prescription } from '../types';

interface HealthRecordsProps {
  onBack?: () => void;
  onNavigateDoctors?: () => void;
  initialTab?: 'records' | 'consultations' | 'prescriptions' | 'consent';
}

export default function HealthRecords({ onBack, onNavigateDoctors, initialTab = 'records' }: HealthRecordsProps) {
  const { 
    currentPatient, 
    isPatientLoggedIn, 
    patientLogin, 
    patientLogout, 
    patientConsultations, 
    patientPrescriptions, 
    patientHealthRecords, 
    consentRequests, 
    handleConsentAction,
    cancelPatientConsultation,
    addHealthRecord
  } = useAppContext();

  const [activeTab, setActiveTab] = useState<'records' | 'consultations' | 'prescriptions' | 'consent'>(initialTab);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // Modals & Details
  const [selectedRecord, setSelectedRecord] = useState<HealthRecordItem | null>(null);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [activeVideoCall, setActiveVideoCall] = useState<ConsultationRecord | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // New record form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<HealthRecordItem['category']>('Diagnostic Lab Report');
  const [newIssuer, setNewIssuer] = useState('');
  const [newSummary, setNewSummary] = useState('');

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleUploadRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newIssuer) return;
    addHealthRecord({
      title: newTitle,
      category: newCategory,
      issuedBy: newIssuer,
      date: 'Today',
      verified: true,
      fileType: 'Uploaded Document',
      summary: newSummary || 'Digitally uploaded personal health record verified via ABDM format.',
      metrics: [
        { label: 'Status', value: 'Verified', status: 'normal' }
      ]
    });
    setNewTitle('');
    setNewIssuer('');
    setNewSummary('');
    setShowUploadModal(false);
    showToast('Health record uploaded and synced successfully!');
  };

  // If patient is NOT logged in: Prompt to Sign In
  if (!isPatientLoggedIn || !currentPatient) {
    return (
      <div className="flex-grow w-full bg-slate-50 flex flex-col items-center justify-start p-4 sm:p-8 min-h-[calc(100vh-64px)]">
        {onBack && (
          <div className="w-full max-w-4xl mb-4 flex items-center justify-start">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 px-3.5 py-1.5 rounded-xl shadow-2xs transition-all cursor-pointer group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Home</span>
            </button>
          </div>
        )}

        <div className="w-full max-w-4xl bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mt-2">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-800 p-8 sm:p-12 text-white relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 opacity-10 pointer-events-none">
              <ShieldCheck className="w-96 h-96 text-white" />
            </div>
            
            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-emerald-500/30 border border-emerald-400/40 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-emerald-100 mb-4">
                <BadgeCheck className="w-4 h-4" />
                <span>Ayushman Bharat Digital Mission (ABDM)</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
                Patient Health & Records Portal
              </h1>
              <p className="text-emerald-100 text-sm sm:text-base leading-relaxed">
                Log in as a patient to access your lifelong medical records, review upcoming doctor consultations, and view verified digital prescriptions.
              </p>
            </div>
          </div>

          {/* Body Features & Auth trigger */}
          <div className="p-6 sm:p-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="bg-slate-50 border border-slate-200/80 p-5 rounded-2xl flex flex-col items-start">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-1">Health Records</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  View lab diagnostic reports, discharge summaries, and vaccine certificates linked to your ABHA ID.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 p-5 rounded-2xl flex flex-col items-start">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-3">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-1">Meetings & Consultations</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Track booked doctor appointments, token queue position, and join video consultations directly.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 p-5 rounded-2xl flex flex-col items-start">
                <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center mb-3">
                  <Pill className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-1">Digital Prescriptions</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Access doctor-signed e-prescriptions with dosage schedules and one-click pharmacy availability.
                </p>
              </div>
            </div>

            {/* Login Call to Action */}
            <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-slate-50 border border-emerald-200 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Secure Access</span>
                <h3 className="text-xl font-bold text-slate-900 mt-0.5">Ready to view your records?</h3>
                <p className="text-sm text-slate-600 mt-1 max-w-md">
                  Sign in using your mobile number or ABHA address to access your verified consultations, health records, and prescriptions.
                </p>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="w-full sm:w-auto bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-6 py-3 rounded-xl transition-all text-sm flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-emerald-200"
                >
                  <User className="w-4 h-4" />
                  <span>Sign In with Phone / ABHA</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <PatientAuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />
      </div>
    );
  }

  // Active Patient Dashboard
  return (
    <div className="flex-grow w-full bg-slate-50 min-h-[calc(100vh-64px)] pb-16">
      
      {/* Top Bar with Back and Patient Identity */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              {onBack && (
                <button
                  onClick={onBack}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-3.5 py-1.5 rounded-xl transition-all mb-3 cursor-pointer group shadow-2xs"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                  <span>Back to Home</span>
                </button>
              )}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-bold flex items-center justify-center text-lg shadow-md shadow-emerald-200">
                  {currentPatient.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{currentPatient.name}</h1>
                    <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                      <BadgeCheck className="w-3.5 h-3.5" /> ABDM Verified
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                    <span className="font-mono font-medium text-slate-700">ABHA: {currentPatient.abhaId}</span>
                    <span>•</span>
                    <span>Card No: {currentPatient.abhaNumber}</span>
                    <span>•</span>
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded font-semibold text-slate-700">
                      Blood: {currentPatient.bloodGroup}
                    </span>
                    <span>•</span>
                    <span>{currentPatient.age} Yrs ({currentPatient.gender})</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowUploadModal(true)}
                className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-4 py-2 rounded-xl transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Upload Record</span>
              </button>
              <button
                onClick={patientLogout}
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
                title="Sign out of patient portal"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
            <div 
              onClick={() => setActiveTab('records')}
              className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                activeTab === 'records' ? 'bg-emerald-50/80 border-emerald-300' : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100'
              }`}
            >
              <span className="text-xs font-semibold text-slate-500">Stored Health Records</span>
              <p className="text-xl font-bold text-slate-900 mt-0.5">{patientHealthRecords.length}</p>
            </div>

            <div 
              onClick={() => setActiveTab('consultations')}
              className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                activeTab === 'consultations' ? 'bg-indigo-50/80 border-indigo-300' : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100'
              }`}
            >
              <span className="text-xs font-semibold text-slate-500">Booked Meetings</span>
              <p className="text-xl font-bold text-slate-900 mt-0.5">
                {patientConsultations.filter(c => c.status === 'Upcoming').length} Upcoming
              </p>
            </div>

            <div 
              onClick={() => setActiveTab('prescriptions')}
              className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                activeTab === 'prescriptions' ? 'bg-rose-50/80 border-rose-300' : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100'
              }`}
            >
              <span className="text-xs font-semibold text-slate-500">Active Prescriptions</span>
              <p className="text-xl font-bold text-slate-900 mt-0.5">{patientPrescriptions.length}</p>
            </div>

            <div 
              onClick={() => setActiveTab('consent')}
              className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                activeTab === 'consent' ? 'bg-amber-50/80 border-amber-300' : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100'
              }`}
            >
              <span className="text-xs font-semibold text-slate-500">ABDM Consents</span>
              <p className="text-xl font-bold text-slate-900 mt-0.5">
                {consentRequests.filter(c => c.status === 'PENDING').length} Pending
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 overflow-x-auto mt-6 pt-2 border-t border-slate-100 scrollbar-none">
            <button
              onClick={() => setActiveTab('records')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === 'records'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Health Records</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === 'records' ? 'bg-white/20' : 'bg-slate-200 text-slate-700'}`}>
                {patientHealthRecords.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('consultations')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === 'consultations'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Meetings & Consultations</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === 'consultations' ? 'bg-white/20' : 'bg-slate-200 text-slate-700'}`}>
                {patientConsultations.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('prescriptions')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === 'prescriptions'
                  ? 'bg-rose-600 text-white shadow-sm shadow-rose-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Pill className="w-4 h-4" />
              <span>Prescriptions</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === 'prescriptions' ? 'bg-white/20' : 'bg-slate-200 text-slate-700'}`}>
                {patientPrescriptions.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('consent')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === 'consent'
                  ? 'bg-amber-600 text-white shadow-sm shadow-amber-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>ABDM Consents</span>
              {consentRequests.filter(c => c.status === 'PENDING').length > 0 && (
                <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full font-bold animate-pulse">
                  {consentRequests.filter(c => c.status === 'PENDING').length}
                </span>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Main Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* ================= TAB 1: HEALTH RECORDS ================= */}
        {activeTab === 'records' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Digital Health Records</h2>
                <p className="text-sm text-slate-500">Diagnostic lab reports, immunization certificates, and hospital discharge summaries</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Upload Record</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {patientHealthRecords.map((record) => (
                <div 
                  key={record.id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 hover:border-emerald-300 hover:shadow-sm transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {record.category}
                      </span>
                      <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {record.date}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 leading-snug mb-1">
                      {record.title}
                    </h3>
                    
                    <p className="text-xs font-medium text-slate-500 flex items-center gap-1.5 mb-3">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      {record.issuedBy}
                    </p>

                    <p className="text-xs text-slate-600 leading-relaxed mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      {record.summary}
                    </p>

                    {/* Metric preview tags */}
                    {record.metrics && record.metrics.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        {record.metrics.map((m, idx) => (
                          <div key={idx} className="bg-slate-50 p-2 rounded-lg border border-slate-100 text-xs">
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">{m.label}</span>
                            <span className={`font-bold ${m.status === 'attention' ? 'text-amber-600' : 'text-slate-800'}`}>
                              {m.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-xs text-slate-400 font-mono">{record.fileType}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedRecord(record)}
                        className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        View Report
                      </button>
                      <button
                        onClick={() => showToast(`Downloaded ${record.title} in official FHIR/PDF format`)}
                        className="text-slate-500 hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Download PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 2: MEETINGS & CONSULTATIONS ================= */}
        {activeTab === 'consultations' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Meeting & Consultation Records</h2>
                <p className="text-sm text-slate-500">Track active bookings, queue status, and past doctor discussions</p>
              </div>
              {onNavigateDoctors && (
                <button
                  onClick={onNavigateDoctors}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Book New Consultation</span>
                </button>
              )}
            </div>

            {/* Upcoming Appointments Section */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Booked & Upcoming Consultations</h3>
                    <p className="text-xs text-slate-500">Present your token number at the clinic or join the telehealth room.</p>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {patientConsultations.filter(c => c.status === 'Upcoming' || c.status === 'In Progress').map((cons) => (
                  <div key={cons.id} className="p-6 hover:bg-slate-50/60 transition-colors">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex flex-col items-center justify-center shrink-0">
                          <span className="text-[10px] uppercase font-bold text-indigo-500">TOKEN</span>
                          <span className="text-xl font-black">#{cons.tokenNumber}</span>
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h4 className="text-lg font-bold text-slate-900">{cons.doctorName}</h4>
                            <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
                              {cons.specialty}
                            </span>
                            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Confirmed
                            </span>
                          </div>

                          <p className="text-xs text-slate-600 flex items-center gap-1.5 mb-2">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            {cons.clinicOrHospital}
                          </p>

                          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500">
                            <span className="flex items-center gap-1 text-slate-800 font-semibold bg-slate-100 px-2 py-1 rounded-md">
                              <Calendar className="w-3.5 h-3.5 text-slate-500" />
                              {cons.date} at {cons.time}
                            </span>
                            <span>•</span>
                            <span className="font-semibold text-slate-700">{cons.type} Consultation</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap items-center gap-3">
                        {cons.type === 'Online Video' ? (
                          <button
                            onClick={() => setActiveVideoCall(cons)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                          >
                            <Video className="w-4 h-4" />
                            <span>Join Video Meeting</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => showToast(`Directions mapped to ${cons.clinicOrHospital}`)}
                            className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                          >
                            <MapPin className="w-4 h-4" />
                            <span>Clinic Directions</span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            cancelPatientConsultation(cons.id);
                            showToast('Consultation cancelled successfully.');
                          }}
                          className="text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer"
                        >
                          Cancel Booking
                        </button>
                      </div>

                    </div>
                  </div>
                ))}

                {patientConsultations.filter(c => c.status === 'Upcoming' || c.status === 'In Progress').length === 0 && (
                  <div className="p-12 text-center text-slate-500">
                    <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="font-semibold text-slate-700">No upcoming doctor appointments</p>
                    <p className="text-xs text-slate-400 mt-1">Book a consultation with verified specialists in your city.</p>
                    {onNavigateDoctors && (
                      <button
                        onClick={onNavigateDoctors}
                        className="mt-4 bg-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors inline-flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" /> Book a Doctor
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Past Consultations History */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-bold text-slate-900 text-base">Past Consultations & Clinical Notes</h3>
                <p className="text-xs text-slate-500">Doctor diagnosis, follow-ups, and attached prescriptions</p>
              </div>

              <div className="divide-y divide-slate-100">
                {patientConsultations.filter(c => c.status === 'Completed' || c.status === 'Cancelled').map((cons) => (
                  <div key={cons.id} className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-base font-bold text-slate-900">{cons.doctorName}</h4>
                          <span className="text-xs text-slate-500">• {cons.specialty}</span>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                            cons.status === 'Completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {cons.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mb-2">{cons.clinicOrHospital} • {cons.date}</p>
                        
                        {cons.consultationNotes && (
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-700 mt-2 max-w-2xl">
                            <span className="font-semibold text-slate-900 block mb-0.5">Doctor's Clinical Notes:</span>
                            {cons.consultationNotes}
                          </div>
                        )}
                      </div>

                      {cons.prescriptionId && (
                        <button
                          onClick={() => {
                            const rx = patientPrescriptions.find(p => p.id === cons.prescriptionId);
                            if (rx) {
                              setSelectedPrescription(rx);
                            } else {
                              setActiveTab('prescriptions');
                            }
                          }}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-2 rounded-xl transition-colors shrink-0 cursor-pointer"
                        >
                          <Pill className="w-3.5 h-3.5" />
                          <span>View Prescribed Rx</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ================= TAB 3: PRESCRIPTIONS ================= */}
        {activeTab === 'prescriptions' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Digital Doctor Prescriptions (E-Rx)</h2>
                <p className="text-sm text-slate-500">Verified medication lists, dosage instructions, and print-ready medical records</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {patientPrescriptions.map((rx) => (
                <div 
                  key={rx.id} 
                  className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm hover:border-rose-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Doctor Header */}
                    <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold shrink-0 border border-rose-100">
                          <Stethoscope className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-base">{rx.doctorName}</h3>
                          <p className="text-xs text-slate-500">{rx.doctorSpecialty}</p>
                          <p className="text-[11px] text-slate-400 font-mono">Reg: {rx.doctorRegNo} • {rx.clinicOrHospital}</p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                        {rx.date}
                      </span>
                    </div>

                    {/* Diagnosis */}
                    <div className="mb-4">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Diagnosis</span>
                      <p className="text-sm font-bold text-slate-800 bg-rose-50/50 border border-rose-100 p-2.5 rounded-xl">
                        {rx.diagnosis}
                      </p>
                    </div>

                    {/* Medicines Table */}
                    <div className="mb-4 space-y-2.5">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Prescribed Medicines</span>
                      {rx.medicines.map((med, idx) => (
                        <div key={idx} className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs flex flex-col gap-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">{med.name}</span>
                            <span className="font-mono text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                              {med.dosage}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-slate-500 text-[11px]">
                            <span className="font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                              Schedule: {med.frequency}
                            </span>
                            <span>•</span>
                            <span>Duration: {med.duration}</span>
                          </div>
                          <p className="text-slate-500 text-[11px] italic mt-0.5">
                            Note: {med.instructions}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Doctor Advice */}
                    <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-3 text-xs text-amber-900 mb-4">
                      <span className="font-bold block mb-0.5">Doctor's Advice:</span>
                      {rx.advice}
                      {rx.followUpDate && (
                        <p className="text-[11px] font-semibold text-amber-800 mt-1">
                          Next Follow-up: {rx.followUpDate}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    <span className="text-[11px] text-slate-400 font-mono">Digitally Signed Rx</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedPrescription(rx)}
                        className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        Full Prescription
                      </button>
                      <button
                        onClick={() => showToast(`Printing official prescription issued by ${rx.doctorName}`)}
                        className="text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 p-1.5 rounded-lg transition-colors cursor-pointer"
                        title="Print Prescription"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 4: ABDM CONSENT MANAGER ================= */}
        {activeTab === 'consent' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">ABDM Consent Manager</h2>
                <p className="text-sm text-slate-500">Control which hospitals and doctors are allowed to access your health records</p>
              </div>
            </div>

            <div className="space-y-4">
              {consentRequests.map((request) => (
                <div 
                  key={request.id}
                  className={`bg-white rounded-2xl border p-6 shadow-sm transition-all ${
                    request.status === 'PENDING' ? 'border-amber-300 ring-2 ring-amber-100' : 'border-slate-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          request.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                          request.status === 'GRANTED' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-rose-100 text-rose-800'
                        }`}>
                          {request.status}
                        </span>
                        {request.date && <span className="text-xs text-slate-400">• {request.date}</span>}
                      </div>
                      <h3 className="text-base font-bold text-slate-900">{request.requester}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Purpose: <strong>{request.purpose}</strong></p>
                    </div>

                    {request.expiresIn && (
                      <span className="text-xs text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100 shrink-0">
                        Expires in: {request.expiresIn}
                      </span>
                    )}
                  </div>

                  <div className="mb-4">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1.5">
                      Requested Health Data
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {request.infoTypes.map((type, idx) => (
                        <span key={idx} className="bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-md border border-slate-200">
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>

                  {request.status === 'PENDING' ? (
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                      <button
                        onClick={() => {
                          handleConsentAction(request.id, 'DENIED');
                          showToast('Consent request denied.');
                        }}
                        className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition-colors cursor-pointer"
                      >
                        Deny Access
                      </button>
                      <button
                        onClick={() => {
                          handleConsentAction(request.id, 'GRANTED');
                          showToast(`Consent granted to ${request.requester}`);
                        }}
                        className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-5 py-2 rounded-xl transition-colors shadow-sm shadow-emerald-200 cursor-pointer"
                      >
                        Grant Consent
                      </button>
                    </div>
                  ) : (
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                      <span>Status updated via ABDM Gateway</span>
                      <button
                        onClick={() => {
                          handleConsentAction(request.id, request.status === 'GRANTED' ? 'DENIED' : 'GRANTED');
                        }}
                        className="text-emerald-700 hover:underline font-medium cursor-pointer"
                      >
                        {request.status === 'GRANTED' ? 'Revoke Access' : 'Re-grant Access'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ================= REPORT DETAILS MODAL ================= */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                  {selectedRecord.category}
                </span>
                <h3 className="text-lg font-bold text-white mt-1">{selectedRecord.title}</h3>
                <p className="text-xs text-slate-400">{selectedRecord.issuedBy} • {selectedRecord.date}</p>
              </div>
              <button 
                onClick={() => setSelectedRecord(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Clinical Summary</span>
                <p className="text-sm text-slate-700 mt-1 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  {selectedRecord.summary}
                </p>
              </div>

              {selectedRecord.metrics && (
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Verified Biomarkers</span>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedRecord.metrics.map((m, idx) => (
                      <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                        <span className="text-slate-500 font-medium">{m.label}</span>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className="text-base font-bold text-slate-900">{m.value}</span>
                          {m.unit && <span className="text-slate-400 text-[10px]">{m.unit}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Verified ABDM Digital Asset
                </span>
                <button
                  onClick={() => {
                    showToast(`Downloading official report PDF: ${selectedRecord.title}`);
                    setSelectedRecord(null);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Report (PDF)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= FULL PRESCRIPTION MODAL ================= */}
      {selectedPrescription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 bg-gradient-to-r from-rose-700 to-pink-700 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded">
                  Official Digital Prescription (E-Rx)
                </span>
                <h3 className="text-lg font-bold text-white mt-1">{selectedPrescription.doctorName}</h3>
                <p className="text-xs text-rose-100">{selectedPrescription.doctorSpecialty} • Reg: {selectedPrescription.doctorRegNo}</p>
              </div>
              <button 
                onClick={() => setSelectedPrescription(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Patient</span>
                  <span className="font-bold text-slate-800">{currentPatient.name} ({currentPatient.age} Yrs, {currentPatient.gender})</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block font-medium">Date</span>
                  <span className="font-bold text-slate-800">{selectedPrescription.date}</span>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Diagnosis</span>
                <p className="text-sm font-bold text-slate-900 mt-1">{selectedPrescription.diagnosis}</p>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Prescribed Medicines</span>
                <div className="space-y-2">
                  {selectedPrescription.medicines.map((med, idx) => (
                    <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs flex flex-col gap-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-900 text-sm">{med.name}</span>
                        <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          {med.dosage}
                        </span>
                      </div>
                      <p className="text-slate-600 font-medium">Timing: {med.frequency} • Duration: {med.duration}</p>
                      <p className="text-slate-500 italic text-[11px]">{med.instructions}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 text-xs text-amber-900">
                <span className="font-bold block mb-1">Doctor's Advice & Instructions:</span>
                {selectedPrescription.advice}
                {selectedPrescription.followUpDate && (
                  <p className="font-semibold mt-1.5 text-amber-950">Follow-up: {selectedPrescription.followUpDate}</p>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-mono">Verified ABDM Signature</span>
                <button
                  onClick={() => {
                    showToast('Prescription printed successfully.');
                    setSelectedPrescription(null);
                  }}
                  className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Prescription</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TELEHEALTH VIDEO CALL SIMULATOR ================= */}
      {activeVideoCall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-2xl bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 overflow-hidden text-white animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Telehealth Video Call</span>
              </div>
              <button 
                onClick={() => setActiveVideoCall(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-8 text-center space-y-4">
              <div className="w-24 h-24 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-3xl mx-auto shadow-lg shadow-indigo-500/20 border-4 border-indigo-400">
                {activeVideoCall.doctorName.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h3 className="text-xl font-bold">{activeVideoCall.doctorName}</h3>
                <p className="text-sm text-indigo-300">{activeVideoCall.specialty} • {activeVideoCall.clinicOrHospital}</p>
                <span className="inline-block bg-emerald-500/20 text-emerald-300 text-xs px-3 py-1 rounded-full font-semibold mt-2 border border-emerald-500/30">
                  Doctor is ready in waiting room
                </span>
              </div>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Secure encrypted teleconsultation powered by ABDM Telehealth Gateway. Audio and video permissions will be requested upon connecting.
              </p>
            </div>

            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-center gap-4">
              <button
                onClick={() => {
                  showToast('Connected to consultation room! Microphone and camera enabled.');
                  setActiveVideoCall(null);
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-md shadow-emerald-600/30 flex items-center gap-2 cursor-pointer"
              >
                <Video className="w-4 h-4" />
                <span>Enter Consultation Room</span>
              </button>
              <button
                onClick={() => setActiveVideoCall(null)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs px-5 py-3 rounded-xl transition-colors cursor-pointer"
              >
                Cancel Call
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= UPLOAD RECORD MODAL ================= */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">Upload New Health Record</h3>
              <button 
                onClick={() => setShowUploadModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadRecord} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Record Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Thyroid Panel (T3, T4, TSH)"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="Diagnostic Lab Report">Diagnostic Lab Report</option>
                  <option value="Discharge Summary">Discharge Summary</option>
                  <option value="Immunization">Immunization</option>
                  <option value="Radiology / Scan">Radiology / Scan</option>
                  <option value="Prescription">Prescription</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Issuing Lab / Hospital / Doctor
                </label>
                <input
                  type="text"
                  required
                  value={newIssuer}
                  onChange={e => setNewIssuer(e.target.value)}
                  placeholder="e.g. Max Hospital Diagnostics"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Summary / Key Findings
                </label>
                <textarea
                  rows={3}
                  value={newSummary}
                  onChange={e => setNewSummary(e.target.value)}
                  placeholder="Enter diagnostic report summary or normal values..."
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-4 py-2.5 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors shadow-sm shadow-emerald-200 cursor-pointer"
                >
                  Save to ABDM
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <p className="text-sm font-medium">{toastMessage}</p>
        </div>
      )}

    </div>
  );
}
