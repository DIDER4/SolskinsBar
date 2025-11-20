/**
 * Bar Manager Module
 * Handles bar data fetching and map visualization
 */

export class BarManager {
  constructor(mapManager) {
    this.mapManager = mapManager;
    this.barerData = [];
  }

  /**
   * Fetch bars from API
   */
  async fetchBars(timestamp) {
    try {
      const url = timestamp 
        ? `/api/barer?tidspunkt=${timestamp}` 
        : '/api/barer';
      
      const response = await fetch(url);
      this.barerData = await response.json();
      return this.barerData;
    } catch (error) {
      console.error('Error fetching bars:', error);
      return [];
    }
  }

  /**
   * Display bars on the map
   */
  displayBars(searchQuery = '') {
    const map = this.mapManager.getMap();
    
    // Filter bars with sun and apply search
    let filteredBars = this.barerData.filter(bar => bar.harSol);
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredBars = filteredBars.filter(bar => 
        bar.navn.toLowerCase().includes(query) || 
        bar.by.toLowerCase().includes(query)
      );
    }

    // Create GeoJSON features
    const features = this.barerData.map(bar => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [bar.lng, bar.lat]
      },
      properties: {
        ...bar
      }
    }));

    // Update or create bar source
    if (map.getSource('barer')) {
      map.getSource('barer').setData({
        type: 'FeatureCollection',
        features: features
      });
    } else {
      this._createBarLayers(features);
    }

    return {
      filtered: filteredBars,
      total: this.barerData.filter(bar => bar.harSol).length
    };
  }

  /**
   * Create bar layers on the map
   * @private
   */
  _createBarLayers(features) {
    const map = this.mapManager.getMap();

    map.addSource('barer', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: features
      }
    });

    // Bars with sun
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

    // Bars without sun
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

    // Labels
    map.addLayer({
      id: 'barer-labels',
      type: 'symbol',
      source: 'barer',
      layout: {
        'text-field': ['case', ['get', 'harSol'], '☀️', '🌙'],
        'text-size': 16,
        'text-offset': [0, 0],
        'text-anchor': 'center'
      },
      paint: {
        'text-color': '#000000'
      }
    });

    this._setupMapInteractions();
  }

  /**
   * Setup map click and hover interactions
   * @private
   */
  _setupMapInteractions() {
    const map = this.mapManager.getMap();

    // Click handlers
    map.on('click', 'barer-med-sol', (e) => {
      this._showBarPopup(e.features[0].properties, e.lngLat);
    });

    map.on('click', 'barer-uden-sol', (e) => {
      this._showBarPopup(e.features[0].properties, e.lngLat);
    });

    // Cursor changes
    ['barer-med-sol', 'barer-uden-sol'].forEach(layer => {
      map.on('mouseenter', layer, () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', layer, () => {
        map.getCanvas().style.cursor = '';
      });
    });
  }

  /**
   * Show popup for a bar
   * @private
   */
  _showBarPopup(properties, lngLat) {
    const hasLight = properties.harSol === 'true' || properties.harSol === true;
    const statusText = hasLight 
      ? '<p style="margin: 10px 0 0 0; color: #f39c12; font-weight: bold;">☀️ Denne bar har sol lige nu!</p>'
      : '<p style="margin: 10px 0 0 0; color: #7f8c8d; font-weight: bold;">🌙 Denne bar har ikke sol lige nu</p>';

    // Build additional info sections
    let additionalInfo = '';
    
    // Address
    if (properties.address && properties.address !== 'null') {
      additionalInfo += `
        <div style="margin: 8px 0; padding: 6px 0; border-top: 1px solid #eee;">
          <p style="margin: 2px 0; font-size: 0.9em;">
            <strong>📍 Adresse:</strong><br/>
            ${properties.address}
          </p>
        </div>`;
    }
    
    // Opening hours
    if (properties.opening_hours && properties.opening_hours !== 'null') {
      additionalInfo += `
        <div style="margin: 8px 0; padding: 6px 0; border-top: 1px solid #eee;">
          <p style="margin: 2px 0; font-size: 0.9em;">
            <strong>🕐 Åbningstider:</strong><br/>
            ${this._formatOpeningHours(properties.opening_hours)}
          </p>
        </div>`;
    }
    
    // Contact info
    let contactInfo = '';
    if (properties.phone && properties.phone !== 'null') {
      contactInfo += `<a href="tel:${properties.phone}" style="color: #ff6b35; text-decoration: none; margin-right: 10px;">📞 ${properties.phone}</a>`;
    }
    if (properties.website && properties.website !== 'null') {
      const displayUrl = properties.website.replace(/^https?:\/\//, '').replace(/\/$/, '');
      contactInfo += `<a href="${properties.website}" target="_blank" style="color: #ff6b35; text-decoration: none;">🌐 Website</a>`;
    }
    if (contactInfo) {
      additionalInfo += `
        <div style="margin: 8px 0; padding: 6px 0; border-top: 1px solid #eee; font-size: 0.9em;">
          ${contactInfo}
        </div>`;
    }
    
    // Additional features
    let features = '';
    if (properties.outdoor_seating === 'yes') {
      features += '<span style="display: inline-block; background: #e8f5e9; color: #2e7d32; padding: 2px 8px; border-radius: 12px; font-size: 0.85em; margin-right: 4px;">🪑 Udeservering</span>';
    }
    if (properties.cuisine && properties.cuisine !== 'null') {
      features += `<span style="display: inline-block; background: #fff3e0; color: #e65100; padding: 2px 8px; border-radius: 12px; font-size: 0.85em; margin-right: 4px;">🍴 ${properties.cuisine}</span>`;
    }
    if (features) {
      additionalInfo += `
        <div style="margin: 8px 0; padding: 6px 0;">
          ${features}
        </div>`;
    }

    new maplibregl.Popup({ maxWidth: '350px' })
      .setLngLat(lngLat)
      .setHTML(`
        <div style="padding: 12px; font-family: 'Inter', sans-serif;">
          <h3 style="margin: 0 0 8px 0; color: #ff6b35; font-size: 1.1em;">${properties.navn}</h3>
          <p style="margin: 4px 0; color: #666; font-size: 0.9em;">
            <strong>By:</strong> ${properties.by} | <strong>Type:</strong> ${properties.amenity || 'bar'}
          </p>
          ${statusText}
          ${additionalInfo}
        </div>
      `)
      .addTo(this.mapManager.getMap());
  }

  /**
   * Format opening hours for display
   * @private
   */
  _formatOpeningHours(hours) {
    // Simple formatting - replace semicolons with line breaks
    return hours.replace(/;/g, '<br/>').replace(/,/g, ', ');
  }

  /**
   * Get current bar data
   */
  getBars() {
    return this.barerData;
  }
}
