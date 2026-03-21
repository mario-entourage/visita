import { startOfWeek, endOfWeek, addWeeks, format } from 'date-fns';
import type { Doctor } from '@/types/doctor';

// ── Types ──────────────────────────────────────────────────────────

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  description?: string;
}

export interface MatchedEvent {
  event: GoogleCalendarEvent;
  doctor: Doctor & { id: string };
}

export interface UnmatchedEvent {
  event: GoogleCalendarEvent;
  /** Pre-cleaned name extracted from event title */
  suggestedName: string;
}

export interface MatchResult {
  matched: MatchedEvent[];
  unmatched: UnmatchedEvent[];
}

// ── Week range ─────────────────────────────────────────────────────

/** Get start (Monday 00:00) and end (Sunday 23:59) of current or next week. */
export function getWeekRange(offset: 0 | 1): { start: Date; end: Date } {
  const base = offset === 0 ? new Date() : addWeeks(new Date(), 1);
  const start = startOfWeek(base, { weekStartsOn: 1 }); // Monday
  const end = endOfWeek(base, { weekStartsOn: 1 }); // Sunday
  return { start, end };
}

// ── Name normalization ─────────────────────────────────────────────

/** Strip accents, prefixes (Dr./Dra.), suffixes after " - " or " | ", lowercase. */
export function normalizeName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip accents
    .toLowerCase()
    .replace(/^(dr\.?|dra\.?)\s*/i, '') // strip Dr./Dra. prefix
    .replace(/\s*[-|].*$/, '') // strip everything after " - " or " | "
    .trim();
}

// ── Doctor matching ────────────────────────────────────────────────

/** Match calendar events against doctor list by name substring. */
export function matchEventsToDb(
  events: GoogleCalendarEvent[],
  doctors: (Doctor & { id: string })[]
): MatchResult {
  const matched: MatchedEvent[] = [];
  const unmatched: UnmatchedEvent[] = [];

  for (const event of events) {
    if (!event.summary) {
      unmatched.push({ event, suggestedName: '' });
      continue;
    }

    const normalizedTitle = normalizeName(event.summary);
    if (!normalizedTitle) {
      unmatched.push({ event, suggestedName: '' });
      continue;
    }

    let bestMatch: (Doctor & { id: string }) | null = null;

    for (const doctor of doctors) {
      const normalizedDoctor = normalizeName(doctor.fullName);
      if (!normalizedDoctor) continue;

      // Check if doctor name is in event title or vice versa
      if (
        normalizedTitle.includes(normalizedDoctor) ||
        normalizedDoctor.includes(normalizedTitle)
      ) {
        bestMatch = doctor;
        break;
      }
    }

    if (bestMatch) {
      matched.push({ event, doctor: bestMatch });
    } else {
      // Extract a clean name suggestion from the event title
      const suggestedName = event.summary
        .replace(/^(Dr\.?|Dra\.?)\s*/i, '')
        .replace(/\s*[-|].*$/, '')
        .trim();
      unmatched.push({ event, suggestedName });
    }
  }

  return { matched, unmatched };
}

// ── Google Calendar API ────────────────────────────────────────────

const CALENDAR_API = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';

/** Fetch events from Google Calendar for a date range. */
export async function fetchGoogleEvents(
  accessToken: string,
  timeMin: Date,
  timeMax: Date
): Promise<GoogleCalendarEvent[]> {
  const params = new URLSearchParams({
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '100',
  });

  const res = await fetch(`${CALENDAR_API}?${params}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (res.status === 401) {
    throw new Error('TOKEN_EXPIRED');
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google Calendar API error ${res.status}: ${text}`);
  }

  const data = await res.json();
  return (data.items ?? []) as GoogleCalendarEvent[];
}

/** Create an event in Google Calendar. Returns the event ID. */
export async function createGoogleEvent(
  accessToken: string,
  event: {
    summary: string;
    startTime: Date;
    endTime: Date;
    description?: string;
  }
): Promise<string> {
  const body = {
    summary: event.summary,
    start: { dateTime: event.startTime.toISOString() },
    end: { dateTime: event.endTime.toISOString() },
    description: event.description ?? '',
  };

  const res = await fetch(CALENDAR_API, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (res.status === 401) {
    throw new Error('TOKEN_EXPIRED');
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google Calendar API error ${res.status}: ${text}`);
  }

  const data = await res.json();
  return data.id;
}

/** Update an event in Google Calendar. */
export async function updateGoogleEvent(
  accessToken: string,
  eventId: string,
  event: {
    summary: string;
    startTime: Date;
    endTime: Date;
    description?: string;
  }
): Promise<void> {
  const body = {
    summary: event.summary,
    start: { dateTime: event.startTime.toISOString() },
    end: { dateTime: event.endTime.toISOString() },
    description: event.description ?? '',
  };

  const res = await fetch(`${CALENDAR_API}/${eventId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (res.status === 401) {
    throw new Error('TOKEN_EXPIRED');
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google Calendar API error ${res.status}: ${text}`);
  }
}

/** Parse a Google Calendar event's start time to a Date. */
export function getEventStartDate(event: GoogleCalendarEvent): Date {
  const raw = event.start.dateTime ?? event.start.date;
  return raw ? new Date(raw) : new Date();
}

/** Format event time for display. */
export function formatEventTime(event: GoogleCalendarEvent): string {
  const date = getEventStartDate(event);
  return format(date, "EEE dd/MM 'às' HH:mm");
}
