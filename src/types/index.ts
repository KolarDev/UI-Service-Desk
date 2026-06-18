export type Role = 'SUPER_ADMIN' | 'UNIT_DIRECTOR' | 'ENGINEER';
export type TicketStatus = 'SUBMITTED' | 'ASSIGNED' | 'IN_PROGRESS' | 'ESCALATED' | 'RESOLVED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Unit {
  id: string;
  name: string;
  description?: string;
}

export interface User {
  id: string;
  email?: string;
  name: string;
  role?: Role;
  unitId?: string;
  avatar?: string;
}

export interface PrivateInstruction {
  engineerId: string;
  instructionText: string;
}

export interface TicketLog {
  id: string;
  timestamp: string;
  authorName: string;
  authorType: 'SYSTEM' | 'DIRECTOR' | 'ENGINEER' | 'COMPLAINER';
  authorAvatar: string | null;
  logType: 'MILESTONE' | 'ESCALATION' | 'RESOLUTION';
  text: string;
  attachmentName: string | null;
}

export interface Ticket {
  id: string;
  ticketIdDisplay?: string;
  title: string;
  description: string;
  priority: Priority;
  status: TicketStatus;
  complainerEmail?: string;
  complainerPhone?: string;
  faculty: string;
  department: string;
  roomNumber: string;
  unitId: string;
  assignedEngineerIds: string[];
  privateInstructions: PrivateInstruction[];
  logs: TicketLog[];
  createdAt: string;
  updatedAt: string;
}

export interface DbSchema {
  units: Unit[];
  engineers: User[];
  tickets: Ticket[];
}