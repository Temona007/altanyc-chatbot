const express = require('express');
const fs = require('fs');
const path = require('path');
const VectorService = require('../services/VectorService');

const router = express.Router();

// Initialize vector service
const vectorService = new VectorService();
vectorService.initialize();

// Simple endpoint to test listings processing
router.post('/process', async (req, res) => {
  try {
    console.log('🔄 Processing listings (simple version)...');
    
    // Create a mock listing for testing
    const mockListing = {
      id: `listing-${Date.now()}`,
      title: 'Beautiful NYC Apartment',
      price: '$2,500,000',
      address: '123 Park Avenue, New York, NY',
      beds: '3',
      baths: '2',
      sqft: '1,200',
      link: 'https://altanewyork.com/property/123',
      source: 'Alta New York Website',
      scrapedAt: new Date().toISOString()
    };

    // Create data directory if it doesn't exist
    const dataDir = path.join(__dirname, '../data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Save to file
    const filename = `alta_listings_${new Date().toISOString().split('T')[0]}.json`;
    const filepath = path.join(dataDir, filename);
    
    const listingsData = {
      scrapedAt: new Date().toISOString(),
      source: 'Alta New York Website',
      totalListings: 1,
      listings: [mockListing]
    };

    fs.writeFileSync(filepath, JSON.stringify(listingsData, null, 2));
    console.log(`💾 Saved listings to file: ${filename}`);

    // For now, skip Pinecone storage to avoid hanging
    let storedInPinecone = 0;
    console.log('⚠️ Skipping Pinecone storage for now (to avoid hanging)');

    res.json({
      success: true,
      message: 'Successfully processed 1 mock listing',
      listings: [mockListing],
      total: 1,
      filepath,
      storedInPinecone,
      processedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error in simple listings process:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      listings: []
    });
  }
});

// Endpoint to manually add stored listings to Pinecone
router.post('/add-to-pinecone', async (req, res) => {
  try {
    console.log('🔄 Adding stored listings to Pinecone...');
    
    // Read the stored listings file
    const dataDir = path.join(__dirname, '../data');
    const files = fs.readdirSync(dataDir);
    const listingFiles = files.filter(file => file.startsWith('alta_listings_') && file.endsWith('.json'));
    
    if (listingFiles.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No listing files found'
      });
    }

    const latestFile = listingFiles.sort().pop();
    const filepath = path.join(dataDir, latestFile);
    const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));

    let storedCount = 0;
    for (const listing of data.listings) {
      try {
        const listingText = `Title: ${listing.title}\nPrice: ${listing.price}\nAddress: ${listing.address}\nBedrooms: ${listing.beds}\nBathrooms: ${listing.baths}\nSquare Feet: ${listing.sqft}\nProperty Type: Real Estate Listing\nLocation: New York City\nSource: Alta New York Real Estate`;
        
        const result = await vectorService.storeDocument(
          listingText,
          {
            filename: 'alta_listings.json',
            listingId: listing.id,
            title: listing.title,
            price: listing.price,
            address: listing.address,
            beds: listing.beds,
            baths: listing.baths,
            sqft: listing.sqft,
            link: listing.link,
            source: 'Alta New York Website',
            scrapedAt: listing.scrapedAt
          }
        );

        if (result.success) {
          storedCount++;
          console.log(`✅ Stored listing in Pinecone: ${listing.title}`);
        }
      } catch (error) {
        console.error(`❌ Error storing listing ${listing.title}:`, error);
      }
    }

    res.json({
      success: true,
      message: `Successfully stored ${storedCount} out of ${data.listings.length} listings in Pinecone`,
      storedCount,
      totalListings: data.listings.length
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
