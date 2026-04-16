import { format, parse } from 'date-fns';

export function decimalHoursToDate(
  date: Date,
  decimalHours: string | number,
): Date {
  const decimal = parseFloat(String(decimalHours));
  const hours = Math.floor(decimal);
  const minutes = Math.round((decimal - hours) * 60);

  const eventDate = new Date(date);
  eventDate.setHours(hours, minutes, 0, 0);

  return eventDate;
}

export function decimalHoursToTimeString(
  decimalHours: string | number,
): string {
  const date = decimalHoursToDate(new Date(), decimalHours);
  return format(date, 'h:mm a');
}

export function generateTimeOptions(
  startTime: string,
  endTime: string,
  stepMinutes: number,
) {
  const options: Array<{ label: string; value: string }> = [];
  let currentTime = parse(startTime, 'h:mm a', new Date());
  const endTimeParsed = parse(endTime, 'h:mm a', new Date());

  while (currentTime <= endTimeParsed) {
    const timeString = format(currentTime, 'h:mm a');
    options.push({ label: timeString, value: timeString });
    currentTime = new Date(currentTime.getTime() + stepMinutes * 60000);
  }

  return options;
}

export function inferFloorFromRoomName(roomName: string): string {
  const parts = roomName.split(' ');

  if (parts.length >= 2) {
    const roomNumber = parts[1];

    if (roomNumber.startsWith('0')) {
      return 'Ground Floor';
    }

    if (/^\d/.test(roomNumber)) {
      return roomNumber.charAt(0);
    }
  }

  return '1';
}
