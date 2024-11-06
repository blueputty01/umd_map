// src/App.js

import React, { useState, useCallback } from 'react';
import Sidebar from './Sidebar';
import Map from './Map';
import './App.css'; // Import the CSS file for styling

const App = () => {
  // Initialize both start and end date-time to current date and time
  const [selectedStartDateTime, setSelectedStartDateTime] = useState(() => new Date());
  const [selectedEndDateTime, setSelectedEndDateTime] = useState(() => new Date());

  const [selectedBuilding, setSelectedBuilding] = useState(null);

  // Handler for building selection
  const handleBuildingSelect = useCallback((building) => {
    setSelectedBuilding(building);
  }, []);

  // Handler for start date-time change using functional update
  const handleStartDateTimeChange = useCallback(
    (dateTime) => {
      if (!(dateTime instanceof Date) || isNaN(dateTime)) {
        console.error('Invalid dateTime received:', dateTime);
        return;
      }
      setSelectedStartDateTime(dateTime);
      // Adjust the end time if it's before the new start time using functional update
      setSelectedEndDateTime((prevEnd) => {
        if (prevEnd <= dateTime) {
          return new Date(dateTime.getTime()); // Set end time equal to start time
        }
        return prevEnd;
      });
    },
    []
  );

  // Handler for end date-time change
  const handleEndDateTimeChange = useCallback((dateTime) => {
    if (!(dateTime instanceof Date) || isNaN(dateTime)) {
      console.error('Invalid dateTime received:', dateTime);
      return;
    }
    setSelectedEndDateTime(dateTime);
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
      {/* Wrap Map inside a div with className="map-container" */}
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
