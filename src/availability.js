// src/availability.js

import { toZonedTime, format } from "date-fns-tz";

// Define University Holidays
const UNIVERSITY_HOLIDAYS = [
  "2024-01-01", // New Year's Day
  "2024-07-04", // Independence Day
  "2024-12-25", // Christmas Day
  // Add more holidays as needed
];

const OPERATING_START_HOUR = 7; // 7 AM
const OPERATING_END_HOUR = 22; // 10 PM

/**
 * Debug function to log availability calculation steps
 */
export function debugClassroomAvailability(
  room,
  selectedStartDateTime,
  selectedEndDateTime,
) {
  const debug = getClassroomAvailability(
    room,
    selectedStartDateTime,
    selectedEndDateTime,
    true,
  );
  console.log("Availability Debug:", debug);
  return debug.status;
}

/**
 * Checks if a given date is a university holiday.
 */
function isUniversityHoliday(date) {
  const formattedDate = format(date, "yyyy-MM-dd", {
    timeZone: "America/New_York",
  });
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
  debug = false,
) {
  const timeZone = "America/New_York";
  const debugInfo = debug ? { steps: [], events: [] } : null;

  // Get current times
  const currentStartTime = selectedStartDateTime
    ? toZonedTime(selectedStartDateTime, timeZone)
    : toZonedTime(new Date(), timeZone);

  // When checking current availability, we only need to check the current moment
  const currentEndTime = selectedEndDateTime
    ? toZonedTime(selectedEndDateTime, timeZone)
    : currentStartTime; // For "now" view, start and end time are the same

  if (debug) {
    debugInfo.steps.push({
      step: "Times",
      requested: {
        start: currentStartTime.toISOString(),
        end: currentEndTime.toISOString(),
      },
    });
  }

  // Check weekend
  const dateToCheck = new Date(currentStartTime);
  const dayOfWeek = dateToCheck.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return [
      debug ? { status: "Closed", reason: "Weekend" } : "Closed",
      undefined,
    ];
  }

  // Check holidays
  if (isUniversityHoliday(dateToCheck)) {
    return [
      debug ? { status: "Closed", reason: "Holiday" } : "Closed",
      undefined,
    ];
  }

  // Check operating hours
  const currentHour =
    currentStartTime.getHours() + currentStartTime.getMinutes() / 60;

  if (currentHour < OPERATING_START_HOUR || currentHour >= OPERATING_END_HOUR) {
    return [
      debug
        ? { status: "Closed", reason: "Outside Operating Hours" }
        : "Closed",
      undefined,
    ];
  }

  // Check if availability data exists
  if (!room.availability_times || !Array.isArray(room.availability_times)) {
    return [
      debug ? { status: "Available", reason: "No Schedule Data" } : "Available",
      undefined,
    ];
  }

  // Get events for the date and with status:1
  const dateString = format(dateToCheck, "yyyy-MM-dd", { timeZone });
  const todayAvailability = room.availability_times.filter((timeRange) => {
    const eventDatePart = timeRange.date.split("T")[0];
    return eventDatePart === dateString && timeRange.status === 1;
  });

  if (todayAvailability.length === 0) {
    return [
      debug ? { status: "Available", reason: "No Events Today" } : "Available",
      undefined,
    ];
  }

  let shortest = Number.MAX_SAFE_INTEGER;
  // Check for overlapping events
  const overlappingEvents = todayAvailability.filter((timeRange) => {
    const eventStartDecimal = parseFloat(timeRange.time_start);
    const eventEndDecimal = parseFloat(timeRange.time_end);

    const eventStart = decimalHoursToDate(currentStartTime, eventStartDecimal);
    const eventEnd = decimalHoursToDate(currentStartTime, eventEndDecimal);

    const distanceToStart = eventStart - currentEndTime;
    if (distanceToStart > 0) {
      shortest = Math.min(shortest, distanceToStart);
    }

    if (selectedStartDateTime && selectedEndDateTime) {
      // For scheduled time slots, check if the requested time range overlaps with any events
      return !(currentEndTime <= eventStart || currentStartTime >= eventEnd);
    } else {
      // For "now" view, just check if current time falls within event
      return currentStartTime >= eventStart && currentStartTime < eventEnd;
    }
  });

  if (debug) {
    debugInfo.steps.push({
      step: "Events",
      totalEvents: todayAvailability.length,
      overlappingEvents: overlappingEvents.length,
    });

    debugInfo.events = overlappingEvents.map((event) => ({
      event: event.event_name,
      eventTime: `${event.time_start} - ${event.time_end}`,
      currentTime: currentHour,
      overlaps: true,
    }));

    return [
      {
        status: overlappingEvents.length === 0 ? "Available" : "Unavailable",
        reason:
          overlappingEvents.length === 0
            ? "No Conflicts"
            : "Conflicting Events",
        debug: debugInfo,
      },
      shortest,
    ];
  }

  return [
    overlappingEvents.length === 0 ? "Available" : "Unavailable",
    shortest,
  ];
}

/**
 * Checks building availability
 */
export function getBuildingAvailability(
  classrooms,
  selectedStartDateTime = null,
  selectedEndDateTime = null,
) {
  if (!Array.isArray(classrooms) || classrooms.length === 0) {
    return "No Data";
  }

  const hasAvailableRoom = classrooms.some((room) => {
    const status = getClassroomAvailability(
      room,
      selectedStartDateTime,
      selectedEndDateTime,
    );
    return status === "Available";
  });

  return hasAvailableRoom ? "Available" : "Unavailable";
}
