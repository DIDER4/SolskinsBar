# Solskinsbar - Architecture Documentation

## 📁 Project Structure

```
SolskinsBar/
├── src/                          # Backend source code
│   ├── config/                   # Configuration files
│   │   └── app.config.js        # Application configuration
│   ├── controllers/              # Business logic controllers
│   │   └── barController.js     # Bar-related operations
│   ├── models/                   # Data models
│   │   └── bars.js              # Bar data and queries
│   ├── routes/                   # API route definitions
│   │   └── api.js               # API endpoints
│   ├── services/                 # Business services
│   │   └── sunService.js        # Sun calculation logic
│   └── utils/                    # Utility functions
├── public/                       # Frontend static files
│   ├── css/
│   │   └── style.css            # Application styles
│   └── js/
│       ├── modules/              # ES6 modules
│       │   ├── mapManager.js    # Map initialization & 3D buildings
│       │   ├── sunCalculator.js # Sun position & lighting
│       │   ├── barManager.js    # Bar data & visualization
│       │   └── uiController.js  # UI interactions
│       ├── app-modular.js       # Main app entry (modular)
│       └── app.js               # Legacy monolithic version
├── views/                        # Pug templates
│   └── index.pug                # Main page template
├── server.js                     # Express server entry point
└── package.json                  # Dependencies and scripts
```

## 🏗️ Architecture Overview

### Backend (Node.js/Express)

#### **Layered Architecture**
- **Routes** (`src/routes/`) - HTTP endpoints and request handling
- **Controllers** (`src/controllers/`) - Business logic coordination
- **Services** (`src/services/`) - Reusable business operations
- **Models** (`src/models/`) - Data access and manipulation
- **Config** (`src/config/`) - Application configuration

#### **Data Flow**
```
Request → Routes → Controllers → Services/Models → Response
```

### Frontend (Vanilla JS with ES6 Modules)

#### **Module Responsibilities**

1. **MapManager** (`mapManager.js`)
   - MapLibre GL initialization
   - 3D building rendering from OSM
   - Map interactions and navigation

2. **SunCalculator** (`sunCalculator.js`)
   - Sun position calculations using SunCalc
   - Dynamic lighting based on time of day
   - Light color adjustments (dawn/day/dusk/night)

3. **BarManager** (`barManager.js`)
   - Fetch bar data from API
   - Display bars as GeoJSON points
   - Handle bar clicks and popups

4. **UIController** (`uiController.js`)
   - Time slider management
   - Search functionality
   - Bar list rendering
   - Date navigation

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```
Uses nodemon for automatic restarts on file changes.

### Production Mode
```bash
npm start
```

## 📡 API Endpoints

### `GET /api/barer`
Get all bars with sunlight information.

**Query Parameters:**
- `tidspunkt` (optional) - ISO date string

**Response:**
```json
[
  {
    "id": 1,
    "navn": "Café Casablanca",
    "by": "Aarhus",
    "lat": 56.1572,
    "lng": 10.2085,
    "retning": "vest",
    "harSol": true,
    "solInfo": {
      "altitude": 45.2,
      "azimuth": 180.5
    }
  }
]
```

### `GET /api/soltider/:barId`
Get sunrise/sunset times for a specific bar.

**Response:**
```json
{
  "bar": { ... },
  "solopgang": "2025-11-20T07:45:00.000Z",
  "solnedgang": "2025-11-20T16:30:00.000Z",
  "solensHøjdepunkt": "2025-11-20T12:07:00.000Z"
}
```

## 🔧 Key Technologies

- **Backend:** Node.js, Express 4.18
- **View Engine:** Pug 3.0
- **Maps:** MapLibre GL JS 4.1
- **Sun Calculations:** SunCalc 1.9
- **Tiles:** CartoDB Voyager (raster)
- **3D Data:** OpenStreetMap via Overpass API

## 📦 Module Dependencies

### Backend
```
server.js → routes → controllers → services/models
```

### Frontend
```
app-modular.js → {
  mapManager,
  sunCalculator,
  barManager,
  uiController
}
```

## 🎨 Features

- ✅ Real-time sun position tracking
- ✅ 3D building visualization
- ✅ Dynamic lighting (dawn/day/dusk/night)
- ✅ Transparent buildings with ambient occlusion
- ✅ Time travel slider (24 hours)
- ✅ Search bars by name or city
- ✅ Interactive map with popups
- ✅ Responsive glassmorphism UI

## 🔄 Migration Notes

The application now supports both:
- **Modular version** (`app-modular.js`) - ES6 modules, better maintainability
- **Legacy version** (`app.js`) - Original monolithic code

To switch between versions, update the script tag in `views/index.pug`:
```pug
// Modular (recommended)
script(type='module', src='/js/app-modular.js')

// Legacy
script(src='/js/app.js')
```

## 📝 Development Guidelines

1. **Backend changes:** Modify files in `src/` directory
2. **Frontend changes:** Update modules in `public/js/modules/`
3. **Styling:** Edit `public/css/style.css`
4. **Configuration:** Update `src/config/app.config.js`
5. **New features:** Create new modules/services following existing patterns

## 🐛 Debugging

- Check browser console for frontend errors
- Server logs show backend errors
- Use `npm run dev` for hot-reloading during development
