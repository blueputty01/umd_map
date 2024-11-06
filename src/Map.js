// src/Map.js

import React, { useEffect, useRef, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "./Map.css"; // For map styles
import { getBuildingAvailability } from "./availability";
import { addMapLegend } from "./legend";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

const Map = ({
  selectedBuilding,
  onBuildingSelect,
  selectedStartDateTime,
  selectedEndDateTime,
}) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const buildingsDataRef = useRef(null); // Store buildings data
  const isMapLoadedRef = useRef(false); // Flag to check if map is loaded

  // Initialize the map
  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/remagi/cm32mhtye00ve01pd1opq9gaj", // Use your custom map style
      center: [-76.943487, 38.987822],
      zoom: 15.51,
      pitch: 49.53,
      bearing: -35.53,
    });

    mapRef.current = map;

    map.on("load", () => {
      isMapLoadedRef.current = true; // Map is fully loaded

      // Load buildings data
      fetch(process.env.PUBLIC_URL + "/buildings_data.json")
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((buildingsData) => {
          buildingsDataRef.current = buildingsData; // Store data for later use
          updateMapData(
            map,
            buildingsData,
            selectedStartDateTime,
            selectedEndDateTime,
            selectedBuilding
          );

          // Add a legend to the map
          addMapLegend(map);

          // Change the cursor to a pointer when over the dots
          map.on("mouseenter", "building-dots", () => {
            map.getCanvas().style.cursor = "pointer";
          });

          // Change it back when it leaves
          map.on("mouseleave", "building-dots", () => {
            map.getCanvas().style.cursor = "";
          });

          // Add click event listener
          map.on("click", "building-dots", (e) => {
            const features = map.queryRenderedFeatures(e.point, {
              layers: ["building-dots"],
            });

            if (features.length) {
              const clickedFeature = features[0];
              const buildingProperties = clickedFeature.properties;

              // Fly to the clicked building
              map.flyTo({
                center: clickedFeature.geometry.coordinates,
                zoom: 17,
                speed: 1.2,
                curve: 1.42,
                easing: (t) => t,
              });

              if (onBuildingSelect) {
                onBuildingSelect({
                  name: buildingProperties.name,
                  code: buildingProperties.code,
                  longitude: clickedFeature.geometry.coordinates[0],
                  latitude: clickedFeature.geometry.coordinates[1],
                });
              }
            }
          });
        })
        .catch((error) => console.error("Error loading building data:", error));
    });

    // Clean up on unmount
    return () => map.remove();
  }, []); // Empty dependency array ensures this runs once

  // Update map data when selectedStartDateTime, selectedEndDateTime, or selectedBuilding changes
  useEffect(() => {
    if (isMapLoadedRef.current && mapRef.current && buildingsDataRef.current) {
      if (mapRef.current.isStyleLoaded()) {
        updateMapData(
          mapRef.current,
          buildingsDataRef.current,
          selectedStartDateTime,
          selectedEndDateTime,
          selectedBuilding
        );
      } else {
        mapRef.current.once("styledata", () => {
          updateMapData(
            mapRef.current,
            buildingsDataRef.current,
            selectedStartDateTime,
            selectedEndDateTime,
            selectedBuilding
          );
        });
      }
    }
  }, [selectedStartDateTime, selectedEndDateTime, selectedBuilding]);

  // Fly to selected building when it's changed
  useEffect(() => {
    if (selectedBuilding && mapRef.current) {
      const { longitude, latitude } = selectedBuilding;
      mapRef.current.flyTo({
        center: [longitude, latitude],
        zoom: 17,
        speed: 1, // Adjust the speed for smoothness
        curve: 1.42,
        easing: (t) => t,
      });
    }
  }, [selectedBuilding]);

  const updateMapData = useCallback(
    (
      map,
      buildingsData,
      selectedStartDateTime,
      selectedEndDateTime,
      selectedBuilding
    ) => {
      const features = buildingsData.map((building, index) => {
        const availabilityStatus = getBuildingAvailability(
          building.classrooms,
          selectedStartDateTime,
          selectedEndDateTime
        );

        return {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [building.longitude, building.latitude],
          },
          properties: {
            id: index,
            name: building.name,
            code: building.code,
            availabilityStatus: availabilityStatus,
            selected:
              selectedBuilding && building.code === selectedBuilding.code
                ? true
                : false,
          },
        };
      });

      const geojson = {
        type: "FeatureCollection",
        features: features,
      };

      if (map.getSource("buildings")) {
        map.getSource("buildings").setData(geojson);
      } else {
        map.addSource("buildings", {
          type: "geojson",
          data: geojson,
        });

        // Define colors based on availability status and selection
        const getColorExpression = [
          "case",
          ["get", "selected"],
          "black", // Black color for selected building
          [
            "match",
            ["get", "availabilityStatus"],
            "Available",
            "#39FF14", // Neon green
            "Unavailable",
            "#FF073A", // Neon red
            "No availability data",
            "#808080", // Gray
            "#808080", // Default to gray
          ],
        ];

        // Add the glow layer with adjusted properties
        map.addLayer({
          id: "building-dots-glow",
          type: "circle",
          source: "buildings",
          paint: {
            "circle-radius": 10, // Increase size for better visibility
            "circle-color": getColorExpression,
            "circle-opacity": 0.8, // Increase opacity
            "circle-blur": 0.5, // Adjust blur for glow effect
          },
        });

        // Add the inner dot layer with neon colors
        map.addLayer({
          id: "building-dots",
          type: "circle",
          source: "buildings",
          paint: {
            "circle-radius": 5, // Adjust size of inner dot
            "circle-color": getColorExpression,
            "circle-stroke-width": 1,
            "circle-stroke-color": "#FFFFFF", // White stroke for contrast
            "circle-opacity": 1,
          },
        });
      }
    },
    []
  );

  // Handler for the Recenter button
  const handleRecenter = () => {
    if (mapRef.current) {
      // Set the initial coordinates here
      const initialCenter = [-76.943487, 38.987822];
      mapRef.current.flyTo({
        center: initialCenter,
        zoom: 15.7,
        speed: 1.2,
        curve: 1.42,
        easing: (t) => t,
      });
    }
  };

  return (
    <div className="map-wrapper">
      <div className="map-inner-container" ref={mapContainerRef} />
      {/* Recenter Button */}
      <button
        className="map-recenter-button"
        title="Recenter map"
        onClick={handleRecenter}
      >
        📍
      </button>
    </div>
  );
};

export default Map;
