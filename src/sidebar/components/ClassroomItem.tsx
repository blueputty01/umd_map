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
  isSelected,
  isFavorite,
  availabilityStatus,
  availabilityMinutes,
  onClassroomClick,
  onToggleFavorite,
}: ClassroomItemProps) => {
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
          {availabilityMinutes
            ? `${availabilityStatus} for ${Math.round(availabilityMinutes / 60 / 1000)} min`
            : availabilityStatus}
        </div>
      </div>
    </div>
  );
};

export default ClassroomItem;
