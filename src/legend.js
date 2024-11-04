// src/legend.js

import './legend.css'; // Import the CSS file for the legend

export function addMapLegend(map) {
  const legend = document.createElement('div');
  legend.className = 'map-legend';
  
  const statuses = [
    { label: 'Available', color: 'rgb(20, 96, 28)' },    // Greenish color
    { label: 'Unavailable', color: 'rgb(99, 0, 30)' },  // Reddish color
  ];

  statuses.forEach((status) => {
    const legendItem = document.createElement('div');
    legendItem.className = 'legend-item';

    const colorBox = document.createElement('span');
    colorBox.className = 'color-box';
    colorBox.style.backgroundColor = status.color;

    const label = document.createElement('span');
    label.className = 'legend-label'; // Apply the label class for consistent styling
    label.innerText = status.label;

    legendItem.appendChild(colorBox);
    legendItem.appendChild(label);

    legend.appendChild(legendItem);
  });

  map.getContainer().appendChild(legend);
}
