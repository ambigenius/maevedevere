// Shared section names across the app
export type Section = 'About' | 'All' | 'Words' | 'Lines' | 'Motion' | 'Sound';

// Base model used by all content types
export interface BaseModel {
  id: string;
  title: string;
  // Dates can be stored as ISO strings on disk and parsed to Date in-memory
  date: string | Date;
  description: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  isActive: boolean;
  metadata: Record<string, any>;
}

export interface Words extends BaseModel {
  type: 'Words';
  text: string;
}

export interface Lines extends BaseModel {
  type: 'Lines';
  text: string;
  image?: string | string[] | null;
  imageWidth?: string;
}

export interface Motion extends BaseModel {
  type: 'Motion';
  text: string;
  videoUrl?: string | null;
}

export interface Sound extends BaseModel {
  type: 'Sound';
  text: string;
  image?: string | string[] | null;
  imageWidth?: string;
  audioUrl?: string | null;
}

export interface About extends BaseModel {
  type: 'About';
  text: string;
}

export type AnyPost = Words | Lines | Motion | Sound | About;

// Helper: convert specific keys containing ISO strings into Date instances
export function parseIsoDateFields<T extends Record<string, any>>(obj: T, keys: string[]): T {
  if (!obj || typeof obj !== 'object') return obj;
  const clone: Record<string, any> = { ...obj };

  for (const key of keys) {
    const value = clone[key];
    if (typeof value === 'string') {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        clone[key] = d;
      }
    }
  }

  return clone as T;
}


