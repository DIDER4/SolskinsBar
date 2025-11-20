/**
 * Application Configuration
 */

module.exports = {
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development',
  
  // Paths
  paths: {
    views: 'views',
    public: 'public'
  },
  
  // Aarhus default coordinates
  defaultLocation: {
    lat: 56.1629,
    lng: 10.2039,
    city: 'Aarhus'
  }
};
