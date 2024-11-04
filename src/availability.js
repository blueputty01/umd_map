// src/availability.js

import { toZonedTime, format } from 'date-fns-tz';

// Define University Holidays (Add actual dates here)
const UNIVERSITY_HOLIDAYS = [
  '2024-01-01', // New Year's Day
  '2024-07-04', // Independence Day
  '2024-12-25', // Christmas Day
  // Add more holidays as needed
];

/**
 * Checks if a given date is a university holiday.
 * @param {Date} date
 * @returns {boolean}
 */
function isUniversityHoliday(date) {
  const formattedDate = format(date, 'yyyy-MM-dd', { timeZone: 'America/New_York' });
  return UNIVERSITY_HOLIDAYS.includes(formattedDate);
}

export function getClassroomAvailability(
  room,
  selectedStartDateTime = null,
  selectedEndDateTime = null
) {
  const timeZone = 'America/New_York';

  // Get the selected times in the specified time zone
  const currentStartTime = selectedStartDateTime
    ? toZonedTime(selectedStartDateTime, timeZone)
    : toZonedTime(new Date(), timeZone);
  const currentEndTime = selectedEndDateTime
    ? toZonedTime(selectedEndDateTime, timeZone)
    : toZonedTime(new Date(), timeZone);

  // Extract the date to check
  const dateToCheck = new Date(currentStartTime);
  const dayOfWeek = dateToCheck.getDay(); // 0 = Sunday, 6 = Saturday

  // Check if the day is Saturday or Sunday
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return 'Unavailable';
  }

  // Check if the day is a university holiday
  if (isUniversityHoliday(dateToCheck)) {
    return 'Unavailable';
  }

  // Define operating hours
  const OPERATING_START_HOUR = 7;  // 7 AM
  const OPERATING_END_HOUR = 22;   // 10 PM

  // Convert selected times to decimal hours
  const selectedStartDecimal =
    currentStartTime.getHours() + currentStartTime.getMinutes() / 60;
  const selectedEndDecimal =
    currentEndTime.getHours() + currentEndTime.getMinutes() / 60;

  // Check if selected times are within operating hours
  if (
    selectedStartDecimal < OPERATING_START_HOUR ||
    selectedEndDecimal > OPERATING_END_HOUR
  ) {
    return 'Unavailable';
  }

  // Create date string in 'YYYY-MM-DDT00:00:00' format
  const dateString = format(dateToCheck, "yyyy-MM-dd'T00:00:00'", { timeZone });

  if (!room.availability_times || room.availability_times.length === 0) {
    return 'No availability data';
  }

  // Filter availability times for the date to check
  const todayAvailability = room.availability_times.filter(
    (timeRange) => timeRange.date === dateString
  );

  // Check for overlapping events
  const overlappingEvents = todayAvailability.filter((timeRange) => {
    const eventStart = parseFloat(timeRange.time_start);
    const eventEnd = parseFloat(timeRange.time_end);

    // Check if the event overlaps with the selected time range
    return selectedStartDecimal < eventEnd && selectedEndDecimal > eventStart;
  });

  if (overlappingEvents.length === 0) {
    return 'Available';
  } else {
    return 'Unavailable';
  }
}

export function getBuildingAvailability(
  classrooms,
  selectedStartDateTime = null,
  selectedEndDateTime = null
) {
  let available = false;

  classrooms.forEach((room) => {
    const status = getClassroomAvailability(
      room,
      selectedStartDateTime,
      selectedEndDateTime
    );
    if (status === 'Available') {
      available = true;
    }
  });

  return available ? 'Available' : 'Unavailable';
}
