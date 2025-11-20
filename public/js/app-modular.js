/**
 * Main Application Entry Point
 * Modular architecture using ES6 modules
 */

import { MapManager } from './modules/mapManager.js';
import { SunCalculator } from './modules/sunCalculator.js';
import { BarManager } from './modules/barManager.js';
import { UIController } from './modules/uiController.js';

/**
 * Application configuration
 */
const APP_CONFIG = {
  mapConfig: {
    center: [10.2039, 56.1629], // Aarhus
    zoom: 15,
    pitch: 60,
    bearing: -17.6
  },
  buildingBounds: {
    minLat: 56.13,
    minLng: 10.15,
    maxLat: 56.20,
    maxLng: 10.26
  },
  location: {
    lat: 56.1629,
    lng: 10.2039
  }
};

/**
 * Initialize the application
 */
async function initApp() {
  try {
    // Initialize map
    const mapManager = new MapManager('map', APP_CONFIG.mapConfig);
    
    // Initialize managers and controllers
    const sunCalculator = new SunCalculator(mapManager, APP_CONFIG.location);
    const barManager = new BarManager(mapManager);
    const uiController = new UIController(barManager, sunCalculator, mapManager);
    
    // Setup UI
    uiController.init();
    
    // Setup map load event
    mapManager.onLoad(async () => {
      // Load 3D buildings
      await mapManager.load3DBuildings(APP_CONFIG.buildingBounds);
      
      // Initialize sun lighting
      sunCalculator.updateSunLight(uiController.getCurrentDate());
      
      // Fetch and display bars
      await uiController.refreshData();
    });
    
    console.log('✅ Solskinsbar application initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize application:', error);
  }
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
