// src/App.js

import React, { useState, useCallback } from 'react';
import Sidebar from './Sidebar';
import Map from './Map';
import './App.css'; // Import the CSS file for styling

const App = () => {
  // Initialize start date-time to current date and time
  const [selectedStartDateTime, setSelectedStartDateTime] = useState(() => new Date());

  // Initialize end date-time to one hour later
  const [selectedEndDateTime, setSelectedEndDateTime] = useState(() => {
    const oneHourLater = new Date();
    oneHourLater.setHours(oneHourLater.getHours() + 1);
    return oneHourLater;
  });

  const [selectedBuilding, setSelectedBuilding] = useState(null);

  // Handler for building selection
  const handleBuildingSelect = useCallback((building) => {
    setSelectedBuilding(building);
  }, []);

  // Handler for start date-time change
  const handleStartDateTimeChange = useCallback(
    (dateTime) => {
      if (!(dateTime instanceof Date) || isNaN(dateTime)) {
        console.error('Invalid dateTime received:', dateTime);
        return;
      }
      setSelectedStartDateTime(dateTime);
      // Adjust the end time if it's before the new start time
      if (selectedEndDateTime <= dateTime) {
        const newEndDateTime = new Date(dateTime.getTime() + 60 * 60 * 1000); // Add 1 hour
        setSelectedEndDateTime(newEndDateTime);
      }
    },
    [selectedEndDateTime]
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
