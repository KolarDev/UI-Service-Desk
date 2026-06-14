import { getTickets, getEngineers, getUnits } from '@/lib/db';
import DirectorDashboardClient from './DirectorDashboardClient';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Director Control Center | uiservicedesk',
  description: 'Secure internal management view for the Deputy Director, Helpdesk Unit.',
};

export default async function DirectorDashboardPage() {
  const tickets = getTickets();
  const engineers = getEngineers();
  const units = getUnits();

  return (
    <DirectorDashboardClient
      initialTickets={tickets}
      engineers={engineers}
      units={units}
    />
  );
}
