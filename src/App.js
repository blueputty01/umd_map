// src/App.js

import React, { useState, useCallback } from 'react';
import Sidebar from './Sidebar';
import Map from './Map';
import './App.css'; // Import the CSS file for styling

const App = () => {
  const [selectedStartDateTime, setSelectedStartDateTime] = useState(new Date());
  const [selectedEndDateTime, setSelectedEndDateTime] = useState(new Date());

  const [selectedBuilding, setSelectedBuilding] = useState(null);

  const handleBuildingSelect = useCallback((building) => {
    setSelectedBuilding(building);
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

  return (
    <div className="app-container">
      <Sidebar
        onBuildingSelect={handleBuildingSelect}
        selectedBuilding={selectedBuilding}
        selectedStartDateTime={selectedStartDateTime}
        selectedEndDateTime={selectedEndDateTime}
        onStartDateTimeChange={handleStartDateTimeChange}
        onEndDateTimeChange={handleEndDateTimeChange}
      />
      <div className="map-container">
        <Map
          selectedBuilding={selectedBuilding}
          onBuildingSelect={handleBuildingSelect}
          selectedStartDateTime={selectedStartDateTime}
          selectedEndDateTime={selectedEndDateTime}
        />
      </div>
    </div>
  );
};

export default App;
