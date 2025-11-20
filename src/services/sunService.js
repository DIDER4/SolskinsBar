/**
 * Sun Calculation Service
 * Handles all sun position and time calculations using SunCalc
 */

const SunCalc = require('suncalc');

/**
 * Cardinal direction angles (in degrees)
 */
const DIRECTIONS = {
  'nord': 0,
  'øst': 90,
  'syd': 180,
  'vest': 270
};

/**
 * Check if a bar has sunlight based on its location and orientation
 * @param {Object} bar - Bar object with lat, lng, and retning properties
 * @param {Date} timestamp - Time to check (defaults to current time)
 * @returns {boolean} True if the bar has sunlight
 */
function hasBarSunlight(bar, timestamp = new Date()) {
  const sunPos = SunCalc.getPosition(timestamp, bar.lat, bar.lng);
  const azimuth = sunPos.azimuth * 180 / Math.PI; // Convert to degrees
  const altitude = sunPos.altitude * 180 / Math.PI;
  
  // If sun is below horizon, no sunlight
  if (altitude < 0) {
    return false;
  }
  
  // Normalize azimuth to 0-360 range
  const normalizedAzimuth = (azimuth + 180) % 360;
  
  // Check if sun shines on bar's direction (±60 degrees tolerance)
  const barDirection = DIRECTIONS[bar.retning];
  const difference = Math.abs(normalizedAzimuth - barDirection);
  const adjustedDifference = Math.min(difference, 360 - difference);
  
  return adjustedDifference <= 60;
}

/**
 * Get sun position for a specific location and time
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {Date} timestamp - Time to check
 * @returns {Object} Sun position with altitude and azimuth
 */
function getSunPosition(lat, lng, timestamp = new Date()) {
  return SunCalc.getPosition(timestamp, lat, lng);
}

/**
 * Get sun times (sunrise, sunset, etc.) for a location
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {Date} date - Date to check
 * @returns {Object} Sun times object
 */
function getSunTimes(lat, lng, date = new Date()) {
  return SunCalc.getTimes(date, lat, lng);
}

/**
 * Calculate sun info for a bar
 * @param {Object} bar - Bar object
 * @param {Date} timestamp - Time to check
 * @returns {Object} Object with hasLight and sunPosition
 */
function calculateBarSunInfo(bar, timestamp = new Date()) {
  const hasLight = hasBarSunlight(bar, timestamp);
  const sunPosition = getSunPosition(bar.lat, bar.lng, timestamp);
  
  return {
    hasLight,
    sunPosition: {
      altitude: sunPosition.altitude * 180 / Math.PI,
      azimuth: sunPosition.azimuth * 180 / Math.PI
    }
  };
}

module.exports = {
  hasBarSunlight,
  getSunPosition,
  getSunTimes,
  calculateBarSunInfo
};
