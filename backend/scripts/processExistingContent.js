const fs = require('fs');
const path = require('path');
const FileProcessingService = require('../services/FileProcessingService');
const VectorService = require('../services/VectorService');

async function processExistingContent() {
  console.log('🚀 Starting to process existing MadCo content...');
  
  const fileProcessingService = new FileProcessingService();
  const vectorService = new VectorService();
  
  try {
    // Initialize services
    await fileProcessingService.initialize();
    await vectorService.initialize();
    
    // Process existing content
    const results = await fileProcessingService.processExistingContent();
    
    console.log('\n📊 Processing Results:');
    console.log('====================');
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const result of results) {
      if (result.success) {
        console.log(`✅ ${result.filename}: ${result.chunks} chunks processed`);
        successCount++;
        
        // Store in vector database
        try {
          const embeddingResult = await vectorService.storeDocument(
            result.content,
            {
              filename: result.filename,
              fileType: 'text/plain',
              source: 'existing-content',
              processedAt: new Date().toISOString()
            }
          );
          
          if (embeddingResult.success) {
            console.log(`   📝 Stored in vector database`);
          } else {
            console.log(`   ⚠️  Vector storage failed: ${embeddingResult.error}`);
          }
        } catch (error) {
          console.log(`   ⚠️  Vector storage error: ${error.message}`);
        }
      } else {
        console.log(`❌ ${result.filename}: ${result.error}`);
        errorCount++;
      }
    }
    
    console.log('\n📈 Summary:');
    console.log(`✅ Successfully processed: ${successCount} files`);
    console.log(`❌ Failed to process: ${errorCount} files`);
    console.log(`📁 Total files: ${results.length}`);
    
    // Get vector database stats
    const stats = await vectorService.getIndexStats();
    if (stats.success) {
      console.log(`\n🗄️  Vector Database Stats:`);
      console.log(`   Total vectors: ${stats.stats.totalVectors || 0}`);
    }
    
    console.log('\n🎉 Content processing completed!');
    
  } catch (error) {
    console.error('❌ Error processing existing content:', error);
  }
}

// Run if called directly
if (require.main === module) {
  processExistingContent()
    .then(() => {
      console.log('✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = processExistingContent;
