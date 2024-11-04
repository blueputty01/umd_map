// src/availability.js

import { toZonedTime, format } from 'date-fns-tz';

// Define University Holidays
const UNIVERSITY_HOLIDAYS = [
  '2024-01-01', // New Year's Day
  '2024-07-04', // Independence Day
  '2024-12-25', // Christmas Day
  // Add more holidays as needed
];

const OPERATING_START_HOUR = 7;  // 7 AM
const OPERATING_END_HOUR = 22;   // 10 PM

/**
 * Debug function to log availability calculation steps
 */
export function debugClassroomAvailability(room, selectedStartDateTime, selectedEndDateTime) {
  const debug = getClassroomAvailability(room, selectedStartDateTime, selectedEndDateTime, true);
  console.log('Availability Debug:', debug);
  return debug.status;
}

/**
 * Checks if a given date is a university holiday.
 */
function isUniversityHoliday(date) {
  const formattedDate = format(date, 'yyyy-MM-dd', { timeZone: 'America/New_York' });
  return UNIVERSITY_HOLIDAYS.includes(formattedDate);
}

/**
 * Converts decimal hours to a Date object
 */
function decimalHoursToDate(date, decimalHours) {
  const decimal = parseFloat(decimalHours);
  const hours = Math.floor(decimal);
  const minutes = Math.round((decimal - hours) * 60);

  const eventDate = new Date(date);
  eventDate.setHours(hours, minutes, 0, 0);
  return eventDate;
}

/**
 * Enhanced classroom availability checker with optional debugging
 */
export function getClassroomAvailability(
  room,
  selectedStartDateTime = null,
  selectedEndDateTime = null,
  debug = false
) {
  const timeZone = 'America/New_York';
  const debugInfo = debug ? { steps: [], events: [] } : null;

  // Get current times
  const currentStartTime = selectedStartDateTime
    ? toZonedTime(selectedStartDateTime, timeZone)
    : toZonedTime(new Date(), timeZone);
  const currentEndTime = selectedEndDateTime
    ? toZonedTime(selectedEndDateTime, timeZone)
    : toZonedTime(new Date(Date.now() + 3600000), timeZone); // 1 hour from now

  if (debug) {
    debugInfo.steps.push({
      step: 'Times',
      requested: {
        start: currentStartTime.toISOString(),
        end: currentEndTime.toISOString()
      }
    });
  }

  // Check weekend
  const dateToCheck = new Date(currentStartTime);
  const dayOfWeek = dateToCheck.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return debug ? { status: 'Unavailable', reason: 'Weekend' } : 'Unavailable';
  }

  // Check holidays
  if (isUniversityHoliday(dateToCheck)) {
    return debug ? { status: 'Unavailable', reason: 'Holiday' } : 'Unavailable';
  }

  // Check operating hours (7 AM - 10 PM)
  const startHour = currentStartTime.getHours() + currentStartTime.getMinutes() / 60;
  const endHour = currentEndTime.getHours() + currentEndTime.getMinutes() / 60;
  
  if (debug) {
    debugInfo.steps.push({
      step: 'Operating Hours Check',
      startHour: startHour,
      endHour: endHour,
      operatingStart: OPERATING_START_HOUR,
      operatingEnd: OPERATING_END_HOUR
    });
  }

  if (startHour < OPERATING_START_HOUR || endHour > OPERATING_END_HOUR) {
    return debug ? { status: 'Unavailable', reason: 'Outside Operating Hours' } : 'Unavailable';
  }

  // Check if availability data exists
  if (!room.availability_times || !Array.isArray(room.availability_times)) {
    return debug ? { status: 'Available', reason: 'No Schedule Data' } : 'Available';
  }

  // Get events for the date
  const dateString = format(dateToCheck, 'yyyy-MM-dd', { timeZone });
  const todayAvailability = room.availability_times.filter(timeRange => {
    const eventDatePart = timeRange.date.split('T')[0];
    return eventDatePart === dateString;
  });

  if (debug) {
    debugInfo.steps.push({
      step: 'Date Filter',
      dateString: dateString,
      eventsFound: todayAvailability.length
    });
  }

  if (todayAvailability.length === 0) {
    return debug ? { status: 'Available', reason: 'No Events Today' } : 'Available';
  }

  // Convert all times to comparable values (minutes since midnight)
  const requestStartMinutes = currentStartTime.getHours() * 60 + currentStartTime.getMinutes();
  const requestEndMinutes = currentEndTime.getHours() * 60 + currentEndTime.getMinutes();

  // Check for overlapping events
  const overlappingEvents = todayAvailability.filter(timeRange => {
    const eventStartHour = Math.floor(parseFloat(timeRange.time_start));
    const eventStartMinute = Math.round((parseFloat(timeRange.time_start) % 1) * 60);
    const eventEndHour = Math.floor(parseFloat(timeRange.time_end));
    const eventEndMinute = Math.round((parseFloat(timeRange.time_end) % 1) * 60);

    const eventStartMinutes = eventStartHour * 60 + eventStartMinute;
    const eventEndMinutes = eventEndHour * 60 + eventEndMinute;

    // Add small buffer (2 minutes) for setup/cleanup
    const BUFFER_MINUTES = 2;
    
    const overlap = !(
      requestEndMinutes <= eventStartMinutes + BUFFER_MINUTES ||
      requestStartMinutes >= eventEndMinutes - BUFFER_MINUTES
    );

    if (debug) {
      debugInfo.events.push({
        event: timeRange.event_name,
        eventTime: `${eventStartHour}:${eventStartMinute.toString().padStart(2, '0')} - ${eventEndHour}:${eventEndMinute.toString().padStart(2, '0')}`,
        requestedTime: `${Math.floor(requestStartMinutes / 60)}:${(requestStartMinutes % 60).toString().padStart(2, '0')} - ${Math.floor(requestEndMinutes / 60)}:${(requestEndMinutes % 60).toString().padStart(2, '0')}`,
        overlaps: overlap
      });
    }

    return overlap;
  });

  if (debug) {
    debugInfo.overlappingEvents = overlappingEvents;
    debugInfo.steps.push({
      step: 'Overlap Check',
      overlappingEvents: overlappingEvents.length,
      events: debugInfo.events
    });
    debugInfo.status = overlappingEvents.length === 0 ? 'Available' : 'Unavailable';
    debugInfo.reason = overlappingEvents.length === 0 ? 'No Conflicts' : 'Overlapping Events Found';
    return debugInfo;
  }

  return overlappingEvents.length === 0 ? 'Available' : 'Unavailable';
}

/**
 * Checks building availability
 */
export function getBuildingAvailability(
  classrooms,
  selectedStartDateTime = null,
  selectedEndDateTime = null
) {
  if (!Array.isArray(classrooms) || classrooms.length === 0) {
    return 'No Data';
  }

  const hasAvailableRoom = classrooms.some(room => {
    const status = getClassroomAvailability(room, selectedStartDateTime, selectedEndDateTime);
    return status === 'Available';
  });

  return hasAvailableRoom ? 'Available' : 'Unavailable';
}
