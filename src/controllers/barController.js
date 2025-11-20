/**
 * Bar Controller
 * Business logic for bar-related operations
 */

const { getAllBars, getBarById } = require('../models/bars');
const { hasBarSunlight, getSunTimes, calculateBarSunInfo } = require('../services/sunService');

/**
 * Get all bars with sunlight information
 * @param {Date} timestamp - Time to check sunlight (defaults to now)
 * @returns {Promise<Array>} Array of bars with sunlight status
 */
async function getBarsWithSunlight(timestamp = new Date()) {
  const bars = await getAllBars();
  
  return bars.map(bar => {
    const sunInfo = calculateBarSunInfo(bar, timestamp);
    return {
      ...bar,
      harSol: sunInfo.hasLight,
      solInfo: sunInfo.sunPosition
    };
  });
}

/**
 * Get sun times for a specific bar
 * @param {number} barId - Bar ID
 * @returns {Promise<Object|null>} Object with bar and sun times, or null if bar not found
 */
async function getBarSunTimes(barId) {
  const bar = await getBarById(barId);
  
  if (!bar) {
    return null;
  }
  
  const today = new Date();
  const times = getSunTimes(bar.lat, bar.lng, today);
  
  return {
    bar,
    solopgang: times.sunrise,
    solnedgang: times.sunset,
    solensHøjdepunkt: times.solarNoon
  };
}

module.exports = {
  getBarsWithSunlight,
  getBarSunTimes
};
