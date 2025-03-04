// src/App.js

import React, { useState, useCallback, useEffect } from 'react';
import Sidebar from './Sidebar';
import Map from './Map';
import './App.css'; // Import the CSS file for styling

const App = () => {
  const [selectedStartDateTime, setSelectedStartDateTime] = useState(new Date());
  const [selectedEndDateTime, setSelectedEndDateTime] = useState(new Date());

  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [showMap, setShowMap] = useState(false); // New state variable for toggling map
  const [darkMode, setDarkMode] = useState(false); // State for dark mode toggle
  const [mapSelectionMode, setMapSelectionMode] = useState(false); // Track if selection came from map

  // Favorites system
  const [favoriteBuildings, setFavoriteBuildings] = useState(() => {
    // Initialize from localStorage if available
    const saved = localStorage.getItem('favoriteBuildings');
    return saved ? JSON.parse(saved) : [];
  });

  const [favoriteRooms, setFavoriteRooms] = useState(() => {
    // Initialize from localStorage if available
    const saved = localStorage.getItem('favoriteRooms');
    return saved ? JSON.parse(saved) : [];
  });

  const handleBuildingSelect = useCallback((building, fromMap = false) => {
    console.log(`Building selected: ${building?.name || 'none'}, fromMap: ${fromMap}`);

    // Set both the building and whether selection came from map
    setSelectedBuilding(building);
    setMapSelectionMode(fromMap);
  }, []);

  // Adjusted handlers to accept functional updates
  const handleStartDateTimeChange = useCallback(
    (update) => {
      setSelectedStartDateTime((prevDateTime) => {
        const newDateTime = typeof update === 'function' ? update(prevDateTime) : update;
        if (!(newDateTime instanceof Date) || isNaN(newDateTime)) {
          console.error('Invalid dateTime received:', newDateTime);
          return prevDateTime;
        }
        // Ensure end time is not before start time
        setSelectedEndDateTime((prevEnd) => {
          if (prevEnd <= newDateTime) {
            return new Date(newDateTime.getTime());
          }
          return prevEnd;
        });
        return newDateTime;
      });
    },
    []
  );

  const handleEndDateTimeChange = useCallback((update) => {
    setSelectedEndDateTime((prevDateTime) => {
      const newDateTime = typeof update === 'function' ? update(prevDateTime) : update;
      if (!(newDateTime instanceof Date) || isNaN(newDateTime)) {
        console.error('Invalid dateTime received:', newDateTime);
        return prevDateTime;
      }
      return newDateTime;
    });
  }, []);

  // Effect to apply dark mode class to body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  // Effect to save favorites to localStorage
  useEffect(() => {
    localStorage.setItem('favoriteBuildings', JSON.stringify(favoriteBuildings));
  }, [favoriteBuildings]);

  useEffect(() => {
    localStorage.setItem('favoriteRooms', JSON.stringify(favoriteRooms));
  }, [favoriteRooms]);

  // Toggle dark mode function
  const toggleDarkMode = useCallback(() => {
    setDarkMode(prev => !prev);
  }, []);

  // Favorites management functions
  const toggleFavoriteBuilding = useCallback((building) => {
    setFavoriteBuildings(prev => {
      const buildingCode = building.code;
      const isAlreadyFavorite = prev.some(fav => fav.code === buildingCode);

      if (isAlreadyFavorite) {
        return prev.filter(fav => fav.code !== buildingCode);
      } else {
        return [...prev, { code: buildingCode, name: building.name }];
      }
    });
  }, []);

  const toggleFavoriteRoom = useCallback((building, room) => {
    setFavoriteRooms(prev => {
      const roomId = room.id;
      const isAlreadyFavorite = prev.some(fav => fav.id === roomId);

      if (isAlreadyFavorite) {
        return prev.filter(fav => fav.id !== roomId);
      } else {
        return [...prev, {
          id: roomId,
          name: room.name,
          buildingCode: building.code,
          buildingName: building.name
        }];
      }
    });
  }, []);

  return (
    <div className={`app-container ${showMap ? '' : 'no-map'} ${darkMode ? 'dark-mode' : ''}`}>
      <Sidebar
        onBuildingSelect={handleBuildingSelect}
        selectedBuilding={selectedBuilding}
        selectedStartDateTime={selectedStartDateTime}
        selectedEndDateTime={selectedEndDateTime}
        onStartDateTimeChange={handleStartDateTimeChange}
        onEndDateTimeChange={handleEndDateTimeChange}
        showMap={showMap}
        setShowMap={setShowMap}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        favoriteBuildings={favoriteBuildings}
        favoriteRooms={favoriteRooms}
        toggleFavoriteBuilding={toggleFavoriteBuilding}
        toggleFavoriteRoom={toggleFavoriteRoom}
        mapSelectionMode={mapSelectionMode}
      />
      {showMap && (
        <div className="map-container">
          <Map
            selectedBuilding={selectedBuilding}
            onBuildingSelect={handleBuildingSelect}
            selectedStartDateTime={selectedStartDateTime}
            selectedEndDateTime={selectedEndDateTime}
            darkMode={darkMode}
          />
        </div>
      )}
    </div>
  );
};

export default App;
