import type { Room } from '../types';
import { inferFloorFromRoomName } from '../utils';

interface RoomDetailsProps {
  room: Room;
}

const RoomDetails = ({ room }: RoomDetailsProps) => {
  return (
    <div className="room-details">
      <div className="room-details-header">
        <h5>Room Details</h5>
      </div>

      <div className="room-info-grid">
        <div className="room-info-item">
          <span className="info-label">Type</span>
          <span className="info-value">{room.type || 'Classroom'}</span>
        </div>
        <div className="room-info-item">
          <span className="info-label">Floor</span>
          <span className="info-value">
            {room.floor || inferFloorFromRoomName(room.name)}
          </span>
        </div>
        <div className="room-info-item">
          <span className="info-label">Features</span>
          <a
            href={`https://25live.collegenet.com/pro/umd#!/home/location/${room.id}/details`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open in 25live
          </a>
          <div className="feature-pills">
            <span className="feature-pill">Projector</span>
            <span className="feature-pill">Whiteboard</span>
            {room.name.includes('C') && (
              <span className="feature-pill">Computers</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetails;
