const axios = require('axios');
const fs = require('fs');
const path = require('path');

class RapidAPIService {
  constructor() {
    this.apiKey = process.env.RAPIDAPI_KEY || '0d1606010cmsha4cfc69a2af69a4p1d3a93jsn3cfd368bf60c';
    this.baseUrl = 'https://realtor16.p.rapidapi.com';
    this.hostname = 'realtor16.p.rapidapi.com';
    this.isInitialized = false;
    this.dataDir = path.join(__dirname, '../data');
  }

  async initialize() {
    try {
      console.log('🚀 Initializing RapidAPI Service...');
      
      if (!this.apiKey) {
        console.log('⚠️ RAPIDAPI_KEY not found in environment variables');
        this.isInitialized = false;
        return;
      }

      // Create data directory if it doesn't exist
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
      }

      this.isInitialized = true;
      console.log('✅ RapidAPI Service initialized successfully');
    } catch (error) {
      console.error('❌ RapidAPI Service initialization failed:', error);
      this.isInitialized = false;
    }
  }

  async fetchListings(options = {}) {
    try {
      if (!this.isInitialized) {
        console.log('⚠️ RapidAPI Service not initialized');
        return this.getMockListings(options.limit);
      }

      console.log('🔍 Fetching listings from Realtor.com API...');
      
      const {
        city = 'New York',
        state = 'NY',
        limit = 20,
        propertyType = 'residential',
        minPrice = 0,
        maxPrice = 10000000,
        searchType = 'forsale' // 'forsale', 'forrent', 'forsold'
      } = options;

      // Build search parameters for Realtor.com API
      const searchParams = new URLSearchParams({
        location: `${city}, ${state}`,
        limit: limit.toString(),
        offset: '0',
        sort: 'relevance',
        price_min: minPrice.toString(),
        price_max: maxPrice.toString(),
        property_type: propertyType,
        status: searchType
      });

      const response = await axios.get(`${this.baseUrl}/search/${searchType}?${searchParams}`, {
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': this.hostname
        },
        timeout: 30000
      });

      if (response.data && response.data.properties) {
        const properties = response.data.properties || [];
        const listings = this.formatRealtorListings(properties);
        console.log(`📊 Fetched ${listings.length} listings from Realtor.com API`);
        return {
          success: true,
          listings,
          total: listings.length,
          source: 'Realtor.com API'
        };
      } else {
        console.log('⚠️ No listings found in API response');
        return this.getMockListings(limit);
      }

    } catch (error) {
      console.error('❌ Error fetching listings from Realtor.com API:', error);
      console.log('🔄 Falling back to mock listings');
      return this.getMockListings(options.limit);
    }
  }

  formatRealtorListings(properties) {
    return properties.map((property, index) => ({
      id: property.property_id || `realtor-${Date.now()}-${index}`,
      title: property.description?.name || property.location?.address?.line || 'Property Listing',
      price: property.list_price ? `$${property.list_price.toLocaleString()}` : 'Price upon request',
      address: this.formatAddress(property.location?.address),
      beds: property.description?.beds || 'N/A',
      baths: property.description?.baths || 'N/A',
      sqft: property.description?.sqft ? `${property.description.sqft.toLocaleString()}` : 'N/A',
      link: property.rdc_web_url || property.href || null,
      source: 'Realtor.com API',
      scrapedAt: new Date().toISOString(),
      propertyType: property.description?.type || 'residential',
      lotSize: property.description?.lot_sqft ? `${property.description.lot_sqft.toLocaleString()} sqft` : 'N/A',
      yearBuilt: property.description?.year_built || 'N/A',
      photos: property.photos || [],
      rawData: property // Keep original data for reference
    }));
  }

  formatAddress(address) {
    if (!address) return 'Address not available';
    
    const parts = [];
    if (address.line) parts.push(address.line);
    if (address.city) parts.push(address.city);
    if (address.state_code) parts.push(address.state_code);
    if (address.postal_code) parts.push(address.postal_code);
    
    return parts.join(', ') || 'Address not available';
  }

  formatListings(properties) {
    // Legacy method for backward compatibility
    return this.formatRealtorListings(properties);
  }

  getMockListings(limit = 3) {
    console.log(`📋 Using mock listings (RapidAPI not available) - generating ${limit} properties`);
    
    const baseListings = [
      {
        title: 'Luxury Manhattan Apartment',
        price: '$3,200,000',
        address: '456 Park Avenue, New York, NY 10022',
        beds: '4',
        baths: '3',
        sqft: '2,100',
        link: 'https://altanewyork.com/property/456'
      },
      {
        title: 'Modern Brooklyn Condo',
        price: '$1,850,000',
        address: '789 Brooklyn Heights, Brooklyn, NY 11201',
        beds: '3',
        baths: '2',
        sqft: '1,500',
        link: 'https://altanewyork.com/property/789'
      },
      {
        title: 'Charming Upper East Side Co-op',
        price: '$2,100,000',
        address: '321 East 75th Street, New York, NY 10021',
        beds: '2',
        baths: '2',
        sqft: '1,200',
        link: 'https://altanewyork.com/property/321'
      },
      {
        title: 'Elegant Tribeca Loft',
        price: '$4,500,000',
        address: '123 Hudson Street, New York, NY 10013',
        beds: '3',
        baths: '3',
        sqft: '2,800',
        link: 'https://altanewyork.com/property/123'
      },
      {
        title: 'Soho Penthouse',
        price: '$6,200,000',
        address: '456 Spring Street, New York, NY 10012',
        beds: '4',
        baths: '4',
        sqft: '3,200',
        link: 'https://altanewyork.com/property/456'
      },
      {
        title: 'West Village Townhouse',
        price: '$8,900,000',
        address: '789 Bleecker Street, New York, NY 10014',
        beds: '5',
        baths: '4',
        sqft: '4,100',
        link: 'https://altanewyork.com/property/789'
      },
      {
        title: 'Upper West Side Classic',
        price: '$2,800,000',
        address: '321 West 79th Street, New York, NY 10024',
        beds: '3',
        baths: '2',
        sqft: '1,800',
        link: 'https://altanewyork.com/property/321'
      },
      {
        title: 'Chelsea Modern Condo',
        price: '$3,600,000',
        address: '654 10th Avenue, New York, NY 10036',
        beds: '3',
        baths: '3',
        sqft: '2,200',
        link: 'https://altanewyork.com/property/654'
      }
    ];

    const mockListings = [];
    const timestamp = Date.now();
    
    for (let i = 0; i < limit; i++) {
      const baseListing = baseListings[i % baseListings.length];
      const variation = Math.floor(i / baseListings.length);
      
      mockListings.push({
        id: `mock-${timestamp}-${i + 1}`,
        title: variation > 0 ? `${baseListing.title} (${variation + 1})` : baseListing.title,
        price: baseListing.price,
        address: baseListing.address,
        beds: baseListing.beds,
        baths: baseListing.baths,
        sqft: baseListing.sqft,
        link: baseListing.link,
        source: 'Mock Data',
        scrapedAt: new Date().toISOString()
      });
    }

    return {
      success: true,
      listings: mockListings,
      total: mockListings.length,
      source: 'Mock Data'
    };
  }

  async saveListingsToFile(listings) {
    try {
      const listingsData = {
        fetchedAt: new Date().toISOString(),
        source: 'RapidAPI',
        totalListings: listings.length,
        listings: listings
      };

      const filename = `rapidapi_listings_${new Date().toISOString().split('T')[0]}.json`;
      const filepath = path.join(this.dataDir, filename);
      
      fs.writeFileSync(filepath, JSON.stringify(listingsData, null, 2));
      console.log(`💾 Saved listings to file: ${filename}`);
      
      return {
        success: true,
        filepath,
        filename
      };
    } catch (error) {
      console.error('❌ Error saving listings to file:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getPropertyDetails(propertyId) {
    try {
      if (!this.isInitialized) {
        console.log('⚠️ RapidAPI Service not initialized');
        return { success: false, error: 'Service not initialized' };
      }

      console.log(`🔍 Fetching property details for ID: ${propertyId}`);

      const response = await axios.get(`${this.baseUrl}/property/details`, {
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': this.hostname
        },
        params: {
          property_id: propertyId
        },
        timeout: 30000
      });

      if (response.data && response.data.data) {
        console.log(`📊 Fetched property details for ${propertyId}`);
        return {
          success: true,
          property: response.data.data,
          source: 'Realtor.com API'
        };
      } else {
        return { success: false, error: 'No property details found' };
      }

    } catch (error) {
      console.error('❌ Error fetching property details:', error);
      return { success: false, error: error.message };
    }
  }

  async getMarketTrends(propertyId) {
    try {
      if (!this.isInitialized) {
        console.log('⚠️ RapidAPI Service not initialized');
        return { success: false, error: 'Service not initialized' };
      }

      console.log(`📈 Fetching market trends for property ID: ${propertyId}`);

      const response = await axios.get(`${this.baseUrl}/property/market_trends`, {
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': this.hostname
        },
        params: {
          property_id: propertyId
        },
        timeout: 30000
      });

      if (response.data && response.data.data) {
        console.log(`📊 Fetched market trends for ${propertyId}`);
        return {
          success: true,
          trends: response.data.data,
          source: 'Realtor.com API'
        };
      } else {
        return { success: false, error: 'No market trends found' };
      }

    } catch (error) {
      console.error('❌ Error fetching market trends:', error);
      return { success: false, error: error.message };
    }
  }

  async getPropertyPhotos(propertyId) {
    try {
      if (!this.isInitialized) {
        console.log('⚠️ RapidAPI Service not initialized');
        return { success: false, error: 'Service not initialized' };
      }

      console.log(`📸 Fetching photos for property ID: ${propertyId}`);

      const response = await axios.get(`${this.baseUrl}/property/photos`, {
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': this.hostname
        },
        params: {
          property_id: propertyId
        },
        timeout: 30000
      });

      if (response.data && response.data.data) {
        console.log(`📊 Fetched photos for ${propertyId}`);
        return {
          success: true,
          photos: response.data.data,
          source: 'Realtor.com API'
        };
      } else {
        return { success: false, error: 'No photos found' };
      }

    } catch (error) {
      console.error('❌ Error fetching property photos:', error);
      return { success: false, error: error.message };
    }
  }

  async getHousingMarketDetails(location) {
    try {
      if (!this.isInitialized) {
        console.log('⚠️ RapidAPI Service not initialized');
        return { success: false, error: 'Service not initialized' };
      }

      console.log(`🏠 Fetching housing market details for: ${location}`);

      const response = await axios.get(`${this.baseUrl}/housing_market_details`, {
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': this.hostname
        },
        params: {
          location: location
        },
        timeout: 30000
      });

      if (response.data && response.data.data) {
        console.log(`📊 Fetched housing market details for ${location}`);
        return {
          success: true,
          marketData: response.data.data,
          source: 'Realtor.com API'
        };
      } else {
        return { success: false, error: 'No market data found' };
      }

    } catch (error) {
      console.error('❌ Error fetching housing market details:', error);
      return { success: false, error: error.message };
    }
  }

  async getStoredListings() {
    try {
      const files = fs.readdirSync(this.dataDir);
      const listingFiles = files.filter(file => 
        file.startsWith('rapidapi_listings_') && file.endsWith('.json')
      );
      
      if (listingFiles.length === 0) {
        return { 
          success: true, 
          listings: [], 
          message: 'No listing files found' 
        };
      }

      // Get the most recent file
      const latestFile = listingFiles.sort().pop();
      const filepath = path.join(this.dataDir, latestFile);
      const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));

      return {
        success: true,
        listings: data.listings,
        total: data.totalListings,
        fetchedAt: data.fetchedAt,
        filename: latestFile
      };

    } catch (error) {
      console.error('❌ Error getting stored listings:', error);
      return {
        success: false,
        error: error.message,
        listings: []
      };
    }
  }
}

module.exports = RapidAPIService;
