/**
 * Bar Data Model
 * Dynamic bar data from OpenStreetMap via Overpass API
 */

const { fetchBarsFromOSM } = require('../services/overpassService');

// Cache for bar data
let cachedBars = null;
let lastFetchTime = null;
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

/**
 * Get all bars (with caching)
 * @param {boolean} forceRefresh - Force refresh from OSM
 * @returns {Promise<Array>} Array of bar objects
 */
async function getAllBars(forceRefresh = false) {
  const now = Date.now();
  
  // Return cached data if available and not expired
  if (!forceRefresh && cachedBars && lastFetchTime && (now - lastFetchTime) < CACHE_DURATION) {
    return cachedBars;
  }
  
  try {
    // Fetch bars from Aarhus
    const aarhusBars = await fetchBarsFromOSM({
      minLat: 56.13,
      minLng: 10.15,
      maxLat: 56.20,
      maxLng: 10.26
    });
    
    cachedBars = aarhusBars;
    lastFetchTime = now;
    
    console.log(`✅ Fetched ${cachedBars.length} bars from OpenStreetMap`);
    return cachedBars;
  } catch (error) {
    console.error('Failed to fetch bars from OSM, using fallback data:', error);
    
    // Fallback to hardcoded data if OSM fetch fails
    if (!cachedBars) {
      cachedBars = getFallbackBars();
    }
    return cachedBars;
  }
}

/**
 * Fallback bar data (in case OSM is unavailable)
 * @returns {Array} Array of fallback bar objects
 */
function getFallbackBars() {
  return [
    { id: 1, navn: "Café Casablanca", by: "Aarhus", lat: 56.1572, lng: 10.2085, retning: "vest" },
    { id: 2, navn: "Sherlock Holmes", by: "Aarhus", lat: 56.1569, lng: 10.2079, retning: "vest" },
    { id: 3, navn: "Gyngen", by: "Aarhus", lat: 56.1566, lng: 10.2073, retning: "vest" },
    { id: 4, navn: "Café Paradis", by: "Aarhus", lat: 56.1563, lng: 10.2067, retning: "vest" },
    { id: 5, navn: "Carlton", by: "Aarhus", lat: 56.1560, lng: 10.2061, retning: "vest" },
    { id: 6, navn: "Mikkeller Aarhus", by: "Aarhus", lat: 56.1570, lng: 10.2103, retning: "syd" },
    { id: 7, navn: "Løve's Kaffebar", by: "Aarhus", lat: 56.1583, lng: 10.2087, retning: "øst" },
    { id: 8, navn: "Great Coffee", by: "Aarhus", lat: 56.1577, lng: 10.2095, retning: "syd" },
    { id: 9, navn: "Café Møllen", by: "Aarhus", lat: 56.1590, lng: 10.2075, retning: "vest" },
    { id: 10, navn: "La Cabra", by: "Aarhus", lat: 56.1595, lng: 10.2068, retning: "nord" }
  ];
}

/**
 * Get bar by ID
 * @param {number} id - Bar ID
 * @returns {Promise<Object|undefined>} Bar object or undefined if not found
 */
async function getBarById(id) {
  const bars = await getAllBars();
  return bars.find(bar => bar.id === parseInt(id));
}

/**
 * Get bars by city
 * @param {string} city - City name
 * @returns {Promise<Array>} Array of bars in the specified city
 */
async function getBarsByCity(city) {
  const bars = await getAllBars();
  return bars.filter(bar => bar.by.toLowerCase() === city.toLowerCase());
}

/**
 * Clear cache and force refresh
 */
function clearCache() {
  cachedBars = null;
  lastFetchTime = null;
}

module.exports = {
  getAllBars,
  getBarById,
  getBarsByCity,
  clearCache
};
