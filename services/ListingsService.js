const RapidAPIService = require('./RapidAPIService');
const VectorService = require('./VectorService');

class ListingsService {
  constructor() {
    this.rapidAPIService = new RapidAPIService();
    this.vectorService = new VectorService();
    this.isInitialized = false;
  }

  async initialize() {
    try {
      console.log('🚀 Initializing ListingsService...');
      
      // Initialize RapidAPI service
      await this.rapidAPIService.initialize();
      
      // Initialize vector service
      await this.vectorService.initialize();
      
      this.isInitialized = true;
      console.log('✅ ListingsService initialized successfully');
    } catch (error) {
      console.error('❌ ListingsService initialization failed:', error);
      this.isInitialized = false;
    }
  }

  async fetchAndStoreListings(options = {}) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      console.log('🔍 Fetching listings from RapidAPI...');
      
      // Fetch listings from RapidAPI
      const result = await this.rapidAPIService.fetchListings(options);
      
      if (!result.success || result.listings.length === 0) {
        console.log('⚠️ No listings found');
        return {
          success: false,
          message: 'No listings found',
          listings: []
        };
      }

      console.log(`📊 Found ${result.listings.length} listings`);

      // Save to file
      const saveResult = await this.rapidAPIService.saveListingsToFile(result.listings);
      
      // Store in Pinecone
      const storedCount = await this.storeListingsInPinecone(result.listings);
      
      return {
        success: true,
        message: `Successfully processed ${result.listings.length} listings`,
        listings: result.listings,
        filepath: saveResult.filepath,
        storedInPinecone: storedCount,
        source: result.source
      };

    } catch (error) {
      console.error('❌ Error in fetchAndStoreListings:', error);
      return {
        success: false,
        error: error.message,
        listings: []
      };
    }
  }

  async storeListingsInPinecone(listings) {
    try {
      if (!this.vectorService.isInitialized) {
        console.log('⚠️ VectorService not initialized, skipping Pinecone storage');
        return 0;
      }

      console.log('🗄️ Storing listings in Pinecone database...');
      let storedCount = 0;

      for (const listing of listings) {
        try {
          // Create a comprehensive text representation of the listing
          const listingText = this.createListingText(listing);
          
          // Store in Pinecone
          const result = await this.vectorService.storeDocument(
            listingText,
            {
              filename: 'rapidapi_listings.json',
              listingId: listing.id,
              title: listing.title,
              price: listing.price,
              address: listing.address,
              beds: listing.beds,
              baths: listing.baths,
              sqft: listing.sqft,
              link: listing.link,
              source: listing.source,
              scrapedAt: listing.scrapedAt
            }
          );

          if (result.success) {
            storedCount++;
            console.log(`✅ Stored listing: ${listing.title}`);
          } else {
            console.log(`❌ Failed to store listing: ${listing.title}`);
          }
        } catch (error) {
          console.error(`❌ Error storing listing ${listing.title}:`, error);
        }
      }

      console.log(`📊 Successfully stored ${storedCount} out of ${listings.length} listings in Pinecone`);
      return storedCount;

    } catch (error) {
      console.error('❌ Error storing listings in Pinecone:', error);
      return 0;
    }
  }

  createListingText(listing) {
    const parts = [];
    
    if (listing.title) parts.push(`Title: ${listing.title}`);
    if (listing.price) parts.push(`Price: ${listing.price}`);
    if (listing.address) parts.push(`Address: ${listing.address}`);
    if (listing.beds && listing.beds !== 'N/A') parts.push(`Bedrooms: ${listing.beds}`);
    if (listing.baths && listing.baths !== 'N/A') parts.push(`Bathrooms: ${listing.baths}`);
    if (listing.sqft && listing.sqft !== 'N/A') parts.push(`Square Feet: ${listing.sqft}`);
    
    // Add general property information
    parts.push('Property Type: Real Estate Listing');
    parts.push('Location: New York City');
    parts.push('Source: RapidAPI Real Estate Data');
    
    if (listing.link) parts.push(`More Details: ${listing.link}`);
    
    return parts.join('\n');
  }

  async getStoredListings() {
    try {
      return await this.rapidAPIService.getStoredListings();
    } catch (error) {
      console.error('❌ Error getting stored listings:', error);
      return {
        success: false,
        error: error.message,
        listings: []
      };
    }
  }

  async searchListings(query, options = {}) {
    try {
      if (!this.vectorService.isInitialized) {
        console.log('⚠️ VectorService not initialized, using file search');
        return await this.searchListingsInFiles(query);
      }

      console.log(`🔍 Searching listings in Pinecone: ${query}`);
      
      const searchResults = await this.vectorService.searchSimilar(query, {
        topK: options.limit || 10,
        filter: {
          source: 'RapidAPI'
        }
      });

      if (!searchResults.success) {
        console.log('❌ Pinecone search failed, falling back to file search');
        return await this.searchListingsInFiles(query);
      }

      return {
        success: true,
        results: searchResults.results,
        total: searchResults.results.length,
        source: 'Pinecone'
      };

    } catch (error) {
      console.error('❌ Error searching listings:', error);
      return await this.searchListingsInFiles(query);
    }
  }

  async searchListingsInFiles(query) {
    try {
      const storedListings = await this.getStoredListings();
      
      if (!storedListings.success) {
        return storedListings;
      }

      const queryLower = query.toLowerCase();
      const filteredListings = storedListings.listings.filter(listing => {
        const searchText = `${listing.title} ${listing.address} ${listing.price}`.toLowerCase();
        return searchText.includes(queryLower);
      });

      return {
        success: true,
        results: filteredListings.map(listing => ({
          id: listing.id,
          score: 0.8, // Mock score for file search
          metadata: listing
        })),
        total: filteredListings.length,
        source: 'File'
      };

    } catch (error) {
      console.error('❌ Error searching listings in files:', error);
      return {
        success: false,
        error: error.message,
        results: []
      };
    }
  }
}

module.exports = ListingsService;





