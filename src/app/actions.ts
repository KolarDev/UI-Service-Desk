'use server';

import { randomUUID } from 'crypto';
import { addTicket, getUnits, updateTicket, getTickets } from '@/lib/db';
import { Ticket, Priority, TicketStatus, TicketLog } from '@/types';
import { revalidatePath } from 'next/cache';

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
    // 1. Validation
    if (!input.unitId) {
      return { success: false, error: 'Please select a destination unit first.' };
    }

    // Verify unit exists
    const units = getUnits();
    const unitExists = units.some(u => u.id === input.unitId);
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

    // 2. Package matching Ticket schema
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
      createdAt: now,
      updatedAt: now,
      logs: [],
    };

    // 3. Append to mock DB
    addTicket(newTicket);

    return { success: true, ticket: newTicket };
  } catch (error) {
    console.error('Failed to create ticket in action:', error);
    return { success: false, error: 'An unexpected error occurred while submitting your ticket.' };
  }
}

export async function assignTicketAction(ticketId: string, engineerId: string) {
  try {
    if (!ticketId) {
      return { success: false, error: 'Ticket ID is required.' };
    }
    if (!engineerId) {
      return { success: false, error: 'Please select an engineer to assign.' };
    }

    const updated = updateTicket(ticketId, {
      status: 'ASSIGNED',
      assignedToId: engineerId,
    });

    if (!updated) {
      return { success: false, error: 'Ticket not found or update failed.' };
    }

    revalidatePath('/dashboard/director');
    revalidatePath('/dashboard/engineer');
    return { success: true, ticket: updated };
  } catch (error) {
    console.error('Failed to assign ticket:', error);
    return { success: false, error: 'An unexpected error occurred while assigning the ticket.' };
  }
}

export async function submitEngineerUpdateAction(
  ticketId: string,
  text: string,
  actionType: 'MILESTONE' | 'ESCALATION' | 'RESOLUTION',
  attachmentName: string | null
) {
  try {
    if (!ticketId) {
      return { success: false, error: 'Ticket ID is required.' };
    }
    if (!text || text.trim() === '') {
      return { success: false, error: 'Comment text is required.' };
    }

    const tickets = getTickets();
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) {
      return { success: false, error: 'Ticket not found.' };
    }

    const newLog: TicketLog = {
      id: `log-${randomUUID()}`,
      timestamp: new Date().toISOString(),
      authorName: 'Engineer Kola',
      authorType: 'ENGINEER',
      authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kola',
      logType: actionType,
      text: text.trim(),
      attachmentName: actionType === 'MILESTONE' ? (attachmentName ? attachmentName.trim() : null) : null,
    };

    let statusUpdate = ticket.status;
    let assignedToIdUpdate: string | undefined = ticket.assignedToId;

    if (actionType === 'ESCALATION') {
      statusUpdate = 'ESCALATED';
      assignedToIdUpdate = undefined; // Strips assignedToId back to null
    } else if (actionType === 'RESOLUTION') {
      statusUpdate = 'RESOLVED';
    } else if (actionType === 'MILESTONE') {
      statusUpdate = 'ASSIGNED';
    }

    const updatedLogs = [...(ticket.logs || []), newLog];
    const updated = updateTicket(ticketId, {
      logs: updatedLogs,
      status: statusUpdate,
      assignedToId: assignedToIdUpdate,
    });

    if (!updated) {
      return { success: false, error: 'Failed to apply update in mock-db.' };
    }

    revalidatePath('/dashboard/engineer');
    revalidatePath('/dashboard/director');
    revalidatePath(`/track/${ticketId}`);
    return { success: true, ticket: updated };
  } catch (error) {
    console.error('Failed to submit engineer update:', error);
    return { success: false, error: 'An unexpected error occurred during submission.' };
  }
}

export async function submitComplainerUpdateAction(ticketId: string, text: string) {
  try {
    if (!ticketId) {
      return { success: false, error: 'Ticket ID is required.' };
    }
    if (!text || text.trim() === '') {
      return { success: false, error: 'Message content is required.' };
    }

    const tickets = getTickets();
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) {
      return { success: false, error: 'Ticket not found.' };
    }

    const newLog: TicketLog = {
      id: `log-${randomUUID()}`,
      timestamp: new Date().toISOString(),
      authorName: 'Complainer (Public User)',
      authorType: 'COMPLAINER',
      authorAvatar: null,
      logType: 'MILESTONE',
      text: text.trim(),
      attachmentName: null,
    };

    const updatedLogs = [...(ticket.logs || []), newLog];
    const updated = updateTicket(ticketId, {
      logs: updatedLogs,
    });

    if (!updated) {
      return { success: false, error: 'Failed to submit comment in mock-db.' };
    }

    revalidatePath('/dashboard/engineer');
    revalidatePath('/dashboard/director');
    revalidatePath(`/track/${ticketId}`);
    return { success: true, ticket: updated };
  } catch (error) {
    console.error('Failed to submit complainer update:', error);
    return { success: false, error: 'An unexpected error occurred during submission.' };
  }
}

export async function checkTicketTrackingIdAction(displayId: string) {
  try {
    if (!displayId) {
      return { success: false, error: 'Tracking ID is required.' };
    }
    const tickets = getTickets();
    const ticket = tickets.find(
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
