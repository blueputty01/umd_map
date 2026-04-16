import './SidebarHeader.css';

import type { Building } from '../types';

interface SidebarHeaderProps {
  focusedBuildingMode: boolean;
  selectedBuilding: Building | null;
  showFavorites: boolean;
  darkMode: boolean;
  onToggleFavorites: () => void;
  onToggleDarkMode: () => void;
  onToggleDescription: () => void;
  onExitFocusMode: () => void;
}

const SidebarHeader = ({
  focusedBuildingMode,
  selectedBuilding,
  showFavorites,
  darkMode,
  onToggleFavorites,
  onToggleDarkMode,
  onToggleDescription,
  onExitFocusMode,
}: SidebarHeaderProps) => {
  return (
    <div className="sidebar-header">
      {focusedBuildingMode ? (
        <>
          <button className="back-button" onClick={onExitFocusMode}>
            ← Back to Building List
          </button>
          <h2 className="sidebar-title">
            {selectedBuilding?.name || 'Building'}
          </h2>
        </>
      ) : (
        <>
          <h2 className="sidebar-title">UMD Rooms</h2>
          <div className="header-controls">
            <button
              className={`favorites-toggle ${showFavorites ? 'active' : ''}`}
              onClick={onToggleFavorites}
              title={showFavorites ? 'Show all rooms' : 'Show favorites'}
              aria-label={showFavorites ? 'Show all rooms' : 'Show favorites'}
            >
              {showFavorites ? '📋' : '⭐'}
            </button>
            <button
              className="dark-mode-toggle"
              onClick={onToggleDarkMode}
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label={
                darkMode ? 'Switch to light mode' : 'Switch to dark mode'
              }
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
            <button
              className="info-button"
              onClick={onToggleDescription}
              aria-label="Project Description"
            >
              ⓘ
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default SidebarHeader;
