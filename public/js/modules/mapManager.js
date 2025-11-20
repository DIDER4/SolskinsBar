/**
 * Map Manager Module
 * Handles MapLibre GL map initialization and 3D building rendering
 */

export class MapManager {
  constructor(containerId, config) {
    this.map = new maplibregl.Map({
      container: containerId,
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
      center: config.center || [10.2039, 56.1629],
      zoom: config.zoom || 15,
      pitch: config.pitch || 60,
      bearing: config.bearing || -17.6,
      antialias: true
    });

    this.map.addControl(new maplibregl.NavigationControl({
      visualizePitch: true
    }), 'top-left');
  }

  /**
   * Load 3D buildings from OpenStreetMap
   * @param {Object} bounds - Geographic bounds {minLat, minLng, maxLat, maxLng}
   */
  async load3DBuildings(bounds = {minLat: 56.13, minLng: 10.15, maxLat: 56.20, maxLng: 10.26}) {
    try {
      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: `[out:json][timeout:25];
(
  way["building"](${bounds.minLat},${bounds.minLng},${bounds.maxLat},${bounds.maxLng});
  relation["building"](${bounds.minLat},${bounds.minLng},${bounds.maxLat},${bounds.maxLng});
);
out body;
>;
out skel qt;`
      });

      const data = await response.json();
      const buildings = this._convertOSMToGeoJSON(data);

      if (buildings.length > 0) {
        this.map.addSource('osm-buildings', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: buildings
          }
        });

        this.map.addLayer({
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
      }
    } catch (error) {
      console.log('Could not fetch buildings, using fallback:', error);
      this._addSimpleBuildings();
    }
  }

  /**
   * Convert OSM data to GeoJSON features
   * @private
   */
  _convertOSMToGeoJSON(data) {
    const buildings = [];
    const nodes = {};

    // Store nodes first
    data.elements.forEach(el => {
      if (el.type === 'node') {
        nodes[el.id] = [el.lon, el.lat];
      }
    });

    // Build building features
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

    return buildings;
  }

  /**
   * Add simple placeholder buildings
   * @private
   */
  _addSimpleBuildings() {
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

    this.map.addSource('simple-buildings', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: simpleBuildings
      }
    });

    this.map.addLayer({
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

  /**
   * Fly to a specific location
   */
  flyTo(lng, lat, zoom = 17) {
    this.map.flyTo({
      center: [lng, lat],
      zoom: zoom,
      pitch: 60,
      bearing: -17.6,
      duration: 2000
    });
  }

  /**
   * Set map lighting
   */
  setLight(lightConfig) {
    this.map.setLight(lightConfig);
  }

  /**
   * Get the map instance
   */
  getMap() {
    return this.map;
  }

  /**
   * Register map load callback
   */
  onLoad(callback) {
    this.map.on('load', callback);
  }
}
