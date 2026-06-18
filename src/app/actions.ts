'use server';

import { randomUUID } from 'crypto';
import { Ticket, Priority, TicketStatus, TicketLog, DbSchema } from '@/types';
import { revalidatePath } from 'next/cache';

// Shared Architecture Setup inside src/app/actions.ts
let globalDbInstance: any = null;

export async function getDb(): Promise<DbSchema> {
  if (!globalDbInstance) {
    globalDbInstance = {
      units: [
        { id: "unit-1", name: "Fiber & Core Infrastructure" },
        { id: "unit-2", name: "Helpdesk & LAN Routing" }
      ],
      engineers: [
        { id: "eng-1", name: "Engineer Kola", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kola", unitId: "unit-2" },
        { id: "eng-2", name: "Engineer Chioma", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Chioma", unitId: "unit-2" }
      ],
      tickets: [
        {
          id: "t-1",
          ticketIdDisplay: "UI-74A9",
          title: "Faculty of Science Lab 3 Link Failure",
          description: "Entire row of computers in Lab 3 cannot obtain IP addresses. Link lights on wall jacks are completely dead.",
          priority: "HIGH",
          status: "ASSIGNED",
          assignedEngineerIds: ["eng-1"],
          unitId: "unit-2",
          faculty: "Faculty of Science",
          department: "Computer Science",
          roomNumber: "Lab 3, Ground Floor",
          privateInstructions: [
            { engineerId: "eng-1", instructionText: "Please verify if the core switch stacked link failed before re-terminating any copper drops." }
          ],
          logs: [
            { id: "log-1", timestamp: "2026-06-15T10:00:00Z", authorName: "System", authorType: "SYSTEM", logType: "MILESTONE", text: "Ticket generated via public submission portal.", attachmentName: null },
            { id: "log-2", timestamp: "2026-06-15T11:00:00Z", authorName: "Director Pool", authorType: "DIRECTOR", logType: "MILESTONE", text: "Ticket dispatched and assigned to Engineer Kola.", attachmentName: null }
          ]
        }
      ]
    };
  }
  return globalDbInstance;
}

export async function getTicketsAction() {
  const db = await getDb();
  return db.tickets;
}

export async function getEngineersAction() {
  const db = await getDb();
  return db.engineers;
}

export async function getUnitsAction() {
  const db = await getDb();
  return db.units;
}

export interface CreateTicketInput {
  unitId: string;
  complainerEmail: string;
  complainerPhone?: string;
  faculty: string;
  department: string;
  roomNumber: string;
  title: string;
  description: string;
}

export async function createTicketAction(input: CreateTicketInput) {
  try {
    const db = await getDb();

    // 1. Validation
    if (!input.unitId) {
      return { success: false, error: 'Please select a destination unit first.' };
    }

    const unitExists = db.units.some(u => u.id === input.unitId);
    if (!unitExists) {
      return { success: false, error: 'Invalid destination unit selected.' };
    }

    if (!input.complainerEmail || !input.complainerEmail.includes('@')) {
      return { success: false, error: 'A valid email address is required.' };
    }

    if (!input.department || input.department.trim() === '') {
      return { success: false, error: 'Department is required.' };
    }

    if (!input.roomNumber || input.roomNumber.trim() === '') {
      return { success: false, error: 'Specific location/room number is required.' };
    }

    if (!input.title || input.title.trim() === '') {
      return { success: false, error: 'Short issue summary is required.' };
    }

    if (!input.description || input.description.trim() === '') {
      return { success: false, error: 'Detailed issue description is required.' };
    }

    const now = new Date().toISOString();
    const randomId = Math.floor(1000 + Math.random() * 9000);

    const newTicket: Ticket = {
      id: randomUUID(),
      ticketIdDisplay: `UI-${randomId}`,
      title: input.title.trim(),
      description: input.description.trim(),
      priority: 'MEDIUM' as Priority,
      status: 'SUBMITTED' as TicketStatus,
      complainerEmail: input.complainerEmail.trim(),
      complainerPhone: input.complainerPhone?.trim() || undefined,
      faculty: input.faculty,
      department: input.department.trim(),
      roomNumber: input.roomNumber.trim(),
      unitId: input.unitId,
      assignedEngineerIds: [],
      privateInstructions: [],
      logs: [
        {
          id: `log-${randomUUID()}`,
          timestamp: now,
          authorName: 'System',
          authorType: 'SYSTEM',
          authorAvatar: null,
          logType: 'MILESTONE',
          text: 'Ticket generated via public submission portal.',
          attachmentName: null,
        }
      ],
      createdAt: now,
      updatedAt: now,
    };

    db.tickets.push(newTicket);

    revalidatePath('/');
    revalidatePath('/dashboard/director');
    revalidatePath('/dashboard/engineer');
    return { success: true, ticket: newTicket };
  } catch (error) {
    console.error('Failed to create ticket in action:', error);
    return { success: false, error: 'An unexpected error occurred while submitting your ticket.' };
  }
}

export async function dispatchTicketAction(
  ticketId: string,
  engineerIds: string[],
  instructions: string
) {
  try {
    const db = await getDb();
    const ticket = db.tickets.find(t => t.id === ticketId);
    if (!ticket) {
      return { success: false, error: 'Ticket not found.' };
    }

    if (!engineerIds || engineerIds.length === 0) {
      return { success: false, error: 'Please select at least one engineer.' };
    }

    // 1. Append selected engineer IDs into the assignedEngineerIds array (allowing more than one to coexist)
    const existingIds = ticket.assignedEngineerIds || [];
    const newIds = engineerIds.filter(id => !existingIds.includes(id));
    ticket.assignedEngineerIds = [...existingIds, ...newIds];

    // 2. Pushes a new object into the privateInstructions array linking the instruction text to those specific engineers
    if (instructions && instructions.trim() !== '') {
      engineerIds.forEach(engId => {
        // Remove any old instruction for this engineer on this ticket, or just append it
        ticket.privateInstructions = (ticket.privateInstructions || []).filter(pi => pi.engineerId !== engId);
        ticket.privateInstructions.push({
          engineerId: engId,
          instructionText: instructions.trim()
        });
      });
    }

    // 3. Resets top-level ticket status to ASSIGNED
    ticket.status = 'ASSIGNED';
    ticket.updatedAt = new Date().toISOString();

    // 4. Pushes a public dispatch milestone comment into the log thread for all participants to see
    const engineerNames = engineerIds
      .map(id => db.engineers.find(e => e.id === id)?.name || 'Unknown Engineer')
      .join(', ');

    const newLog: TicketLog = {
      id: `log-${randomUUID()}`,
      timestamp: new Date().toISOString(),
      authorName: 'Director Pool',
      authorType: 'DIRECTOR',
      authorAvatar: null,
      logType: 'MILESTONE',
      text: `Ticket dispatched and assigned to ${engineerNames}.`,
      attachmentName: null
    };

    ticket.logs.push(newLog);

    revalidatePath('/dashboard/director');
    revalidatePath('/dashboard/engineer');
    revalidatePath(`/track/${ticketId}`);

    return { success: true, ticket };
  } catch (error) {
    console.error('Failed to dispatch ticket:', error);
    return { success: false, error: 'An unexpected error occurred during dispatch.' };
  }
}

export async function escalateTicketByDirectorAction(
  ticketId: string,
  reason: string
) {
  try {
    const db = await getDb();
    const ticket = db.tickets.find(t => t.id === ticketId);
    if (!ticket) {
      return { success: false, error: 'Ticket not found.' };
    }

    if (!reason || reason.trim() === '') {
      return { success: false, error: 'Escalation reason is required.' };
    }

    const timestamp = new Date().toISOString();

    const newLog: TicketLog = {
      id: `log-${randomUUID()}`,
      timestamp,
      authorName: 'Director Pool',
      authorType: 'DIRECTOR',
      authorAvatar: null,
      logType: 'ESCALATION',
      text: `Director Pool: Escalated via Management. Reason: ${reason.trim()}`,
      attachmentName: null
    };

    ticket.logs.push(newLog);
    ticket.status = 'ESCALATED';
    ticket.assignedEngineerIds = []; // emptying the assignedEngineerIds array
    ticket.updatedAt = timestamp;

    revalidatePath('/dashboard/director');
    revalidatePath('/dashboard/engineer');
    revalidatePath(`/track/${ticketId}`);

    return { success: true, ticket };
  } catch (error) {
    console.error('Failed to escalate ticket by director:', error);
    return { success: false, error: 'An unexpected error occurred during escalation.' };
  }
}

export async function submitEngineerUpdateAction(
  ticketId: string,
  text: string,
  actionType: 'MILESTONE' | 'ESCALATION' | 'RESOLUTION',
  attachmentName: string | null
) {
  try {
    const db = await getDb();
    const ticket = db.tickets.find(t => t.id === ticketId);
    if (!ticket) {
      return { success: false, error: 'Ticket not found.' };
    }

    if (!text || text.trim() === '') {
      return { success: false, error: 'Comment text is required.' };
    }

    const timestamp = new Date().toISOString();

    const newLog: TicketLog = {
      id: `log-${randomUUID()}`,
      timestamp,
      authorName: 'Engineer Kola',
      authorType: 'ENGINEER',
      authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kola',
      logType: actionType,
      text: text.trim(),
      attachmentName: actionType === 'MILESTONE' ? (attachmentName ? attachmentName.trim() : null) : null,
    };

    ticket.logs.push(newLog);

    if (actionType === 'ESCALATION') {
      ticket.status = 'ESCALATED';
      ticket.assignedEngineerIds = []; // clears the assignedEngineerIds array back to []
    } else if (actionType === 'RESOLUTION') {
      ticket.status = 'RESOLVED';
    } else {
      ticket.status = 'ASSIGNED';
    }

    ticket.updatedAt = timestamp;

    revalidatePath('/dashboard/engineer');
    revalidatePath('/dashboard/director');
    revalidatePath(`/track/${ticketId}`);
    return { success: true, ticket };
  } catch (error) {
    console.error('Failed to submit engineer update:', error);
    return { success: false, error: 'An unexpected error occurred during submission.' };
  }
}

export async function submitComplainerUpdateAction(ticketId: string, text: string) {
  try {
    const db = await getDb();
    const ticket = db.tickets.find(t => t.id === ticketId);
    if (!ticket) {
      return { success: false, error: 'Ticket not found.' };
    }

    if (!text || text.trim() === '') {
      return { success: false, error: 'Message content is required.' };
    }

    const timestamp = new Date().toISOString();

    const newLog: TicketLog = {
      id: `log-${randomUUID()}`,
      timestamp,
      authorName: 'Complainer (Public User)',
      authorType: 'COMPLAINER',
      authorAvatar: null,
      logType: 'MILESTONE',
      text: text.trim(),
      attachmentName: null,
    };

    ticket.logs.push(newLog);
    ticket.updatedAt = timestamp;

    revalidatePath('/dashboard/engineer');
    revalidatePath('/dashboard/director');
    revalidatePath(`/track/${ticketId}`);
    return { success: true, ticket };
  } catch (error) {
    console.error('Failed to submit complainer update:', error);
    return { success: false, error: 'An unexpected error occurred during submission.' };
  }
}

export async function checkTicketTrackingIdAction(displayId: string) {
  try {
    const db = await getDb();
    const ticket = db.tickets.find(
      t => (t.ticketIdDisplay && t.ticketIdDisplay.trim().toLowerCase() === displayId.trim().toLowerCase()) ||
           (t.id && t.id.trim().toLowerCase() === displayId.trim().toLowerCase())
    );
    if (ticket) {
      return { success: true, ticketId: ticket.id };
    }
    return { success: false, error: 'No active record found with that tracking ID. Please check the reference code.' };
  } catch (error) {
    console.error('Failed to check tracking ID:', error);
    return { success: false, error: 'An unexpected error occurred while looking up tracking ID.' };
  }
}
