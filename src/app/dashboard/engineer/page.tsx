import { getTicketsAction, getEngineersAction } from '@/app/actions';
import EngineerDashboardClient from './EngineerDashboardClient';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Engineer Workspace | uiservicedesk',
  description: 'Internal tracking workspace for Network Engineers - University of Ibadan IT ticketing ecosystem.',
};

export default async function EngineerDashboardPage() {
  const tickets = await getTicketsAction();
  const engineers = await getEngineersAction();

  // Find Kola dynamically to get his technical unit
  const kola = engineers.find(e => e.id === 'eng-1');
  const kolaUnitId = kola?.unitId || 'unit-2';

  // Queue Rules:
  // 1. All tickets assigned to him (assignedEngineerIds contains "eng-1")
  // 2. Any tickets currently marked as "ESCALATED"
  const activeTickets = tickets.filter(t => {
    const isAssignedToKola = t.assignedEngineerIds && t.assignedEngineerIds.includes('eng-1');
    const isEscalated = t.status === 'ESCALATED';
    return isAssignedToKola || isEscalated;
  });

  return (
    <EngineerDashboardClient initialTickets={activeTickets} />
  );
}
