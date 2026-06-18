import { getTicketsAction } from '@/app/actions';
import TrackingViewClient from './TrackingViewClient';
import { Metadata } from 'next';
import Link from 'next/link';
import { AlertCircle, Home } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Track Complaint Status | uiservicedesk',
  description: 'Track your network complaint in real-time.',
};

interface TrackPageProps {
  params: Promise<{ ticketId: string }> | { ticketId: string };
}

export default async function TrackPage({ params }: TrackPageProps) {
  // Await params if it is a Promise (Next.js 15 App Router convention)
  const resolvedParams = await params;
  const ticketId = resolvedParams.ticketId;

  const tickets = await getTicketsAction();
  const ticket = tickets.find(
    t => t.id === ticketId || t.ticketIdDisplay?.toLowerCase() === ticketId.toLowerCase()
  );

  if (!ticket) {
    return (
      <div className="flex flex-col min-h-screen bg-[#F9FAFB] text-[#1A212C]">
        <header className="bg-[#1F4096] border-b-4 border-[#7E711F] text-white py-4 shadow-md">
          <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
            <h1 className="text-xl font-bold">uiservicedesk // Public Tracking Portal</h1>
            <Link
              href="/"
              className="text-xs hover:underline bg-white/10 px-3 py-1.5 rounded flex items-center gap-1"
            >
              <Home className="w-3.5 h-3.5" />
              Back Home
            </Link>
          </div>
        </header>
        <main className="flex-grow flex items-center justify-center p-6">
          <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-md text-center max-w-md space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-100">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-red-950">Tracking Reference Not Found</h2>
            <p className="text-xs text-gray-500">
              The ticket tracking code <span className="font-mono font-bold text-gray-700">"{ticketId}"</span> could not be located in our systems. It may have been archived or entered incorrectly.
            </p>
            <Link
              href="/"
              className="inline-block px-4 py-2 bg-[#1F4096] text-white text-xs font-semibold rounded hover:bg-[#152e72] transition-colors"
            >
              Return to Homepage
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return <TrackingViewClient ticket={ticket} />;
}
