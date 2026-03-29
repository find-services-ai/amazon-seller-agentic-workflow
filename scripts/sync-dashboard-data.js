/**
 * Sync dashboard data from active deals
 * This script reads the markdown files and converts them to JSON for the dashboard
 */

const fs = require('fs');
const path = require('path');

const ACTIVE_DEALS_DIR = path.join(__dirname, '..', 'active-deals');
const DASHBOARD_DATA_FILE = path.join(__dirname, '..', 'dashboard', 'src', 'data', 'dashboardData.js');

function parseValidationScore(content) {
  const scoreMatch = content.match(/Total Score[:\s]*(\d+)\/(\d+)/i);
  const confidenceMatch = content.match(/Confidence[:\s]*(\d+)%/i);
  
  return {
    score: scoreMatch ? parseInt(scoreMatch[1]) : 0,
    maxScore: scoreMatch ? parseInt(scoreMatch[2]) : 50,
    confidence: confidenceMatch ? parseInt(confidenceMatch[1]) : 0
  };
}

function parseMarginData(content) {
  const expectedMarginMatch = content.match(/Expected.*Margin[:\s]*(\d+)%/i);
  const worstCaseMatch = content.match(/Worst.*Case[:\s]*(\d+)%/i);
  
  return {
    expectedMargin: expectedMarginMatch ? parseInt(expectedMarginMatch[1]) : 0,
    worstCaseMargin: worstCaseMatch ? parseInt(worstCaseMatch[1]) : 0
  };
}

function syncData() {
  console.log('Syncing dashboard data from active deals...');
  
  // Check if active-deals directory exists
  if (!fs.existsSync(ACTIVE_DEALS_DIR)) {
    console.log('No active deals directory found. Using default data.');
    return;
  }

  const deals = fs.readdirSync(ACTIVE_DEALS_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  console.log(`Found ${deals.length} active deals:`, deals);

  // For each deal, read the validation scorecard if it exists
  deals.forEach(deal => {
    const scorecardPath = path.join(ACTIVE_DEALS_DIR, deal, 'PRODUCT-VALIDATION-SCORECARD.md');
    
    if (fs.existsSync(scorecardPath)) {
      const content = fs.readFileSync(scorecardPath, 'utf-8');
      const { score, maxScore, confidence } = parseValidationScore(content);
      const { expectedMargin, worstCaseMargin } = parseMarginData(content);
      
      console.log(`${deal}: Score ${score}/${maxScore}, ${confidence}% confidence, ${expectedMargin}% margin`);
    }
  });

  console.log('Data sync complete.');
}

// Run if called directly
if (require.main === module) {
  syncData();
}

module.exports = { syncData };
