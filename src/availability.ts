import { toZonedTime, format } from 'date-fns-tz';
import { Room } from './sidebar/types';

// --- Types & Constants ---

const TIME_ZONE = 'America/New_York';
const OPERATING_HOURS = { start: 7, end: 22 };

// Using a Set for O(1) lookups
const UNIVERSITY_HOLIDAYS = new Set(['2024-01-01', '2024-07-04', '2024-12-25']);

// --- Helpers ---

/**
 * Converts decimal hours (14.5) to total minutes from midnight (870)
 */
const toTotalMinutes = (decimal: string | number) =>
  Math.round(parseFloat(decimal as string) * 60);

/**
 * Checks if the room is fundamentally closed (Weekends, Holidays, Hours)
 */
function getClosedReason(date: Date): string | null {
  const day = date.getDay();
  if (day === 0 || day === 6) return 'Weekend';

  const dateStr = format(date, 'yyyy-MM-dd', { timeZone: TIME_ZONE });
  if (UNIVERSITY_HOLIDAYS.has(dateStr)) return 'Holiday';

  const currentMinutes = date.getHours() * 60 + date.getMinutes();
  if (
    currentMinutes < OPERATING_HOURS.start * 60 ||
    currentMinutes >= OPERATING_HOURS.end * 60
  ) {
    return 'Outside Operating Hours';
  }

  return null;
}

// --- Main Logic ---

export function getClassroomAvailability(
  room: Room,
  selectedStart?: Date | null,
  selectedEnd?: Date | null,
  debug = false,
) {
  const startTime = toZonedTime(selectedStart || new Date(), TIME_ZONE);
  const endTime = selectedEnd ? toZonedTime(selectedEnd, TIME_ZONE) : startTime;

  const currentTotalMinutes =
    startTime.getHours() * 60 + startTime.getMinutes();
  const requestedRangeMinutes = {
    start: currentTotalMinutes,
    end: endTime.getHours() * 60 + endTime.getMinutes(),
  };

  // 1. Check Global Constraints
  const closedReason = getClosedReason(startTime);
  if (closedReason) {
    return [
      debug ? { status: 'Closed', reason: closedReason } : 'Closed',
      undefined,
    ];
  }

  if (!Array.isArray(room.availability_times)) {
    return [
      debug ? { status: 'Available', reason: 'No Schedule' } : 'Available',
      undefined,
    ];
  }

  // 2. Filter today's active events
  const dateStr = format(startTime, 'yyyy-MM-dd', { timeZone: TIME_ZONE });
  const todaysEvents = room.availability_times
    .filter((e) => e.date.startsWith(dateStr) && e.status === 1)
    .map((e) => ({
      ...e,
      startMins: toTotalMinutes(e.time_start),
      endMins: toTotalMinutes(e.time_end),
    }))
    .sort((a, b) => a.startMins - b.startMins);

  // 3. Determine Overlaps
  const overlappingEvents = todaysEvents.filter((event) => {
    // Standard interval overlap logic: (StartA < EndB) and (EndA > StartB)
    return (
      requestedRangeMinutes.start < event.endMins &&
      requestedRangeMinutes.end >= event.startMins
    );
  });

  const isUnavailable = overlappingEvents.length > 0;

  // 4. Calculate "Shortest" (Minutes until state change)
  let timeUntilChange: number | undefined;

  if (isUnavailable) {
    // If busy, when does the CURRENT block end?
    const currentEventEnd = Math.max(
      ...overlappingEvents.map((e) => e.endMins),
    );
    timeUntilChange = currentEventEnd - currentTotalMinutes;
  } else {
    // If free, when does the NEXT block start?
    const nextEvent = todaysEvents.find(
      (e) => e.startMins > currentTotalMinutes,
    );
    if (nextEvent) {
      timeUntilChange = nextEvent.startMins - currentTotalMinutes;
    } else {
      // No more events? Time until building closes
      timeUntilChange = OPERATING_HOURS.end * 60 - currentTotalMinutes;
    }
  }

  // 5. Final Return
  const status = isUnavailable ? 'Unavailable' : 'Available';

  if (debug) {
    return [
      {
        status,
        reason: isUnavailable ? 'Conflicting Events' : 'No Conflicts',
        debug: { overlappingEvents, timeUntilChange },
      },
      timeUntilChange,
    ];
  }

  return [status, timeUntilChange];
}
