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
      <p>I forked </p>
    </div>
  );
};

export default ProjectDescription;
