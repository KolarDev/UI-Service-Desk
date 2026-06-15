'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { Ticket, TicketLog } from '@/types';
import { submitEngineerUpdateAction } from '@/app/actions';
import { cn } from '@/lib/utils';
import {
  Wrench,
  CheckCircle2,
  AlertCircle,
  User,
  Paperclip,
  Clock,
  MapPin,
  Mail,
  FileText,
  ChevronRight,
  Download,
  AlertTriangle,
  Trash2,
  Check,
  Send,
  Home,
  FileCheck
} from 'lucide-react';
import Link from 'next/link';

interface EngineerDashboardClientProps {
  initialTickets: Ticket[];
}

const MOCK_DIAGNOSTIC_FILES = [
  'switch_error_log.txt',
  'core_ping_trace.log',
  'fiber_loss_db_report.txt',
  'dhcp_lease_overlap.csv',
  'patch_test_results.log'
];

export default function EngineerDashboardClient({
  initialTickets,
}: EngineerDashboardClientProps) {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  // Consolidated Form State
  const [commentText, setCommentText] = useState('');
  const [actionType, setActionType] = useState<'MILESTONE' | 'ESCALATION' | 'RESOLUTION'>('MILESTONE');
  const [mockAttachment, setMockAttachment] = useState<string | null>(null);
  const [showMockFiles, setShowMockFiles] = useState(false);

  // Server Action state
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sync tickets prop
  useEffect(() => {
    setTickets(initialTickets);
    // If the currently selected ticket is resolved/escalated (and removed from prop if not escalated in unit), clear selection
    if (selectedTicketId && !initialTickets.some(t => t.id === selectedTicketId)) {
      setSelectedTicketId(null);
    }
  }, [initialTickets, selectedTicketId]);

  const activeTicket = tickets.find(t => t.id === selectedTicketId);

  // Check if active ticket is locked (escalated or assigned to someone else)
  // Lock triggers if status is ESCALATED, or if assignedToId !== "eng-1" (or is null/undefined)
  const isLocked = activeTicket
    ? activeTicket.status === 'ESCALATED' || activeTicket.assignedToId !== 'eng-1'
    : false;

  // Clear feedback messages
  const clearMessages = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  // Submit action update
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket) return;
    if (!commentText.trim()) {
      setErrorMsg('Please enter a comment for this update.');
      return;
    }

    clearMessages();
    startTransition(async () => {
      const res = await submitEngineerUpdateAction(
        activeTicket.id,
        commentText,
        actionType,
        actionType === 'MILESTONE' ? mockAttachment : null
      );
      
      if (res.success) {
        setCommentText('');
        setMockAttachment(null);
        setShowMockFiles(false);
        setActionType('MILESTONE');
        
        // Show success alert
        setSuccessMsg(
          actionType === 'MILESTONE'
            ? 'Milestone update posted successfully!'
            : actionType === 'ESCALATION'
            ? 'Handoff submitted and ticket escalated back to Director.'
            : 'Ticket resolved and closed out successfully.'
        );
        
        // If escalated or resolved, clear selected ticket as it changes state
        if (actionType === 'ESCALATION' || actionType === 'RESOLUTION') {
          setSelectedTicketId(null);
        }

        setTimeout(() => setSuccessMsg(null), 4000);
      } else {
        setErrorMsg(res.error || 'Failed to submit update action.');
      }
    });
  };

  // Helper for priority color tags
  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW':
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  // Timeline styling based on logType
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
    <div className="flex flex-col min-h-screen bg-[#F9FAFB] text-[#1A212C] font-sans">
      {/* Brand Header */}
      <header className="bg-[#1F4096] border-b-4 border-[#7E711F] shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white border border-[#7E711F] flex items-center justify-center font-bold text-[#1F4096] shadow-inner text-sm">
              UI
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight leading-none">
                uiservicedesk // Field Console
              </h1>
              <span className="text-[10px] text-white/70 font-semibold tracking-wider uppercase">
                Network Engineers Troubleshooting Workspace
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-xs text-white/80 hover:text-white bg-white/10 hover:bg-white/20 transition-all px-3 py-1.5 rounded border border-white/10 flex items-center gap-1.5"
            >
              <Home className="w-3.5 h-3.5" />
              Portal Home
            </Link>

            <div className="bg-white px-3.5 py-1.5 rounded-full border border-gray-200 shadow-sm flex items-center gap-2.5">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Kola"
                alt="Engineer Kola"
                className="w-6 h-6 rounded-full border border-[#7E711F] bg-[#F3F4F6]"
              />
              <div className="text-left">
                <p className="text-xs font-bold text-[#1F4096] leading-none">
                  Engineer Kola
                </p>
                <p className="text-[9px] text-[#4B5563] font-medium leading-none mt-0.5">
                  k.olaniyi@ui.edu.ng
                </p>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-1" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace Area */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Status Messages */}
        {successMsg && (
          <div className="mb-4 bg-emerald-50 border-l-4 border-emerald-600 p-4 rounded-r-lg shadow-sm flex items-start gap-3 animate-fadeIn">
            <div className="p-1 rounded-full bg-emerald-100 text-emerald-800">
              <Check className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-950">
                Action Successful
              </p>
              <p className="text-xs text-emerald-800 mt-0.5">{successMsg}</p>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-600 p-4 rounded-r-lg shadow-sm flex items-start gap-3 animate-fadeIn">
            <div className="p-1 rounded-full bg-red-100 text-red-800">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-red-950">
                Execution Terminated
              </p>
              <p className="text-xs text-red-800 mt-0.5">{errorMsg}</p>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* LEFT COLUMN: Queue of Tickets */}
          <div className="w-full lg:w-1/3 flex flex-col gap-4">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#1A212C] flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 text-[#7E711F]" />
                  Active Workspace Queue
                </h2>
                <span className="bg-[#1F4096]/10 text-[#1F4096] text-xs font-bold px-2 py-0.5 rounded-full font-mono">
                  {tickets.length} Ticket{tickets.length !== 1 && 's'}
                </span>
              </div>
              <p className="text-xs text-[#4B5563]">
                Displaying assignments (active) & unit-level escalated escalations.
              </p>
            </div>

            {/* Tickets list */}
            <div className="space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto pr-1">
              {tickets.length === 0 ? (
                <div className="bg-white rounded-xl border border-dashed border-gray-300 p-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1A212C] text-sm">All Clear!</h3>
                    <p className="text-xs text-[#4B5563] mt-1 max-w-[200px] mx-auto">
                      No active tickets assigned to you or escalated in your unit.
                    </p>
                  </div>
                </div>
              ) : (
                tickets.map(ticket => {
                  const isSelected = ticket.id === selectedTicketId;
                  const isTicketEscalated = ticket.status === 'ESCALATED';
                  return (
                    <button
                      key={ticket.id}
                      onClick={() => {
                        setSelectedTicketId(ticket.id);
                        clearMessages();
                      }}
                      className={cn(
                        'w-full text-left bg-white rounded-xl p-4 border transition-all duration-200 shadow-sm hover:shadow-md hover:border-[#7E711F]/50 flex flex-col gap-2 relative overflow-hidden group',
                        isSelected
                          ? 'border-2 border-[#7E711F] ring-2 ring-[#7E711F]/15'
                          : 'border-gray-200'
                      )}
                    >
                      {/* Selection highlight strip */}
                      {isSelected && (
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#7E711F]" />
                      )}

                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[11px] font-mono font-bold bg-gray-100 border border-gray-200 text-[#4B5563] px-2 py-0.5 rounded">
                          {ticket.ticketIdDisplay || 'UI-TICKET'}
                        </span>
                        
                        <div className="flex gap-1.5 items-center">
                          {isTicketEscalated && (
                            <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                              Escalated
                            </span>
                          )}
                          <span
                            className={cn(
                              'text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border tracking-wide',
                              getPriorityStyles(ticket.priority)
                            )}
                          >
                            {ticket.priority}
                          </span>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-bold text-sm text-[#1A212C] group-hover:text-[#1F4096] transition-colors leading-tight line-clamp-2">
                          {ticket.title}
                        </h4>
                        <p className="text-[11px] text-[#4B5563] font-medium mt-1.5 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#7E711F]" />
                          {ticket.department} ({ticket.roomNumber})
                        </p>
                      </div>

                      <div className="border-t border-gray-100 pt-2.5 mt-1 flex items-center justify-between text-[10px] text-[#4B5563]">
                        <span className="flex items-center gap-1 font-medium">
                          <Clock className="w-3 h-3 text-gray-400" />
                          Created on {new Date(ticket.createdAt).toLocaleDateString()}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Active Ticket Workspace */}
          <div className="w-full lg:w-2/3">
            {!activeTicket ? (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center flex flex-col items-center justify-center min-h-[480px] space-y-5">
                <div className="w-16 h-16 rounded-full bg-[#1F4096]/5 border border-[#1F4096]/10 flex items-center justify-center text-[#1F4096] shadow-inner">
                  <Wrench className="w-8 h-8" />
                </div>
                <div className="max-w-md space-y-2">
                  <h3 className="text-xl font-bold text-[#1A212C]">
                    Network Engineering Workspace
                  </h3>
                  <p className="text-sm text-[#4B5563] leading-relaxed">
                    Select an active deployment ticket from the left panel list queue to view structural details, inspect complainers logs, upload field proofs, and submit milestone updates.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 w-full max-w-sm pt-4 border-t border-gray-100 text-left">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-[10px] font-bold text-[#4B5563] uppercase">
                      My Workload
                    </p>
                    <p className="text-2xl font-extrabold text-[#1F4096]">
                      {tickets.filter(t => t.assignedToId === 'eng-1' && t.status !== 'RESOLVED').length} Active
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-[10px] font-bold text-[#4B5563] uppercase">
                      Escalated Tickets
                    </p>
                    <p className="text-2xl font-extrabold text-amber-600">
                      {tickets.filter(t => t.status === 'ESCALATED').length} Unresolved
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden min-h-[500px]">
                
                {/* Active Ticket Header details */}
                <div className="bg-white border-b border-gray-200 p-5 space-y-3 relative">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-[#7E711F]" />
                  
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold bg-[#1F4096]/10 border border-[#1F4096]/20 text-[#1F4096] px-2.5 py-0.5 rounded-full">
                        {activeTicket.ticketIdDisplay || 'UI-74A9'}
                      </span>
                      <span className={cn(
                        "text-xs font-bold px-2.5 py-0.5 rounded-full border",
                        activeTicket.status === 'ESCALATED'
                          ? "bg-amber-100 text-amber-800 border-amber-200"
                          : activeTicket.status === 'RESOLVED'
                          ? "bg-green-100 text-green-800 border-green-200"
                          : "bg-blue-100 text-blue-800 border-blue-200"
                      )}>
                        {activeTicket.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-[#4B5563] font-medium flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        Reported: {new Date(activeTicket.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-lg font-bold text-[#1A212C] leading-snug">
                      {activeTicket.title}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-[#4B5563] pt-1">
                      <p className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-[#7E711F] shrink-0" />
                        <span className="font-bold text-[#1A212C]">Location:</span>{' '}
                        {activeTicket.faculty} • {activeTicket.department} ({activeTicket.roomNumber})
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Mail className="w-4 h-4 text-[#7E711F] shrink-0" />
                        <span className="font-bold text-[#1A212C]">Complainer:</span>{' '}
                        <span className="font-mono text-[11px]">{activeTicket.complainerEmail}</span>
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-150 mt-1">
                    <p className="text-xs font-bold text-[#1A212C] uppercase flex items-center gap-1 mb-1">
                      <FileText className="w-3.5 h-3.5 text-[#1F4096]" />
                      Original Trouble Description
                    </p>
                    <p className="text-xs text-[#4B5563] leading-relaxed whitespace-pre-line">
                      {activeTicket.description}
                    </p>
                  </div>
                </div>

                {/* Collaborative Timeline Logs Area */}
                <div className="flex-grow p-6 bg-gray-50/50 max-h-[400px] overflow-y-auto border-b border-gray-200">
                  <h4 className="text-xs font-extrabold text-[#1A212C] uppercase tracking-wider mb-5 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#7E711F]" />
                    Collaborative Troubleshooting Timeline
                  </h4>

                  {/* Vertical Timeline Thread */}
                  <div className="relative border-l-2 border-[#7E711F]/30 ml-4 pl-6 space-y-6 pb-2">
                    {(!activeTicket.logs || activeTicket.logs.length === 0) ? (
                      <p className="text-xs text-gray-400 italic">No timeline entries yet.</p>
                    ) : (
                      activeTicket.logs.map((log) => {
                        const isEngineer = log.authorType === 'ENGINEER';
                        const logCardStyle = getLogCardStyles(log.logType || 'MILESTONE');
                        
                        return (
                          <div key={log.id} className="relative group/log animate-fadeIn">
                            
                            {/* Timeline circle badge */}
                            <div className="absolute -left-[35px] top-1.5 w-6 h-6 rounded-full border-2 border-[#7E711F] bg-white flex items-center justify-center overflow-hidden shadow-sm">
                              {isEngineer ? (
                                <img
                                  src={log.authorAvatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kola'}
                                  alt={log.authorName}
                                  className="w-full h-full object-cover bg-gray-100"
                                />
                              ) : (
                                <User className="w-3.5 h-3.5 text-[#4B5563]" />
                              )}
                            </div>

                            <div className={cn("rounded-lg p-4 shadow-sm transition-all duration-200", logCardStyle)}>
                              {/* Header row */}
                              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-[#1A212C]">
                                    {log.authorName}
                                  </span>

                                  {/* Badges */}
                                  {isEngineer ? (
                                    <span className="bg-[#1F4096]/10 text-[#1F4096] border border-[#1F4096]/20 text-[9px] font-bold px-1.5 py-0.5 rounded font-mono">
                                      [Network Unit]
                                    </span>
                                  ) : (
                                    <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[9px] font-bold px-1.5 py-0.5 rounded font-mono">
                                      [Complainer Update]
                                    </span>
                                  )}

                                  {/* Action Type Tag */}
                                  <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#4B5563]/70 font-mono">
                                    • {log.logType || 'MILESTONE'}
                                  </span>
                                </div>

                                <span className="text-[10px] text-gray-400 font-medium font-mono">
                                  {new Date(log.timestamp).toLocaleString()}
                                </span>
                              </div>

                              {/* Text content */}
                              <p className="text-xs text-[#4B5563] leading-relaxed whitespace-pre-line">
                                {log.text}
                              </p>

                              {/* Attachment badge */}
                              {log.attachmentName && (
                                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded bg-gray-50 border border-gray-200 text-xs font-semibold text-[#1F4096] hover:bg-gray-100 transition-colors">
                                  <Paperclip className="w-3.5 h-3.5 text-[#7E711F]" />
                                  <span className="font-mono text-[11px]">📎 {log.attachmentName}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Consolidated Action Form */}
                <div className="border-t border-gray-200 bg-gray-50 p-5 space-y-4">
                  
                  {/* Lock badge if view-only */}
                  {isLocked ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 flex items-start gap-3 text-amber-900 text-xs font-semibold">
                      <AlertCircle className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">This ticket is currently Escalated/Unassigned. Only a Director can modify this state.</p>
                        <p className="text-[11px] text-amber-700/80 font-normal mt-0.5">
                          You are currently in view-only mode. You cannot submit field milestones, complete reports, or escalate this issue further until it is re-assigned to your queue.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h4 className="text-xs font-extrabold text-[#1A212C] uppercase tracking-wider flex items-center gap-1.5 mb-1">
                        <FileCheck className="w-4 h-4 text-[#1F4096]" />
                        Consolidated field operations form
                      </h4>
                      <p className="text-[11px] text-[#4B5563]">
                        Enter your log comment, choose the action type, and submit to update the ticket status.
                      </p>
                    </div>
                  )}

                  <form onSubmit={handleFormSubmit} className={cn("space-y-4", isLocked && "opacity-50 pointer-events-none")}>
                    
                    {/* Textarea */}
                    <div>
                      <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder={
                          actionType === 'MILESTONE'
                            ? "Detail your current field diagnostics, patch tests, rack setups, or cable replacements..."
                            : actionType === 'ESCALATION'
                            ? "Explain why control is being relinquished (e.g. requires outdoor fiber splicing gear)..."
                            : "Provide the final resolution summary to mark this complaint resolved and closed..."
                        }
                        rows={3}
                        disabled={isLocked || isPending}
                        className="w-full p-2.5 border border-gray-300 rounded-lg text-xs focus:ring-1 focus:ring-[#1F4096] focus:border-[#1F4096] outline-none resize-none transition-all placeholder:text-gray-400 bg-white disabled:bg-gray-100"
                      />
                    </div>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                      
                      {/* Update Action Type Radios */}
                      <div className="space-y-1.5">
                        <span className="block text-[11px] font-bold text-[#1A212C] uppercase tracking-wider">
                          Update Action Type:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          <label className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer transition-all",
                            actionType === 'MILESTONE'
                              ? "bg-[#1F4096]/5 border-[#1F4096] text-[#1F4096] ring-1 ring-[#1F4096]"
                              : "border-gray-200 bg-white text-[#4B5563] hover:bg-gray-100"
                          )}>
                            <input
                              type="radio"
                              name="actionType"
                              value="MILESTONE"
                              checked={actionType === 'MILESTONE'}
                              onChange={() => setActionType('MILESTONE')}
                              disabled={isLocked || isPending}
                              className="sr-only"
                            />
                            <span className="w-2 h-2 rounded-full bg-blue-500" />
                            Post Field Milestone
                          </label>

                          <label className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer transition-all",
                            actionType === 'ESCALATION'
                              ? "bg-amber-50 border-amber-500 text-amber-800 ring-1 ring-amber-500"
                              : "border-gray-200 bg-white text-[#4B5563] hover:bg-gray-100"
                          )}>
                            <input
                              type="radio"
                              name="actionType"
                              value="ESCALATION"
                              checked={actionType === 'ESCALATION'}
                              onChange={() => setActionType('ESCALATION')}
                              disabled={isLocked || isPending}
                              className="sr-only"
                            />
                            <span className="w-2 h-2 rounded-full bg-amber-500" />
                            Escalate & Hand Off
                          </label>

                          <label className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer transition-all",
                            actionType === 'RESOLUTION'
                              ? "bg-green-50 border-green-500 text-green-800 ring-1 ring-green-500"
                              : "border-gray-200 bg-white text-[#4B5563] hover:bg-gray-100"
                          )}>
                            <input
                              type="radio"
                              name="actionType"
                              value="RESOLUTION"
                              checked={actionType === 'RESOLUTION'}
                              onChange={() => setActionType('RESOLUTION')}
                              disabled={isLocked || isPending}
                              className="sr-only"
                            />
                            <span className="w-2 h-2 rounded-full bg-green-500" />
                            Final Closeout Report
                          </label>
                        </div>
                      </div>

                      {/* Mock File Attachment Picker (Milestone Only) */}
                      {actionType === 'MILESTONE' && (
                        <div className="relative min-w-[180px]">
                          {mockAttachment ? (
                            <div className="flex items-center justify-between p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-mono">
                              <span className="flex items-center gap-1.5 truncate max-w-[140px]">
                                <Paperclip className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                                <span className="truncate">{mockAttachment}</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => setMockAttachment(null)}
                                className="p-0.5 hover:bg-emerald-100 rounded text-emerald-700 hover:text-red-600 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div>
                              <button
                                type="button"
                                onClick={() => setShowMockFiles(!showMockFiles)}
                                disabled={isLocked || isPending}
                                className="w-full text-left py-2 px-3 border border-dashed border-gray-300 hover:border-gray-400 rounded-lg text-xs text-[#4B5563] flex items-center justify-between gap-1.5 transition-colors bg-white font-medium"
                              >
                                <span className="flex items-center gap-1">
                                  <Paperclip className="w-3.5 h-3.5 text-gray-400" />
                                  Attach Field Proof
                                </span>
                                <span className="text-[8px] bg-gray-100 text-gray-500 px-1 py-0.5 rounded font-mono">Mock</span>
                              </button>

                              {showMockFiles && (
                                <div className="absolute bottom-full right-0 mb-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 p-1.5 w-48 max-h-36 overflow-y-auto space-y-1">
                                  <p className="text-[9px] text-gray-405 px-1 font-bold uppercase tracking-wider border-b border-gray-100 pb-1 mb-1">
                                    Select Simulated Proof:
                                  </p>
                                  {MOCK_DIAGNOSTIC_FILES.map(file => (
                                    <button
                                      key={file}
                                      type="button"
                                      onClick={() => {
                                        setMockAttachment(file);
                                        setShowMockFiles(false);
                                      }}
                                      className="w-full text-left px-2 py-1 rounded text-[10px] font-mono hover:bg-gray-50 text-gray-700 hover:text-[#1F4096] transition-colors"
                                    >
                                      📎 {file}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Submit button */}
                      <div>
                        <button
                          type="submit"
                          disabled={isLocked || isPending}
                          className="w-full md:w-auto px-5 py-2 bg-[#1F4096] hover:bg-[#1F4096]/90 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow disabled:opacity-50"
                        >
                          {isPending ? 'Submitting...' : 'Submit Update'}
                        </button>
                      </div>

                    </div>
                  </form>
                </div>

              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
