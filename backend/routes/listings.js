const express = require('express');
const RapidAPIService = require('../services/RapidAPIService');

const router = express.Router();

// Initialize RapidAPI service
const rapidAPIService = new RapidAPIService();

// Initialize the service
rapidAPIService.initialize();

// GET /api/listings - Fetch real estate listings
router.get('/', async (req, res) => {
  try {
    const {
      propertyType = 'all',
      priceMin = 0,
      priceMax = 50000000,
      listingStatus = 'ACTIVE',
      lat = 40.7576,
      lng = -73.9629,
      zoom = 13
    } = req.query;

    const options = {
      propertyType,
      priceMin: parseInt(priceMin),
      priceMax: parseInt(priceMax),
      listingStatus,
      center: { lat: parseFloat(lat), lng: parseFloat(lng) },
      zoom: parseInt(zoom)
    };

    console.log('🔍 Fetching listings with options:', options);

    const result = await rapidAPIService.fetchListings(options);

    if (result.success) {
      res.json({
        success: true,
        listings: result.listings,
        total: result.total,
        url: result.url,
        scrapedAt: result.scrapedAt,
        method: result.method || 'unknown'
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        listings: [],
        total: 0
      });
    }

  } catch (error) {
    console.error('❌ Error in listings endpoint:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      listings: [],
      total: 0
    });
  }
});

// GET /api/listings/search - Search listings with specific criteria
router.get('/search', async (req, res) => {
  try {
    const {
      query = '',
      minPrice = 0,
      maxPrice = 50000000,
      propertyTypes = 'all',
      neighborhoods = 'all'
    } = req.query;

    // For now, we'll use the same scraping logic but could be enhanced
    // to filter results based on the search query
    const options = {
      priceMin: parseInt(minPrice),
      priceMax: parseInt(maxPrice),
      propertyType: propertyTypes
    };

    console.log('🔍 Searching listings with query:', query, 'options:', options);

    const result = await rapidAPIService.fetchListings(options);

    if (result.success) {
      // Filter results based on search query if provided
      let filteredListings = result.listings;
      
      if (query) {
        const searchTerms = query.toLowerCase().split(' ');
        filteredListings = result.listings.filter(listing => {
          const searchText = `${listing.title} ${listing.address} ${listing.price}`.toLowerCase();
          return searchTerms.some(term => searchText.includes(term));
        });
      }

      res.json({
        success: true,
        listings: filteredListings,
        total: filteredListings.length,
        originalTotal: result.total,
        query,
        url: result.url,
        scrapedAt: result.scrapedAt
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        listings: [],
        total: 0
      });
    }

  } catch (error) {
    console.error('❌ Error in listings search endpoint:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      listings: [],
      total: 0
    });
  }
});

// GET /api/listings/url - Get the URL for the listings page
router.get('/url', (req, res) => {
  try {
    const {
      propertyType = 'all',
      priceMin = 0,
      priceMax = 50000000,
      listingStatus = 'ACTIVE',
      lat = 40.7576,
      lng = -73.9629,
      zoom = 13
    } = req.query;

    const options = {
      propertyType,
      priceMin: parseInt(priceMin),
      priceMax: parseInt(priceMax),
      listingStatus,
      center: { lat: parseFloat(lat), lng: parseFloat(lng) },
      zoom: parseInt(zoom)
    };

    const url = 'https://rapidapi.com/realty-mole-property-api/api/realty-mole-property-api';

    res.json({
      success: true,
      url,
      options
    });

  } catch (error) {
    console.error('❌ Error building listings URL:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
