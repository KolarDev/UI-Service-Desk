'use server';

import { randomUUID } from 'crypto';
import { addTicket, getUnits } from '@/lib/db';
import { Ticket, Priority, TicketStatus } from '@/types';

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

    // 2. Package matching Ticket schema
    const newTicket: Ticket = {
      id: randomUUID(),
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
    };

    // 3. Append to mock DB
    addTicket(newTicket);

    return { success: true, ticket: newTicket };
  } catch (error) {
    console.error('Failed to create ticket in action:', error);
    return { success: false, error: 'An unexpected error occurred while submitting your ticket.' };
  }
}
