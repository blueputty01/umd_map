import type { AvailabilityTime } from '../types';

interface AvailabilityVisualizationProps {
  classroomSchedule: AvailabilityTime[];
  selectedStartDateTime: Date;
  selectedEndDateTime: Date;
  isNow: boolean;
}

const AvailabilityVisualization = ({
  classroomSchedule,
  selectedStartDateTime,
  selectedEndDateTime,
  isNow,
}: AvailabilityVisualizationProps) => {
  const isBooked = (hour: number): boolean => {
    return classroomSchedule.some((event) => {
      const startHour = Math.floor(parseFloat(String(event.time_start)));
      const endHour = Math.ceil(parseFloat(String(event.time_end)));
      return hour >= startHour && hour < endHour;
    });
  };

  const isCurrent = (hour: number): boolean => {
    if (!isNow) return false;
    return hour === new Date().getHours();
  };

  const isInSelectedTimeRange = (hour: number): boolean => {
    if (isNow) return false;
    const startHour = selectedStartDateTime.getHours();
    const endHour = selectedEndDateTime.getHours();

    return (
      selectedStartDateTime.toDateString() ===
        selectedEndDateTime.toDateString() &&
      hour >= startHour &&
      hour < endHour
    );
  };

  const formatHourLabel = (hour: number): string => {
    return `${hour > 12 ? hour - 12 : hour}${hour >= 12 ? 'pm' : 'am'}`;
  };

  const shouldShowLabel = (hour: number): boolean => {
    return hour === 7 || hour === 12 || hour === 17 || hour === 22;
  };

  return (
    <div className="availability-viz">
      <h5>
        {isNow
          ? "Today's Availability"
          : `Availability on ${selectedStartDateTime.toLocaleDateString()}`}
      </h5>
      <div className="time-blocks">
        {Array.from({ length: 16 }, (_, index) => {
          const hour = index + 7;
          const bookedStatus = isBooked(hour);
          const currentStatus = isCurrent(hour);
          const selectedStatus = isInSelectedTimeRange(hour) && !bookedStatus;

          return (
            <div
              key={hour}
              className={`time-block
                ${bookedStatus ? 'booked' : 'available'}
                ${currentStatus ? 'current' : ''}
                ${selectedStatus ? 'selected-time' : ''}
              `}
              title={`${formatHourLabel(hour)}: ${bookedStatus ? 'Booked' : 'Available'}`}
            >
              {shouldShowLabel(hour) && (
                <span className="hour-label">{formatHourLabel(hour)}</span>
              )}
            </div>
          );
        })}
      </div>
      {!isNow && (
        <div className="time-range-info">
          <div className="time-range-indicator">
            <span className="time-indicator selected-time-indicator" />
            <span>Your selected time</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailabilityVisualization;
