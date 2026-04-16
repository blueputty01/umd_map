import type { AvailabilityTime } from '../types';
import { decimalHoursToDate, decimalHoursToTimeString } from '../utils';

interface ScheduleListProps {
  classroomSchedule: AvailabilityTime[];
  selectedStartDateTime: Date;
  isNow: boolean;
}

const ScheduleList = ({
  classroomSchedule,
  selectedStartDateTime,
  isNow,
}: ScheduleListProps) => {
  const isActiveEvent = (timeRange: AvailabilityTime): boolean => {
    const eventStart = decimalHoursToDate(
      isNow ? new Date() : selectedStartDateTime,
      timeRange.time_start,
    );
    const eventEnd = decimalHoursToDate(
      isNow ? new Date() : selectedStartDateTime,
      timeRange.time_end,
    );
    const now = new Date();
    return now >= eventStart && now <= eventEnd;
  };

  return (
    <>
      <h5>Schedule</h5>
      {classroomSchedule.length > 0 ? (
        <ul>
          {classroomSchedule.map((timeRange, index) => (
            <li
              key={index}
              className={isActiveEvent(timeRange) ? 'active-event' : ''}
            >
              <strong>
                {decimalHoursToTimeString(timeRange.time_start)} -{' '}
                {decimalHoursToTimeString(timeRange.time_end)}
              </strong>
              : <em>{timeRange.event_name}</em>
            </li>
          ))}
        </ul>
      ) : (
        <p>No events scheduled for this time.</p>
      )}
    </>
  );
};

export default ScheduleList;
