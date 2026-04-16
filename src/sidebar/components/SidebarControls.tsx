import './SidebarControls.css';

interface SidebarControlsProps {
  focusedBuildingMode: boolean;
  isNow: boolean;
  showSearchOptions: boolean;
  onToggleNowMode: () => void;
  onToggleSearchOptions: () => void;
}

const SidebarControls = ({
  focusedBuildingMode,
  isNow,
  showSearchOptions,
  onToggleNowMode,
  onToggleSearchOptions,
}: SidebarControlsProps) => {
  if (focusedBuildingMode) {
    return null;
  }

  return (
    <>
      <div className="toggle-now">
        <label className="switch">
          <input type="checkbox" checked={!isNow} onChange={onToggleNowMode} />
          <span className="slider round" />
        </label>
        <span className="toggle-label">
          {isNow
            ? 'Select Date and Time Range Off'
            : 'Select Date and Time Range'}
        </span>
      </div>

      {!isNow && (
        <div className="toggle-search">
          <button className="toggle-button" onClick={onToggleSearchOptions}>
            {showSearchOptions ? 'Hide Search Options' : 'Show Search Options'}
            <span style={{ marginLeft: '10px' }}>
              {showSearchOptions ? '▲' : '▼'}
            </span>
          </button>
        </div>
      )}
    </>
  );
};

export default SidebarControls;
