'use client';

import React, { useState, useTransition } from 'react';
import { Unit, Ticket } from '@/types';
import { createTicketAction } from '@/app/actions';
import { 
  Network, 
  HelpCircle, 
  ShieldAlert, 
  Mail, 
  Phone, 
  Building, 
  MapPin, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  Info,
  Building2,
  Copy,
  Check
} from 'lucide-react';

interface ServiceDeskHomeProps {
  initialUnits: Unit[];
}

export default function ServiceDeskHome({ initialUnits }: ServiceDeskHomeProps) {
  // Client state
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  
  // Form state
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [faculty, setFaculty] = useState('Faculty of Science');
  const [department, setDepartment] = useState('');
  const [location, setLocation] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  // Feedback states
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successTicket, setSuccessTicket] = useState<Ticket | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  // Icon mapping for University of Ibadan Service Desk Units
  const getUnitIcon = (id: string) => {
    switch (id) {
      case 'unit-1':
        return <Network className="w-8 h-8 text-[#1F4096]" />;
      case 'unit-2':
        return <HelpCircle className="w-8 h-8 text-[#1F4096]" />;
      case 'unit-3':
        return <ShieldAlert className="w-8 h-8 text-[#1F4096]" />;
      default:
        return <Network className="w-8 h-8 text-[#1F4096]" />;
    }
  };

  const selectedUnit = initialUnits.find(u => u.id === selectedUnitId);

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleResetForm = () => {
    setEmail('');
    setPhone('');
    setFaculty('Faculty of Science');
    setDepartment('');
    setLocation('');
    setTitle('');
    setDescription('');
    setSelectedUnitId(null);
    setSuccessTicket(null);
    setErrorMsg(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!selectedUnitId) {
      setErrorMsg('Please select a Destination Unit from the grid above before submitting your ticket.');
      return;
    }

    startTransition(async () => {
      const result = await createTicketAction({
        unitId: selectedUnitId,
        complainerEmail: email,
        complainerPhone: phone || undefined,
        faculty,
        department,
        roomNumber: location,
        title,
        description,
      });

      if (result.success && result.ticket) {
        setSuccessTicket(result.ticket);
      } else {
        setErrorMsg(result.error || 'Something went wrong. Please check your fields.');
      }
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F9FAFB] text-[#1A212C]">
      {/* 1. Header Component */}
      <header className="bg-[#1F4096] border-b-4 border-[#7E711F] shadow-md sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Crest/Shield Placeholder with UI Colors */}
            <div className="w-10 h-10 rounded-full bg-white border border-[#7E711F] flex items-center justify-center font-bold text-[#1F4096] shadow-inner text-base">
              UI
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight leading-none flex items-center gap-1.5">
                uiservicedesk
              </h1>
              <span className="text-xs text-white/70 font-medium tracking-wider uppercase">Network Portal</span>
            </div>
          </div>
          <div className="bg-white/10 px-3.5 py-1.5 rounded-lg border border-white/10">
            <span className="text-xs font-semibold text-white/70 tracking-wide">
              University of Ibadan • ICT Network Unit
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-5xl w-full mx-auto px-4 py-10 md:py-16 space-y-12">
        {/* 2. Hero Section */}
        <section className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-[#7E711F] bg-[#7E711F]/10 px-3.5 py-1 rounded-full">
            Institutional Support System
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#1F4096] tracking-tight leading-tight">
            University Network Service Desk
          </h2>
          <p className="text-[#4B5563] text-lg max-w-2xl mx-auto leading-relaxed font-normal">
            Submit network requests, report fiber line drops, request LAN setup configurations, or raise issues with institutional accounts directly to the relevant IT teams.
          </p>
        </section>

        {/* Success / Confirmation State View */}
        {successTicket ? (
          <section className="bg-white rounded-lg border-2 border-green-500 shadow-xl overflow-hidden max-w-3xl mx-auto transition-all duration-300">
            <div className="bg-green-50 border-b border-green-100 p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-7 h-7 text-green-600 animate-bounce" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-green-950">Ticket Submitted Successfully</h3>
                <p className="text-sm text-green-700 font-medium">Your request has been logged and queued for the technician.</p>
              </div>
            </div>

            <div className="p-6 md:p-8 space-y-6">
              {/* Reference ID Card */}
              <div className="bg-[#F9FAFB] rounded-lg border border-gray-200 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-semibold text-[#4B5563] uppercase tracking-wider block mb-1">Ticket Reference ID</span>
                  <code className="text-sm font-mono font-semibold text-[#1A212C] break-all">{successTicket.id}</code>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyId(successTicket.id)}
                  className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-md border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 transition-colors shrink-0"
                >
                  {copiedId ? (
                    <>
                      <Check className="w-4 h-4 text-green-600" />
                      <span>Copied Reference</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-gray-500" />
                      <span>Copy Reference</span>
                    </>
                  )}
                </button>
              </div>

              {/* Grid details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-bold uppercase text-[#4B5563] tracking-wide mb-1">Routed Destination</h4>
                    <p className="text-sm font-semibold text-[#1F4096]">
                      {selectedUnit?.name || 'Assigned Network Unit'}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase text-[#4B5563] tracking-wide mb-1">Requester Location</h4>
                    <p className="text-sm text-[#1A212C]">
                      {successTicket.roomNumber}, {successTicket.department}
                    </p>
                    <p className="text-xs text-[#4B5563] font-medium">{successTicket.faculty}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-bold uppercase text-[#4B5563] tracking-wide mb-1">Contact Email</h4>
                    <p className="text-sm font-medium text-[#1A212C]">{successTicket.complainerEmail}</p>
                  </div>
                  {successTicket.complainerPhone && (
                    <div>
                      <h4 className="text-xs font-bold uppercase text-[#4B5563] tracking-wide mb-1">Contact Phone</h4>
                      <p className="text-sm font-medium text-[#1A212C]">{successTicket.complainerPhone}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <h4 className="text-xs font-bold uppercase text-[#4B5563] tracking-wide mb-2">Issue Details</h4>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h5 className="font-semibold text-sm text-[#1A212C] mb-1.5">{successTicket.title}</h5>
                  <p className="text-sm text-[#4B5563] whitespace-pre-wrap leading-relaxed">{successTicket.description}</p>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs font-medium text-[#4B5563]">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                  Status: <span className="font-bold text-[#1F4096]">{successTicket.status}</span>
                </div>
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="w-full sm:w-auto px-6 py-2.5 bg-[#1F4096] text-white text-sm font-semibold rounded-lg hover:bg-[#152e72] transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  Submit Another Complaint
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </section>
        ) : (
          <>
            {/* 3. Destination Unit Grid Layout */}
            <section className="space-y-6">
              <div className="text-center max-w-xl mx-auto space-y-1">
                <h3 className="text-xl font-bold text-[#1F4096] tracking-tight">Step 1: Choose a Target Support Unit</h3>
                <p className="text-sm text-[#4B5563]">
                  Select the specialized ICT unit below that is responsible for handling your network issue.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {initialUnits.map((unit) => {
                  const isSelected = selectedUnitId === unit.id;
                  return (
                    <div
                      key={unit.id}
                      onClick={() => {
                        setSelectedUnitId(unit.id);
                        setErrorMsg(null);
                      }}
                      className={`relative flex flex-col p-6 rounded-lg bg-white border cursor-pointer select-none transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${
                        isSelected 
                          ? 'border-2 border-[#7E711F] ring-4 ring-[#7E711F]/10' 
                          : 'border-gray-200 hover:border-[#1F4096]'
                      }`}
                    >
                      {/* Active Indicator Pin */}
                      {isSelected && (
                        <span className="absolute top-3 right-3 bg-[#7E711F] text-white p-1 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </span>
                      )}
                      
                      <div className="mb-4">
                        {getUnitIcon(unit.id)}
                      </div>
                      
                      <h4 className="text-base font-bold text-[#1F4096] mb-2 leading-tight">
                        {unit.name}
                      </h4>
                      
                      <p className="text-xs text-[#4B5563] leading-relaxed mt-auto font-normal">
                        {unit.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 4. The Complaint Form Component */}
            <section className="space-y-6">
              <div className="text-center max-w-xl mx-auto space-y-1">
                <h3 className="text-xl font-bold text-[#1F4096] tracking-tight">Step 2: Enter Complaint Details</h3>
                <p className="text-sm text-[#4B5563]">
                  Please fill out the form below. Anonymous submissions are supported; no login required.
                </p>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-8 max-w-3xl mx-auto space-y-6">
                
                {/* Destination High-Visibility Info Bar */}
                <div className="transition-all duration-300">
                  {selectedUnit ? (
                    <div className="bg-blue-50 border-l-4 border-[#1F4096] p-4 rounded-r-lg flex items-center gap-3">
                      <Info className="w-5 h-5 text-[#1F4096] shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-[#1A212C]">
                          Selected Destination: <span className="font-bold text-[#1F4096]">{selectedUnit.name}</span>
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-amber-50 border-l-4 border-[#7E711F] p-4 rounded-r-lg flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-[#7E711F] shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-[#7E711F]">
                          Warning: Please select a target support unit from the grid above to activate the form.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Form fields */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* Email & Phone input grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="email" className="block text-xs font-bold text-[#1A212C] uppercase tracking-wide mb-1.5">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <Mail className="w-4 h-4 text-[#4B5563]" />
                        </span>
                        <input
                          id="email"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="staff@ui.edu.ng"
                          className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#F9FAFB] border border-gray-300 rounded-lg text-[#1A212C] font-normal transition-all duration-200 outline-none focus:border-[#1F4096] focus:ring-2 focus:ring-[#1F4096]/10"
                        />
                      </div>
                      <span className="text-[10px] text-[#4B5563] mt-1 block">Preferably your official university mail.</span>
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-xs font-bold text-[#1A212C] uppercase tracking-wide mb-1.5">
                        Phone Number
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <Phone className="w-4 h-4 text-[#4B5563]" />
                        </span>
                        <input
                          id="phone"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="080XXXXXXXX"
                          className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#F9FAFB] border border-gray-300 rounded-lg text-[#1A212C] font-normal transition-all duration-200 outline-none focus:border-[#1F4096] focus:ring-2 focus:ring-[#1F4096]/10"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Faculty dropdown & Department text grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="faculty" className="block text-xs font-bold text-[#1A212C] uppercase tracking-wide mb-1.5">
                        Faculty <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <Building2 className="w-4 h-4 text-[#4B5563]" />
                        </span>
                        <select
                          id="faculty"
                          value={faculty}
                          onChange={(e) => setFaculty(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#F9FAFB] border border-gray-300 rounded-lg text-[#1A212C] font-normal appearance-none transition-all duration-200 outline-none focus:border-[#1F4096] focus:ring-2 focus:ring-[#1F4096]/10"
                        >
                          <option value="Faculty of Science">Faculty of Science</option>
                          <option value="Faculty of Arts">Faculty of Arts</option>
                          <option value="Faculty of Technology">Faculty of Technology</option>
                          <option value="Faculty of Social Sciences">Faculty of Social Sciences</option>
                          <option value="College of Medicine">College of Medicine</option>
                        </select>
                        <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[#4B5563] text-xs">
                          ▼
                        </span>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="department" className="block text-xs font-bold text-[#1A212C] uppercase tracking-wide mb-1.5">
                        Department <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <Building className="w-4 h-4 text-[#4B5563]" />
                        </span>
                        <input
                          id="department"
                          type="text"
                          required
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                          placeholder="e.g. Department of Computer Science"
                          className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#F9FAFB] border border-gray-300 rounded-lg text-[#1A212C] font-normal transition-all duration-200 outline-none focus:border-[#1F4096] focus:ring-2 focus:ring-[#1F4096]/10"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Specific Location Input */}
                  <div>
                    <label htmlFor="location" className="block text-xs font-bold text-[#1A212C] uppercase tracking-wide mb-1.5">
                      Specific Location / Office / Room Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <MapPin className="w-4 h-4 text-[#4B5563]" />
                      </span>
                      <input
                        id="location"
                        type="text"
                        required
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g., Room 204, Second Floor"
                        className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#F9FAFB] border border-gray-300 rounded-lg text-[#1A212C] font-normal transition-all duration-200 outline-none focus:border-[#1F4096] focus:ring-2 focus:ring-[#1F4096]/10"
                      />
                    </div>
                  </div>

                  {/* Short Issue Summary */}
                  <div>
                    <label htmlFor="title" className="block text-xs font-bold text-[#1A212C] uppercase tracking-wide mb-1.5">
                      Short Issue Summary <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <FileText className="w-4 h-4 text-[#4B5563]" />
                      </span>
                      <input
                        id="title"
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Broken wall jack or Department switch blinking orange"
                        className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#F9FAFB] border border-gray-300 rounded-lg text-[#1A212C] font-normal transition-all duration-200 outline-none focus:border-[#1F4096] focus:ring-2 focus:ring-[#1F4096]/10"
                      />
                    </div>
                  </div>

                  {/* Detailed Description */}
                  <div>
                    <label htmlFor="description" className="block text-xs font-bold text-[#1A212C] uppercase tracking-wide mb-1.5">
                      Detailed Description of the Problem <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="description"
                      required
                      rows={5}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Provide all relevant symptoms, when it started, specific error messages, or devices affected to help technicians debug the fault faster."
                      className="w-full px-4 py-2.5 text-sm bg-[#F9FAFB] border border-gray-300 rounded-lg text-[#1A212C] font-normal transition-all duration-200 outline-none focus:border-[#1F4096] focus:ring-2 focus:ring-[#1F4096]/10"
                    />
                  </div>

                  {/* Errors display */}
                  {errorMsg && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 text-red-800 text-sm font-medium">
                      <AlertCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
                      <div>{errorMsg}</div>
                    </div>
                  )}

                  {/* Action Submit Button */}
                  <div>
                    <button
                      type="submit"
                      disabled={isPending}
                      className={`w-full py-3 bg-[#1F4096] text-white text-sm font-bold rounded-lg hover:bg-[#152e72] focus:ring-4 focus:ring-[#1F4096]/30 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 ${
                        isPending ? 'opacity-75 cursor-not-allowed' : ''
                      }`}
                    >
                      {isPending ? (
                        <>
                          <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                          <span>Routing & Registering Ticket...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Network Support Ticket</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </section>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#1A212C] text-white/70 border-t border-[#7E711F]/20 mt-auto">
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#7E711F]"></span>
              <span className="font-semibold text-white tracking-tight">University of Ibadan Digital Network Portal</span>
            </div>
            <div className="flex items-center gap-6 text-xs font-semibold">
              <a href="#" className="hover:text-white transition-colors">IT Policies</a>
              <a href="#" className="hover:text-white transition-colors">Help Center</a>
              <a href="#" className="hover:text-white transition-colors">Contact ICT</a>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <p>© {new Date().getFullYear()} University of Ibadan. All Rights Reserved. Managed by the ICT Infrastructure Unit.</p>
            <p>Version 1.0.0 (Anonymous Access enabled)</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
