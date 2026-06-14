'use client';

import React, { useState, useTransition, useEffect } from 'react';
import { Ticket, User, Unit } from '@/types';
import { assignTicketAction } from '@/app/actions';
import { cn } from '@/lib/utils';
import {
  Inbox,
  Wrench,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  Mail,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
  ClipboardList,
  ChevronRight,
  ShieldAlert,
  Home,
  Check
} from 'lucide-react';
import Link from 'next/link';

interface DirectorDashboardClientProps {
  initialTickets: Ticket[];
  engineers: User[];
  units: Unit[];
}

export default function DirectorDashboardClient({
  initialTickets,
  engineers,
  units,
}: DirectorDashboardClientProps) {
  const directorUnitId = 'unit-2'; // Helpdesk & LAN Routing Unit
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [selectedEngineerId, setSelectedEngineerId] = useState<string>('');
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<{ idDisplay: string; engineerName: string } | null>(null);

  // Sync state with server props when page path revalidates
  useEffect(() => {
    setTickets(initialTickets);
  }, [initialTickets]);

  // Filter tickets strictly for the director's unit
  const unitTickets = tickets.filter(t => t.unitId === directorUnitId);

  // Top Metrics calculation (for director's unit)
  const metricsSubmitted = unitTickets.filter(t => t.status === 'SUBMITTED').length;
  const metricsActive = unitTickets.filter(t => t.status === 'ASSIGNED' || t.status === 'IN_PROGRESS').length;
  const metricsResolved = unitTickets.filter(t => t.status === 'RESOLVED').length;

  // Incoming queue displays SUBMITTED and ESCALATED tickets
  const queueTickets = unitTickets.filter(t => t.status === 'SUBMITTED' || t.status === 'ESCALATED');

  // Currently active selected ticket
  const activeTicket = queueTickets.find(t => t.id === selectedTicketId);

  // Filter engineers belonging to the director's unit (Helpdesk Unit)
  const matchingEngineers = engineers.filter(e => e.unitId === directorUnitId);

  // Initialize selected engineer ID if empty or not valid
  useEffect(() => {
    if (matchingEngineers.length > 0) {
      const isAlreadyValid = matchingEngineers.some(e => e.id === selectedEngineerId);
      if (!isAlreadyValid) {
        setSelectedEngineerId(matchingEngineers[0].id);
      }
    } else {
      setSelectedEngineerId('');
    }
  }, [matchingEngineers, selectedEngineerId]);

  const handleAssignDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket || !selectedEngineerId) return;

    setErrorMsg(null);
    setSuccessBanner(null);

    const engineer = matchingEngineers.find(eng => eng.id === selectedEngineerId);
    const engineerName = engineer ? engineer.name : 'Technical Specialist';

    startTransition(async () => {
      const res = await assignTicketAction(activeTicket.id, selectedEngineerId);
      if (res.success) {
        setSuccessBanner({
          idDisplay: activeTicket.ticketIdDisplay || 'UI-Ticket',
          engineerName,
        });
        setSelectedTicketId(null); // Reset detail pane view
        // Auto-dismiss banner after 4.5 seconds
        setTimeout(() => setSuccessBanner(null), 4500);
      } else {
        setErrorMsg(res.error || 'Failed to dispatch ticket. Please try again.');
      }
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F9FAFB] text-[#1A212C]">
      {/* 1. Dashboard Header Navigation */}
      <header className="bg-[#1F4096] border-b-4 border-[#7E711F] shadow-md sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Crest badge resembling University UI colors */}
            <div className="w-10 h-10 rounded-full bg-white border border-[#7E711F] flex items-center justify-center font-bold text-[#1F4096] shadow-inner text-sm">
              UI
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight leading-none">
                uiservicedesk // Control Center
              </h1>
              <span className="text-[10px] text-white/70 font-semibold tracking-wider uppercase">
                Deputy Director Administration Panel
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link 
              href="/"
              className="text-xs text-white/80 hover:text-white bg-white/10 hover:bg-white/20 transition-all px-3 py-1.5 rounded border border-white/10 flex items-center gap-1.5"
            >
              <Home className="w-3.5 h-3.5" />
              Portal Home
            </Link>
            <div className="bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-semibold text-[#1F4096]">
                Welcome, Deputy Director • Helpdesk Unit
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Banner Messages */}
        {successBanner && (
          <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-lg shadow-sm flex items-start gap-3 animate-fadeIn transition-all duration-300">
            <div className="p-1 rounded-full bg-emerald-100 text-emerald-800">
              <Check className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-900">
                Ticket Dispatch Completed Successfully!
              </p>
              <p className="text-xs text-emerald-700 mt-0.5">
                Ticket <span className="font-mono font-bold text-[#1F4096]">{successBanner.idDisplay}</span> has been updated to <span className="font-semibold text-emerald-800">ASSIGNED</span> and dispatched to <span className="font-semibold">{successBanner.engineerName}</span>.
              </p>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg shadow-sm flex items-start gap-3 animate-fadeIn">
            <div className="p-1 rounded-full bg-red-100 text-red-800">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-red-950">
                Dispatch Error
              </p>
              <p className="text-xs text-red-800 mt-0.5">
                {errorMsg}
              </p>
            </div>
          </div>
        )}

        {/* 2. Top Metrics Overview Strip */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Unassigned Backlog */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow duration-300">
            <div className="space-y-1">
              <p className="text-xs font-semibold tracking-wider text-[#4B5563] uppercase">
                Unassigned Backlog
              </p>
              <h3 className="text-3xl font-extrabold text-amber-600">
                {metricsSubmitted}
              </h3>
              <p className="text-[10px] text-[#4B5563]">
                Awaiting engineer assignment
              </p>
            </div>
            <div className="p-3 bg-amber-50 rounded-full border border-amber-100 text-amber-600">
              <Inbox className="w-6 h-6" />
            </div>
          </div>

          {/* Card 2: Active Deployments */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow duration-300">
            <div className="space-y-1">
              <p className="text-xs font-semibold tracking-wider text-[#4B5563] uppercase">
                Active Deployments
              </p>
              <h3 className="text-3xl font-extrabold text-[#1F4096]">
                {metricsActive}
              </h3>
              <p className="text-[10px] text-[#4B5563]">
                Assigned or in progress
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-full border border-blue-100 text-[#1F4096]">
              <Wrench className="w-6 h-6" />
            </div>
          </div>

          {/* Card 3: Resolved Closures */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow duration-300">
            <div className="space-y-1">
              <p className="text-xs font-semibold tracking-wider text-[#4B5563] uppercase">
                Resolved Closures
              </p>
              <h3 className="text-3xl font-extrabold text-green-600">
                {metricsResolved}
              </h3>
              <p className="text-[10px] text-[#4B5563]">
                Successfully completed tickets
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-full border border-green-100 text-green-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

        </section>

        {/* 3. Dual-Pane Operational Workspace (Split Layout) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Queue Pane (4 Columns) */}
          <div className="lg:col-span-4 bg-white rounded-lg border border-gray-200 p-5 shadow-sm flex flex-col h-[600px]">
            <div className="pb-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xs font-bold text-[#1A212C] uppercase tracking-wider flex items-center gap-1.5">
                <ClipboardList className="w-4 h-4 text-[#1F4096]" />
                Incoming Ticket Queue
              </h2>
              <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full border border-amber-200">
                {queueTickets.length} Pending
              </span>
            </div>

            {/* Scrollable list of tickets */}
            <div className="flex-grow overflow-y-auto mt-4 space-y-3 pr-1">
              {queueTickets.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
                  <div className="w-12 h-12 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-semibold text-[#1A212C]">All Clean!</p>
                  <p className="text-[10px] text-[#4B5563] max-w-[200px]">
                    No unassigned tickets in the Helpdesk Unit queue.
                  </p>
                </div>
              ) : (
                queueTickets.map((ticket) => {
                  const isSelected = selectedTicketId === ticket.id;
                  const isEscalated = ticket.status === 'ESCALATED';

                  return (
                    <div
                      key={ticket.id}
                      onClick={() => setSelectedTicketId(ticket.id)}
                      className={cn(
                        "group p-4 rounded-lg border text-left cursor-pointer transition-all duration-200 select-none",
                        isSelected
                          ? "border-[#7E711F] ring-2 ring-[#7E711F] bg-[#7E711F]/5 shadow-sm"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/70"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-xs font-mono font-bold text-[#7E711F] tracking-wide">
                          {ticket.ticketIdDisplay || 'UI-XXXX'}
                        </span>
                        
                        {/* Dynamic Status Badge using cn() */}
                        <span
                          className={cn(
                            "text-[10px] font-bold px-2.5 py-0.5 rounded border leading-normal uppercase tracking-wide",
                            isEscalated
                              ? "bg-red-50 text-red-800 border-red-200"
                              : "bg-amber-50 text-amber-800 border-amber-200"
                          )}
                        >
                          {ticket.status}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-[#1A212C] line-clamp-1 group-hover:text-[#1F4096] transition-colors duration-150">
                        {ticket.title}
                      </h4>

                      <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-[10px] text-[#4B5563]">
                        <span className="flex items-center gap-1 font-medium max-w-[70%] truncate">
                          <MapPin className="w-3 h-3 text-[#1F4096] shrink-0" />
                          {ticket.faculty} • {ticket.department}
                        </span>
                        
                        <span className="flex items-center gap-0.5 shrink-0 text-gray-400 font-normal">
                          <Clock className="w-3 h-3" />
                          {new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Details & Dispatch Pane (8 Columns) */}
          <div className="lg:col-span-8 bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col h-[600px] overflow-hidden">
            {!activeTicket ? (
              /* Empty state block */
              <div className="flex-grow flex flex-col items-center justify-center p-8 text-center space-y-4 bg-gray-50/50">
                <div className="w-16 h-16 rounded-full bg-white border border-gray-200 shadow-inner flex items-center justify-center text-gray-300 animate-pulse">
                  <Wrench className="w-8 h-8 text-[#1F4096]" />
                </div>
                <div className="space-y-1.5 max-w-sm">
                  <h3 className="text-sm font-bold text-[#1A212C]">
                    No Ticket Selected
                  </h3>
                  <p className="text-xs text-[#4B5563] leading-relaxed">
                    Select an incoming ticket from the queue to review details, view complainers, and dispatch to technical personnel.
                  </p>
                </div>
              </div>
            ) : (
              /* Active Ticket Detail Form Pane */
              <div className="flex-grow flex flex-col h-full">
                
                {/* Scrollable details area */}
                <div className="flex-grow overflow-y-auto p-6 space-y-6">
                  
                  {/* Top Row: tracking ID and full title */}
                  <div className="border-b border-gray-100 pb-4 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-extrabold text-[#7E711F] bg-[#7E711F]/10 px-2.5 py-1 rounded">
                        {activeTicket.ticketIdDisplay || 'UI-XXXX'}
                      </span>
                      <span className="text-[10px] text-gray-400 font-medium">
                        Submitted: {new Date(activeTicket.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <h3 className="text-lg font-extrabold text-[#1A212C] mt-2">
                      {activeTicket.title}
                    </h3>
                  </div>

                  {/* Metadata Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#F9FAFB] border border-gray-200 rounded-lg p-4">
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-bold text-[#4B5563] uppercase tracking-wide">
                        Complainer Contact
                      </h4>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs text-[#1A212C]">
                          <Mail className="w-3.5 h-3.5 text-[#1F4096] shrink-0" />
                          <span className="font-medium break-all">{activeTicket.complainerEmail}</span>
                        </div>
                        {activeTicket.complainerPhone && (
                          <div className="flex items-center gap-2 text-xs text-[#1A212C]">
                            <Phone className="w-3.5 h-3.5 text-[#1F4096] shrink-0" />
                            <span>{activeTicket.complainerPhone}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-[10px] font-bold text-[#4B5563] uppercase tracking-wide">
                        Incident Location
                      </h4>
                      <div className="space-y-1">
                        <div className="flex items-start gap-2 text-xs text-[#1A212C]">
                          <MapPin className="w-3.5 h-3.5 text-[#1F4096] shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold">{activeTicket.faculty}</p>
                            <p className="text-[11px] text-[#4B5563]">{activeTicket.department}</p>
                            <p className="text-[11px] text-gray-400">Room: {activeTicket.roomNumber}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Core Problem Description */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold text-[#4B5563] uppercase tracking-wide">
                      Core Problem Description
                    </h4>
                    <div className="bg-[#1F4096]/5 border-l-4 border-[#1F4096] p-4 rounded-r-md">
                      <p className="text-xs text-[#1A212C] leading-relaxed whitespace-pre-wrap font-medium">
                        {activeTicket.description}
                      </p>
                    </div>
                  </div>

                </div>

                {/* The Engineer Dispatch Form Module (Sticky Bottom) */}
                <form 
                  onSubmit={handleAssignDispatch}
                  className="bg-[#F9FAFB] border-t border-gray-200 p-5 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-[#1A212C] uppercase tracking-wider flex items-center gap-1.5">
                        <UserCheck className="w-4 h-4 text-[#1F4096]" />
                        Assign Technical Personnel
                      </h4>
                      <p className="text-[10px] text-[#4B5563]">
                        Select an engineer to dispatch to resolve this network outage/request.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    {matchingEngineers.length === 0 ? (
                      <div className="w-full bg-amber-50 border border-amber-200 p-2.5 rounded text-[11px] text-amber-900 font-medium">
                        No active engineers registered under the Helpdesk Unit in JSON.
                      </div>
                    ) : (
                      <>
                        <select
                          required
                          value={selectedEngineerId}
                          onChange={(e) => setSelectedEngineerId(e.target.value)}
                          className="w-full sm:flex-grow bg-white border border-gray-300 rounded-md py-2 px-3 text-xs text-[#1A212C] font-semibold focus:outline-none focus:ring-2 focus:ring-[#7E711F] focus:border-[#7E711F] transition-all cursor-pointer shadow-inner"
                        >
                          {matchingEngineers.map((engineer) => (
                            <option key={engineer.id} value={engineer.id}>
                              {engineer.name} ({engineer.email})
                            </option>
                          ))}
                        </select>
                        <button
                          type="submit"
                          disabled={isPending || !selectedEngineerId}
                          className={cn(
                            "w-full sm:w-auto bg-[#1F4096] hover:bg-[#1A3780] text-white font-bold text-xs py-2 px-5 rounded-md shadow transition-all duration-200 shrink-0 border border-transparent hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed disabled:transform-none"
                          )}
                        >
                          {isPending ? (
                            <>
                              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Dispatching...
                            </>
                          ) : (
                            <>
                              Confirm Assignment Dispatch
                              <ArrowRight className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </form>

              </div>
            )}
          </div>

        </section>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 mt-12 text-center text-xs text-[#4B5563]">
        <div className="max-w-7xl mx-auto px-4">
          <p>© 2026 University of Ibadan • Information & Communication Technology Unit</p>
          <p className="text-[10px] text-gray-400 mt-1 font-medium">
            Secure Administrator Console
          </p>
        </div>
      </footer>
    </div>
  );
}
