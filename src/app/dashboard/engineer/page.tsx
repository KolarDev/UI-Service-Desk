import { getTickets, getEngineers } from '@/lib/db';
import EngineerDashboardClient from './EngineerDashboardClient';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Engineer Workspace | uiservicedesk',
  description: 'Internal tracking workspace for Network Engineers - University of Ibadan IT ticketing ecosystem.',
};

export default async function EngineerDashboardPage() {
  const tickets = getTickets();
  const engineers = getEngineers();

  // Find Kola dynamically to get his technical unit
  const kola = engineers.find(e => e.id === 'eng-1');
  const kolaUnitId = kola?.unitId || 'unit-2';

  // Queue Rules:
  // 1. All tickets assigned to him (assignedToId === "eng-1" && status !== "RESOLVED")
  // 2. Any historical tickets belonging to his technical unit that have been ESCALATED (status === "ESCALATED")
  const activeTickets = tickets.filter(t => {
    const isAssignedToKola = t.assignedToId === 'eng-1' && t.status !== 'RESOLVED';
    const isEscalatedInUnit = t.unitId === kolaUnitId && t.status === 'ESCALATED';
    return isAssignedToKola || isEscalatedInUnit;
  });

  return (
    <EngineerDashboardClient initialTickets={activeTickets} />
  );
}
