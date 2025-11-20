/**
 * UI Controller Module
 * Handles all UI interactions and updates
 */

export class UIController {
  constructor(barManager, sunCalculator, mapManager) {
    this.barManager = barManager;
    this.sunCalculator = sunCalculator;
    this.mapManager = mapManager;
    this.currentDate = new Date();
    this.searchQuery = '';
  }

  /**
   * Initialize all UI components
   */
  init() {
    this.updateTimeDisplay();
    this.setupTimeSlider();
    this.setupDayNavigation();
    this.setupSearch();
  }

  /**
   * Update the time display
   */
  updateTimeDisplay() {
    const dage = ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'];
    const måneder = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
    
    const dag = dage[this.currentDate.getDay()];
    const dato = this.currentDate.getDate();
    const måned = måneder[this.currentDate.getMonth()];
    const år = this.currentDate.getFullYear();
    
    const timer = this.currentDate.getHours().toString().padStart(2, '0');
    const minutter = this.currentDate.getMinutes().toString().padStart(2, '0');
    
    document.getElementById('datoVisning').textContent = `${dag} ${dato}. ${måned} ${år}`;
    document.getElementById('tidsVisning').textContent = `${timer}:${minutter}`;
  }

  /**
   * Setup time slider
   */
  setupTimeSlider() {
    const slider = document.getElementById('timeSlider');
    
    // Initialize slider to current time
    const timer = this.currentDate.getHours();
    const minutter = this.currentDate.getMinutes();
    const sliderValue = (timer * 4) + Math.floor(minutter / 15); // 96 intervals (4 per hour)
    slider.value = sliderValue;
    
    slider.addEventListener('input', (e) => {
      const value = parseInt(e.target.value);
      const newTimer = Math.floor(value / 4);
      const newMinutter = (value % 4) * 15;
      
      // Keep same date, update time only
      this.currentDate.setHours(newTimer, newMinutter, 0, 0);
      
      this.updateTimeDisplay();
      this.refreshData();
    });
  }

  /**
   * Setup day navigation buttons
   */
  setupDayNavigation() {
    document.getElementById('prevDay').addEventListener('click', () => {
      this.currentDate.setDate(this.currentDate.getDate() - 1);
      this.updateTimeDisplay();
      this.refreshData();
    });
    
    document.getElementById('nextDay').addEventListener('click', () => {
      this.currentDate.setDate(this.currentDate.getDate() + 1);
      this.updateTimeDisplay();
      this.refreshData();
    });
  }

  /**
   * Setup search functionality
   */
  setupSearch() {
    const searchInput = document.getElementById('barSearch');
    
    searchInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value;
      this.updateBarList();
    });
    
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        searchInput.value = '';
        this.searchQuery = '';
        this.updateBarList();
      }
    });
  }

  /**
   * Refresh all data (bars and sun lighting)
   */
  async refreshData() {
    await this.barManager.fetchBars(this.currentDate.toISOString());
    this.updateBarList();
    this.sunCalculator.updateSunLight(this.currentDate);
  }

  /**
   * Update the bar list in the UI
   */
  updateBarList() {
    const result = this.barManager.displayBars(this.searchQuery);
    const barListe = document.getElementById('barListe');
    const antalMedSol = document.getElementById('antalMedSol');
    
    antalMedSol.textContent = result.total;
    barListe.innerHTML = '';
    
    if (result.filtered.length === 0) {
      barListe.innerHTML = '<div class="loading">Ingen barer med sol fundet...</div>';
      return;
    }
    
    result.filtered.forEach(bar => {
      const barElement = document.createElement('div');
      barElement.className = 'bar-item med-sol';
      barElement.innerHTML = `
        <h3>
          <span class="sol-ikon">☀️</span>
          ${bar.navn}
        </h3>
        <p class="by">${bar.by}</p>
        <p>Retning: ${bar.retning}</p>
      `;
      
      barElement.addEventListener('click', () => {
        this.mapManager.flyTo(bar.lng, bar.lat);
        
        setTimeout(() => {
          new maplibregl.Popup()
            .setLngLat([bar.lng, bar.lat])
            .setHTML(`
              <div style="padding: 10px;">
                <h3 style="margin: 0 0 8px 0; color: #ff6b35;">${bar.navn}</h3>
                <p style="margin: 4px 0;"><strong>By:</strong> ${bar.by}</p>
                <p style="margin: 4px 0;"><strong>Retning:</strong> ${bar.retning}</p>
                <p style="margin: 10px 0 0 0; color: #f39c12; font-weight: bold;">☀️ Denne bar har sol lige nu!</p>
              </div>
            `)
            .addTo(this.mapManager.getMap());
        }, 2100);
      });
      
      barListe.appendChild(barElement);
    });
  }

  /**
   * Get current date
   */
  getCurrentDate() {
    return this.currentDate;
  }
}
