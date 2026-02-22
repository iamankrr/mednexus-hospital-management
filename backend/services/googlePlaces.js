const axios = require('axios');

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

// Fetch place details by Place ID
exports.getPlaceDetails = async (placeId) => {
  try {
    console.log('🔍 Fetching Google Place details for:', placeId);

    const response = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', {
      params: {
        place_id: placeId,
        fields: 'name,formatted_address,geometry,rating,user_ratings_total,formatted_phone_number,website,address_components,photos',
        key: GOOGLE_PLACES_API_KEY
      }
    });

    if (response.data.status !== 'OK') {
      throw new Error(`Google Places API error: ${response.data.status}`);
    }

    const place = response.data.result;

    // Extract address components
    const addressComponents = {};
    place.address_components?.forEach(component => {
      if (component.types.includes('locality')) {
        addressComponents.city = component.long_name;
      }
      if (component.types.includes('administrative_area_level_1')) {
        addressComponents.state = component.long_name;
      }
      if (component.types.includes('postal_code')) {
        addressComponents.pincode = component.long_name;
      }
      if (component.types.includes('sublocality') || component.types.includes('sublocality_level_1')) {
        addressComponents.area = component.long_name;
      }
    });

    // Get photo URLs (first 5)
    const photoUrls = [];
    if (place.photos && place.photos.length > 0) {
      place.photos.slice(0, 5).forEach(photo => {
        const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photo.photo_reference}&key=${GOOGLE_PLACES_API_KEY}`;
        photoUrls.push(photoUrl);
      });
    }

    const placeData = {
      name: place.name,
      address: {
        street: place.formatted_address?.split(',')[0] || '',
        area: addressComponents.area || '',
        city: addressComponents.city || '',
        state: addressComponents.state || '',
        pincode: addressComponents.pincode || ''
      },
      location: {
        type: 'Point',
        coordinates: [
          place.geometry.location.lng,
          place.geometry.location.lat
        ]
      },
      phone: place.formatted_phone_number || '',
      website: place.website || '',
      googleRating: place.rating || 0,
      googleReviewCount: place.user_ratings_total || 0,
      googlePlaceId: placeId,
      photos: photoUrls
    };

    console.log('✅ Place details fetched:', placeData.name);

    return placeData;

  } catch (error) {
    console.error('❌ Google Places API error:', error.message);
    throw error;
  }
};

// Search places by text query with location bias
exports.searchPlaces = async (query, type = 'hospital', location = null) => {
  try {
    console.log('🔍 Searching Google Places:', query);

    const params = {
      query: `${query} ${type}`,
      key: GOOGLE_PLACES_API_KEY
    };

    // Add location bias if provided (prioritize nearby results)
    if (location && location.lat && location.lng) {
      params.location = `${location.lat},${location.lng}`;
      params.radius = 50000; // 50km radius
      console.log('📍 Location bias:', location);
    }

    const response = await axios.get('https://maps.googleapis.com/maps/api/place/textsearch/json', {
      params
    });

    if (response.data.status !== 'OK') {
      return [];
    }

    const places = response.data.results.slice(0, 10).map(place => ({
      placeId: place.place_id,
      name: place.name,
      address: place.formatted_address,
      rating: place.rating || 0,
      totalRatings: place.user_ratings_total || 0,
      geometry: place.geometry
    }));

    console.log('✅ Found places:', places.length);

    return places;

  } catch (error) {
    console.error('❌ Search places error:', error.message);
    return [];
  }
};