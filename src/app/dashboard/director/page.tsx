import { getTicketsAction, getEngineersAction, getUnitsAction } from '@/app/actions';
import DirectorDashboardClient from './DirectorDashboardClient';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Director Control Center | uiservicedesk',
  description: 'Secure internal management view for the Deputy Director, Helpdesk Unit.',
};

export default async function DirectorDashboardPage() {
  const tickets = await getTicketsAction();
  const engineers = await getEngineersAction();
  const units = await getUnitsAction();

  return (
    <DirectorDashboardClient
      initialTickets={tickets}
      engineers={engineers}
      units={units}
    />
  );
}
