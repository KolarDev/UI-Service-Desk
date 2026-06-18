'use client';

import React, { useState, useTransition, useEffect } from 'react';
import { Ticket, User, Unit, TicketLog } from '@/types';
import { dispatchTicketAction, escalateTicketByDirectorAction } from '@/app/actions';
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
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Home,
  Check,
  User as UserIcon,
  Paperclip,
  Info
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
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  
  // Multi-select engineers state
  const [selectedEngineerIds, setSelectedEngineerIds] = useState<string[]>([]);
  const [operationalInstructions, setOperationalInstructions] = useState('');
  
  // Director Escalation state
  const [escalationReason, setEscalationReason] = useState('');
  
  // Accordion toggle state for metadata
  const [isMetadataExpanded, setIsMetadataExpanded] = useState(true);

  // Filter state for queue list
  const [queueFilter, setQueueFilter] = useState<'ACTIVE' | 'ALL' | 'RESOLVED'>('ACTIVE');

  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Sync state with server props when page path revalidates
  useEffect(() => {
    setTickets(initialTickets);
  }, [initialTickets]);

  // Top Metrics calculation (across all tickets)
  const metricsSubmitted = tickets.filter(t => t.assignedEngineerIds.length === 0 && t.status !== 'RESOLVED').length;
  const metricsActive = tickets.filter(t => t.assignedEngineerIds.length > 0 && t.status !== 'RESOLVED').length;
  const metricsResolved = tickets.filter(t => t.status === 'RESOLVED').length;

  // Filtered tickets for the left queue pane
  const filteredTickets = tickets.filter(t => {
    if (queueFilter === 'ACTIVE') {
      return t.status === 'SUBMITTED' || t.status === 'ESCALATED';
    }
    if (queueFilter === 'RESOLVED') {
      return t.status === 'RESOLVED';
    }
    return true; // ALL
  });

  // Currently active selected ticket
  const activeTicket = tickets.find(t => t.id === selectedTicketId);

  // Toggle engineer selection
  const handleToggleEngineer = (id: string) => {
    setSelectedEngineerIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleDispatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket) return;
    if (selectedEngineerIds.length === 0) {
      setErrorMsg('Please select at least one engineer to assign.');
      return;
    }

    setErrorMsg(null);
    setSuccessBanner(null);

    startTransition(async () => {
      const res = await dispatchTicketAction(activeTicket.id, selectedEngineerIds, operationalInstructions);
      if (res.success) {
        setSuccessBanner(`Ticket ${activeTicket.ticketIdDisplay || activeTicket.id} successfully assigned and dispatched.`);
        setSelectedEngineerIds([]);
        setOperationalInstructions('');
        setTimeout(() => setSuccessBanner(null), 4000);
      } else {
        setErrorMsg(res.error || 'Failed to dispatch ticket. Please try again.');
      }
    });
  };

  const handleEscalateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket) return;
    if (!escalationReason.trim()) {
      setErrorMsg('Please enter a reason for escalation.');
      return;
    }

    setErrorMsg(null);
    setSuccessBanner(null);

    startTransition(async () => {
      const res = await escalateTicketByDirectorAction(activeTicket.id, escalationReason);
      if (res.success) {
        setSuccessBanner(`Ticket ${activeTicket.ticketIdDisplay || activeTicket.id} has been escalated to management.`);
        setEscalationReason('');
        setTimeout(() => setSuccessBanner(null), 4000);
      } else {
        setErrorMsg(res.error || 'Failed to escalate ticket. Please try again.');
      }
    });
  };

  // Helper for timeline log classes
  const getLogCardStyles = (logType: string) => {
    switch (logType) {
      case 'ESCALATION':
        return 'bg-amber-50 border border-amber-200 border-l-4 border-l-amber-500';
      case 'RESOLUTION':
        return 'bg-green-50 border border-green-200 border-l-4 border-l-green-500';
      case 'MILESTONE':
      default:
        return 'bg-white border border-gray-200 border-l-4 border-l-[#1F4096]';
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F9FAFB] text-[#1A212C]">
      {/* 1. Dashboard Header Navigation */}
      <header className="bg-[#1F4096] border-b-4 border-[#7E711F] shadow-md sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
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
                Action Completed Successfully
              </p>
              <p className="text-xs text-emerald-700 mt-0.5">
                {successBanner}
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
                Action Failed
              </p>
              <p className="text-xs text-red-800 mt-0.5">
                {errorMsg}
              </p>
            </div>
          </div>
        )}

        {/* 2. Top Metrics Overview Strip */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow duration-300">
            <div className="space-y-1">
              <p className="text-xs font-semibold tracking-wider text-[#4B5563] uppercase">
                Unassigned Backlog
              </p>
              <h3 className="text-3xl font-extrabold text-amber-600">
                {metricsSubmitted}
              </h3>
              <p className="text-[10px] text-[#4B5563]">
                Awaiting initial dispatch
              </p>
            </div>
            <div className="p-3 bg-amber-50 rounded-full border border-amber-100 text-amber-600">
              <Inbox className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow duration-300">
            <div className="space-y-1">
              <p className="text-xs font-semibold tracking-wider text-[#4B5563] uppercase">
                Active Deployments
              </p>
              <h3 className="text-3xl font-extrabold text-[#1F4096]">
                {metricsActive}
              </h3>
              <p className="text-[10px] text-[#4B5563]">
                Assigned to engineering roster
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-full border border-blue-100 text-[#1F4096]">
              <Wrench className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow duration-300">
            <div className="space-y-1">
              <p className="text-xs font-semibold tracking-wider text-[#4B5563] uppercase">
                Resolved Closures
              </p>
              <h3 className="text-3xl font-extrabold text-green-600">
                {metricsResolved}
              </h3>
              <p className="text-[10px] text-[#4B5563]">
                Completed resolution pipelines
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
          <div className="lg:col-span-4 bg-white rounded-lg border border-gray-200 p-4 shadow-sm flex flex-col h-[650px]">
            <div className="pb-3 border-b border-gray-150 flex flex-col gap-3">
              <h2 className="text-xs font-bold text-[#1A212C] uppercase tracking-wider flex items-center gap-1.5">
                <ClipboardList className="w-4 h-4 text-[#1F4096]" />
                University Outages Queue
              </h2>
              
              {/* Queue Filters */}
              <div className="flex bg-gray-100 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setQueueFilter('ACTIVE')}
                  className={cn(
                    "flex-1 text-[10px] font-bold py-1 px-2 rounded-md transition-all cursor-pointer",
                    queueFilter === 'ACTIVE'
                      ? "bg-white text-[#1F4096] shadow-sm"
                      : "text-gray-500 hover:text-gray-800"
                  )}
                >
                  Active Queue ({tickets.filter(t => t.status === 'SUBMITTED' || t.status === 'ESCALATED').length})
                </button>
                <button
                  type="button"
                  onClick={() => setQueueFilter('ALL')}
                  className={cn(
                    "flex-1 text-[10px] font-bold py-1 px-2 rounded-md transition-all cursor-pointer",
                    queueFilter === 'ALL'
                      ? "bg-white text-[#1F4096] shadow-sm"
                      : "text-gray-500 hover:text-gray-800"
                  )}
                >
                  All ({tickets.length})
                </button>
                <button
                  type="button"
                  onClick={() => setQueueFilter('RESOLVED')}
                  className={cn(
                    "flex-1 text-[10px] font-bold py-1 px-2 rounded-md transition-all cursor-pointer",
                    queueFilter === 'RESOLVED'
                      ? "bg-white text-[#1F4096] shadow-sm"
                      : "text-gray-500 hover:text-gray-800"
                  )}
                >
                  Resolved ({tickets.filter(t => t.status === 'RESOLVED').length})
                </button>
              </div>
            </div>

            {/* Scrollable list of tickets */}
            <div className="flex-grow overflow-y-auto mt-3 space-y-2 pr-1">
              {filteredTickets.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
                  <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-semibold text-[#1A212C]">Queue Clean</p>
                  <p className="text-[10px] text-[#4B5563] max-w-[200px]">
                    No tickets match the selected filter query.
                  </p>
                </div>
              ) : (
                filteredTickets.map((ticket) => {
                  const isSelected = selectedTicketId === ticket.id;
                  const isEscalated = ticket.status === 'ESCALATED';

                  return (
                    <div
                      key={ticket.id}
                      onClick={() => {
                        setSelectedTicketId(ticket.id);
                        setErrorMsg(null);
                      }}
                      className={cn(
                        "group p-3 rounded-lg border text-left cursor-pointer transition-all duration-200 select-none relative overflow-hidden",
                        isSelected
                          ? "border-[#7E711F] ring-2 ring-[#7E711F]/15 bg-[#7E711F]/5 shadow-sm"
                          : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/70"
                      )}
                    >
                      {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#7E711F]" />}

                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span className="text-[10px] font-mono font-bold text-[#7E711F] tracking-wide">
                          {ticket.ticketIdDisplay || 'UI-XXXX'}
                        </span>
                        
                        <span
                          className={cn(
                            "text-[9px] font-extrabold px-1.5 py-0.5 rounded border leading-none uppercase tracking-wide font-mono",
                            isEscalated
                              ? "bg-red-50 text-red-800 border-red-200"
                              : ticket.status === 'RESOLVED'
                              ? "bg-green-50 text-green-800 border-green-200"
                              : ticket.status === 'ASSIGNED'
                              ? "bg-blue-50 text-blue-800 border-blue-200"
                              : "bg-gray-50 text-gray-800 border-gray-200"
                          )}
                        >
                          {ticket.status}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-[#1A212C] line-clamp-1 group-hover:text-[#1F4096] transition-colors duration-150">
                        {ticket.title}
                      </h4>

                      <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-[9px] text-[#4B5563]">
                        <span className="flex items-center gap-1 font-semibold truncate max-w-[75%]">
                          <MapPin className="w-3 h-3 text-[#1F4096] shrink-0" />
                          {ticket.department}
                        </span>
                        
                        <span className="flex items-center gap-0.5 text-gray-400 font-normal">
                          <Clock className="w-3 h-3" />
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Details & Dispatch Pane (8 Columns) */}
          <div className="lg:col-span-8 bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col h-[650px] overflow-hidden">
            {!activeTicket ? (
              <div className="flex-grow flex flex-col items-center justify-center p-8 text-center space-y-4 bg-gray-50/50">
                <div className="w-16 h-16 rounded-full bg-white border border-gray-200 shadow-inner flex items-center justify-center text-gray-300 animate-pulse">
                  <Wrench className="w-8 h-8 text-[#1F4096]" />
                </div>
                <div className="space-y-1.5 max-w-sm">
                  <h3 className="text-sm font-bold text-[#1A212C]">
                    No Outage Selected
                  </h3>
                  <p className="text-xs text-[#4B5563] leading-relaxed">
                    Select an issue ticket from the left panel queue to review diagnostic details, manage roster assignments, and view logs.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-grow flex flex-col h-full">
                
                {/* Scrollable details area */}
                <div className="flex-grow overflow-y-auto p-5 space-y-5">
                  
                  <div className="border-b border-gray-100 pb-3 space-y-1">
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

                  {/* Accordion Collapsible Detail Panel */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden bg-[#F9FAFB]">
                    <button
                      type="button"
                      onClick={() => setIsMetadataExpanded(!isMetadataExpanded)}
                      className="w-full flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200 text-xs font-bold text-[#1A212C] uppercase tracking-wide cursor-pointer hover:bg-gray-100/80 transition-colors"
                    >
                      <span className="flex items-center gap-1.5">
                        <Info className="w-4 h-4 text-[#1F4096]" />
                        Ticket Metadata & Location Details
                      </span>
                      {isMetadataExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    
                    {isMetadataExpanded && (
                      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="space-y-2">
                          <h4 className="text-[10px] font-bold text-[#4B5563] uppercase tracking-wide">
                            Complainer Contact
                          </h4>
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-xs text-[#1A212C]">
                              <Mail className="w-3.5 h-3.5 text-[#1F4096] shrink-0" />
                              <span className="font-medium break-all">{activeTicket.complainerEmail || 'Anonymous'}</span>
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
                    )}
                  </div>

                  {/* Core Description */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold text-[#4B5563] uppercase tracking-wide">
                      Problem Statement
                    </h4>
                    <div className="bg-[#1F4096]/5 border-l-4 border-[#1F4096] p-4 rounded-r-md">
                      <p className="text-xs text-[#1A212C] leading-relaxed whitespace-pre-wrap font-medium">
                        {activeTicket.description}
                      </p>
                    </div>
                  </div>

                  {/* Current Assignments Roster Display */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold text-[#4B5563] uppercase tracking-wide">
                      Assigned Technical Roster
                    </h4>
                    {(!activeTicket.assignedEngineerIds || activeTicket.assignedEngineerIds.length === 0) ? (
                      <div className="text-xs italic text-amber-600 bg-amber-50 border border-amber-100 p-2.5 rounded-lg">
                        Currently unassigned. Awaiting engineer allocation.
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {activeTicket.assignedEngineerIds.map(id => {
                          const eng = engineers.find(e => e.id === id);
                          return (
                            <div key={id} className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-xs font-semibold text-[#1F4096]">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                              {eng?.name || id}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Logs timeline thread */}
                  <div className="space-y-3 pt-3 border-t border-gray-150">
                    <h4 className="text-[10px] font-bold text-[#4B5563] uppercase tracking-wide">
                      Resolution Activity Thread
                    </h4>
                    <div className="space-y-3">
                      {activeTicket.logs?.map((log) => (
                        <div key={log.id} className={cn("p-3.5 rounded-lg text-xs space-y-1.5", getLogCardStyles(log.logType))}>
                          <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono">
                            <span className="font-bold text-gray-800">{log.authorName} ({log.authorType})</span>
                            <span>{new Date(log.timestamp).toLocaleString()}</span>
                          </div>
                          <p className="leading-relaxed text-gray-700">{log.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Operations Forms Panel (Sticky Bottom) */}
                <div className="bg-[#F9FAFB] border-t border-gray-200 p-5 space-y-4 max-h-[280px] overflow-y-auto shrink-0">
                  
                  {activeTicket.status === 'RESOLVED' ? (
                    <div className="bg-green-50 border border-green-200 p-3 rounded-lg text-xs text-green-800 font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <span>This complaint is resolved and archived. No further operational adjustments can be made.</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Left: Multi-Engineer Dispatch */}
                      <form onSubmit={handleDispatchSubmit} className="space-y-3 bg-white p-3.5 rounded-lg border border-gray-200">
                        <h4 className="text-[10px] font-bold text-[#1D2939] uppercase tracking-wider flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5 text-[#1F4096]" />
                          Multi-Engineer Dispatch Module
                        </h4>
                        
                        <div className="space-y-1.5">
                          <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wide">
                            Assigned personnel roster (Select Multiple):
                          </label>
                          <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto border border-gray-150 p-1 rounded bg-gray-50">
                            {engineers.map(eng => {
                              const isAssigned = selectedEngineerIds.includes(eng.id);
                              return (
                                <button
                                  key={eng.id}
                                  type="button"
                                  onClick={() => handleToggleEngineer(eng.id)}
                                  className={cn(
                                    "px-2 py-0.5 rounded text-[10px] font-semibold border cursor-pointer select-none",
                                    isAssigned
                                      ? "bg-[#1F4096] text-white border-[#1F4096]"
                                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-100"
                                  )}
                                >
                                  {eng.name}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label htmlFor="instructions" className="block text-[9px] font-bold text-gray-500 uppercase tracking-wide">
                            Operational Instructions for Assigned Personnel:
                          </label>
                          <input
                            id="instructions"
                            type="text"
                            value={operationalInstructions}
                            onChange={(e) => setOperationalInstructions(e.target.value)}
                            placeholder="Specific diagnostics requirements..."
                            disabled={isPending}
                            className="w-full p-2 border border-gray-300 rounded text-[11px] outline-none focus:ring-1 focus:ring-[#1F4096]"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={isPending || selectedEngineerIds.length === 0}
                          className="w-full bg-[#1F4096] hover:bg-[#152e72] text-white font-bold text-[10px] py-1.5 rounded transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {isPending ? 'Processing...' : 'Confirm Dispatch Allocation'}
                        </button>
                      </form>

                      {/* Right: Management Handoff Escalation */}
                      <form onSubmit={handleEscalateSubmit} className="space-y-3 bg-white p-3.5 rounded-lg border border-gray-200 flex flex-col justify-between">
                        <div>
                          <h4 className="text-[10px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1">
                            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                            Director Escalation Form
                          </h4>
                          <p className="text-[9px] text-gray-400 mt-1">
                            Escalate this ticket. This will clear the active assignment roster and flag it for management attention.
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={escalationReason}
                            onChange={(e) => setEscalationReason(e.target.value)}
                            placeholder="Enter justification for management escalation..."
                            disabled={isPending}
                            className="w-full p-2 border border-gray-300 rounded text-[11px] outline-none focus:ring-1 focus:ring-amber-500"
                          />
                          
                          <button
                            type="submit"
                            disabled={isPending || !escalationReason.trim()}
                            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] py-1.5 rounded transition-colors cursor-pointer disabled:opacity-50"
                          >
                            Execute Escalation Command
                          </button>
                        </div>
                      </form>

                    </div>
                  )}

                </div>

              </div>
            )}
          </div>

        </section>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 text-center text-xs text-[#4B5563]">
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
