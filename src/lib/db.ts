import fs from 'fs';
import path from 'path';
import { Unit, Ticket } from '@/types';

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
  tickets: []
};

interface DbSchema {
  units: Unit[];
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
      return defaultDb;
    }
    const fileContent = fs.readFileSync(dbPath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Failed to read or parse mock-db.json:', error);
    return defaultDb;
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

export function addTicket(ticket: Ticket): void {
  const db = getDb();
  db.tickets.push(ticket);
  saveDb(db);
}
