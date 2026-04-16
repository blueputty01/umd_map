import type { MutableRefObject } from 'react';

import './BuildingList.css';
import { getClassroomAvailability } from '../../availability';
import type {
  AvailabilityTime,
  Building,
  FavoriteBuilding,
  FavoriteRoom,
  Room,
} from '../types';
import {
  decimalHoursToDate,
  decimalHoursToTimeString,
  inferFloorFromRoomName,
} from '../utils';

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
  buildingRefs: MutableRefObject<Record<string, HTMLLIElement | null>>;
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
  buildingRefs,
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
          ref={(element) => {
            buildingRefs.current[building.code] = element;
          }}
          className={
            selectedBuilding?.code === building.code ? 'selected-building' : ''
          }
        >
          <div
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
          </div>

          {expandedBuilding?.code === building.code && (
            <ul className="classroom-list">
              {building.classrooms.map((room) => {
                const [availabilityStatus, shortest] = getClassroomAvailability(
                  room,
                  isNow ? null : selectedStartDateTime,
                  isNow ? null : selectedEndDateTime,
                ) as [string, number | undefined];

                const isSelectedClassroom = selectedClassroom?.id === room.id;

                return (
                  <li
                    key={room.id}
                    onClick={() => onClassroomClick(room)}
                    className={isSelectedClassroom ? 'selected-classroom' : ''}
                    id={`room-${room.id}`}
                  >
                    <div
                      className={`classroom-item ${isRoomFavorite(room.id) ? 'favorited' : ''}`}
                    >
                      <div className="classroom-name">{room.name}</div>
                      <div className="classroom-actions">
                        <button
                          className={`favorite-button small ${isRoomFavorite(room.id) ? 'favorited' : ''}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            onToggleFavoriteRoom(building, room);
                          }}
                          title={
                            isRoomFavorite(room.id)
                              ? 'Remove from favorites'
                              : 'Add to favorites'
                          }
                        >
                          {isRoomFavorite(room.id) ? '★' : '☆'}
                        </button>
                        <div
                          className={`availability ${availabilityStatus.toLowerCase().replace(' ', '-')}`}
                        >
                          {shortest
                            ? `${availabilityStatus} for ${Math.round(shortest / 60 / 1000)} min`
                            : availabilityStatus}
                        </div>
                      </div>
                    </div>

                    {isSelectedClassroom && (
                      <div className="classroom-schedule">
                        <h4>Schedule for {room.name}</h4>

                        <div className="room-details">
                          <div className="room-details-header">
                            <h5>Room Details</h5>
                          </div>

                          <div className="room-info-grid">
                            <div className="room-info-item">
                              <span className="info-label">Type</span>
                              <span className="info-value">
                                {room.type || 'Classroom'}
                              </span>
                            </div>
                            <div className="room-info-item">
                              <span className="info-label">Floor</span>
                              <span className="info-value">
                                {room.floor ||
                                  inferFloorFromRoomName(room.name)}
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
                                  <span className="feature-pill">
                                    Computers
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="availability-viz">
                          <h5>
                            {isNow
                              ? "Today's Availability"
                              : `Availability on ${selectedStartDateTime.toLocaleDateString()}`}
                          </h5>
                          <div className="time-blocks">
                            {Array.from({ length: 16 }, (_, index) => {
                              const hour = index + 7;

                              const isBooked = classroomSchedule.some(
                                (event) => {
                                  const startHour = Math.floor(
                                    parseFloat(String(event.time_start)),
                                  );
                                  const endHour = Math.ceil(
                                    parseFloat(String(event.time_end)),
                                  );
                                  return hour >= startHour && hour < endHour;
                                },
                              );

                              const currentHour = new Date().getHours();
                              const isCurrent = hour === currentHour;

                              const isInSelectedTimeRange =
                                !isNow &&
                                (() => {
                                  const startHour =
                                    selectedStartDateTime.getHours();
                                  const endHour =
                                    selectedEndDateTime.getHours();

                                  return (
                                    selectedStartDateTime.toDateString() ===
                                      selectedEndDateTime.toDateString() &&
                                    hour >= startHour &&
                                    hour < endHour
                                  );
                                })();

                              let tooltipText = `${hour > 12 ? hour - 12 : hour}${hour >= 12 ? 'pm' : 'am'}: `;
                              tooltipText += isBooked ? 'Booked' : 'Available';

                              const showCurrentIndicator = isNow && isCurrent;

                              return (
                                <div
                                  key={hour}
                                  className={`time-block
                                    ${isBooked ? 'booked' : 'available'}
                                    ${showCurrentIndicator ? 'current' : ''}
                                    ${isInSelectedTimeRange && !isBooked ? 'selected-time' : ''}
                                  `}
                                  title={tooltipText}
                                >
                                  {hour === 7 ||
                                  hour === 12 ||
                                  hour === 17 ||
                                  hour === 22 ? (
                                    <span className="hour-label">
                                      {hour > 12 ? hour - 12 : hour}
                                      {hour >= 12 ? 'pm' : 'am'}
                                    </span>
                                  ) : (
                                    ''
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

                        <h5>Schedule</h5>
                        {classroomSchedule.length > 0 ? (
                          <ul>
                            {classroomSchedule.map((timeRange, index) => {
                              const eventStart = decimalHoursToDate(
                                isNow ? new Date() : selectedStartDateTime,
                                timeRange.time_start,
                              );
                              const eventEnd = decimalHoursToDate(
                                isNow ? new Date() : selectedStartDateTime,
                                timeRange.time_end,
                              );
                              const now = new Date();
                              const isActive =
                                now >= eventStart && now <= eventEnd;

                              return (
                                <li
                                  key={index}
                                  className={isActive ? 'active-event' : ''}
                                >
                                  <strong>
                                    {decimalHoursToTimeString(
                                      timeRange.time_start,
                                    )}{' '}
                                    -{' '}
                                    {decimalHoursToTimeString(
                                      timeRange.time_end,
                                    )}
                                  </strong>
                                  : <em>{timeRange.event_name}</em>
                                </li>
                              );
                            })}
                          </ul>
                        ) : (
                          <p>No events scheduled for this time.</p>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
};

export default BuildingList;
