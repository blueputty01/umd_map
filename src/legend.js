// src/legend.js

export function addMapLegend(map) {
    const legend = document.createElement('div');
    legend.className = 'map-legend';
  
    const statuses = [
      { label: 'Available', color: 'rgb(20, 96, 28)' }, // Updated to RGB(46, 96, 28)
      { label: 'Unavailable', color: 'rgb(86, 15, 29)' }, // Updated to RGB(86, 15, 29)
    ];
  
    statuses.forEach((status) => {
      const legendItem = document.createElement('div');
      legendItem.className = 'legend-item';
  
      const colorBox = document.createElement('span');
      colorBox.className = 'color-box';
      colorBox.style.backgroundColor = status.color;
  
      const label = document.createElement('span');
      label.innerText = status.label;
  
      legendItem.appendChild(colorBox);
      legendItem.appendChild(label);
  
      legend.appendChild(legendItem);
    });
  
    map.getContainer().appendChild(legend);
}
