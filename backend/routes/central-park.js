const express = require('express');
const CentralParkScheduler = require('../services/CentralParkScheduler');

const router = express.Router();

// Initialize Central Park Scheduler
const centralParkScheduler = new CentralParkScheduler();

// Initialize the scheduler
centralParkScheduler.initialize();

// GET /api/central-park/status - Get scheduler status
router.get('/status', async (req, res) => {
  try {
    const status = centralParkScheduler.getStatus();
    const recentFiles = centralParkScheduler.getRecentFiles();
    
    res.json({
      success: true,
      status,
      recentFiles: recentFiles.slice(0, 10), // Last 10 files
      totalFiles: recentFiles.length
    });

  } catch (error) {
    console.error('❌ Error getting Central Park scheduler status:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/central-park/fetch - Manually trigger Central Park property fetch
router.post('/fetch', async (req, res) => {
  try {
    console.log('🔧 Manual Central Park property fetch requested');
    
    // Trigger the fetch (this runs asynchronously)
    centralParkScheduler.triggerManualFetch();
    
    res.json({
      success: true,
      message: 'Central Park property fetch triggered successfully',
      status: centralParkScheduler.getStatus()
    });

  } catch (error) {
    console.error('❌ Error triggering Central Park fetch:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/central-park/properties - Get recent Central Park properties
router.get('/properties', async (req, res) => {
  try {
    const recentFiles = centralParkScheduler.getRecentFiles();
    
    if (recentFiles.length === 0) {
      return res.json({
        success: true,
        message: 'No Central Park property files found',
        properties: [],
        totalFiles: 0
      });
    }

    // Get the most recent file
    const latestFile = recentFiles[0];
    const fs = require('fs');
    const path = require('path');
    const filepath = path.join(centralParkScheduler.dataDir, latestFile.filename);
    const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));

    res.json({
      success: true,
      latestFile: latestFile.filename,
      fetchedAt: data.fetchedAt,
      totalProperties: data.totalProperties,
      source: data.source,
      properties: data.properties,
      searchOptions: data.searchOptions,
      recentFiles: recentFiles.slice(0, 5) // Last 5 files for reference
    });

  } catch (error) {
    console.error('❌ Error getting Central Park properties:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/central-park/properties/:filename - Get specific Central Park property file
router.get('/properties/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Validate filename for security
    if (!filename.startsWith('central_park_properties_') || !filename.endsWith('.json')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid filename format'
      });
    }

    const fs = require('fs');
    const path = require('path');
    const filepath = path.join(centralParkScheduler.dataDir, filename);
    
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));

    res.json({
      success: true,
      filename,
      data
    });

  } catch (error) {
    console.error('❌ Error getting Central Park property file:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/central-park/files - Get list of all Central Park property files
router.get('/files', async (req, res) => {
  try {
    const recentFiles = centralParkScheduler.getRecentFiles();
    
    res.json({
      success: true,
      files: recentFiles,
      totalFiles: recentFiles.length
    });

  } catch (error) {
    console.error('❌ Error getting Central Park files:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;



