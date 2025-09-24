const express = require('express');
const VectorService = require('../services/VectorService');

const router = express.Router();
const vectorService = new VectorService();

// Initialize vector service
vectorService.initialize();

// Semantic search
router.post('/semantic', async (req, res) => {
  try {
    const { query, topK = 5, filter = {} } = req.body;
    
    if (!query) {
      return res.status(400).json({
        error: 'Query is required'
      });
    }

    const results = await vectorService.searchSimilar(query, { topK, filter });
    
    res.json({
      success: true,
      query,
      results: results.results || [],
      totalResults: results.results?.length || 0
    });

  } catch (error) {
    console.error('Semantic search error:', error);
    res.status(500).json({
      error: 'Semantic search failed',
      message: error.message
    });
  }
});

// Exact search
router.post('/exact', async (req, res) => {
  try {
    const { query, topK = 5 } = req.body;
    
    if (!query) {
      return res.status(400).json({
        error: 'Query is required'
      });
    }

    const results = await vectorService.searchExact(query, { topK });
    
    res.json({
      success: true,
      query,
      results: results.results || [],
      totalResults: results.results?.length || 0
    });

  } catch (error) {
    console.error('Exact search error:', error);
    res.status(500).json({
      error: 'Exact search failed',
      message: error.message
    });
  }
});

// Hybrid search (combines semantic and exact)
router.post('/hybrid', async (req, res) => {
  try {
    const { query, topK = 5, semanticWeight = 0.7 } = req.body;
    
    if (!query) {
      return res.status(400).json({
        error: 'Query is required'
      });
    }

    // Perform both searches
    const [semanticResults, exactResults] = await Promise.all([
      vectorService.searchSimilar(query, { topK: Math.ceil(topK * semanticWeight) }),
      vectorService.searchExact(query, { topK: Math.ceil(topK * (1 - semanticWeight)) })
    ]);

    // Combine and deduplicate results
    const combinedResults = new Map();
    
    // Add semantic results with weighted scores
    if (semanticResults.success && semanticResults.results) {
      semanticResults.results.forEach(result => {
        combinedResults.set(result.id, {
          ...result,
          score: result.score * semanticWeight,
          searchType: 'semantic'
        });
      });
    }
    
    // Add exact results with weighted scores
    if (exactResults.success && exactResults.results) {
      exactResults.results.forEach(result => {
        const existing = combinedResults.get(result.id);
        if (existing) {
          // Combine scores if document appears in both results
          existing.score = Math.max(existing.score, result.score * (1 - semanticWeight));
          existing.searchType = 'hybrid';
        } else {
          combinedResults.set(result.id, {
            ...result,
            score: result.score * (1 - semanticWeight),
            searchType: 'exact'
          });
        }
      });
    }

    // Sort by combined score and limit results
    const finalResults = Array.from(combinedResults.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    res.json({
      success: true,
      query,
      results: finalResults,
      totalResults: finalResults.length,
      searchType: 'hybrid',
      semanticWeight
    });

  } catch (error) {
    console.error('Hybrid search error:', error);
    res.status(500).json({
      error: 'Hybrid search failed',
      message: error.message
    });
  }
});

// Get search suggestions
router.get('/suggestions', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({
        success: true,
        suggestions: []
      });
    }

    // Mock suggestions - in a real implementation, you might use a search suggestion service
    const mockSuggestions = [
      'Alta New York real estate services',
      'Steps to buying in NYC',
      'Asset-based transportation',
      'Brokerage services',
      'Equipment services',
      'Chris Kutz founder',
      'Terminal locations',
      'Fleet management',
      'Logistics solutions',
      'Transportation management system'
    ].filter(suggestion => 
      suggestion.toLowerCase().includes(q.toLowerCase())
    );

    res.json({
      success: true,
      suggestions: mockSuggestions.slice(0, 5)
    });

  } catch (error) {
    console.error('Search suggestions error:', error);
    res.status(500).json({
      error: 'Failed to get search suggestions',
      message: error.message
    });
  }
});

// Get index statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await vectorService.getIndexStats();
    
    res.json({
      success: true,
      stats: stats.stats || { totalVectors: 0 }
    });

  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      error: 'Failed to get index stats',
      message: error.message
    });
  }
});

module.exports = router;
