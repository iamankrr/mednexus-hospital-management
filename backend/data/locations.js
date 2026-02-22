// data/locations.js - India Location Hierarchy

const locations = {
  Delhi: {
    districts: {
      'Central Delhi': ['Connaught Place', 'Karol Bagh', 'Paharganj'],
      'North Delhi': ['Civil Lines', 'Model Town', 'Sadar Bazar'],
      'South Delhi': ['Hauz Khas', 'Saket', 'Greater Kailash', 'Defence Colony'],
      'East Delhi': ['Laxmi Nagar', 'Preet Vihar', 'Mayur Vihar'],
      'West Delhi': ['Janakpuri', 'Rajouri Garden', 'Tilak Nagar'],
      'New Delhi': ['Chanakyapuri', 'Rajpath', 'Lutyens Delhi'],
      'North East Delhi': ['Seelampur', 'Shahdara', 'Welcome'],
      'North West Delhi': ['Rohini', 'Pitampura', 'Shalimar Bagh'],
      'South West Delhi': ['Dwarka', 'Vasant Kunj', 'Najafgarh'],
      'South East Delhi': ['Kalkaji', 'Nehru Place', 'Sarita Vihar']
    }
  },
  Haryana: {
    districts: {
      'Gurugram': ['DLF Phase 1', 'DLF Phase 2', 'DLF Phase 3', 'Sector 14', 'Sector 29', 'Golf Course Road', 'MG Road', 'Sohna Road'],
      'Faridabad': ['NIT', 'Old Faridabad', 'Sector 15', 'Sector 16'],
      'Rohtak': ['Model Town', 'Civil Lines', 'Rohtak City'],
      'Panipat': ['GT Road', 'Model Town', 'City Center'],
      'Sonipat': ['Old Sonipat', 'Rai', 'Gannaur'],
      'Ambala': ['Ambala Cantt', 'Ambala City', 'Saha'],
      'Hisar': ['Urban Estate', 'Red Square', 'Model Town'],
      'Karnal': ['Sector 13', 'Sector 14', 'Old City'],
      'Panchkula': ['Sector 5', 'Sector 8', 'Sector 20']
    }
  },
  'Uttar Pradesh': {
    districts: {
      'Noida': ['Sector 15', 'Sector 18', 'Sector 62', 'Sector 63', 'Film City'],
      'Greater Noida': ['Alpha 1', 'Alpha 2', 'Beta 1', 'Beta 2', 'Pari Chowk'],
      'Ghaziabad': ['Vaishali', 'Indirapuram', 'Kaushambi', 'Raj Nagar'],
      'Lucknow': ['Hazratganj', 'Gomti Nagar', 'Aliganj', 'Indira Nagar'],
      'Kanpur': ['Kidwai Nagar', 'Civil Lines', 'Panki'],
      'Agra': ['Taj Ganj', 'Sadar Bazaar', 'Sikandra'],
      'Varanasi': ['Cantonment', 'Lanka', 'Sigra'],
      'Meerut': ['Civil Lines', 'Shastri Nagar', 'Begum Bridge'],
      'Allahabad': ['Civil Lines', 'George Town', 'Naini']
    }
  },
  Maharashtra: {
    districts: {
      'Mumbai': ['Andheri', 'Bandra', 'Borivali', 'Dadar', 'Goregaon', 'Juhu', 'Malad', 'Powai', 'Vile Parle'],
      'Pune': ['Koregaon Park', 'Kothrud', 'Shivajinagar', 'Viman Nagar', 'Hinjewadi'],
      'Nagpur': ['Sitabuldi', 'Dharampeth', 'Sadar'],
      'Thane': ['Ghodbunder Road', 'Majiwada', 'Naupada'],
      'Nashik': ['College Road', 'Panchavati', 'Satpur'],
      'Aurangabad': ['Cidco', 'Town Center', 'Jalna Road']
    }
  },
  Karnataka: {
    districts: {
      'Bengaluru': ['Koramangala', 'Indiranagar', 'Whitefield', 'Electronic City', 'Jayanagar', 'Marathahalli', 'HSR Layout', 'BTM Layout'],
      'Mysuru': ['Saraswathipuram', 'Kuvempunagar', 'Vijayanagar'],
      'Mangaluru': ['Hampankatta', 'Bejai', 'Kadri'],
      'Hubballi': ['Old Hubli', 'Gokul Road', 'Unkal']
    }
  },
  'Tamil Nadu': {
    districts: {
      'Chennai': ['T Nagar', 'Anna Nagar', 'Velachery', 'Adyar', 'Mylapore', 'Nungambakkam'],
      'Coimbatore': ['RS Puram', 'Gandhipuram', 'Saibaba Colony'],
      'Madurai': ['Anna Nagar', 'K Pudur', 'Pasumalai'],
      'Tiruchirappalli': ['Srirangam', 'Cantonment', 'K K Nagar']
    }
  },
  Gujarat: {
    districts: {
      'Ahmedabad': ['Satellite', 'Vastrapur', 'Maninagar', 'Navrangpura', 'SG Highway'],
      'Surat': ['Adajan', 'Vesu', 'Athwa'],
      'Vadodara': ['Alkapuri', 'Sayajigunj', 'Manjalpur'],
      'Rajkot': ['Race Course', 'Kalawad Road', 'University Road']
    }
  },
  Rajasthan: {
    districts: {
      'Jaipur': ['Vaishali Nagar', 'Malviya Nagar', 'C Scheme', 'Raja Park'],
      'Jodhpur': ['Paota', 'Ratanada', 'Shastri Nagar'],
      'Udaipur': ['City Palace', 'Fateh Sagar', 'Hiran Magri'],
      'Kota': ['Vigyan Nagar', 'Dadabari', 'Talwandi']
    }
  },
  'West Bengal': {
    districts: {
      'Kolkata': ['Salt Lake', 'Park Street', 'Howrah', 'New Town', 'Ballygunge'],
      'Siliguri': ['Matigara', 'Pradhan Nagar', 'Hakimpara'],
      'Durgapur': ['City Centre', 'Benachity', 'Bidhannagar']
    }
  }
};

// Get all states
const getStates = () => {
  return Object.keys(locations).sort();
};

// Get districts by state
const getDistricts = (state) => {
  if (!locations[state]) return [];
  return Object.keys(locations[state].districts).sort();
};

// Get cities/areas by state and district
const getCities = (state, district) => {
  if (!locations[state] || !locations[state].districts[district]) return [];
  return locations[state].districts[district].sort();
};

module.exports = {
  locations,
  getStates,
  getDistricts,
  getCities
};