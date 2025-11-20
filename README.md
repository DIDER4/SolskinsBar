<img width="2545" height="1252" alt="Skærmbillede 2025-11-20 193723" src="https://github.com/user-attachments/assets/4383cd6e-3156-4441-bf36-06a915c06b59" />
<img width="2541" height="1250" alt="Skærmbillede 2025-11-20 193615" src="https://github.com/user-attachments/assets/268314cc-609f-4fd6-9fc7-ea06bcc7a29e" />
<img width="2546" height="1254" alt="Skærmbillede 2025-11-20 193652" src="https://github.com/user-attachments/assets/8c887b53-3542-4d4f-9566-ebd3627a6e9b" />




# 🌞 Solskinsbar

En avanceret web-applikation der hjælper dig med at finde barer og pubber med sol i danske byer. Projektet kombinerer real-time solberegninger med OpenStreetMap data og 3D kortvisualisering for at give den bedste oplevelse af at planlægge dit næste barbesøg i sollyset.

![Solskinsbar Preview](https://img.shields.io/badge/Status-Active-success)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![License](https://img.shields.io/badge/License-ISC-blue)

## ✨ Hovedfunktioner

- 🗺️ **3D Interaktivt Kort** - MapLibre GL JS med fuldt 3D bygningsvisualisering
- ☀️ **Real-time Solberegning** - Præcis beregning af solens position med SunCalc
- 🏢 **3D Bygninger** - Dynamisk indlæsning af bygninger fra OpenStreetMap med transparente effekter
- 🌅 **Dynamisk Belysning** - Lysscenarier der ændrer sig baseret på tidspunkt (daggry, dag, skumring, nat)
- 📍 **Live Data** - Over 150 barer og pubber fra OpenStreetMap Overpass API
- ⏰ **Tidsrejse** - Slider med 96 intervaller (15 minutters spring) til at se solforhold hele dagen
- 🔍 **Avanceret Søgning** - Live filtrering af barer efter navn eller by
- 📋 **Detaljeret Information** - Adresse, åbningstider, telefon, hjemmeside, udeservering, og madtyper
- 💎 **Glassmorphism UI** - Moderne, responsivt design med flydende kontrolpaneler
- 🔄 **Smart Caching** - 1-times cache på OSM data for optimal performance
- 📱 **Fuldt Responsivt** - Virker perfekt på desktop, tablet og mobil

## 🚀 Hurtig Start

### Forudsætninger

- Node.js 18+ installeret
- npm eller yarn package manager

### Installation

1. **Klon repository:**
```bash
git clone https://github.com/[dit-brugernavn]/solskinsbar.git
cd solskinsbar
```

2. **Installer dependencies:**
```bash
npm install
```

3. **Start applikationen:**
```bash
npm start
```

4. **Åbn i browser:**
```
http://localhost:3000
```

### Udvikling med Auto-reload

For udvikling med automatisk genstart ved filændringer:
```bash
npm run dev
```

## 📋 Teknologi Stack

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express 4.18.2
- **Template Engine:** Pug 3.0.2
- **Sun Calculations:** SunCalc 1.9.0

### Frontend
- **Map Library:** MapLibre GL JS 4.1.1
- **Architecture:** ES6 Modules (modular design)
- **Styling:** Custom CSS med glassmorphism effekter
- **Fonts:** Inter (Google Fonts)

### Data Sources
- **Bar Data:** OpenStreetMap via Overpass API
- **Map Tiles:** CartoDB Voyager (raster tiles)
- **3D Buildings:** OpenStreetMap building data via Overpass API
- **Caching:** In-memory 1-hour cache

## 🏗️ Projektstruktur

```
SolskinsBar/
├── src/                          # Backend kildekode
│   ├── config/                   
│   │   └── app.config.js        # Applikationskonfiguration
│   ├── controllers/              
│   │   └── barController.js     # Business logic for barer
│   ├── models/                   
│   │   └── bars.js              # Bar data model med OSM integration
│   ├── routes/                   
│   │   └── api.js               # API endpoint definitioner
│   └── services/                 
│       ├── sunService.js        # Solberegnings logik
│       └── overpassService.js   # OpenStreetMap data fetching
├── public/                       # Frontend statiske filer
│   ├── css/
│   │   └── style.css            # Hoved stylesheet (~750 linjer)
│   └── js/
│       ├── modules/              # ES6 moduler
│       │   ├── mapManager.js    # Kort initialisering & 3D bygninger
│       │   ├── sunCalculator.js # Solposition & belysning
│       │   └── barManager.js    # Bar data & visualisering
│       ├── app-modular.js       # Hovedindgangspunkt (modular)
│       └── app.js               # Legacy monolitisk version
├── views/                        
│   └── index.pug                # Hovedside template
├── server.js                     # Express server entry point
├── package.json                  # Dependencies og scripts
├── README.md                     # Denne fil
└── ARCHITECTURE.md               # Detaljeret arkitektur dokumentation
```

## 🔌 API Endpoints

### `GET /api/barer`
Hent alle barer med sol-information.

**Query Parameters:**
- `tidspunkt` (valgfri) - ISO 8601 dato string for specifikt tidspunkt

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
    "amenity": "bar",
    "opening_hours": "Mo-Su 10:00-23:00",
    "website": "https://example.com",
    "phone": "+45 12345678",
    "address": "Vestergade 5, 8000 Aarhus C",
    "cuisine": "danish",
    "outdoor_seating": "yes",
    "harSol": true,
    "solInfo": {
      "altitude": 45.2,
      "azimuth": 180.5
    }
  }
]
```

### `GET /api/soltider/:barId`
Hent solopgang, solnedgang og solens højdepunkt for en specifik bar.

**Response:**
```json
{
  "bar": {
    "id": 1,
    "navn": "Café Casablanca",
    "by": "Aarhus",
    "lat": 56.1572,
    "lng": 10.2085
  },
  "solopgang": "2025-11-20T07:45:23.000Z",
  "solnedgang": "2025-11-20T16:32:41.000Z",
  "solensHøjdepunkt": "2025-11-20T12:09:02.000Z"
}
```

### `POST /api/barer/refresh`
Tving genindlæsning af bar data fra OpenStreetMap (clearer cache).

**Response:**
```json
{
  "message": "Cache cleared successfully"
}
```

## 🎯 Sådan Virker Det

### Solberegning Algoritme

1. **SunCalc Integration** - Applikationen bruger SunCalc biblioteket til at beregne præcis solposition baseret på:
   - Geografiske koordinater (latitude/longitude)
   - Tidspunkt (dato + klokkeslæt)
   
2. **Retningsbestemmelse** - Hver bar har en retning (nord, syd, øst, vest) bestemt fra:
   - Bygningens orientering fra OSM data
   - Manuel fallback til vestvendt for barer uden retningsdata

3. **Solfiltrering** - En bar markeres som "med sol" hvis:
   - Solen er over horisonten (altitude > 0°)
   - Solens azimuth er inden for ±60° af barens retning
   - Dette giver en 120° "sol-korridor" for hver retning

4. **Dynamisk Belysning** - Kortets belysning opdateres baseret på:
   - **Daggry (05:00-08:00):** Orange/pink toner
   - **Dag (08:00-16:00):** Hvidt lys fra oven
   - **Skumring (16:00-20:00):** Varme orange toner
   - **Nat (20:00-05:00):** Mørkeblå/lilla ambient lys

### 3D Bygnings Rendering

1. **Data Fetching** - Henter bygningsdata fra Overpass API når kortet indlæses
2. **GeoJSON Konvertering** - Konverterer OSM way data til MapLibre-kompatibel GeoJSON
3. **Extrusion** - Bruger bygningshøjder (eller estimeret 15m) til at ekstruere 3D former
4. **Styling** - Transparente bygninger (opacity 0.6) med ambient occlusion for dybde

### OSM Data Integration

Applikationen querier OpenStreetMap Overpass API for:
- Alle `amenity=bar` nodes og ways
- Alle `amenity=pub` nodes og ways
- Inden for bounding boxes af danske byer (Aarhus, København, Odense, Aalborg)

Data caches i 1 time for at:
- Reducere API load
- Forbedre response times
- Respektere OSM rate limits

## 🎨 Arkitektur Oversigt

### Backend Lagdelt Arkitektur

```
HTTP Request
    ↓
Routes Layer (api.js)
    ↓
Controller Layer (barController.js)
    ↓
Service Layer (sunService.js, overpassService.js)
    ↓
Model Layer (bars.js)
    ↓
External APIs (Overpass API) / In-Memory Cache
    ↓
Response
```

### Frontend Modulær Arkitektur

```
app-modular.js (Entry Point)
    ↓
    ├─→ MapManager (map initialisering, 3D bygninger)
    ├─→ SunCalculator (sol position, belysning)
    ├─→ BarManager (bar data, popups)
    └─→ UIController (slider, søgning, liste)
```

**Fordele ved modulær struktur:**
- 🔧 **Lettere vedligeholdelse** - Hver modul har et enkelt ansvar
- 🧪 **Bedre testbarhed** - Isolerede moduler er lettere at teste
- 🔄 **Genanvendelighed** - Moduler kan bruges i andre projekter
- 📖 **Læsbar kode** - Klar separation of concerns

## 🛠️ Udvikling

### Tilføj Nye Byer

Rediger `src/services/overpassService.js` og tilføj bounding box:

```javascript
const CITY_BOUNDS = {
  aarhus: { south: 56.10, north: 56.20, west: 10.10, east: 10.30 },
  // Tilføj din by her:
  esbjerg: { south: 55.40, north: 55.50, west: 8.40, east: 8.50 }
};
```

### Tilpas Solfilter Tolerance

Rediger `src/services/sunService.js`:

```javascript
// Skift fra ±60° til ±45° for snævrere sol-korridor
const toleranceGrader = 45;
```

### Tilføj Nye Features til Bar Items

1. Opdater `src/services/overpassService.js` for at parse nye OSM tags
2. Udvid `public/js/app.js` `visBarer()` funktion for at vise data
3. Tilføj styling i `public/css/style.css`

### Debugging Tips

- **Backend errors:** Check terminal console hvor server kører
- **Frontend errors:** Åbn browser DevTools (F12) → Console tab
- **Network issues:** DevTools → Network tab for at inspicere API calls
- **Map rendering:** Check for MapLibre GL JS fejl i console

## 📊 Performance Optimering

- **Caching:** 1-times cache på OSM data reducerer API calls med ~99%
- **Lazy Loading:** 3D bygninger indlæses kun når kortet er klar
- **Debouncing:** Søgefunktion debounced for at undgå excessive re-renders
- **GeoJSON Clustering:** Kan tilføjes for bedre performance med mange markører

## 🐛 Fejlfinding

### Port 3000 allerede i brug
```bash
# Windows PowerShell
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force
```

### OSM API Timeout
- Check internet forbindelse
- Vent et minut (rate limiting)
- Applikationen falder automatisk tilbage til cached data

### Ingen barer vises
- Åbn browser console og check for JavaScript errors
- Verificer at `/api/barer` endpoint returnerer data
- Check at MapLibre GL JS er loaded korrekt

## 📄 Licens

Dette projekt er kun til uddannelsesmæssige formål. Må ikke distribueres.

## 🤝 Bidrag

Bidrag er velkomne! For at bidrage:

1. Fork projektet
2. Opret en feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit dine ændringer (`git commit -m 'Add some AmazingFeature'`)
4. Push til branch (`git push origin feature/AmazingFeature`)
5. Åbn en Pull Request

## 📞 Support

Hvis du har spørgsmål eller problemer, åbn venligst et issue på GitHub.

## 🔮 Fremtidige Features

- [ ] Live skygge sporing
- [ ] Bruger-submitted barer (crowdsourcing)
- [ ] Real-time vejrdata integration
- [ ] Filtrering efter madtyper og faciliteter
- [ ] Favoritter og bruger-profiler
- [ ] Progressive Web App (PWA) support
- [ ] Multi-sprog support (engelsk, tysk)
- [ ] Rute-planlægning til valgt bar
- [ ] Notifikationer når favorit-barer får sol

## 🙏 Anerkendelser

- [OpenStreetMap](https://www.openstreetmap.org/) for kortdata
- [MapLibre GL JS](https://maplibre.org/) for kort rendering
- [SunCalc](https://github.com/mourner/suncalc) for solberegninger
- [CartoDB](https://carto.com/) for smukke map tiles
- [Inter Font](https://fonts.google.com/specimen/Inter) fra Google Fonts

---

**Lavet med ☀️ og ❤️ for at finde de bedste solrige barer i Danmark**
