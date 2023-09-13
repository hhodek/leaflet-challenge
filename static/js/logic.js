// Function to create the legend control
function createLegendControl() {
    const legend = L.control({ position: 'bottomright' });
  
    legend.onAdd = function (map) {
      const div = L.DomUtil.create('div', 'info legend');
      div.innerHTML += '<h4>Depth Legend</h4>'; // Add the legend title
      // Loop through depthRanges and add legend items
      depthRanges.forEach((range) => {
        div.innerHTML += `<i style="background: ${range.color}"></i> ${range.label}<br>`;
      });
      return div;
    };
  
    return legend;
  }
  
  // Define depth ranges and labels with associated colors
  const depthRanges = [
    { min: 0, max: 49, label: '0 - 49 km', color: '#00FF00' }, // Green
    { min: 50, max: 100, label: '50 - 100 km', color: '#DAF7A6' }, // Light Green
    { min: 101, max: 150, label: '101 - 150 km', color: '#FFD700' }, // Gold
    { min: 151, max: 200, label: '151 - 200 km', color: '#FFC300' }, // Orange
    { min: 201, max: 300, label: '201 - 300 km', color: '#FF5733' }, // Light Red
    { min: 301, max: 400, label: '301 - 400 km', color: '#FF0000' }, // Red
    { min: 401, max: 999, label: '401+ km', color: '#800000' }, // Maroon
  ];
  
  // Function to set marker color based on earthquake depth
  function getMarkerColor(depth) {
    // Loop through depthRanges and check if depth falls within a range
    for (const range of depthRanges) {
      if (depth >= range.min && depth <= range.max) {
        return range.color;
      }
    }
    // Default color if depth doesn't match any range
    return '#000000'; // Black
  }
  
  function createMap(earthquakeMarkers, legend) {
    // Create the tile layer that will be the background of our map.
    const streetmap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    });
  
    // Create a baseMaps object to hold the streetmap layer.
    const baseMaps = {
      'Street Map': streetmap,
    };
  
    // Create an overlayMaps object to hold the earthquakeMarkers layer.
    const overlayMaps = {
      Earthquakes: earthquakeMarkers,
    };
  
    // Create the map object with options.
    const map = L.map('map', {
      center: [35, -100], // Adjust the initial center and zoom level as needed
      zoom: 4,
      layers: [streetmap, earthquakeMarkers],
    });
  
    // Create a layer control, and pass it baseMaps and overlayMaps. Add the layer control to the map.
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false,
    }).addTo(map);
  
    // Add the legend to the map.
    legend.addTo(map);
  }
  
  function createEarthquakeMarkers(earthquakeData) {
    // Initialize an array to hold earthquake markers.
    const earthquakeMarkers = [];
  
    // Loop through the earthquake data features.
    earthquakeData.features.forEach(function (feature) {
      // Extract relevant earthquake properties.
      const magnitude = feature.properties.mag;
      const depth = feature.geometry.coordinates[2];
      const coordinates = [feature.geometry.coordinates[1], feature.geometry.coordinates[0]];
  
      // Create a marker, and bind a popup with earthquake information.
      const earthquakeMarker = L.circleMarker(coordinates, {
        radius: magnitude * 3, // Adjust the marker size based on magnitude
        fillColor: getMarkerColor(depth), // Use the modified function to set marker color based on depth
        color: '#000',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8,
      }).bindPopup(
        `<strong>Magnitude:</strong> ${magnitude}<br>
         <strong>Location:</strong> ${feature.properties.place}<br>
         <strong>Depth:</strong> ${depth} km`
      );
  
      // Add the marker to the earthquakeMarkers array.
      earthquakeMarkers.push(earthquakeMarker);
    });
  
    // Create a layer group that's made from the earthquake markers array.
    const earthquakeLayer = L.layerGroup(earthquakeMarkers);
  
    // Create the legend control.
    const legend = createLegendControl();
  
    // Create the map with earthquake markers and legend.
    createMap(earthquakeLayer, legend);
  }
  
  // Perform an API call to load earthquake data from the USGS API. Call createEarthquakeMarkers when it completes.
  d3.json('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson').then(createEarthquakeMarkers);
  