/**
 * Sun Calculator Module
 * Handles sun position calculations and lighting updates
 */

export class SunCalculator {
  constructor(mapManager, location = { lat: 56.1629, lng: 10.2039 }) {
    this.mapManager = mapManager;
    this.location = location;
  }

  /**
   * Update sun lighting based on current date/time
   */
  updateSunLight(currentDate) {
    const sunPos = SunCalc.getPosition(currentDate, this.location.lat, this.location.lng);
    const altitude = sunPos.altitude * 180 / Math.PI;
    const azimuth = sunPos.azimuth * 180 / Math.PI;
    const normalizedAzimuth = (azimuth + 180) % 360;

    const lightColor = this._getLightColor(currentDate.getHours());

    if (altitude > 0) {
      const lightAltitude = Math.max(altitude, 15);
      const intensity = Math.min(0.4 + (altitude / 90) * 0.5, 0.9);

      // Convert to radial polar coordinates
      const azimuthRad = (normalizedAzimuth - 90) * Math.PI / 180;
      const altitudeRad = lightAltitude * Math.PI / 180;

      const radialDistance = 1;
      const lightPosition = [
        radialDistance * Math.cos(altitudeRad) * Math.cos(azimuthRad),
        radialDistance * Math.cos(altitudeRad) * Math.sin(azimuthRad),
        radialDistance * Math.sin(altitudeRad)
      ];

      this.mapManager.setLight({
        anchor: 'viewport',
        color: lightColor,
        intensity: intensity,
        position: lightPosition
      });
    } else {
      // Night - dim blue light from above
      this.mapManager.setLight({
        anchor: 'viewport',
        color: '#6B7B9C',
        intensity: 0.15,
        position: [0, 0, 1]
      });
    }
  }

  /**
   * Get light color based on hour of day
   * @private
   */
  _getLightColor(hour) {
    if (hour >= 5 && hour < 7) {
      return '#FFB366'; // Dawn - orange
    } else if (hour >= 7 && hour < 17) {
      return '#FFFBEA'; // Day - white/yellow
    } else if (hour >= 17 && hour < 20) {
      return '#FFB347'; // Dusk - orange
    } else {
      return '#8B9DC3'; // Night - blue
    }
  }
}
