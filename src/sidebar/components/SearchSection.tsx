import './SearchSection.css';

interface SearchSectionProps {
  focusedBuildingMode: boolean;
  searchQuery: string;
  filteredBuildingsCount: number;
  onSearchQueryChange: (value: string) => void;
  onClearSearch: () => void;
}

const SearchSection = ({
  focusedBuildingMode,
  searchQuery,
  filteredBuildingsCount,
  onSearchQueryChange,
  onClearSearch,
}: SearchSectionProps) => {
  if (focusedBuildingMode) {
    return null;
  }

  return (
    <div className="search-container">
      <div className="search-input-wrapper">
        <input
          type="text"
          className="search-input"
          placeholder="Search buildings or rooms..."
          value={searchQuery}
          onChange={(event) => onSearchQueryChange(event.target.value)}
        />
        {searchQuery && (
          <button
            className="clear-search"
            onClick={onClearSearch}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>
      {searchQuery && (
        <div className="search-stats">
          Found {filteredBuildingsCount} buildings
        </div>
      )}
    </div>
  );
};

export default SearchSection;
