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
        I forked{' '}
        <a
          href="https://github.com/andrewxie04/umdrooms"
          target="_blank"
          rel="noopener noreferrer"
        >
          Andrew Xie's amazing UMD Rooms project
        </a>
        for accessibility and to add some features.
      </p>
    </div>
  );
};

export default ProjectDescription;
