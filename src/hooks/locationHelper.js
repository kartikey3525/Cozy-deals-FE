import axios from 'axios';

export const getPlaceName = async (latitude, longitude) => {
  try {
    const response = await axios.get(
      'https://nominatim.openstreetmap.org/reverse',
      {
        params: {
          lat: latitude,
          lon: longitude,
          format: 'json',
          addressdetails: 1,
        },
        headers: {
          'User-Agent': 'CozyDeal/1.0',
        },
      },
    );

    const address = response.data.address;

    return {
      city:
        address.city || address.town || address.village || address.county || '',
      state: address.state || '',
      country: address.country || '',
      fullAddress: response.data.display_name || '',
    };
  } catch (error) {
    console.log('Reverse Geocode Error:', error);

    return {
      city: '',
      state: '',
      country: '',
      fullAddress: '',
    };
  }
};
