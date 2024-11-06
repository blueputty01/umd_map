// src/availability.js

// Define University Holidays
const UNIVERSITY_HOLIDAYS = [
  '2024-01-01', // New Year's Day
  '2024-07-04', // Independence Day
  '2024-12-25', // Christmas Day
  // Add more holidays as needed
];

const OPERATING_START_HOUR = 7; // 7 AM
const OPERATING_END_HOUR = 22; // 10 PM

/**
 * Checks if a given date is a university holiday.
 */
function isUniversityHoliday(date) {
  const formattedDate = date.toISOString().split('T')[0];
  return UNIVERSITY_HOLIDAYS.includes(formattedDate);
}

/**
 * Converts decimal hours to minutes.
 */
function decimalHoursToMinutes(decimalHours) {
  const decimal = parseFloat(decimalHours);
  const hours = Math.floor(decimal);
  const minutes = Math.round((decimal - hours) * 60);
  return hours * 60 + minutes;
}

/**
 * Checks classroom availability.
 */
export function getClassroomAvailability(
  room,
  selectedStartDateTime = null,
  selectedEndDateTime = null
) {
  // Use selected times or default to current time
  const currentStartTime = selectedStartDateTime ? new Date(selectedStartDateTime) : new Date();
  const currentEndTime = selectedEndDateTime ? new Date(selectedEndDateTime) : currentStartTime;

  // Check if the start time is after the end time
  if (currentStartTime >= currentEndTime) {
    return 'Unavailable';
  }

  // Check weekend
  const dayOfWeek = currentStartTime.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return 'Unavailable';
  }

  // Check holidays
  if (isUniversityHoliday(currentStartTime)) {
    return 'Unavailable';
  }

  // Check operating hours (7 AM - 10 PM)
  const startHour = currentStartTime.getHours() + currentStartTime.getMinutes() / 60;
  const endHour = currentEndTime.getHours() + currentEndTime.getMinutes() / 60;

  if (startHour < OPERATING_START_HOUR || endHour > OPERATING_END_HOUR) {
    return 'Unavailable';
  }

  // Check if availability data exists
  if (!room.availability_times || !Array.isArray(room.availability_times)) {
    return 'Available';
  }

  // Get events for the date
  const dateString = currentStartTime.toISOString().split('T')[0];
  const todayAvailability = room.availability_times.filter((timeRange) => {
    const eventDatePart = timeRange.date.split('T')[0];
    return eventDatePart === dateString;
  });

  if (todayAvailability.length === 0) {
    return 'Available';
  }

  // Convert selected times to minutes since midnight
  const requestStartMinutes = currentStartTime.getHours() * 60 + currentStartTime.getMinutes();
  const requestEndMinutes = currentEndTime.getHours() * 60 + currentEndTime.getMinutes();

  // Check for overlapping events
  const overlappingEvents = todayAvailability.filter((timeRange) => {
    const eventStartMinutes = decimalHoursToMinutes(timeRange.time_start);
    const eventEndMinutes = decimalHoursToMinutes(timeRange.time_end);

    // Check for overlap
    const overlap = !(
      requestEndMinutes <= eventStartMinutes || requestStartMinutes >= eventEndMinutes
    );

    return overlap;
  });

  return overlappingEvents.length === 0 ? 'Available' : 'Unavailable';
}

/**
 * Checks building availability.
 */
export function getBuildingAvailability(
  classrooms,
  selectedStartDateTime = null,
  selectedEndDateTime = null
) {
  if (!Array.isArray(classrooms) || classrooms.length === 0) {
    return 'No Data';
  }

  const hasAvailableRoom = classrooms.some((room) => {
    const status = getClassroomAvailability(room, selectedStartDateTime, selectedEndDateTime);
    return status === 'Available';
  });

  return hasAvailableRoom ? 'Available' : 'Unavailable';
}
