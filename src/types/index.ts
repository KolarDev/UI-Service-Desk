export type Role = 'SUPER_ADMIN' | 'UNIT_DIRECTOR' | 'ENGINEER';
export type TicketStatus = 'SUBMITTED' | 'ASSIGNED' | 'IN_PROGRESS' | 'ESCALATED' | 'RESOLVED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Unit {
  id: string;
  name: string;
  description: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  unitId?: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: TicketStatus;
  complainerEmail: string;
  complainerPhone?: string;
  faculty: string;
  department: string;
  roomNumber: string;
  unitId: string;
  assignedToId?: string;
  assignedTo?: User;
  createdAt: string;
  updatedAt: string;
}

export interface TicketLog {
  id: string;
  ticketId: string;
  userId?: string;
  user?: User;
  fromStatus?: TicketStatus;
  toStatus: TicketStatus;
  commentText?: string;
  isSystemLog: boolean;
  createdAt: string;
}