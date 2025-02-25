// src/Sidebar.js

// React imports
import React, { 
  useEffect, 
  useState, 
  useRef, 
  useMemo, 
  useCallback 
} from "react";
import "./Sidebar.css"; // Styles for the sidebar
import { getClassroomAvailability } from "./availability";
import PropTypes from "prop-types";

// Import necessary modules from date-fns
import { parseISO, format, parse } from "date-fns";
// Import Atlaskit components
import { Label } from "@atlaskit/form";
import { DatePicker, TimePicker } from "@atlaskit/datetime-picker";

const Sidebar = ({
  onBuildingSelect,
  selectedBuilding,
  selectedStartDateTime,
  selectedEndDateTime,
  onStartDateTimeChange,
  onEndDateTimeChange,
  showMap,
  setShowMap, // Receive the state setter from App.js
  darkMode,
  toggleDarkMode, // Dark mode toggle function
  favoriteBuildings,
  favoriteRooms,
  toggleFavoriteBuilding,
  toggleFavoriteRoom,
}) => {
  const [buildings, setBuildings] = useState([]);
  const [expandedBuilding, setExpandedBuilding] = useState(null);
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [showSearchOptions, setShowSearchOptions] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [isNow, setIsNow] = useState(true);
  const [showFavorites, setShowFavorites] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const buildingRefs = useRef({});

  useEffect(() => {
    fetch(process.env.PUBLIC_URL + "/buildings_data.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((buildingsData) => {
        const sortedBuildings = buildingsData
          .slice()
          .sort((a, b) => a.name.localeCompare(b.name));
        setBuildings(sortedBuildings);
      })
      .catch((error) => console.error("Error loading building data:", error));
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
          behavior: "smooth",
          block: "nearest",
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
      const selectedDateString = format(selectedDate, "yyyy-MM-dd");

      const filteredSchedule = selectedClassroom.availability_times.filter(
        (timeRange) => {
          const eventDatePart = timeRange.date.split("T")[0];
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
    return format(date, "h:mm a");
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
      console.error("Invalid start date selected:", value);
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
    const parsedTime = parse(value, "h:mm a", new Date());
    if (isNaN(parsedTime)) {
      console.error("Invalid start time selected:", value);
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
      console.error("Invalid end date selected:", value);
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
    const parsedTime = parse(value, "h:mm a", new Date());
    if (isNaN(parsedTime)) {
      console.error("Invalid end time selected:", value);
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
  const timeOptions = generateTimeOptions("7:00 AM", "10:00 PM", 30); // every 30 minutes

  // Helper function to generate time options between startTime and endTime
  function generateTimeOptions(startTime, endTime, stepMinutes) {
    const options = [];
    let currentTime = parse(startTime, "h:mm a", new Date());
    const endTimeParsed = parse(endTime, "h:mm a", new Date());

    while (currentTime <= endTimeParsed) {
      const timeString = format(currentTime, "h:mm a");
      options.push({ label: timeString, value: timeString });
      currentTime = new Date(currentTime.getTime() + stepMinutes * 60000); // add stepMinutes
    }
    return options;
  }

  // Adjusted filtering of buildings and classrooms
  const filteredBuildings = useMemo(() => {
    // Base buildings to filter
    let baseBuildings = buildings;
    
    // Apply search filter if search query exists
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase().trim();
      
      // Search in building names and room names
      baseBuildings = buildings.map(building => {
        // Check if building name matches
        const buildingMatches = building.name.toLowerCase().includes(query) || 
                               (building.code && building.code.toLowerCase().includes(query));
        
        // Filter classrooms that match the query
        const matchingClassrooms = building.classrooms.filter(room => 
          room.name.toLowerCase().includes(query)
        );
        
        // Return building with filtered rooms if either building matches or has matching rooms
        if (buildingMatches || matchingClassrooms.length > 0) {
          return {
            ...building,
            classrooms: buildingMatches ? building.classrooms : matchingClassrooms
          };
        }
        
        return null; // Exclude building if no matches
      }).filter(building => building !== null);
    }
    
    // If showing favorites mode, first filter to just favorite buildings or buildings with favorited rooms
    if (showFavorites) {
      // Get building codes that are favorited directly
      const directlyFavoritedBuildingCodes = favoriteBuildings.map(b => b.code);
      
      // Get building codes that contain favorited rooms
      const buildingCodesWithFavoritedRooms = favoriteRooms.map(r => r.buildingCode);
      
      // Combine unique building codes
      const allFavoritedBuildingCodes = [...new Set([
        ...directlyFavoritedBuildingCodes,
        ...buildingCodesWithFavoritedRooms
      ])];
      
      baseBuildings = baseBuildings.filter(building => allFavoritedBuildingCodes.includes(building.code));
      
      return baseBuildings.map(building => {
        // If the building is directly favorited, keep all its rooms
        if (directlyFavoritedBuildingCodes.includes(building.code)) {
          return building;
        }
        
        // Otherwise filter to just favorited rooms
        const favoritedRoomIds = favoriteRooms
          .filter(r => r.buildingCode === building.code)
          .map(r => r.id);
        
        return {
          ...building,
          classrooms: building.classrooms.filter(room => favoritedRoomIds.includes(room.id))
        };
      });
    }
    
    // Standard filtering based on mode
    if (isNow) {
      // In "Now" mode, display all buildings and classrooms without filtering
      return baseBuildings;
    } else {
      // In "Search" mode, filter buildings and classrooms based on availability
      return baseBuildings
        .map((building) => {
          // Filter classrooms in the building based on availability
          const availableClassrooms = building.classrooms.filter((room) => {
            const status = getClassroomAvailability(
              room,
              selectedStartDateTime,
              selectedEndDateTime
            );
            return status === "Available";
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
  }, [buildings, selectedStartDateTime, selectedEndDateTime, isNow, 
      showFavorites, favoriteBuildings, favoriteRooms, searchQuery]);

  // Check if a building is favorited
  const isBuildingFavorite = (buildingCode) => {
    return favoriteBuildings.some(b => b.code === buildingCode);
  };
  
  // Check if a room is favorited
  const isRoomFavorite = (roomId) => {
    return favoriteRooms.some(r => r.id === roomId);
  };
  
  // Handle toggling favorites mode
  const toggleFavoritesMode = () => {
    setShowFavorites(prev => !prev);
  };

  return (
    <div className={`sidebar ${darkMode ? 'dark-mode' : ''}`}>
      <div className="sidebar-header">
        <h2 className="sidebar-title">Rooms</h2>
        <div className="header-controls">
          <button
            className={`favorites-toggle ${showFavorites ? 'active' : ''}`}
            onClick={toggleFavoritesMode}
            title={showFavorites ? "Show all rooms" : "Show favorites"}
            aria-label={showFavorites ? "Show all rooms" : "Show favorites"}
          >
            {showFavorites ? '📋' : '⭐'}
          </button>
          <button
            className="dark-mode-toggle"
            onClick={toggleDarkMode}
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
          <button
            className="info-button"
            onClick={toggleDescription}
            aria-label="Project Description"
          >
            ⓘ
          </button>
        </div>
      </div>
      
      {/* Search Bar */}
      <div className="search-container">
        <div className="search-input-wrapper">
          <input
            type="text"
            className="search-input"
            placeholder="Search buildings or rooms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              className="clear-search" 
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
        {searchQuery && (
          <div className="search-stats">
            Found {filteredBuildings.length} buildings
          </div>
        )}
      </div>

      {showDescription && (
        <div className="project-description">
          {/* Project description content */}
          <h3>Project Description</h3>
          <p>
            UMD Classroom Search Tool to find available study and meeting spaces across campus. Features include real-time availability tracking, interactive map visualization, detailed room information, availability timeline, favorites system, and powerful search functionality.
          </p>

          <h4>Features</h4>
          <ul>
            <li>
              <strong>Real-Time Availability:</strong> View available classrooms across campus with live updates.
            </li>
            <li>
              <strong>Interactive Map:</strong> Visualize classroom locations with color-coded availability.
            </li>
            <li>
              <strong>Detailed Room Information:</strong> See capacity, room type, floor level, and available features.
            </li>
            <li>
              <strong>Availability Timeline:</strong> Visual representation of available time slots throughout the day.
            </li>
            <li>
              <strong>Dark Mode:</strong> Toggle between light and dark themes for different lighting conditions.
            </li>
            <li>
              <strong>Favorites System:</strong> Save preferred buildings and rooms for quick access.
            </li>
            <li>
              <strong>Powerful Search:</strong> Find specific buildings and rooms with real-time filtering.
            </li>
            <li>
              <strong>Responsive Design:</strong> Optimized for both desktop and mobile devices.
            </li>
          </ul>
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
          {isNow ? "Now" : "Select Date and Time Range"}
        </span>
      </div>

      {/* Toggle Switch for Map View */}
      <div className="toggle-map">
        <label className="switch">
          <input
            type="checkbox"
            checked={showMap}
            onChange={() => setShowMap((prev) => !prev)}
          />
          <span className="slider round"></span>
        </label>
        <span className="toggle-label">
          {showMap ? "Map View On" : "Map View Off"}
        </span>
      </div>

      {/* Toggle Button for Search Options */}
      {!isNow && (
        <div className="toggle-search">
          <button className="toggle-button" onClick={toggleSearchOptions}>
            {showSearchOptions ? "Hide Search Options" : "Show Search Options"}
            <span style={{ marginLeft: "10px" }}>
              {showSearchOptions ? "▲" : "▼"}
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
            value={format(selectedStartDateTime, "yyyy-MM-dd")}
            onChange={handleStartDateChangeInternal}
            dateFormat="MM-DD"
            placeholder="MM-DD"
            shouldShowCalendarButton={true}
          />

          <Label htmlFor="start-time">Select Start Time</Label>
          <TimePicker
            id="start-time"
            value={format(selectedStartDateTime, "h:mm a")}
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
            value={format(selectedEndDateTime, "yyyy-MM-dd")}
            onChange={handleEndDateChangeInternal}
            dateFormat="MM-DD"
            placeholder="MM-DD"
            shouldShowCalendarButton={true}
          />

          <Label htmlFor="end-time">Select End Time</Label>
          <TimePicker
            id="end-time"
            value={format(selectedEndDateTime, "h:mm a")}
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
        <p>{showFavorites && (favoriteBuildings.length === 0 && favoriteRooms.length === 0) 
          ? "You haven't favorited any buildings or rooms yet. Click the ☆ icon next to a building or room to add it to your favorites!"
          : "No available buildings during this time range."}</p>
      ) : (
        <ul className="building-list">
          {filteredBuildings.map((building) => (
            <li
              key={building.code}
              ref={(el) => (buildingRefs.current[building.code] = el)}
              className={
                selectedBuilding && selectedBuilding.code === building.code
                  ? "selected-building"
                  : ""
              }
            >
              <div
                className={`building-name ${isBuildingFavorite(building.code) ? 'favorited' : ''}`}
                onClick={() => handleBuildingClick(building)}
              >
                <span className="building-name-text">{building.name}</span>
                <button 
                  className={`favorite-button ${isBuildingFavorite(building.code) ? 'favorited' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent building click
                    toggleFavoriteBuilding(building);
                  }}
                  title={isBuildingFavorite(building.code) ? "Remove from favorites" : "Add to favorites"}
                >
                  {isBuildingFavorite(building.code) ? '★' : '☆'}
                </button>
              </div>
              {expandedBuilding && expandedBuilding.code === building.code && (
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
                          isSelectedClassroom ? "selected-classroom" : ""
                        }
                      >
                        <div className={`classroom-item ${isRoomFavorite(room.id) ? 'favorited' : ''}`}>
                          <div className="classroom-name">{room.name}</div>
                          <div className="classroom-actions">
                            <button 
                              className={`favorite-button small ${isRoomFavorite(room.id) ? 'favorited' : ''}`}
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent classroom click
                                toggleFavoriteRoom(building, room);
                              }}
                              title={isRoomFavorite(room.id) ? "Remove from favorites" : "Add to favorites"}
                            >
                              {isRoomFavorite(room.id) ? '★' : '☆'}
                            </button>
                            <div
                              className={`availability ${availabilityStatus
                                .toLowerCase()
                                .replace(" ", "-")}`}
                            >
                              {availabilityStatus}
                            </div>
                          </div>
                        </div>
                        {isSelectedClassroom && (
                          <div className="classroom-schedule">
                            <h4>Schedule for {room.name}</h4>
                            
                            {/* Room Details Section */}
                            <div className="room-details">
                              <div className="room-details-header">
                                <h5>Room Details</h5>
                              </div>
                              
                              <div className="room-info-grid">
                                <div className="room-info-item">
                                  <span className="info-label">Type</span>
                                  <span className="info-value">{room.type || "Classroom"}</span>
                                </div>
                                <div className="room-info-item">
                                  <span className="info-label">Floor</span>
                                  <span className="info-value">
                                    {room.floor || (() => {
                                      // Split room name by spaces to get parts
                                      const parts = room.name.split(' ');
                                      
                                      // If we have at least 2 parts (building code and room number)
                                      if (parts.length >= 2) {
                                        // Get the room number part
                                        const roomNumber = parts[1];
                                        
                                        // Check if room number starts with 0
                                        if (roomNumber.startsWith('0')) {
                                          return 'Basement';
                                        }
                                        
                                        // Otherwise return first digit of room number
                                        if (/^\d/.test(roomNumber)) {
                                          return roomNumber.charAt(0);
                                        }
                                      }
                                      
                                      // Fallback to 1 if we can't determine floor
                                      return '1';
                                    })()}
                                  </span>
                                </div>
                                <div className="room-info-item">
                                  <span className="info-label">Features</span>
                                  <div className="feature-pills">
                                    <span className="feature-pill">Projector</span>
                                    <span className="feature-pill">Whiteboard</span>
                                    {room.name.includes('C') && 
                                      <span className="feature-pill">Computers</span>
                                    }
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Availability Visualization */}
                            <div className="availability-viz">
                              <h5>{isNow ? "Today's Availability" : `Availability on ${selectedStartDateTime.toLocaleDateString()}`}</h5>
                              <div className="time-blocks">
                                {Array.from({length: 16}, (_, i) => {
                                  const hour = i + 7; // Start at 7am
                                  
                                  // Check if hour is booked by an event
                                  const isBooked = classroomSchedule.some(event => {
                                    const startHour = Math.floor(parseFloat(event.time_start));
                                    const endHour = Math.ceil(parseFloat(event.time_end));
                                    return hour >= startHour && hour < endHour;
                                  });
                                  
                                  // Current time indicator
                                  const currentHour = new Date().getHours();
                                  const isCurrent = hour === currentHour;
                                  
                                  // Check if this hour is within user's selected time range (only in search mode)
                                  const isInSelectedTimeRange = !isNow && (() => {
                                    const startHour = selectedStartDateTime.getHours();
                                    const endHour = selectedEndDateTime.getHours();
                                    
                                    // If end time is on the same day
                                    if (
                                      selectedStartDateTime.toDateString() === selectedEndDateTime.toDateString() &&
                                      hour >= startHour && hour < endHour
                                    ) {
                                      return true;
                                    }
                                    return false;
                                  })();
                                  
                                  // Build tooltip text
                                  let tooltipText = `${hour > 12 ? hour - 12 : hour}${hour >= 12 ? 'pm' : 'am'}: `;
                                  if (isBooked) {
                                    tooltipText += 'Booked';
                                  } else {
                                    tooltipText += 'Available';
                                  }
                                  
                                  // Only show current time indicator in "Now" mode
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
                                      {hour === 7 || hour === 12 || hour === 17 || hour === 22 ? 
                                        <span className="hour-label">{hour > 12 ? hour - 12 : hour}{hour >= 12 ? 'pm' : 'am'}</span> 
                                        : ''}
                                    </div>
                                  );
                                })}
                              </div>
                              {!isNow && (
                                <div className="time-range-info">
                                  <div className="time-range-indicator">
                                    <span className="time-indicator selected-time-indicator"></span>
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
                                    timeRange.time_start
                                  );
                                  const eventEnd = decimalHoursToDate(
                                    isNow ? new Date() : selectedStartDateTime,
                                    timeRange.time_end
                                  );
                                  const now = new Date();
                                  const isActive =
                                    now >= eventStart && now <= eventEnd;

                                  return (
                                    <li
                                      key={index}
                                      className={isActive ? "active-event" : ""}
                                    >
                                      <strong>
                                        {decimalHoursToTimeString(
                                          timeRange.time_start
                                        )}{" "}
                                        -{" "}
                                        {decimalHoursToTimeString(
                                          timeRange.time_end
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
  showMap: PropTypes.bool.isRequired,
  setShowMap: PropTypes.func.isRequired,
  darkMode: PropTypes.bool,
  toggleDarkMode: PropTypes.func,
  favoriteBuildings: PropTypes.array,
  favoriteRooms: PropTypes.array,
  toggleFavoriteBuilding: PropTypes.func,
  toggleFavoriteRoom: PropTypes.func,
};

export default Sidebar;
