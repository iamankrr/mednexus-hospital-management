require('dotenv').config();
const axios = require('axios');

const testAPI = async () => {
  try {
    console.log('🔍 Testing Google Places API...\n');
    console.log('API Key:', process.env.GOOGLE_PLACES_API_KEY ? 'Found ✅' : 'Not Found ❌\n');

    if (!process.env.GOOGLE_PLACES_API_KEY) {
      console.log('❌ Please add GOOGLE_PLACES_API_KEY to .env file');
      return;
    }

    // STEP 1: Search for a hospital
    console.log('📍 Searching for "Max Hospital Saket New Delhi"...\n');
    
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent('Max Hospital Saket New Delhi')}&key=${process.env.GOOGLE_PLACES_API_KEY}`;

    const searchResponse = await axios.get(searchUrl);

    if (searchResponse.data.status === 'OK' && searchResponse.data.results.length > 0) {
      const place = searchResponse.data.results[0];
      
      console.log('✅ Found Hospital!\n');
      console.log('📍 Name:', place.name);
      console.log('🆔 Place ID:', place.place_id);
      console.log('⭐ Rating:', place.rating || 'N/A');
      console.log('👥 Total Reviews:', place.user_ratings_total || 'N/A');
      console.log('🏠 Address:', place.formatted_address);
      
      // STEP 2: Get detailed info using Place ID
      console.log('\n🔍 Fetching detailed information...\n');
      
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,rating,user_ratings_total,formatted_address,geometry&key=${process.env.GOOGLE_PLACES_API_KEY}`;
      
      const detailsResponse = await axios.get(detailsUrl);
      
      if (detailsResponse.data.status === 'OK') {
        const details = detailsResponse.data.result;
        console.log('✅ Detailed Information Retrieved!\n');
        console.log('📍 Name:', details.name);
        console.log('⭐ Rating:', details.rating);
        console.log('👥 Total Reviews:', details.user_ratings_total);
        console.log('📫 Address:', details.formatted_address);
        console.log('📍 Location:', details.geometry?.location);
        
        console.log('\n🎉 Google Places API is working perfectly!');
      }
      
    } else {
      console.log('❌ Search Error:', searchResponse.data.status);
      console.log('Error message:', searchResponse.data.error_message);
    }
    
  } catch (error) {
    console.error('❌ Test Failed:', error.message);
    
    if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
};

testAPI();