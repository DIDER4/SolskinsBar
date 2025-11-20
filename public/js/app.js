// Initialiser MapLibre GL JS kort med moderne Apple Maps-lignende stil
const map = new maplibregl.Map({
  container: 'map',
  style: {
    version: 8,
    sources: {
      'carto-light': {
        type: 'raster',
        tiles: [
          'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
          'https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
          'https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png'
        ],
        tileSize: 256,
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }
    },
    layers: [
      {
        id: 'background',
        type: 'background',
        paint: {
          'background-color': '#f0f2f5'
        }
      },
      {
        id: 'carto-base',
        type: 'raster',
        source: 'carto-light',
        minzoom: 0,
        maxzoom: 22,
        paint: {
          'raster-opacity': 0.95
        }
      }
    ],
    glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf'
  },
  center: [10.2039, 56.1629],
  zoom: 15,
  pitch: 60,
  bearing: -17.6,
  antialias: true
});

let markers = [];
let barerData = [];
let currentDate = new Date();
let searchQuery = '';

// Hent og vis barer
async function hentBarer(tidspunkt) {
  try {
    const url = tidspunkt 
      ? `/api/barer?tidspunkt=${tidspunkt}` 
      : '/api/barer';
    
    const response = await fetch(url);
    barerData = await response.json();
    
    visBarer();
    updateSunAndShadow();
  } catch (error) {
    console.error('Fejl ved hentning af barer:', error);
  }
}

// Funktion til at opdatere lys baseret på solens position
function updateSunLight() {
  const aarhusLat = 56.1629;
  const aarhusLng = 10.2039;
  
  const sunPos = SunCalc.getPosition(currentDate, aarhusLat, aarhusLng);
  const altitude = sunPos.altitude * 180 / Math.PI;
  const azimuth = sunPos.azimuth * 180 / Math.PI;
  const normalizedAzimuth = (azimuth + 180) % 360;
  
  // Justér lysfarve baseret på tid på dagen
  let lightColor;
  const hour = currentDate.getHours();
  
  if (hour >= 5 && hour < 7) {
    lightColor = '#FFB366';
  } else if (hour >= 7 && hour < 17) {
    lightColor = '#FFFBEA';
  } else if (hour >= 17 && hour < 20) {
    lightColor = '#FFB347';
  } else {
    lightColor = '#8B9DC3';
  }
  
  if (altitude > 0) {
    const lightAltitude = Math.max(altitude, 15);
    const intensity = Math.min(0.4 + (altitude / 90) * 0.5, 0.9);
    
    // Konverter til radianske polarkoordinater for position
    const azimuthRad = (normalizedAzimuth - 90) * Math.PI / 180;
    const altitudeRad = lightAltitude * Math.PI / 180;
    
    const radialDistance = 1;
    const lightPosition = [
      radialDistance * Math.cos(altitudeRad) * Math.cos(azimuthRad),
      radialDistance * Math.cos(altitudeRad) * Math.sin(azimuthRad),
      radialDistance * Math.sin(altitudeRad)
    ];
    
    map.setLight({
      anchor: 'viewport',
      color: lightColor,
      intensity: intensity,
      position: lightPosition
    });
  } else {
    // Nat
    map.setLight({
      anchor: 'viewport',
      color: '#6B7B9C',
      intensity: 0.15,
      position: [0, 0, 1]
    });
  }
}

// Opdater solens position og skygge på kortet med 3D effekt
function updateSunAndShadow() {
  updateSunLight();
}

// Helper function to show detailed popup
function showDetailedPopup(bar) {
  let popupHTML = `
    <div class="popup-content">
      <h3>${bar.navn}</h3>
      <p class="popup-city">${bar.by}</p>
  `;
  
  if (bar.address) {
    popupHTML += `<p class="popup-address"><strong>📍 Adresse:</strong><br/>${bar.address}</p>`;
  }
  
  if (bar.opening_hours) {
    const formattedHours = bar.opening_hours.replace(/;/g, '<br/>').replace(/,/g, ', ');
    popupHTML += `<p class="popup-hours"><strong>🕐 Åbningstider:</strong><br/>${formattedHours}</p>`;
  }
  
  if (bar.phone) {
    popupHTML += `<p class="popup-contact"><strong>📞 Telefon:</strong> <a href="tel:${bar.phone}">${bar.phone}</a></p>`;
  }
  
  if (bar.website) {
    popupHTML += `<p class="popup-contact"><strong>🌐 Website:</strong> <a href="${bar.website}" target="_blank">Besøg hjemmeside</a></p>`;
  }
  
  if (bar.outdoor_seating === 'yes' || bar.cuisine) {
    popupHTML += '<div class="popup-features">';
    if (bar.outdoor_seating === 'yes') {
      popupHTML += '<span class="badge badge-outdoor">🪑 Udeservering</span>';
    }
    if (bar.cuisine) {
      popupHTML += `<span class="badge badge-cuisine">🍴 ${bar.cuisine}</span>`;
    }
    popupHTML += '</div>';
  }
  
  popupHTML += '<p class="popup-sun">☀️ Denne bar har sol lige nu!</p>';
  popupHTML += '</div>';
  
  new maplibregl.Popup()
    .setLngLat([bar.lng, bar.lat])
    .setHTML(popupHTML)
    .addTo(map);
}

function visBarer() {
  const barListe = document.getElementById('barListe');
  barListe.innerHTML = '';
  
  let antalMedSol = 0;
  
  // Filtrer data - vis kun barer med sol
  const barerMedSol = barerData.filter(bar => bar.harSol);
  
  // Søgefiltrering
  let filteredBarer = barerMedSol;
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filteredBarer = barerMedSol.filter(bar => 
      bar.navn.toLowerCase().includes(query) || 
      bar.by.toLowerCase().includes(query)
    );
  }
  
  antalMedSol = barerMedSol.length;
  
  // Opret GeoJSON features for barer
  const features = barerData.map(bar => ({
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [bar.lng, bar.lat]
    },
    properties: {
      id: bar.id,
      navn: bar.navn,
      by: bar.by,
      retning: bar.retning,
      harSol: bar.harSol
    }
  }));
  
  // Opdater eller tilføj marker source
  if (map.getSource('barer')) {
    map.getSource('barer').setData({
      type: 'FeatureCollection',
      features: features
    });
  } else {
    map.addSource('barer', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: features
      }
    });
    
    // Tilføj layer for barer med sol
    map.addLayer({
      id: 'barer-med-sol',
      type: 'circle',
      source: 'barer',
      filter: ['==', ['get', 'harSol'], true],
      paint: {
        'circle-radius': 12,
        'circle-color': '#ffd700',
        'circle-stroke-color': '#ffffff',
        'circle-stroke-width': 3,
        'circle-opacity': 0.9
      }
    });
    
    // Tilføj layer for barer uden sol
    map.addLayer({
      id: 'barer-uden-sol',
      type: 'circle',
      source: 'barer',
      filter: ['==', ['get', 'harSol'], false],
      paint: {
        'circle-radius': 10,
        'circle-color': '#95a5a6',
        'circle-stroke-color': '#ffffff',
        'circle-stroke-width': 2,
        'circle-opacity': 0.5
      }
    });
    
    // Tilføj labels
    map.addLayer({
      id: 'barer-labels',
      type: 'symbol',
      source: 'barer',
      layout: {
        'text-field': ['get', 'harSol'] ? '☀️' : '🌙',
        'text-size': 16,
        'text-offset': [0, 0],
        'text-anchor': 'center'
      },
      paint: {
        'text-color': '#ffffff'
      }
    });
    
    // Tilføj click event
    map.on('click', 'barer-med-sol', (e) => {
      const coordinates = e.features[0].geometry.coordinates.slice();
      const properties = e.features[0].properties;
      
      new maplibregl.Popup()
        .setLngLat(coordinates)
        .setHTML(`
          <div style="padding: 10px;">
            <h3 style="margin: 0 0 8px 0; color: #ff6b35;">${properties.navn}</h3>
            <p style="margin: 4px 0;"><strong>By:</strong> ${properties.by}</p>
            <p style="margin: 4px 0;"><strong>Retning:</strong> ${properties.retning}</p>
            <p style="margin: 10px 0 0 0; color: #f39c12; font-weight: bold;">☀️ Denne bar har sol lige nu!</p>
          </div>
        `)
        .addTo(map);
    });
    
    map.on('click', 'barer-uden-sol', (e) => {
      const coordinates = e.features[0].geometry.coordinates.slice();
      const properties = e.features[0].properties;
      
      new maplibregl.Popup()
        .setLngLat(coordinates)
        .setHTML(`
          <div style="padding: 10px;">
            <h3 style="margin: 0 0 8px 0; color: #ff6b35;">${properties.navn}</h3>
            <p style="margin: 4px 0;"><strong>By:</strong> ${properties.by}</p>
            <p style="margin: 4px 0;"><strong>Retning:</strong> ${properties.retning}</p>
            <p style="margin: 10px 0 0 0; color: #7f8c8d; font-weight: bold;">🌙 Denne bar har ikke sol lige nu</p>
          </div>
        `)
        .addTo(map);
    });
    
    // Ændr cursor ved hover
    map.on('mouseenter', 'barer-med-sol', () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'barer-med-sol', () => {
      map.getCanvas().style.cursor = '';
    });
    map.on('mouseenter', 'barer-uden-sol', () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'barer-uden-sol', () => {
      map.getCanvas().style.cursor = '';
    });
  }
  
  // Vis kun barer med sol i listen (eller søgeresultater)
  if (filteredBarer.length === 0) {
    barListe.innerHTML = '<div class="loading">Ingen barer med sol fundet...</div>';
  } else {
    filteredBarer.forEach(bar => {
      const barElement = document.createElement('div');
      barElement.className = 'bar-item med-sol';
      
      // Build bar item HTML with detailed information
      let barHTML = `
        <div class="bar-header">
          <h3>
            <span class="sol-ikon">☀️</span>
            ${bar.navn}
          </h3>
        </div>
        <div class="bar-info">
          <p class="bar-meta">
            <span class="bar-city">${bar.by}</span>
            ${bar.amenity ? `<span class="bar-type">${bar.amenity === 'pub' ? 'Pub' : 'Bar'}</span>` : ''}
          </p>
      `;
      
      // Address
      if (bar.address) {
        barHTML += `
          <p class="bar-address">
            <strong>📍</strong> ${bar.address}
          </p>
        `;
      }
      
      // Opening hours
      if (bar.opening_hours) {
        const formattedHours = bar.opening_hours.replace(/;/g, '<br/>').replace(/,/g, ', ');
        barHTML += `
          <p class="bar-hours">
            <strong>🕐</strong> ${formattedHours}
          </p>
        `;
      }
      
      // Contact info
      if (bar.phone || bar.website) {
        barHTML += '<div class="bar-contact">';
        if (bar.phone) {
          barHTML += `<a href="tel:${bar.phone}" class="bar-phone">📞</a>`;
        }
        if (bar.website) {
          barHTML += `<a href="${bar.website}" target="_blank" class="bar-website">🌐</a>`;
        }
        barHTML += '</div>';
      }
      
      // Features badges
      if (bar.outdoor_seating === 'yes' || bar.cuisine) {
        barHTML += '<div class="bar-features">';
        if (bar.outdoor_seating === 'yes') {
          barHTML += '<span class="badge badge-outdoor">🪑 Udeservering</span>';
        }
        if (bar.cuisine) {
          barHTML += `<span class="badge badge-cuisine">🍴 ${bar.cuisine}</span>`;
        }
        barHTML += '</div>';
      }
      
      barHTML += '</div>'; // Close bar-info
      
      barElement.innerHTML = barHTML;
      
      barElement.addEventListener('click', () => {
        map.flyTo({
          center: [bar.lng, bar.lat],
          zoom: 17,
          pitch: 60,
          bearing: -17.6,
          duration: 2000
        });
        
        // Vis detailed popup
        setTimeout(() => {
          showDetailedPopup(bar);
        }, 2100);
      });
      
      barListe.appendChild(barElement);
    });
  }
  
  // Opdater statistik
  document.getElementById('antalMedSol').textContent = antalMedSol;
}

// Opdater tidsvisning
function updateTimeDisplay() {
  const dage = ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'];
  const måneder = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
  
  const dag = dage[currentDate.getDay()];
  const dato = currentDate.getDate();
  const måned = måneder[currentDate.getMonth()];
  const år = currentDate.getFullYear();
  
  const timer = currentDate.getHours().toString().padStart(2, '0');
  const minutter = currentDate.getMinutes().toString().padStart(2, '0');
  
  document.getElementById('datoVisning').textContent = `${dag} ${dato}. ${måned} ${år}`;
  document.getElementById('tidsVisning').textContent = `${timer}:${minutter}`;
}

// Håndter tidslinje slider
function setupTimeSlider() {
  const slider = document.getElementById('timeSlider');
  
  // Initialiser slider til nuværende tid
  const timer = currentDate.getHours();
  const minutter = currentDate.getMinutes();
  const sliderValue = (timer * 4) + Math.floor(minutter / 15); // 96 intervaller (4 per time)
  slider.value = sliderValue;
  
  slider.addEventListener('input', (e) => {
    const value = parseInt(e.target.value);
    const timer = Math.floor(value / 4);
    const minutter = (value % 4) * 15;
    
    // Behold samme dato, men opdater tid
    currentDate.setHours(timer, minutter, 0, 0);
    
    updateTimeDisplay();
    hentBarer(currentDate.toISOString());
  });
}

// Dag navigation
function setupDayNavigation() {
  document.getElementById('prevDay').addEventListener('click', () => {
    currentDate.setDate(currentDate.getDate() - 1);
    updateTimeDisplay();
    hentBarer(currentDate.toISOString());
  });
  
  document.getElementById('nextDay').addEventListener('click', () => {
    currentDate.setDate(currentDate.getDate() + 1);
    updateTimeDisplay();
    hentBarer(currentDate.toISOString());
  });
}

// Søgefunktion
function setupSearch() {
  const searchInput = document.getElementById('barSearch');
  
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    visBarer();
  });
  
  // Clear search on escape
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      searchInput.value = '';
      searchQuery = '';
      visBarer();
    }
  });
}

// Initialiser app
function init() {
  updateTimeDisplay();
  setupTimeSlider();
  setupDayNavigation();
  setupSearch();
  
  // Vent på at kortet er loadet
  map.on('load', () => {
    // Tilføj OSM bygninger som GeoJSON med høj zoom for 3D effekt
    // Dette tilføjer realistiske 3D bygninger baseret på OSM data
    // Udvidet område til at dække hele Aarhus by
    fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: `[out:json][timeout:25];
(
  way["building"](56.13,10.15,56.20,10.26);
  relation["building"](56.13,10.15,56.20,10.26);
);
out body;
>;
out skel qt;`
    })
    .then(response => response.json())
    .then(data => {
      // Konverter OSM data til GeoJSON features
      const buildings = [];
      const nodes = {};
      
      // Gem nodes først
      data.elements.forEach(el => {
        if (el.type === 'node') {
          nodes[el.id] = [el.lon, el.lat];
        }
      });
      
      // Byg bygninger
      data.elements.forEach(el => {
        if (el.type === 'way' && el.tags && el.tags.building) {
          const coords = el.nodes.map(nodeId => nodes[nodeId]).filter(Boolean);
          if (coords.length > 2) {
            const height = parseInt(el.tags['building:levels'] || el.tags.height || 3) * 3;
            buildings.push({
              type: 'Feature',
              geometry: {
                type: 'Polygon',
                coordinates: [coords]
              },
              properties: {
                height: height,
                base_height: 0
              }
            });
          }
        }
      });
      
      if (buildings.length > 0) {
        map.addSource('osm-buildings', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: buildings
          }
        });
        
        map.addLayer({
          id: '3d-buildings',
          type: 'fill-extrusion',
          source: 'osm-buildings',
          paint: {
            'fill-extrusion-color': '#ffffff',
            'fill-extrusion-height': ['get', 'height'],
            'fill-extrusion-base': ['get', 'base_height'],
            'fill-extrusion-opacity': 0.3,
            'fill-extrusion-ambient-occlusion-intensity': 0.5,
            'fill-extrusion-ambient-occlusion-radius': 3
          }
        });
        
        // Opdater lys efter bygninger er tilføjet
        updateSunLight();
      }
    })
    .catch(error => {
      console.log('Kunne ikke hente bygninger, bruger fallback:', error);
      // Fallback: Simpel 3D box visualisering
      addSimpleBuildings();
    });
    
    // Initialiser lysindstillinger baseret på nuværende tid
    updateSunLight();
    
    // Hent barer
    hentBarer();
  });
  
  // Fallback funktion til simple 3D bygninger
  function addSimpleBuildings() {
    // Tilføj nogle simple 3D bokse som bygninger i Aarhus centrum
    const simpleBuildings = [
      {lat: 56.1575, lng: 10.2080, height: 15},
      {lat: 56.1580, lng: 10.2090, height: 20},
      {lat: 56.1570, lng: 10.2070, height: 12},
      {lat: 56.1585, lng: 10.2085, height: 18},
      {lat: 56.1565, lng: 10.2075, height: 15},
      {lat: 56.1590, lng: 10.2095, height: 25},
      {lat: 56.1560, lng: 10.2065, height: 10},
      {lat: 56.1595, lng: 10.2100, height: 22}
    ].map(b => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [b.lng, b.lat]
      },
      properties: {
        height: b.height
      }
    }));
    
    map.addSource('simple-buildings', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: simpleBuildings
      }
    });
    
    map.addLayer({
      id: '3d-buildings',
      type: 'fill-extrusion',
      source: 'simple-buildings',
      paint: {
        'fill-extrusion-color': '#ffffff',
        'fill-extrusion-height': ['get', 'height'],
        'fill-extrusion-base': 0,
        'fill-extrusion-opacity': 0.3,
        'fill-extrusion-ambient-occlusion-intensity': 0.5,
        'fill-extrusion-ambient-occlusion-radius': 3
      }
    });
  }
  
  // Tilføj navigation controls
  map.addControl(new maplibregl.NavigationControl({
    visualizePitch: true
  }), 'top-left');
}

// Start app når siden er loadet
init();
