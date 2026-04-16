import './ProjectDescription.css';

interface ProjectDescriptionProps {
  focusedBuildingMode: boolean;
  showDescription: boolean;
}

const ProjectDescription = ({
  focusedBuildingMode,
  showDescription,
}: ProjectDescriptionProps) => {
  if (focusedBuildingMode || !showDescription) {
    return null;
  }

  return (
    <div className="project-description">
      <h3>Project Description</h3>
      <p>
        UMD Classroom Search Tool to find available study and meeting spaces
        across campus. Features include real-time availability tracking,
        interactive map visualization, detailed room information, availability
        timeline, favorites system, and powerful search functionality.
      </p>

      <h4>Features</h4>
      <ul>
        <li>
          <strong>Real-Time Availability:</strong> View available classrooms
          across campus with live updates.
        </li>
        <li>
          <strong>Interactive Map:</strong> Visualize classroom locations with
          color-coded availability.
        </li>
        <li>
          <strong>Detailed Room Information:</strong> See capacity, room type,
          floor level, and available features.
        </li>
        <li>
          <strong>Availability Timeline:</strong> Visual representation of
          available time slots throughout the day.
        </li>
        <li>
          <strong>Dark Mode:</strong> Toggle between light and dark themes for
          different lighting conditions.
        </li>
        <li>
          <strong>Favorites System:</strong> Save preferred buildings and rooms
          for quick access.
        </li>
        <li>
          <strong>Powerful Search:</strong> Find specific buildings and rooms
          with real-time filtering.
        </li>
        <li>
          <strong>Responsive Design:</strong> Optimized for both desktop and
          mobile devices.
        </li>
      </ul>
    </div>
  );
};

export default ProjectDescription;
