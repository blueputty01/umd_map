import './SearchOptions.css';

import { format } from 'date-fns';

interface SearchOptionsProps {
  isNow: boolean;
  showSearchOptions: boolean;
  selectedStartDateTime: Date;
  selectedEndDateTime: Date;
  onStartDateChange: (value: string) => void;
  onStartTimeChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onEndTimeChange: (value: string) => void;
}

const SearchOptions = ({
  isNow,
  showSearchOptions,
  selectedStartDateTime,
  selectedEndDateTime,
  onStartDateChange,
  onStartTimeChange,
  onEndDateChange,
  onEndTimeChange,
}: SearchOptionsProps) => {
  if (isNow || !showSearchOptions) {
    return null;
  }

  return (
    <div className="search-options open">
      <label htmlFor="start-date">Select Start Date</label>
      <input
        type="date"
        id="start-date"
        value={format(selectedStartDateTime, 'yyyy-MM-dd')}
        onChange={(event) => onStartDateChange(event.target.value)}
      />

      <label htmlFor="start-time">Select Start Time</label>
      <input
        type="time"
        id="start-time"
        min="06:00"
        max="22:00"
        step="1800" // 30-minute increments
        value={format(selectedStartDateTime, 'HH:mm')}
        onChange={(event) => onStartTimeChange(event.target.value)}
      />

      <label htmlFor="end-date">Select End Date</label>
      <input
        type="date"
        id="end-date"
        min="06:00"
        max="22:00"
        step="1800" // 30-minute increments
        value={format(selectedEndDateTime, 'yyyy-MM-dd')}
        onChange={(event) => onEndDateChange(event.target.value)}
      />

      <label htmlFor="end-time">Select End Time</label>
      <input
        type="time"
        id="end-time"
        value={format(selectedEndDateTime, 'HH:mm')}
        onChange={(event) => onEndTimeChange(event.target.value)}
      />
    </div>
  );
};

export default SearchOptions;
