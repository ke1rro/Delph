class SidcDataService {
  static SIDC_VERSION = '1.0.0';
  static STORAGE_KEY = 'sidc_data';
  static VERSION_KEY = 'sidc_version';

  static instance = null;

  static getInstance() {
    if (!SidcDataService.instance) {
      SidcDataService.instance = new SidcDataService();
    }
    return SidcDataService.instance;
  }

  constructor() {
    this.data = null;
    this.loadPromise = null;
  }

  /**

   * @returns {Promise<Object>} The SIDC data
   */
  async getData() {
    if (this.data) {
      return this.data;
    }

    if (this.loadPromise) {
      return this.loadPromise;
    }

    const storedVersion = localStorage.getItem(SidcDataService.VERSION_KEY);
    const storedData = localStorage.getItem(SidcDataService.STORAGE_KEY);

    if (storedVersion === SidcDataService.SIDC_VERSION && storedData) {
      try {
        this.data = JSON.parse(storedData);
        return this.data;
      } catch (error) {
        console.error('Error parsing stored SIDC data:', error);
      }
    }

    this.loadPromise = this.fetchData();
    return this.loadPromise;
  }

  /**
   * Fetches SIDC data from server and stores in localStorage
   * @private
   * @returns {Promise<Object>} The fetched SIDC data
   */
  async fetchData() {
    try {
      console.log('Fetching SIDC data from server...');
      const response = await fetch('/sidc.json');

      if (!response.ok) {
        throw new Error(`Failed to fetch SIDC data: ${response.status}`);
      }

      const data = await response.json();

      localStorage.setItem(SidcDataService.STORAGE_KEY, JSON.stringify(data));
      localStorage.setItem(SidcDataService.VERSION_KEY, SidcDataService.SIDC_VERSION);

      this.data = data;
      this.loadPromise = null;
      return data;
    } catch (error) {
      console.error('Error fetching SIDC data:', error);
      this.loadPromise = null;
      throw error;
    }
  }

  /**
   * Force a refresh of the SIDC data
   * @returns {Promise<Object>} The freshly fetched SIDC data
   */
  async refreshData() {
    this.data = null;
    this.loadPromise = null;
    localStorage.removeItem(SidcDataService.STORAGE_KEY);
    localStorage.removeItem(SidcDataService.VERSION_KEY);
    return this.getData();
  }
}

export default SidcDataService;
