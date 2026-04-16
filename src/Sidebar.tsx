'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { format, parse, parseISO } from 'date-fns';

import './Sidebar.css';
import { getClassroomAvailability } from './availability';
import BuildingList from './sidebar/components/BuildingList';
import ProjectDescription from './sidebar/components/ProjectDescription';
import SearchOptions from './sidebar/components/SearchOptions';
import SearchSection from './sidebar/components/SearchSection';
import SidebarControls from './sidebar/components/SidebarControls';
import SidebarHeader from './sidebar/components/SidebarHeader';
import type {
  AvailabilityTime,
  Building,
  FavoriteBuilding,
  FavoriteRoom,
  Room,
  SidebarProps,
} from './sidebar/types';

const Sidebar = ({
  onBuildingSelect,
  selectedBuilding,
  selectedStartDateTime,
  selectedEndDateTime,
  onStartDateTimeChange,
  onEndDateTimeChange,
  darkMode = false,
  toggleDarkMode = () => {},
  favoriteBuildings = [],
  favoriteRooms = [],
  toggleFavoriteBuilding = () => {},
  toggleFavoriteRoom = () => {},
  mapSelectionMode = false,
}: SidebarProps) => {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [expandedBuilding, setExpandedBuilding] = useState<Building | null>(
    null,
  );
  const [selectedClassroom, setSelectedClassroom] = useState<Room | null>(null);
  const [showDescription, setShowDescription] = useState(false);
  const [isNow, setIsNow] = useState(true);
  const [showFavorites, setShowFavorites] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [focusedBuildingMode, setFocusedBuildingMode] = useState(false);

  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const hasHydratedFromUrlRef = useRef(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);

    const queryFromUrl = urlParams.get('q');
    if (queryFromUrl !== null) {
      setSearchQuery(queryFromUrl);
    }

    const modeFromUrl = urlParams.get('mode');
    if (modeFromUrl === 'now') {
      setIsNow(true);
    }

    if (modeFromUrl === 'range') {
      setIsNow(false);
    }

    const startFromUrl = urlParams.get('start');
    const endFromUrl = urlParams.get('end');

    const parsedStart = startFromUrl ? parseISO(startFromUrl) : null;
    const parsedEnd = endFromUrl ? parseISO(endFromUrl) : null;
    const hasValidStart =
      parsedStart !== null && !Number.isNaN(parsedStart.getTime());
    const hasValidEnd =
      parsedEnd !== null && !Number.isNaN(parsedEnd.getTime());

    if (hasValidStart || hasValidEnd) {
      setIsNow(false);
    }

    if (hasValidStart && parsedStart) {
      onStartDateTimeChange(parsedStart);
    }

    if (hasValidEnd && parsedEnd) {
      if (hasValidStart && parsedStart && parsedEnd < parsedStart) {
        onEndDateTimeChange(parsedStart);
      } else {
        onEndDateTimeChange(parsedEnd);
      }
    }

    hasHydratedFromUrlRef.current = true;
  }, [onStartDateTimeChange, onEndDateTimeChange]);

  useEffect(() => {
    if (!hasHydratedFromUrlRef.current) {
      return;
    }

    const currentUrl = new URL(window.location.href);
    const params = new URLSearchParams(currentUrl.search);

    if (searchQuery.trim()) {
      params.set('q', searchQuery);
    } else {
      params.delete('q');
    }

    params.set('mode', isNow ? 'now' : 'range');

    if (isNow) {
      params.delete('start');
      params.delete('end');
      params.delete('showOptions');
    } else {
      params.set('start', format(selectedStartDateTime, "yyyy-MM-dd'T'HH:mm"));
      params.set('end', format(selectedEndDateTime, "yyyy-MM-dd'T'HH:mm"));
    }

    const nextSearch = params.toString();
    const nextUrl = `${currentUrl.pathname}${nextSearch ? `?${nextSearch}` : ''}${currentUrl.hash}`;
    const currentPathAndSearch = `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`;

    if (nextUrl !== currentPathAndSearch) {
      window.history.replaceState({}, '', nextUrl);
    }
  }, [
    searchQuery,
    isNow,
    selectedStartDateTime,
    selectedEndDateTime,
  ]);

  useEffect(() => {
    fetch('/buildings_data.json')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json() as Promise<Building[]>;
      })
      .then((buildingsData) => {
        const sortedBuildings = buildingsData
          .slice()
          .sort((a, b) => a.name.localeCompare(b.name));
        setBuildings(sortedBuildings);
      })
      .catch((error) => console.error('Error loading building data:', error));
  }, []);

  useEffect(() => {
    if (selectedBuilding) {
      const matchingBuilding =
        buildings.find((building) => building.code === selectedBuilding.code) ||
        null;
      setExpandedBuilding(matchingBuilding);
      (
        window as Window & { mapSelectionInProgress?: boolean }
      ).mapSelectionInProgress = false;
      setSelectedClassroom(null);
    } else {
      setExpandedBuilding(null);
      setSelectedClassroom(null);
    }
  }, [selectedBuilding, buildings, isNow]);

  useEffect(() => {
    if (selectedBuilding && mapSelectionMode) {
      setFocusedBuildingMode(true);
    } else if (selectedBuilding && !mapSelectionMode) {
      setFocusedBuildingMode(false);
    }

    if (!selectedBuilding) {
      setFocusedBuildingMode(false);
    }
  }, [selectedBuilding, mapSelectionMode]);

  const handleBuildingClick = (building: Building) => {
    setFocusedBuildingMode(false);
    setExpandedBuilding((prevBuilding) =>
      prevBuilding && prevBuilding.code === building.code ? null : building,
    );
    setSelectedClassroom(null);
    onBuildingSelect(building, false);
  };

  const handleClassroomClick = (classroom: Room) => {
    setSelectedClassroom((prevClassroom) =>
      prevClassroom && prevClassroom.id === classroom.id ? null : classroom,
    );
  };

  const classroomSchedule = useMemo<AvailabilityTime[]>(() => {
    if (!selectedClassroom) {
      return [];
    }

    const selectedDate = isNow ? new Date() : selectedStartDateTime;
    const selectedDateString = format(selectedDate, 'yyyy-MM-dd');

    const filteredSchedule = selectedClassroom.availability_times.filter(
      (timeRange) => {
        const eventDatePart = timeRange.date.split('T')[0];
        return eventDatePart === selectedDateString;
      },
    );

    if (filteredSchedule.length === 0) {
      return [];
    }

    const uniqueSchedule = [...filteredSchedule];

    uniqueSchedule.sort(
      (a, b) =>
        parseFloat(String(a.time_start)) - parseFloat(String(b.time_start)),
    );

    return uniqueSchedule;
  }, [selectedClassroom, selectedStartDateTime, isNow]);

  const handleToggleChange = () => {
    const newIsNow = !isNow;
    setIsNow(newIsNow);

    if (newIsNow) {
      const now = new Date();
      onStartDateTimeChange(now);
      onEndDateTimeChange(now);
    }
  };

  const handleStartDateChangeInternal = (value: string) => {
    const parsedDate = parseISO(value);
    if (Number.isNaN(parsedDate.getTime())) {
      console.error('Invalid start date selected:', value);
      return;
    }

    onStartDateTimeChange((prevDateTime) => {
      const newDateTime = new Date(prevDateTime);
      newDateTime.setFullYear(parsedDate.getFullYear());
      newDateTime.setMonth(parsedDate.getMonth());
      newDateTime.setDate(parsedDate.getDate());
      return newDateTime;
    });
  };

  const handleStartTimeChangeInternal = (value: string) => {
    const parsedTime = parse(value, 'HH:mm', new Date());
    if (Number.isNaN(parsedTime.getTime())) {
      console.error('Invalid start time selected:', value);
      return;
    }

    onStartDateTimeChange((prevDateTime) => {
      const newDateTime = new Date(prevDateTime);
      newDateTime.setHours(parsedTime.getHours());
      newDateTime.setMinutes(parsedTime.getMinutes());
      return newDateTime;
    });
  };

  const handleEndDateChangeInternal = (value: string) => {
    const parsedDate = parseISO(value);
    if (Number.isNaN(parsedDate.getTime())) {
      console.error('Invalid end date selected:', value);
      return;
    }

    onEndDateTimeChange((prevDateTime) => {
      const newDateTime = new Date(prevDateTime);
      newDateTime.setFullYear(parsedDate.getFullYear());
      newDateTime.setMonth(parsedDate.getMonth());
      newDateTime.setDate(parsedDate.getDate());
      return newDateTime;
    });
  };

  const handleEndTimeChangeInternal = (value: string) => {
    const parsedTime = parse(value, 'HH:mm', new Date());
    if (Number.isNaN(parsedTime.getTime())) {
      console.error('Invalid end time selected:', value);
      return;
    }

    onEndDateTimeChange((prevDateTime) => {
      const newDateTime = new Date(prevDateTime);
      newDateTime.setHours(parsedTime.getHours());
      newDateTime.setMinutes(parsedTime.getMinutes());
      return newDateTime;
    });
  };

  const filteredBuildings = useMemo<Building[]>(() => {
    let baseBuildings: Building[] = buildings;

    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase().trim();

      baseBuildings = buildings
        .map((building) => {
          const buildingMatches =
            building.name.toLowerCase().includes(query) ||
            (building.code && building.code.toLowerCase().includes(query));

          const matchingClassrooms = building.classrooms.filter((room) =>
            room.name.toLowerCase().includes(query),
          );

          if (buildingMatches || matchingClassrooms.length > 0) {
            return {
              ...building,
              classrooms: buildingMatches
                ? building.classrooms
                : matchingClassrooms,
            };
          }

          return null;
        })
        .filter((building): building is Building => building !== null);
    }

    if (showFavorites) {
      const directlyFavoritedBuildingCodes = favoriteBuildings.map(
        (building) => building.code,
      );
      const buildingCodesWithFavoritedRooms = favoriteRooms.map(
        (room) => room.buildingCode,
      );

      const allFavoritedBuildingCodes = Array.from(
        new Set([
          ...directlyFavoritedBuildingCodes,
          ...buildingCodesWithFavoritedRooms,
        ]),
      );

      baseBuildings = baseBuildings.filter((building) =>
        allFavoritedBuildingCodes.includes(building.code),
      );

      return baseBuildings.map((building) => {
        if (directlyFavoritedBuildingCodes.includes(building.code)) {
          return building;
        }

        const favoritedRoomIds = favoriteRooms
          .filter((room) => room.buildingCode === building.code)
          .map((room) => room.id);

        return {
          ...building,
          classrooms: building.classrooms.filter((room) =>
            favoritedRoomIds.includes(room.id),
          ),
        };
      });
    }

    if (isNow) {
      return baseBuildings;
    }

    return baseBuildings
      .map((building) => {
        const availableClassrooms = building.classrooms.filter((room) => {
          const [status] = getClassroomAvailability(
            room,
            selectedStartDateTime,
            selectedEndDateTime,
          ) as [string, number | undefined];
          return status === 'Available';
        });

        if (availableClassrooms.length > 0) {
          return {
            ...building,
            classrooms: availableClassrooms,
          };
        }

        return null;
      })
      .filter((building): building is Building => building !== null);
  }, [
    buildings,
    selectedStartDateTime,
    selectedEndDateTime,
    isNow,
    showFavorites,
    favoriteBuildings,
    favoriteRooms,
    searchQuery,
  ]);

  const handleExitFocusMode = () => {
    setFocusedBuildingMode(false);
    onBuildingSelect(null, false);
  };

  return (
    <div
      ref={sidebarRef}
      className={`sidebar ${darkMode ? 'dark-mode' : ''} ${
        focusedBuildingMode ? 'focused-building-mode' : ''
      }`}
    >
      <SidebarHeader
        focusedBuildingMode={focusedBuildingMode}
        selectedBuilding={selectedBuilding}
        showFavorites={showFavorites}
        darkMode={darkMode}
        onToggleFavorites={() => setShowFavorites((prev) => !prev)}
        onToggleDarkMode={toggleDarkMode}
        onToggleDescription={() => setShowDescription((prev) => !prev)}
        onExitFocusMode={handleExitFocusMode}
      />

      <SearchSection
        focusedBuildingMode={focusedBuildingMode}
        searchQuery={searchQuery}
        filteredBuildingsCount={filteredBuildings.length}
        onSearchQueryChange={setSearchQuery}
        onClearSearch={() => setSearchQuery('')}
      />

      <ProjectDescription
        focusedBuildingMode={focusedBuildingMode}
        showDescription={showDescription}
      />

      <SidebarControls
        focusedBuildingMode={focusedBuildingMode}
        isNow={isNow}
        onToggleNowMode={handleToggleChange}
      />

      <SearchOptions
        isNow={isNow}
        selectedStartDateTime={selectedStartDateTime}
        selectedEndDateTime={selectedEndDateTime}
        onStartDateChange={handleStartDateChangeInternal}
        onStartTimeChange={handleStartTimeChangeInternal}
        onEndDateChange={handleEndDateChangeInternal}
        onEndTimeChange={handleEndTimeChangeInternal}
      />

      <BuildingList
        filteredBuildings={filteredBuildings}
        selectedBuilding={selectedBuilding}
        expandedBuilding={expandedBuilding}
        selectedClassroom={selectedClassroom}
        classroomSchedule={classroomSchedule}
        selectedStartDateTime={selectedStartDateTime}
        selectedEndDateTime={selectedEndDateTime}
        isNow={isNow}
        showFavorites={showFavorites}
        favoriteBuildings={favoriteBuildings as FavoriteBuilding[]}
        favoriteRooms={favoriteRooms as FavoriteRoom[]}
        onBuildingClick={handleBuildingClick}
        onClassroomClick={handleClassroomClick}
        onToggleFavoriteBuilding={toggleFavoriteBuilding}
        onToggleFavoriteRoom={toggleFavoriteRoom}
      />
    </div>
  );
};

export default Sidebar;
