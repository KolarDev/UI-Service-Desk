import fs from 'fs';
import path from 'path';
import { Unit, Ticket, User } from '@/types';

const dbPath = path.join(process.cwd(), 'src/data/mock-db.json');

const defaultDb = {
  units: [
    {
      id: "unit-1",
      name: "Fiber & Core Infrastructure Unit",
      description: "Handles entire building network blackouts, damaged fiber optic cables, structural switch failures, and core backbone links."
    },
    {
      id: "unit-2",
      name: "Helpdesk & LAN Routing Unit",
      description: "Handles office LAN port faults, wall jack replacements, single system IP configuration conflicts, and localized Wi-Fi router issues."
    },
    {
      id: "unit-3",
      name: "Network Operations Center (NOC)",
      description: "Handles institutional email access locks, departmental sub-domain setups, firewall white-listing, and server access exceptions."
    }
  ],
  engineers: [
    {
      id: "eng-1",
      name: "Olumide Awolowo",
      email: "olumide.awolowo@ui.edu.ng",
      role: "ENGINEER",
      unitId: "unit-2"
    },
    {
      id: "eng-2",
      name: "Adeshina Falola",
      email: "adeshina.falola@ui.edu.ng",
      role: "ENGINEER",
      unitId: "unit-2"
    },
    {
      id: "eng-3",
      name: "Chidi Nwachukwu",
      email: "chidi.nwachukwu@ui.edu.ng",
      role: "ENGINEER",
      unitId: "unit-2"
    },
    {
      id: "eng-4",
      name: "Amina Bello",
      email: "amina.bello@ui.edu.ng",
      role: "ENGINEER",
      unitId: "unit-3"
    }
  ],
  tickets: []
};

interface DbSchema {
  units: Unit[];
  engineers: User[];
  tickets: Ticket[];
}

export function getDb(): DbSchema {
  try {
    if (!fs.existsSync(dbPath)) {
      // Ensure directory exists
      const dir = path.dirname(dbPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(dbPath, JSON.stringify(defaultDb, null, 2), 'utf-8');
      return defaultDb as DbSchema;
    }
    const fileContent = fs.readFileSync(dbPath, 'utf-8');
    const parsed = JSON.parse(fileContent);
    // Ensure engineers exist in parsed DB
    if (!parsed.engineers) {
      parsed.engineers = defaultDb.engineers;
    }
    return parsed;
  } catch (error) {
    console.error('Failed to read or parse mock-db.json:', error);
    return defaultDb as DbSchema;
  }
}

export function saveDb(data: DbSchema): void {
  try {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to write to mock-db.json:', error);
    throw new Error('Failed to save data to the mock database.');
  }
}

export function getUnits(): Unit[] {
  return getDb().units;
}

export function getTickets(): Ticket[] {
  return getDb().tickets;
}

export function getEngineers(): User[] {
  return getDb().engineers || [];
}

export function addTicket(ticket: Ticket): void {
  const db = getDb();
  db.tickets.push(ticket);
  saveDb(db);
}

export function updateTicket(ticketId: string, updates: Partial<Ticket>): Ticket | null {
  const db = getDb();
  const ticketIndex = db.tickets.findIndex(t => t.id === ticketId);
  if (ticketIndex === -1) return null;
  
  db.tickets[ticketIndex] = {
    ...db.tickets[ticketIndex],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  saveDb(db);
  return db.tickets[ticketIndex];
}
