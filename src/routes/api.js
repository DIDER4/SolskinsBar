/**
 * API Routes
 * Defines all API endpoints for the application
 */

const express = require('express');
const router = express.Router();
const { getBarsWithSunlight, getBarSunTimes } = require('../controllers/barController');
const { clearCache } = require('../models/bars');

/**
 * GET /api/barer
 * Get all bars with sunlight information
 * Query params: tidspunkt (ISO date string, optional)
 */
router.get('/barer', async (req, res) => {
  try {
    const timestamp = req.query.tidspunkt ? new Date(req.query.tidspunkt) : new Date();
    const bars = await getBarsWithSunlight(timestamp);
    res.json(bars);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bars', message: error.message });
  }
});

/**
 * GET /api/soltider/:barId
 * Get sun times for a specific bar
 * Params: barId (number)
 */
router.get('/soltider/:barId', async (req, res) => {
  try {
    const barSunTimes = await getBarSunTimes(req.params.barId);
    
    if (!barSunTimes) {
      return res.status(404).json({ error: 'Bar ikke fundet' });
    }
    
    res.json(barSunTimes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sun times', message: error.message });
  }
});

/**
 * POST /api/barer/refresh
 * Force refresh bar data from OpenStreetMap
 */
router.post('/barer/refresh', async (req, res) => {
  try {
    clearCache();
    const timestamp = new Date();
    const bars = await getBarsWithSunlight(timestamp);
    res.json({ 
      success: true, 
      message: `Refreshed ${bars.length} bars from OpenStreetMap`,
      count: bars.length 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to refresh bars', message: error.message });
  }
});

module.exports = router;
