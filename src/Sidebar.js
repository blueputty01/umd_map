// src/Sidebar.js

import React, { useEffect, useState, useRef, useMemo } from 'react';
import './Sidebar.css'; // Styles for the sidebar
import { getClassroomAvailability } from './availability';
import { DateTimePicker } from '@atlaskit/datetime-picker'; // Updated import
import PropTypes from 'prop-types';

const Sidebar = ({
  onBuildingSelect,
  selectedBuilding,
  selectedStartDateTime,
  selectedEndDateTime,
  onStartDateTimeChange,
  onEndDateTimeChange,
}) => {
  const [buildings, setBuildings] = useState([]);
  const [expandedBuilding, setExpandedBuilding] = useState(null);
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [showSearchOptions, setShowSearchOptions] = useState(false); // New state
  const buildingRefs = useRef({}); // Store refs to building list items

  useEffect(() => {
    fetch(process.env.PUBLIC_URL + '/buildings_data.json')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((buildingsData) => {
        setBuildings(buildingsData);
      })
      .catch((error) => console.error('Error loading building data:', error));
  }, []);

  // Update expanded building when selectedBuilding changes
  useEffect(() => {
    if (selectedBuilding) {
      const matchingBuilding = buildings.find(
        (b) => b.code === selectedBuilding.code
      );
      setExpandedBuilding(matchingBuilding);
      setSelectedClassroom(null); // Reset selected classroom when building changes

      // Scroll the building into view
      if (buildingRefs.current[selectedBuilding.code]) {
        buildingRefs.current[selectedBuilding.code].scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }
    } else {
      setExpandedBuilding(null);
      setSelectedClassroom(null);
    }
  }, [selectedBuilding, buildings]);

  const handleBuildingClick = (building) => {
    setExpandedBuilding((prevBuilding) =>
      prevBuilding && prevBuilding.code === building.code ? null : building
    );
    setSelectedClassroom(null); // Reset selected classroom when collapsing/expanding building

    if (onBuildingSelect) {
      onBuildingSelect(building);
    }
  };

  const handleClassroomClick = (classroom) => {
    setSelectedClassroom((prevClassroom) =>
      prevClassroom && prevClassroom.id === classroom.id ? null : classroom
    );
  };

  // Compute the schedule for the selected classroom and date
  const classroomSchedule = useMemo(() => {
    if (selectedClassroom) {
      const selectedDateString = selectedStartDateTime
        .toISOString()
        .split('T')[0];

      const filteredSchedule = selectedClassroom.availability_times.filter(
        (timeRange) => {
          const eventDateString = timeRange.date.split('T')[0];
          return eventDateString === selectedDateString;
        }
      );

      // Remove duplicates based on time_start, time_end, and event_name
      const uniqueSchedule = [];
      const seen = new Set();

      filteredSchedule.forEach((timeRange) => {
        const key = `${timeRange.time_start}-${timeRange.time_end}-${timeRange.event_name}`;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueSchedule.push(timeRange);
        }
      });

      // Sort the schedule by start time
      uniqueSchedule.sort(
        (a, b) => parseFloat(a.time_start) - parseFloat(b.time_start)
      );

      return uniqueSchedule;
    } else {
      return [];
    }
  }, [selectedClassroom, selectedStartDateTime]);

  // Converts string decimal hours to hh:mm AM/PM format
  function decimalHoursToTimeString(decimalHoursStr) {
    const decimalHours = parseFloat(decimalHoursStr);
    const totalMinutes = decimalHours * 60;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);

    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    date.setSeconds(0);
    date.setMilliseconds(0); // Ensure milliseconds are zeroed

    return date.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  const toggleSearchOptions = () => {
    setShowSearchOptions((prev) => !prev);
  };

  // Internal Handlers with Validation
  const handleStartDateTimeChangeInternal = (timestamp) => {
    if (!timestamp) {
      console.error('Received null timestamp for start date-time');
      return;
    }
    const date = new Date(timestamp);
    if (isNaN(date)) {
      console.error('Invalid timestamp received for start date-time:', timestamp);
      return;
    }
    onStartDateTimeChange(date);
    // If the end date-time is before the start date-time, reset it
    if (selectedEndDateTime <= date) {
      onEndDateTimeChange(new Date(date.getTime() + 60 * 60 * 1000)); // Add 1 hour
    }
  };

  const handleEndDateTimeChangeInternal = (timestamp) => {
    if (!timestamp) {
      console.error('Received null timestamp for end date-time');
      return;
    }
    const date = new Date(timestamp);
    if (isNaN(date)) {
      console.error('Invalid timestamp received for end date-time:', timestamp);
      return;
    }
    onEndDateTimeChange(date);
  };

  return (
    <div className="sidebar">
      <h2>Rooms by Andrew</h2>

      {/* Toggle Button for Search Options */}
      <div className="toggle-search">
        <button className="toggle-button" onClick={toggleSearchOptions}>
          {showSearchOptions ? 'Hide Search Options' : 'Show Search Options'}
          <span style={{ marginLeft: '10px' }}>
            {showSearchOptions ? '▲' : '▼'}
          </span>
        </button>
      </div>

      {/* Search Options Section */}
      <div className={`search-options ${showSearchOptions ? 'open' : ''}`}>
        <div className="date-time-picker">
          <label htmlFor="start-datetime">Select Start Date and Time:</label>
          <DateTimePicker
            id="start-datetime"
            onChange={handleStartDateTimeChangeInternal}
            value={selectedStartDateTime.getTime()}
            placeholder="Select start date and time"
            // Removed timeZone to use local time
          />
        </div>
        <div className="date-time-picker">
          <label htmlFor="end-datetime">Select End Date and Time:</label>
          <DateTimePicker
            id="end-datetime"
            onChange={handleEndDateTimeChangeInternal}
            value={selectedEndDateTime.getTime()}
            placeholder="Select end date and time"
            minDate={selectedStartDateTime.getTime()}
            // Removed timeZone to use local time
          />
        </div>
      </div>

      <ul className="building-list">
        {buildings.map((building) => (
          <li
            key={building.code}
            ref={(el) => (buildingRefs.current[building.code] = el)}
            className={
              selectedBuilding && selectedBuilding.code === building.code
                ? 'selected-building'
                : ''
            }
          >
            <div
              className="building-name"
              onClick={() => handleBuildingClick(building)}
            >
              {building.name}
            </div>
            {expandedBuilding && expandedBuilding.code === building.code && (
              <ul className="classroom-list">
                {building.classrooms.map((room) => {
                  const availabilityStatus = getClassroomAvailability(
                    room,
                    selectedStartDateTime,
                    selectedEndDateTime
                  );
                  const isSelectedClassroom =
                    selectedClassroom && selectedClassroom.id === room.id;
                  return (
                    <li
                      key={room.id}
                      onClick={() => handleClassroomClick(room)}
                      className={isSelectedClassroom ? 'selected-classroom' : ''}
                    >
                      <div className="classroom-item">
                        <div className="classroom-name">{room.name}</div>
                        <div
                          className={`availability ${availabilityStatus
                            .toLowerCase()
                            .replace(' ', '-')}`}
                        >
                          {availabilityStatus}
                        </div>
                      </div>
                      {isSelectedClassroom && (
                        <div className="classroom-schedule">
                          <h4>Schedule for {room.name}</h4>
                          {classroomSchedule.length > 0 ? (
                            <ul>
                              {classroomSchedule.map((timeRange, index) => (
                                <li key={index}>
                                  <strong>
                                    {decimalHoursToTimeString(
                                      timeRange.time_start
                                    )}{' '}
                                    -{' '}
                                    {decimalHoursToTimeString(
                                      timeRange.time_end
                                    )}
                                  </strong>
                                  : <em>{timeRange.event_name}</em>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p>No events scheduled for this day.</p>
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
    </div>
  );
};

// Adding PropTypes for better validation
Sidebar.propTypes = {
  onBuildingSelect: PropTypes.func.isRequired,
  selectedBuilding: PropTypes.object,
  selectedStartDateTime: PropTypes.instanceOf(Date).isRequired,
  selectedEndDateTime: PropTypes.instanceOf(Date).isRequired,
  onStartDateTimeChange: PropTypes.func.isRequired,
  onEndDateTimeChange: PropTypes.func.isRequired,
};

export default Sidebar;
