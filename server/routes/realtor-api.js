const express = require('express');
const RapidAPIService = require('../services/RapidAPIService');

const router = express.Router();

// Initialize RapidAPI service
const rapidAPIService = new RapidAPIService();

// Initialize the service
rapidAPIService.initialize();

// GET /api/realtor/property/:id - Get detailed property information
router.get('/property/:id', async (req, res) => {
  try {
    const { id: propertyId } = req.params;
    
    console.log(`🔍 Fetching property details for ID: ${propertyId}`);

    const result = await rapidAPIService.getPropertyDetails(propertyId);

    if (result.success) {
      res.json({
        success: true,
        property: result.property,
        source: result.source
      });
    } else {
      res.status(404).json({
        success: false,
        error: result.error
      });
    }

  } catch (error) {
    console.error('❌ Error in property details endpoint:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/realtor/property/:id/trends - Get market trends for a property
router.get('/property/:id/trends', async (req, res) => {
  try {
    const { id: propertyId } = req.params;
    
    console.log(`📈 Fetching market trends for property ID: ${propertyId}`);

    const result = await rapidAPIService.getMarketTrends(propertyId);

    if (result.success) {
      res.json({
        success: true,
        trends: result.trends,
        source: result.source
      });
    } else {
      res.status(404).json({
        success: false,
        error: result.error
      });
    }

  } catch (error) {
    console.error('❌ Error in market trends endpoint:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/realtor/property/:id/photos - Get photos for a property
router.get('/property/:id/photos', async (req, res) => {
  try {
    const { id: propertyId } = req.params;
    
    console.log(`📸 Fetching photos for property ID: ${propertyId}`);

    const result = await rapidAPIService.getPropertyPhotos(propertyId);

    if (result.success) {
      res.json({
        success: true,
        photos: result.photos,
        source: result.source
      });
    } else {
      res.status(404).json({
        success: false,
        error: result.error
      });
    }

  } catch (error) {
    console.error('❌ Error in property photos endpoint:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/realtor/market/:location - Get housing market details for a location
router.get('/market/:location', async (req, res) => {
  try {
    const { location } = req.params;
    
    console.log(`🏠 Fetching housing market details for: ${location}`);

    const result = await rapidAPIService.getHousingMarketDetails(location);

    if (result.success) {
      res.json({
        success: true,
        marketData: result.marketData,
        source: result.source
      });
    } else {
      res.status(404).json({
        success: false,
        error: result.error
      });
    }

  } catch (error) {
    console.error('❌ Error in housing market endpoint:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/realtor/search - Search for properties with advanced filters
router.get('/search', async (req, res) => {
  try {
    const {
      location = 'New York, NY',
      searchType = 'forsale', // 'forsale', 'forrent', 'forsold'
      minPrice = 0,
      maxPrice = 10000000,
      minBeds = 0,
      maxBeds = 10,
      minBaths = 0,
      maxBaths = 10,
      propertyType = 'residential',
      limit = 20
    } = req.query;

    const options = {
      city: location.split(',')[0]?.trim() || 'New York',
      state: location.split(',')[1]?.trim() || 'NY',
      searchType,
      minPrice: parseInt(minPrice),
      maxPrice: parseInt(maxPrice),
      minBeds: parseInt(minBeds),
      maxBeds: parseInt(maxBeds),
      minBaths: parseInt(minBaths),
      maxBaths: parseInt(maxBaths),
      propertyType,
      limit: parseInt(limit)
    };

    console.log('🔍 Advanced property search with options:', options);

    const result = await rapidAPIService.fetchListings(options);

    if (result.success) {
      res.json({
        success: true,
        listings: result.listings,
        total: result.total,
        source: result.source,
        searchOptions: options
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Failed to fetch listings',
        listings: []
      });
    }

  } catch (error) {
    console.error('❌ Error in advanced search endpoint:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      listings: []
    });
  }
});

module.exports = router;


