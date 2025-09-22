const express = require('express');
const ListingsService = require('../services/ListingsService');

const router = express.Router();

// Initialize listings service
const listingsService = new ListingsService();

// Initialize the service
listingsService.initialize();

// POST /api/listings/rapidapi/process - Fetch listings from RapidAPI and store in Pinecone
router.post('/process', async (req, res) => {
  try {
    const {
      city = 'New York',
      state = 'NY',
      limit = 20,
      propertyType = 'residential',
      minPrice = 0,
      maxPrice = 10000000
    } = req.body;

    const options = {
      city,
      state,
      limit: parseInt(limit),
      propertyType,
      minPrice: parseInt(minPrice),
      maxPrice: parseInt(maxPrice)
    };

    console.log('🔄 Processing listings with RapidAPI options:', options);

    const result = await listingsService.fetchAndStoreListings(options);

    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        listings: result.listings,
        total: result.listings.length,
        filepath: result.filepath,
        storedInPinecone: result.storedInPinecone,
        source: result.source,
        processedAt: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Failed to process listings',
        listings: []
      });
    }

  } catch (error) {
    console.error('❌ Error in RapidAPI listings process endpoint:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      listings: []
    });
  }
});

// GET /api/listings/rapidapi/stored - Get stored listings from files
router.get('/stored', async (req, res) => {
  try {
    const result = await listingsService.getStoredListings();

    if (result.success) {
      res.json({
        success: true,
        listings: result.listings,
        total: result.total,
        fetchedAt: result.fetchedAt,
        filename: result.filename
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        listings: []
      });
    }

  } catch (error) {
    console.error('❌ Error getting stored listings:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      listings: []
    });
  }
});

// GET /api/listings/rapidapi/search - Search listings
router.get('/search', async (req, res) => {
  try {
    const { q: query, limit = 10 } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query parameter "q" is required'
      });
    }

    console.log(`🔍 Searching listings for: ${query}`);

    const result = await listingsService.searchListings(query, { limit: parseInt(limit) });

    if (result.success) {
      res.json({
        success: true,
        results: result.results,
        total: result.total,
        source: result.source,
        query
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        results: []
      });
    }

  } catch (error) {
    console.error('❌ Error searching listings:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      results: []
    });
  }
});

// POST /api/listings/rapidapi/add-to-pinecone - Manually add stored listings to Pinecone
router.post('/add-to-pinecone', async (req, res) => {
  try {
    console.log('🔄 Adding stored listings to Pinecone...');
    
    const storedListings = await listingsService.getStoredListings();
    
    if (!storedListings.success || storedListings.listings.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No listing files found'
      });
    }

    const storedCount = await listingsService.storeListingsInPinecone(storedListings.listings);

    res.json({
      success: true,
      message: `Successfully stored ${storedCount} out of ${storedListings.listings.length} listings in Pinecone`,
      storedCount,
      totalListings: storedListings.listings.length
    });

  } catch (error) {
    console.error('❌ Error adding listings to Pinecone:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;


