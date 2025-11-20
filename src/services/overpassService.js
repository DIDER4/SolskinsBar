/**
 * Overpass API Service
 * Fetches bar/pub data from OpenStreetMap
 */

/**
 * Fetch bars and pubs from OpenStreetMap via Overpass API
 * @param {Object} bounds - Geographic bounds {minLat, minLng, maxLat, maxLng}
 * @returns {Promise<Array>} Array of bar objects
 */
async function fetchBarsFromOSM(bounds = {
  minLat: 56.13,
  minLng: 10.15,
  maxLat: 56.20,
  maxLng: 10.26
}) {
  const query = `
    [out:json][timeout:25];
    (
      node["amenity"="bar"](${bounds.minLat},${bounds.minLng},${bounds.maxLat},${bounds.maxLng});
      node["amenity"="pub"](${bounds.minLat},${bounds.minLng},${bounds.maxLat},${bounds.maxLng});
      way["amenity"="bar"](${bounds.minLat},${bounds.minLng},${bounds.maxLat},${bounds.maxLng});
      way["amenity"="pub"](${bounds.minLat},${bounds.minLng},${bounds.maxLat},${bounds.maxLng});
    );
    out body center;
  `;

  try {
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query
    });

    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.status}`);
    }

    const data = await response.json();
    return parseOSMBars(data);
  } catch (error) {
    console.error('Error fetching bars from OSM:', error);
    throw error;
  }
}

/**
 * Parse Overpass API response to bar objects
 * @param {Object} data - Overpass API JSON response
 * @returns {Array} Array of parsed bar objects
 */
function parseOSMBars(data) {
  const bars = [];
  let idCounter = 1;

  data.elements.forEach(element => {
    if ((element.type === 'node' || element.type === 'way') && element.tags) {
      const name = element.tags.name || element.tags['name:da'] || 'Unavngiven bar';
      
      // Get coordinates (center for ways, direct for nodes)
      const lat = element.lat || (element.center && element.center.lat);
      const lng = element.lon || (element.center && element.center.lon);
      
      if (!lat || !lng) return; // Skip if no coordinates
      
      // Determine bar orientation based on location
      const orientation = determineOrientation(lat, lng);
      
      // Build address from tags
      const address = buildAddress(element.tags);
      
      bars.push({
        id: idCounter++,
        navn: name,
        by: determineCityFromCoords(lat, lng),
        lat: lat,
        lng: lng,
        retning: orientation,
        amenity: element.tags.amenity,
        opening_hours: element.tags.opening_hours || null,
        website: element.tags.website || element.tags['contact:website'] || null,
        phone: element.tags.phone || element.tags['contact:phone'] || null,
        email: element.tags.email || element.tags['contact:email'] || null,
        address: address,
        description: element.tags.description || null,
        cuisine: element.tags.cuisine || null,
        outdoor_seating: element.tags.outdoor_seating || null,
        osmId: element.id,
        osmType: element.type
      });
    }
  });

  return bars;
}

/**
 * Build address string from OSM tags
 * @param {Object} tags - OSM tags
 * @returns {string|null} Formatted address or null
 */
function buildAddress(tags) {
  const parts = [];
  
  if (tags['addr:street']) {
    let street = tags['addr:street'];
    if (tags['addr:housenumber']) {
      street += ' ' + tags['addr:housenumber'];
    }
    parts.push(street);
  }
  
  if (tags['addr:postcode'] && tags['addr:city']) {
    parts.push(tags['addr:postcode'] + ' ' + tags['addr:city']);
  } else if (tags['addr:city']) {
    parts.push(tags['addr:city']);
  }
  
  return parts.length > 0 ? parts.join(', ') : null;
}

/**
 * Determine city from coordinates
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {string} City name
 */
function determineCityFromCoords(lat, lng) {
  // Aarhus city center
  if (lat >= 56.13 && lat <= 56.20 && lng >= 10.15 && lng <= 10.26) {
    return 'Aarhus';
  }
  
  // København
  if (lat >= 55.6 && lat <= 55.75 && lng >= 12.5 && lng <= 12.65) {
    return 'København';
  }
  
  // Odense
  if (lat >= 55.35 && lat <= 55.45 && lng >= 10.35 && lng <= 10.45) {
    return 'Odense';
  }
  
  // Aalborg
  if (lat >= 57.0 && lat <= 57.1 && lng >= 9.85 && lng <= 10.0) {
    return 'Aalborg';
  }
  
  return 'Ukendt';
}

/**
 * Determine bar orientation based on location
 * Uses a simple grid-based heuristic
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {string} Cardinal direction (nord/øst/syd/vest)
 */
function determineOrientation(lat, lng) {
  // Simple heuristic: divide area into quadrants
  const centerLat = 56.1629; // Aarhus center
  const centerLng = 10.2039;
  
  const latDiff = lat - centerLat;
  const lngDiff = lng - centerLng;
  
  // Determine primary orientation
  if (Math.abs(latDiff) > Math.abs(lngDiff)) {
    return latDiff > 0 ? 'nord' : 'syd';
  } else {
    return lngDiff > 0 ? 'øst' : 'vest';
  }
}

module.exports = {
  fetchBarsFromOSM,
  parseOSMBars,
  determineCityFromCoords,
  determineOrientation,
  buildAddress
};
