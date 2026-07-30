import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export const getPlaceName = async (latitude, longitude) => {
  try {
    const cacheKey = `location_${latitude.toFixed(3)}_${longitude.toFixed(3)}`;

    const cached = await AsyncStorage.getItem(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

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

    const result = {
      city:
        address.city || address.town || address.village || address.county || '',
      state: address.state || '',
      country: address.country || '',
      fullAddress: response.data.display_name || '',
    };

    await AsyncStorage.setItem(cacheKey, JSON.stringify(result));

    return result;
  } catch (error) {
    console.log(error);

    return {
      city: '',
      state: '',
      country: '',
      fullAddress: '',
    };
  }
};
