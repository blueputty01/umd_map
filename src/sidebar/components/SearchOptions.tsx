import './SearchOptions.css';

import { Label } from '@atlaskit/form';
import { DatePicker, TimePicker } from '@atlaskit/datetime-picker';
import { format } from 'date-fns';

interface TimeOption {
  label: string;
  value: string;
}

interface SearchOptionsProps {
  isNow: boolean;
  showSearchOptions: boolean;
  selectedStartDateTime: Date;
  selectedEndDateTime: Date;
  timeOptions: TimeOption[];
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
  timeOptions,
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
      <Label htmlFor="start-date">Select Start Date</Label>
      <DatePicker
        id="start-date"
        value={format(selectedStartDateTime, 'yyyy-MM-dd')}
        onChange={(value) => value && onStartDateChange(value)}
        dateFormat="MM-DD"
        placeholder="MM-DD"
        shouldShowCalendarButton
      />

      <Label htmlFor="start-time">Select Start Time</Label>
      <TimePicker
        id="start-time"
        value={format(selectedStartDateTime, 'h:mm a')}
        onChange={(value) => value && onStartTimeChange(value)}
        timeFormat="h:mm a"
        placeholder="h:mm a"
        selectProps={{
          options: timeOptions,
        }}
      />

      <Label htmlFor="end-date">Select End Date</Label>
      <DatePicker
        id="end-date"
        value={format(selectedEndDateTime, 'yyyy-MM-dd')}
        onChange={(value) => value && onEndDateChange(value)}
        dateFormat="MM-DD"
        placeholder="MM-DD"
        shouldShowCalendarButton
      />

      <Label htmlFor="end-time">Select End Time</Label>
      <TimePicker
        id="end-time"
        value={format(selectedEndDateTime, 'h:mm a')}
        onChange={(value) => value && onEndTimeChange(value)}
        timeFormat="h:mm a"
        placeholder="h:mm a"
        selectProps={{
          options: timeOptions,
        }}
      />
    </div>
  );
};

export default SearchOptions;
