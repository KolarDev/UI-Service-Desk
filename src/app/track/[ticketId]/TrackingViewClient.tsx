'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { Ticket, TicketLog } from '@/types';
import { submitComplainerUpdateAction } from '@/app/actions';
import { cn } from '@/lib/utils';
import {
  Clock,
  MapPin,
  Mail,
  FileText,
  User,
  Paperclip,
  Send,
  Home,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Check
} from 'lucide-react';
import Link from 'next/link';

interface TrackingViewClientProps {
  ticket: Ticket;
}

export default function TrackingViewClient({ ticket: initialTicket }: TrackingViewClientProps) {
  const [ticket, setTicket] = useState<Ticket>(initialTicket);
  const [commentText, setCommentText] = useState('');

  // Transition state
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sync state with props
  useEffect(() => {
    setTicket(initialTicket);
  }, [initialTicket]);

  const isResolved = ticket.status === 'RESOLVED';

  const handleComplainerCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!commentText.trim()) {
      setErrorMsg('Please enter a message before sending.');
      return;
    }

    startTransition(async () => {
      const res = await submitComplainerUpdateAction(ticket.id, commentText);
      if (res.success) {
        setCommentText('');
        setSuccessMsg('Your update has been submitted successfully to the technical unit.');
        setTimeout(() => setSuccessMsg(null), 3000);
      } else {
        setErrorMsg(res.error || 'Failed to send update. Please try again.');
      }
    });
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

  const getStatusBadgeStyles = (status: string) => {
    switch (status) {
      case 'RESOLVED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'ESCALATED':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'ASSIGNED':
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'SUBMITTED':
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F9FAFB] text-[#1A212C] font-sans">
      {/* Brand Header */}
      <header className="bg-[#1F4096] border-b-4 border-[#7E711F] shadow-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white border border-[#7E711F] flex items-center justify-center font-bold text-[#1F4096] shadow-inner text-sm">
              UI
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight leading-none">
                uiservicedesk // Public Tracking Portal
              </h1>
              <span className="text-[9px] text-white/70 font-semibold tracking-wider uppercase">
                University of Ibadan IT Network Support
              </span>
            </div>
          </div>
          
          <Link
            href="/"
            className="text-xs text-white/80 hover:text-white bg-white/10 hover:bg-white/20 transition-all px-3 py-1.5 rounded border border-white/10 flex items-center gap-1.5 font-medium"
          >
            <Home className="w-3.5 h-3.5" />
            Portal Home
          </Link>
        </div>
      </header>

      {/* Main Track Workspace */}
      <main className="flex-grow max-w-4xl w-full mx-auto px-4 py-8 space-y-6">
        
        {/* Banner Alert Messages */}
        {successMsg && (
          <div className="bg-emerald-50 border-l-4 border-emerald-600 p-4 rounded-r-lg shadow-sm flex items-start gap-3 animate-fadeIn">
            <div className="p-1 rounded-full bg-emerald-100 text-emerald-800">
              <Check className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-950">Update Received</p>
              <p className="text-xs text-emerald-800 mt-0.5">{successMsg}</p>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-r-lg shadow-sm flex items-start gap-3 animate-fadeIn">
            <div className="p-1 rounded-full bg-red-100 text-red-800">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-red-950">Handoff Error</p>
              <p className="text-xs text-red-800 mt-0.5">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Live Status Header Block */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#7E711F]" />
          
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-mono font-bold bg-[#1F4096]/10 border border-[#1F4096]/20 text-[#1F4096] px-3 py-1 rounded-full">
                Reference Code: {ticket.ticketIdDisplay || ticket.id}
              </span>
              <span className={cn("text-xs font-bold px-3 py-0.5 rounded-full border uppercase tracking-wider font-mono", getStatusBadgeStyles(ticket.status))}>
                {ticket.status}
              </span>
            </div>
            
            <div className="flex items-center gap-1.5 text-xs text-[#4B5563]">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>Reported: {new Date(ticket.createdAt).toLocaleString()}</span>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-bold text-[#1A212C] leading-snug">
              {ticket.title}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs text-[#4B5563]">
              <p className="flex items-center gap-2">
                <MapPin className="w-4.5 h-4.5 text-[#7E711F] shrink-0" />
                <span className="font-bold text-[#1A212C]">Location:</span>
                <span>{ticket.faculty} • {ticket.department} ({ticket.roomNumber})</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4.5 h-4.5 text-[#7E711F] shrink-0" />
                <span className="font-bold text-[#1A212C]">Reporter Contact:</span>
                <span className="font-mono">{ticket.complainerEmail}</span>
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg border border-gray-150 mt-2">
              <p className="text-xs font-bold text-[#1A212C] uppercase flex items-center gap-1.5 mb-1.5">
                <FileText className="w-4 h-4 text-[#1F4096]" />
                Description of Filed Problem
              </p>
              <p className="text-sm text-[#4B5563] leading-relaxed whitespace-pre-line">
                {ticket.description}
              </p>
            </div>
          </div>
        </section>

        {/* Unified Activity Thread */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-6">
          <h3 className="text-sm font-extrabold text-[#1A212C] uppercase tracking-wider flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#7E711F]" />
            Live Resolution Activity Timeline
          </h3>

          <div className="relative border-l-2 border-[#7E711F]/30 ml-4 pl-6 space-y-5 pb-2">
            {(!ticket.logs || ticket.logs.length === 0) ? (
              <p className="text-xs text-gray-400 italic">No activity logged yet. The ICT technical unit is reviewing your submission.</p>
            ) : (
              ticket.logs.map((log) => {
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

                    <div className={cn("rounded-lg p-4 shadow-sm", logCardStyle)}>
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#1A212C]">
                            {log.authorName}
                          </span>

                          {isEngineer ? (
                            <span className="bg-[#1F4096]/10 text-[#1F4096] border border-[#1F4096]/20 text-[9px] font-bold px-1.5 py-0.5 rounded font-mono">
                              [Technical Staff]
                            </span>
                          ) : (
                            <span className="bg-blue-50 text-[#1F4096] border border-blue-200 text-[9px] font-bold px-1.5 py-0.5 rounded font-mono">
                              [Complainer Update]
                            </span>
                          )}

                          <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#4B5563]/60 font-mono">
                            • {log.logType || 'MILESTONE'}
                          </span>
                        </div>

                        <span className="text-[10px] text-gray-400 font-medium font-mono">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>

                      <p className="text-xs text-[#4B5563] leading-relaxed whitespace-pre-line">
                        {log.text}
                      </p>

                      {log.attachmentName && (
                        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded bg-gray-50 border border-gray-200 text-xs font-semibold text-[#1F4096]">
                          <Paperclip className="w-3.5 h-3.5 text-[#7E711F]" />
                          <span className="font-mono text-[11px]">{log.attachmentName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Complainer Response Channel */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
          {isResolved ? (
            <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded-r-lg flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-green-950">Complaint Closed</p>
                <p className="text-xs text-green-800 mt-0.5">
                  This operational issue has been officially resolved and closed. Thank you for using uiservicedesk.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-extrabold text-[#1A212C] uppercase tracking-wider flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-[#1F4096]" />
                  Response Channel
                </h3>
                <p className="text-xs text-[#4B5563] mt-0.5">
                  Provide additional details, system behavior changes, or check-in messages directly to the technicians.
                </p>
              </div>

              <form onSubmit={handleComplainerCommentSubmit} className="space-y-3">
                <div>
                  <label htmlFor="complainerText" className="block text-xs font-bold text-[#1A212C] uppercase tracking-wide mb-1.5">
                    Send Additional Information / Message to Technical Unit
                  </label>
                  <textarea
                    id="complainerText"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Enter additional symptoms, network status changes, or questions..."
                    rows={3}
                    disabled={isPending}
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-xs focus:ring-1 focus:ring-[#1F4096] focus:border-[#1F4096] outline-none resize-none transition-all placeholder:text-gray-400 bg-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 bg-[#1F4096] hover:bg-[#1F4096]/95 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isPending ? 'Sending...' : 'Send Update'}
                </button>
              </form>
            </div>
          )}
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-[#1A212C] text-white/70 border-t border-[#7E711F]/20 mt-auto">
        <div className="max-w-4xl mx-auto px-4 py-8 text-center text-xs space-y-2">
          <p>© {new Date().getFullYear()} University of Ibadan. ICT Network Support Unit.</p>
          <p>This tracking portal is open and secure. Keep your tracking reference ID confidential.</p>
        </div>
      </footer>
    </div>
  );
}
