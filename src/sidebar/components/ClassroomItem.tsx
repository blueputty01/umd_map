import type { Room, FavoriteRoom } from '../types';

interface ClassroomItemProps {
  room: Room;
  isSelected: boolean;
  isFavorite: boolean;
  availabilityStatus: string;
  availabilityMinutes: number | undefined;
  onClassroomClick: (room: Room) => void;
  onToggleFavorite: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const ClassroomItem = ({
  room,
  isFavorite,
  availabilityStatus,
  availabilityMinutes,
  onClassroomClick,
  onToggleFavorite,
}: ClassroomItemProps) => {
  let availDesc = availabilityStatus;
  if (availabilityMinutes) {
    const minutes = availabilityMinutes % 60;
    const hours = Math.floor(availabilityMinutes / 60);
    availDesc += ` (${hours > 0 ? `${hours}h ` : ''}${minutes}m)`;
  }
  return (
    <div
      className={`classroom-item ${isFavorite ? 'favorited' : ''}`}
      onClick={() => onClassroomClick(room)}
    >
      <div className="classroom-name">{room.name}</div>
      <div className="classroom-actions">
        <button
          className={`favorite-button small ${isFavorite ? 'favorited' : ''}`}
          onClick={onToggleFavorite}
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          {isFavorite ? '★' : '☆'}
        </button>
        <div
          className={`availability ${availabilityStatus.toLowerCase().replace(' ', '-')}`}
        >
          {availDesc}
        </div>
      </div>
    </div>
  );
};

export default ClassroomItem;
