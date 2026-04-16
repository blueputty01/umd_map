import type React from 'react';

export interface AvailabilityTime {
  date: string;
  time_start: string | number;
  time_end: string | number;
  event_name: string;
  status?: number;
}

export interface Room {
  id: string | number;
  name: string;
  type?: string;
  floor?: string;
  availability_times: AvailabilityTime[];
}

export interface Building {
  code: string;
  name: string;
  classrooms: Room[];
}

export interface FavoriteBuilding {
  code: string;
  name: string;
}

export interface FavoriteRoom {
  id: string | number;
  name: string;
  buildingCode: string;
  buildingName: string;
}

export type DateTimeUpdater = Date | ((prevDateTime: Date) => Date);

export interface SidebarProps {
  onBuildingSelect: (building: Building | null, fromMap?: boolean) => void;
  selectedBuilding: Building | null;
  selectedStartDateTime: Date;
  selectedEndDateTime: Date;
  onStartDateTimeChange: (update: DateTimeUpdater) => void;
  onEndDateTimeChange: (update: DateTimeUpdater) => void;
  showMap: boolean;
  setShowMap: React.Dispatch<React.SetStateAction<boolean>>;
  darkMode?: boolean;
  toggleDarkMode?: () => void;
  favoriteBuildings?: FavoriteBuilding[];
  favoriteRooms?: FavoriteRoom[];
  toggleFavoriteBuilding?: (building: Building) => void;
  toggleFavoriteRoom?: (building: Building, room: Room) => void;
  mapSelectionMode?: boolean;
}
