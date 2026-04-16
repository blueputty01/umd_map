import './BuildingList.css';
import { getClassroomAvailability } from '../../availability';
import type {
  AvailabilityTime,
  Building,
  FavoriteBuilding,
  FavoriteRoom,
  Room,
} from '../types';
import ClassroomItem from './ClassroomItem';
import ClassroomScheduleDetails from './ClassroomScheduleDetails';

interface BuildingListProps {
  filteredBuildings: Building[];
  selectedBuilding: Building | null;
  expandedBuilding: Building | null;
  selectedClassroom: Room | null;
  classroomSchedule: AvailabilityTime[];
  selectedStartDateTime: Date;
  selectedEndDateTime: Date;
  isNow: boolean;
  showFavorites: boolean;
  favoriteBuildings: FavoriteBuilding[];
  favoriteRooms: FavoriteRoom[];
  onBuildingClick: (building: Building) => void;
  onClassroomClick: (room: Room) => void;
  onToggleFavoriteBuilding: (building: Building) => void;
  onToggleFavoriteRoom: (building: Building, room: Room) => void;
}

const BuildingList = ({
  filteredBuildings,
  selectedBuilding,
  expandedBuilding,
  selectedClassroom,
  classroomSchedule,
  selectedStartDateTime,
  selectedEndDateTime,
  isNow,
  showFavorites,
  favoriteBuildings,
  favoriteRooms,
  onBuildingClick,
  onClassroomClick,
  onToggleFavoriteBuilding,
  onToggleFavoriteRoom,
}: BuildingListProps) => {
  const isBuildingFavorite = (buildingCode: string) => {
    return favoriteBuildings.some((building) => building.code === buildingCode);
  };

  const isRoomFavorite = (roomId: string | number) => {
    return favoriteRooms.some((room) => room.id === roomId);
  };

  if (filteredBuildings.length === 0) {
    return (
      <p>
        {showFavorites &&
        favoriteBuildings.length === 0 &&
        favoriteRooms.length === 0
          ? "You haven't favorited any buildings or rooms yet. Click the ☆ icon next to a building or room to add it to your favorites!"
          : 'No available buildings during this time range.'}
      </p>
    );
  }

  return (
    <ul className="building-list">
      {filteredBuildings.map((building) => (
        <li
          key={building.code}
          className={
            selectedBuilding?.code === building.code ? 'selected-building' : ''
          }
        >
          <details open={expandedBuilding?.code !== building.code}>
            <summary
              className={`building-name ${isBuildingFavorite(building.code) ? 'favorited' : ''}`}
              onClick={() => onBuildingClick(building)}
            >
              <span className="building-name-text">{`${building.name} (${building.classrooms.length})`}</span>
              <button
                className={`favorite-button ${isBuildingFavorite(building.code) ? 'favorited' : ''}`}
                onClick={(event) => {
                  event.stopPropagation();
                  onToggleFavoriteBuilding(building);
                }}
                title={
                  isBuildingFavorite(building.code)
                    ? 'Remove from favorites'
                    : 'Add to favorites'
                }
              >
                {isBuildingFavorite(building.code) ? '★' : '☆'}
              </button>
            </summary>

            {expandedBuilding?.code === building.code && (
              <ul className="classroom-list">
                {building.classrooms.map((room) => {
                  const [availabilityStatus, shortest] =
                    getClassroomAvailability(
                      room,
                      isNow ? null : selectedStartDateTime,
                      isNow ? null : selectedEndDateTime,
                    ) as [string, number | undefined];

                  const isSelectedClassroom = selectedClassroom?.id === room.id;

                  return (
                    <li
                      key={room.id}
                      className={
                        isSelectedClassroom ? 'selected-classroom' : ''
                      }
                      id={`room-${room.id}`}
                    >
                      <ClassroomItem
                        room={room}
                        isSelected={isSelectedClassroom}
                        isFavorite={isRoomFavorite(room.id)}
                        availabilityStatus={availabilityStatus}
                        availabilityMinutes={shortest}
                        onClassroomClick={onClassroomClick}
                        onToggleFavorite={(event) => {
                          event.stopPropagation();
                          onToggleFavoriteRoom(building, room);
                        }}
                      />

                      {isSelectedClassroom && (
                        <ClassroomScheduleDetails
                          room={room}
                          classroomSchedule={classroomSchedule}
                          selectedStartDateTime={selectedStartDateTime}
                          selectedEndDateTime={selectedEndDateTime}
                          isNow={isNow}
                        />
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </details>
        </li>
      ))}
    </ul>
  );
};

export default BuildingList;
