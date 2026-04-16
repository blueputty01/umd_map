import './SidebarControls.css';

interface SidebarControlsProps {
  focusedBuildingMode: boolean;
  isNow: boolean;
  onToggleNowMode: () => void;
}

const SidebarControls = ({
  focusedBuildingMode,
  isNow,
  onToggleNowMode,
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
    </>
  );
};

export default SidebarControls;
