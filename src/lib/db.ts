import { getDb } from '@/app/actions';
import { Unit, Ticket, User } from '@/types';

export async function getUnits(): Promise<Unit[]> {
  const db = await getDb();
  return db.units;
}

export async function getTickets(): Promise<Ticket[]> {
  const db = await getDb();
  return db.tickets;
}

export async function getEngineers(): Promise<User[]> {
  const db = await getDb();
  return db.engineers || [];
}
