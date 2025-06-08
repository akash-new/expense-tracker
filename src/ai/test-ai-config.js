// Test script to verify AI configuration
require('dotenv').config();

console.log('=== AI Configuration Test ===');
console.log('Testing Google AI API key configuration...');

// Check if Google API key is set
const googleApiKey = process.env.GOOGLE_API_KEY;
if (!googleApiKey) {
  console.error('❌ GOOGLE_API_KEY not found in environment variables');
  console.log('Please set up your Google AI API key by:');
  console.log('1. Create a .env file in your project root if it doesn\'t exist');
  console.log('2. Add the following line: GOOGLE_API_KEY=your_api_key_here');
  console.log('3. Restart your development server');
} else {
  // Very basic validation - just check if it looks like a proper key
  // Google API keys are typically ~39 characters
  if (googleApiKey.length < 20) {
    console.error('❌ GOOGLE_API_KEY seems too short. It might be invalid.');
    console.log('Google API keys are typically at least 20 characters long.');
  } else {
    console.log(`✅ GOOGLE_API_KEY found with length: ${googleApiKey.length}`);
    console.log('The key format appears reasonable.');
  }
}

// Check if required Genkit packages are installed
try {
  require('genkit');
  console.log('✅ Genkit package is installed');
} catch (error) {
  console.error('❌ Genkit package not found.');
  console.log('Run: npm install genkit @genkit-ai/googleai');
}

try {
  require('@genkit-ai/googleai');
  console.log('✅ @genkit-ai/googleai package is installed');
} catch (error) {
  console.error('❌ @genkit-ai/googleai package not found.');
  console.log('Run: npm install @genkit-ai/googleai');
}

// Check if production or development environment
console.log(`🔍 Node environment: ${process.env.NODE_ENV || 'not set'}`);

console.log('\nConfiguration Test Complete');
console.log('If issues were detected, please fix them and restart your server.');
console.log('If all checks passed but AI still doesn\'t work, please check your Google AI API access and permissions.'); 