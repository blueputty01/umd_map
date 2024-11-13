// src/Sidebar.js

import React, { useEffect, useState, useRef, useMemo } from 'react';
import './Sidebar.css'; // Styles for the sidebar
import { getClassroomAvailability } from './availability';
import PropTypes from 'prop-types';

// Import necessary modules from date-fns
import { parseISO, format, parse } from 'date-fns';
// Import Atlaskit components
import { Label } from '@atlaskit/form';
import { DatePicker, TimePicker } from '@atlaskit/datetime-picker';

// Define duration for "Now" mode in minutes (not used since we check availability at the current moment)
const NOW_DURATION_MINUTES = 0;

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
  const [showSearchOptions, setShowSearchOptions] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [isNow, setIsNow] = useState(true);
  const buildingRefs = useRef({});

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

  // Update expanded building when selectedBuilding or isNow changes
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
  }, [selectedBuilding, buildings, isNow]);

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
      const selectedDate = isNow ? new Date() : selectedStartDateTime;
      const selectedDateString = format(selectedDate, 'yyyy-MM-dd');

      const filteredSchedule = selectedClassroom.availability_times.filter(
        (timeRange) => {
          const eventDatePart = timeRange.date.split('T')[0];
          return eventDatePart === selectedDateString;
        }
      );

      if (filteredSchedule.length === 0) {
        return [];
      }

      // Remove duplicates based on time_start, time_end, and event_name
      const uniqueSchedule = [];

      filteredSchedule.forEach((timeRange) => {
        // For simplicity, we assume the time ranges are unique
        uniqueSchedule.push(timeRange);
      });

      // Sort the schedule by start time
      uniqueSchedule.sort(
        (a, b) => parseFloat(a.time_start) - parseFloat(b.time_start)
      );

      return uniqueSchedule;
    } else {
      return [];
    }
  }, [selectedClassroom, selectedStartDateTime, isNow]);

  /**
   * Converts decimal hours to a Date object based on the event's date
   */
  function decimalHoursToDate(date, decimalHours) {
    const decimal = parseFloat(decimalHours);
    const hours = Math.floor(decimal);
    const minutes = Math.round((decimal - hours) * 60);

    const eventDate = new Date(date);
    eventDate.setHours(hours, minutes, 0, 0); // Set hours and minutes

    return eventDate;
  }

  /**
   * Converts decimal hours to 'h:mm a' format in 12-hour time
   */
  function decimalHoursToTimeString(decimalHours) {
    const date = decimalHoursToDate(new Date(), decimalHours);
    return format(date, 'h:mm a');
  }

  const toggleSearchOptions = () => {
    setShowSearchOptions((prev) => !prev);
  };

  const toggleDescription = () => {
    setShowDescription((prev) => !prev);
  };

  const handleToggleChange = () => {
    setIsNow((prevIsNow) => {
      const newIsNow = !prevIsNow;
      if (newIsNow) {
        // Switching to "Now" mode, set the time to current time
        const now = new Date();
        onStartDateTimeChange(now);
        onEndDateTimeChange(now);
      } else {
        // Switching to "Select Date and Time Range" mode - do not change times
        // Optionally, you can reset the times or keep the previous selection
      }
      return newIsNow;
    });
  };

  // Handlers for date and time changes
  const handleStartDateChangeInternal = (value) => {
    // value is in 'YYYY-MM-DD' format
    const parsedDate = parseISO(value);
    if (isNaN(parsedDate)) {
      console.error('Invalid start date selected:', value);
      return;
    }

    // Update selectedStartDateTime by setting the date, keeping the time
    onStartDateTimeChange((prevDateTime) => {
      const newDateTime = new Date(prevDateTime);
      newDateTime.setFullYear(parsedDate.getFullYear());
      newDateTime.setMonth(parsedDate.getMonth());
      newDateTime.setDate(parsedDate.getDate());
      return newDateTime;
    });
  };

  const handleStartTimeChangeInternal = (value) => {
    const parsedTime = parse(value, 'h:mm a', new Date());
    if (isNaN(parsedTime)) {
      console.error('Invalid start time selected:', value);
      return;
    }
    // Update selectedStartDateTime by setting the hours and minutes
    onStartDateTimeChange((prevDateTime) => {
      const newDateTime = new Date(prevDateTime);
      newDateTime.setHours(parsedTime.getHours());
      newDateTime.setMinutes(parsedTime.getMinutes());
      return newDateTime;
    });
  };

  const handleEndDateChangeInternal = (value) => {
    // value is in 'YYYY-MM-DD' format
    const parsedDate = parseISO(value);
    if (isNaN(parsedDate)) {
      console.error('Invalid end date selected:', value);
      return;
    }

    // Update selectedEndDateTime by setting the date, keeping the time
    onEndDateTimeChange((prevDateTime) => {
      const newDateTime = new Date(prevDateTime);
      newDateTime.setFullYear(parsedDate.getFullYear());
      newDateTime.setMonth(parsedDate.getMonth());
      newDateTime.setDate(parsedDate.getDate());
      return newDateTime;
    });
  };

  const handleEndTimeChangeInternal = (value) => {
    const parsedTime = parse(value, 'h:mm a', new Date());
    if (isNaN(parsedTime)) {
      console.error('Invalid end time selected:', value);
      return;
    }
    // Update selectedEndDateTime by setting the hours and minutes
    onEndDateTimeChange((prevDateTime) => {
      const newDateTime = new Date(prevDateTime);
      newDateTime.setHours(parsedTime.getHours());
      newDateTime.setMinutes(parsedTime.getMinutes());
      return newDateTime;
    });
  };

  // Generate time options from 7:00 AM to 10:00 PM in 12-hour format
  const timeOptions = generateTimeOptions('7:00 AM', '10:00 PM', 30); // every 30 minutes

  // Helper function to generate time options between startTime and endTime
  function generateTimeOptions(startTime, endTime, stepMinutes) {
    const options = [];
    let currentTime = parse(startTime, 'h:mm a', new Date());
    const endTimeParsed = parse(endTime, 'h:mm a', new Date());

    while (currentTime <= endTimeParsed) {
      const timeString = format(currentTime, 'h:mm a');
      options.push({ label: timeString, value: timeString });
      currentTime = new Date(currentTime.getTime() + stepMinutes * 60000); // add stepMinutes
    }
    return options;
  }

  // Adjusted filtering of buildings and classrooms
  const filteredBuildings = useMemo(() => {
    if (isNow) {
      // In "Now" mode, display all buildings and classrooms without filtering
      return buildings;
    } else {
      // In "Search" mode, filter buildings and classrooms based on availability
      return buildings
        .map((building) => {
          // Filter classrooms in the building based on availability
          const availableClassrooms = building.classrooms.filter((room) => {
            const status = getClassroomAvailability(
              room,
              selectedStartDateTime,
              selectedEndDateTime
            );
            return status === 'Available';
          });
          if (availableClassrooms.length > 0) {
            // Return building with filtered classrooms
            return {
              ...building,
              classrooms: availableClassrooms,
            };
          } else {
            return null; // Exclude building if no available classrooms
          }
        })
        .filter((building) => building !== null);
    }
  }, [buildings, selectedStartDateTime, selectedEndDateTime, isNow]);

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-title">Rooms</h2>
        <button
          className="info-button"
          onClick={toggleDescription}
          aria-label="Project Description"
        >
          ⓘ
        </button>
      </div>

      {/* Description Section */}
      {showDescription && (
        <div className="project-description">
          {/* Project description content */}
          <p>
            Welcome to the Room Availability Dashboard. Here you can search for
            available classrooms based on your selected time range or view
            real-time availability in "Now" mode.
          </p>
        </div>
      )}

      {/* Toggle Switch for "Now" vs. Custom Time */}
      <div className="toggle-now">
        <label className="switch">
          <input
            type="checkbox"
            checked={!isNow}
            onChange={handleToggleChange}
          />
          <span className="slider round"></span>
        </label>
        <span className="toggle-label">
          {isNow ? 'Now' : 'Select Date and Time Range'}
        </span>
      </div>

      {/* Toggle Button for Search Options */}
      {!isNow && (
        <div className="toggle-search">
          <button className="toggle-button" onClick={toggleSearchOptions}>
            {showSearchOptions ? 'Hide Search Options' : 'Show Search Options'}
            <span style={{ marginLeft: '10px' }}>
              {showSearchOptions ? '▲' : '▼'}
            </span>
          </button>
        </div>
      )}

      {/* Search Options Section */}
      {!isNow && showSearchOptions && (
        <div className="search-options open">
          {/* Start DatePicker and TimePicker */}
          <Label htmlFor="start-date">Select Start Date</Label>
          <DatePicker
            id="start-date"
            value={format(selectedStartDateTime, 'yyyy-MM-dd')}
            onChange={handleStartDateChangeInternal}
            dateFormat="MM-DD"
            placeholder="MM-DD"
            shouldShowCalendarButton={true}
          />

          <Label htmlFor="start-time">Select Start Time</Label>
          <TimePicker
            id="start-time"
            value={format(selectedStartDateTime, 'h:mm a')}
            onChange={handleStartTimeChangeInternal}
            timeFormat="h:mm a"
            placeholder="h:mm a"
            selectProps={{
              options: timeOptions,
            }}
          />

          {/* End DatePicker and TimePicker */}
          <Label htmlFor="end-date">Select End Date</Label>
          <DatePicker
            id="end-date"
            value={format(selectedEndDateTime, 'yyyy-MM-dd')}
            onChange={handleEndDateChangeInternal}
            dateFormat="MM-DD"
            placeholder="MM-DD"
            shouldShowCalendarButton={true}
          />

          <Label htmlFor="end-time">Select End Time</Label>
          <TimePicker
            id="end-time"
            value={format(selectedEndDateTime, 'h:mm a')}
            onChange={handleEndTimeChangeInternal}
            timeFormat="h:mm a"
            placeholder="h:mm a"
            selectProps={{
              options: timeOptions,
            }}
          />
        </div>
      )}

      {/* Building and Classroom Lists */}
      {filteredBuildings.length === 0 ? (
        <p>No available buildings during this time range.</p>
      ) : (
        <ul className="building-list">
          {filteredBuildings.map((building) => (
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
              {expandedBuilding &&
                expandedBuilding.code === building.code && (
                  <ul className="classroom-list">
                    {building.classrooms.map((room) => {
                      // Compute availability status
                      const availabilityStatus = getClassroomAvailability(
                        room,
                        isNow ? null : selectedStartDateTime,
                        isNow ? null : selectedEndDateTime
                      );
                      const isSelectedClassroom =
                        selectedClassroom && selectedClassroom.id === room.id;
                      return (
                        <li
                          key={room.id}
                          onClick={() => handleClassroomClick(room)}
                          className={
                            isSelectedClassroom ? 'selected-classroom' : ''
                          }
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
                                  {classroomSchedule.map(
                                    (timeRange, index) => {
                                      const eventStart = decimalHoursToDate(
                                        isNow
                                          ? new Date()
                                          : selectedStartDateTime,
                                        timeRange.time_start
                                      );
                                      const eventEnd = decimalHoursToDate(
                                        isNow
                                          ? new Date()
                                          : selectedStartDateTime,
                                        timeRange.time_end
                                      );
                                      const now = new Date();
                                      const isActive =
                                        now >= eventStart && now <= eventEnd;

                                      return (
                                        <li
                                          key={index}
                                          className={
                                            isActive ? 'active-event' : ''
                                          }
                                        >
                                          <strong>
                                            {decimalHoursToTimeString(
                                              timeRange.time_start
                                            )}{' '}
                                            -{' '}
                                            {decimalHoursToTimeString(
                                              timeRange.time_end
                                            )}
                                          </strong>
                                          :{' '}
                                          <em>{timeRange.event_name}</em>
                                        </li>
                                      );
                                    }
                                  )}
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
      )}
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
