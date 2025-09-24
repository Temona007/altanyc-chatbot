const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const RapidAPIService = require('./RapidAPIService');
const VectorService = require('./VectorService');

class CentralParkScheduler {
  constructor() {
    this.rapidAPIService = new RapidAPIService();
    this.vectorService = new VectorService();
    this.dataDir = path.join(__dirname, '../data');
    this.isRunning = false;
    this.lastRun = null;
    this.nextRun = null;
    
    // Ensure data directory exists
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
    
    console.log('🚀 Initializing Central Park Scheduler...');
  }

  async initialize() {
    try {
      await this.rapidAPIService.initialize();
      await this.vectorService.initialize();
      
      // Schedule daily fetch at 9:00 AM EST
      this.scheduleDailyFetch();
      
      console.log('✅ Central Park Scheduler initialized successfully');
      console.log('📅 Scheduled to run daily at 9:00 AM EST');
      
    } catch (error) {
      console.error('❌ Central Park Scheduler initialization failed:', error);
    }
  }

  scheduleDailyFetch() {
    // Run daily at 9:00 AM EST (14:00 UTC)
    const cronExpression = '0 14 * * *';
    
    cron.schedule(cronExpression, async () => {
      console.log('🕘 Daily Central Park property fetch triggered');
      await this.fetchCentralParkProperties();
    }, {
      scheduled: true,
      timezone: "America/New_York"
    });

    // Calculate next run time
    const now = new Date();
    const nextRun = new Date(now);
    nextRun.setHours(14, 0, 0, 0); // 9:00 AM EST = 14:00 UTC
    if (nextRun <= now) {
      nextRun.setDate(nextRun.getDate() + 1);
    }
    this.nextRun = nextRun;
  }

  async fetchCentralParkProperties() {
    if (this.isRunning) {
      console.log('⚠️ Central Park fetch already running, skipping...');
      return;
    }

    this.isRunning = true;
    this.lastRun = new Date();

    try {
      console.log('🏞️ Starting Central Park property fetch...');

      // Central Park area coordinates and search parameters
      const centralParkOptions = {
        city: 'New York',
        state: 'NY',
        searchType: 'forsale',
        minPrice: 500000, // $500K minimum for Central Park area
        maxPrice: 50000000, // $50M maximum
        minBeds: 1,
        maxBeds: 10,
        minBaths: 1,
        maxBaths: 10,
        propertyType: 'residential',
        limit: 1000, // Fetch up to 1000 properties
        // Central Park area coordinates (approximate bounding box)
        center: {
          lat: 40.7829, // Central Park center latitude
          lng: -73.9654  // Central Park center longitude
        },
        zoom: 13,
        // Define Central Park area boundary
        boundary: [
          [
            [40.8000, -73.9800], // Northwest corner
            [40.8000, -73.9500], // Northeast corner  
            [40.7600, -73.9500], // Southeast corner
            [40.7600, -73.9800], // Southwest corner
            [40.8000, -73.9800]  // Close the polygon
          ]
        ]
      };

      console.log('🔍 Fetching Central Park area properties...');
      const result = await this.rapidAPIService.fetchListings(centralParkOptions);

      if (result.success && result.listings.length > 0) {
        console.log(`📊 Found ${result.listings.length} Central Park area properties`);

        // Save to JSON file with timestamp
        const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
        const filename = `central_park_properties_${timestamp}.json`;
        const filepath = path.join(this.dataDir, filename);

        const dataToSave = {
          fetchedAt: new Date().toISOString(),
          location: 'Central Park Area, New York, NY',
          searchOptions: centralParkOptions,
          totalProperties: result.listings.length,
          source: result.source,
          properties: result.listings
        };

        fs.writeFileSync(filepath, JSON.stringify(dataToSave, null, 2));
        console.log(`💾 Saved Central Park properties to: ${filename}`);

        // Store properties in Pinecone
        await this.storePropertiesInPinecone(result.listings, filename);

        console.log('✅ Central Park property fetch completed successfully');

      } else {
        console.log('⚠️ No Central Park properties found or API error');
        // Still save a record of the attempt
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `central_park_properties_${timestamp}.json`;
        const filepath = path.join(this.dataDir, filename);

        const dataToSave = {
          fetchedAt: new Date().toISOString(),
          location: 'Central Park Area, New York, NY',
          searchOptions: centralParkOptions,
          totalProperties: 0,
          source: result.source || 'API Error',
          properties: [],
          error: result.error || 'No properties found'
        };

        fs.writeFileSync(filepath, JSON.stringify(dataToSave, null, 2));
        console.log(`💾 Saved empty Central Park properties record to: ${filename}`);
      }

    } catch (error) {
      console.error('❌ Error fetching Central Park properties:', error);
      
      // Save error record
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `central_park_properties_${timestamp}.json`;
      const filepath = path.join(this.dataDir, filename);

      const dataToSave = {
        fetchedAt: new Date().toISOString(),
        location: 'Central Park Area, New York, NY',
        totalProperties: 0,
        properties: [],
        error: error.message
      };

      fs.writeFileSync(filepath, JSON.stringify(dataToSave, null, 2));
      console.log(`💾 Saved error record to: ${filename}`);

    } finally {
      this.isRunning = false;
    }
  }

  async storePropertiesInPinecone(properties, filename) {
    try {
      console.log('🗄️ Storing Central Park properties in Pinecone...');
      
      let storedCount = 0;
      for (const property of properties) {
        try {
          // Create a comprehensive text description for the property
          const propertyText = this.createPropertyDescription(property);
          
          // Prepare metadata, ensuring no null values
          const metadata = {
            filename: filename,
            propertyId: property.id,
            title: property.title,
            price: property.price,
            address: property.address,
            beds: property.beds,
            baths: property.baths,
            sqft: property.sqft,
            source: 'Central Park Area - Realtor.com API',
            location: 'Central Park Area, New York, NY',
            scrapedAt: property.scrapedAt,
            propertyType: property.propertyType || 'residential'
          };
          
          // Only add optional fields if they're not null
          if (property.link && property.link !== null) {
            metadata.link = property.link;
          }
          if (property.lotSize && property.lotSize !== 'N/A') {
            metadata.lotSize = property.lotSize;
          }
          if (property.yearBuilt && property.yearBuilt !== 'N/A') {
            metadata.yearBuilt = property.yearBuilt;
          }

          const result = await this.vectorService.storeDocument(
            propertyText,
            metadata
          );

          if (result.success) {
            storedCount++;
            console.log(`✅ Stored property in Pinecone: ${property.title}`);
          } else {
            console.error(`❌ Failed to store property: ${property.title}`, result.error);
          }
        } catch (error) {
          console.error(`❌ Error storing property ${property.title}:`, error);
        }
      }

      console.log(`📊 Successfully stored ${storedCount} out of ${properties.length} Central Park properties in Pinecone`);

    } catch (error) {
      console.error('❌ Error storing Central Park properties in Pinecone:', error);
    }
  }

  createPropertyDescription(property) {
    const parts = [
      `Property: ${property.title}`,
      `Price: ${property.price}`,
      `Address: ${property.address}`,
      `Bedrooms: ${property.beds}`,
      `Bathrooms: ${property.baths}`,
      `Square Feet: ${property.sqft}`,
      `Property Type: ${property.propertyType || 'residential'}`,
      `Location: Central Park Area, New York City`,
      `Lot Size: ${property.lotSize || 'N/A'}`,
      `Year Built: ${property.yearBuilt || 'N/A'}`,
      `Source: Realtor.com API`,
      `Description: Luxury property in the prestigious Central Park area of Manhattan, offering proximity to Central Park and world-class amenities.`
    ];

    return parts.join('\n');
  }

  // Manual trigger for testing
  async triggerManualFetch() {
    console.log('🔧 Manual Central Park property fetch triggered');
    await this.fetchCentralParkProperties();
  }

  // Get scheduler status
  getStatus() {
    return {
      isRunning: this.isRunning,
      lastRun: this.lastRun,
      nextRun: this.nextRun,
      dataDirectory: this.dataDir
    };
  }

  // Get recent Central Park property files
  getRecentFiles() {
    try {
      const files = fs.readdirSync(this.dataDir);
      const centralParkFiles = files
        .filter(file => file.startsWith('central_park_properties_') && file.endsWith('.json'))
        .sort()
        .reverse(); // Most recent first

      return centralParkFiles.map(filename => {
        const filepath = path.join(this.dataDir, filename);
        const stats = fs.statSync(filepath);
        const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
        
        return {
          filename,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime,
          totalProperties: data.totalProperties,
          fetchedAt: data.fetchedAt,
          source: data.source
        };
      });
    } catch (error) {
      console.error('❌ Error getting recent files:', error);
      return [];
    }
  }
}

module.exports = CentralParkScheduler;
