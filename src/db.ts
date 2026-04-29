import Dexie, { type Table } from 'dexie';

export interface TrainingSession {
  id?: number;
  schoolName: string;
  courseTitle: string;
  gregorianDate: string; // YYYY-MM-DD
  hijriDate: string;
  dayOfWeek: string;
  status: 'executed' | 'in_progress' | 'not_executed';
  reminderTime: string; // ISO string for when to notify
}

export class AppDatabase extends Dexie {
  sessions!: Table<TrainingSession>;

  constructor() {
    super('TrainerOrganizeDB');
    this.version(1).stores({
      sessions: '++id, gregorianDate, hijriDate, schoolName'
    });
  }
}

export const db = new AppDatabase();
