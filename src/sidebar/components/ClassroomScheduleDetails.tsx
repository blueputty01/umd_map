import type { Room, AvailabilityTime } from '../types';
import RoomDetails from './RoomDetails';
import AvailabilityVisualization from './AvailabilityVisualization';
import ScheduleList from './ScheduleList';

interface ClassroomScheduleDetailsProps {
  room: Room;
  classroomSchedule: AvailabilityTime[];
  selectedStartDateTime: Date;
  selectedEndDateTime: Date;
  isNow: boolean;
}

const ClassroomScheduleDetails = ({
  room,
  classroomSchedule,
  selectedStartDateTime,
  selectedEndDateTime,
  isNow,
}: ClassroomScheduleDetailsProps) => {
  return (
    <div className="classroom-schedule">
      <h4>Schedule for {room.name}</h4>

      <RoomDetails room={room} />

      <AvailabilityVisualization
        classroomSchedule={classroomSchedule}
        selectedStartDateTime={selectedStartDateTime}
        selectedEndDateTime={selectedEndDateTime}
        isNow={isNow}
      />

      <ScheduleList
        classroomSchedule={classroomSchedule}
        selectedStartDateTime={selectedStartDateTime}
        isNow={isNow}
      />
    </div>
  );
};

export default ClassroomScheduleDetails;
