import Geolocation from '@react-native-community/geolocation';
import {useEffect} from 'react';
import {Alert, Linking, PermissionsAndroid, Platform} from 'react-native';
import {getPlaceName} from './locationHelper';

const LocationPermission = ({setLocation}) => {
  useEffect(() => {
    requestLocationPermission();
  }, []);

  const checkLocationServices = async () => {
    const enabled = await Geolocation.getProviderStatus();
    if (!enabled.locationServicesEnabled) {
      Alert.alert(
        'Location Services Disabled',
        'Please enable location services to use this feature.',
        [
          {text: 'Cancel', style: 'cancel'},
          {text: 'Open Settings', onPress: () => Linking.openSettings()},
        ],
      );
    }
  };

  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Access Required',
            message: 'This app needs to access your location.',
          },
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Location permission granted');
          checkLocationServices();
          getLocation();
        } else {
          Alert.alert(
            'Permission Denied',
            'Location access is required. Please enable it in Settings.',
            [{text: 'Open Settings', onPress: () => Linking.openSettings()}],
          );
        }
      } else {
        checkLocationServices();
        getLocation(); // iOS handles permissions automatically
      }
    } catch (err) {
      console.warn('Permission error:', err);
    }
  };

  const getLocation = async (retryCount = 0) => {
    Geolocation.getCurrentPosition(
      async position => {
        const {latitude, longitude} = position.coords;

        // Update location immediately
        setLocation({
          latitude,
          longitude,
          city: '',
          state: '',
          country: '',
          address: '',
        });

        console.log('GPS Location:', latitude, longitude);

        // Resolve address in background
        getPlaceName(latitude, longitude)
          .then(place => {
            console.log('Resolved Location:', place);

            setLocation(prev => ({
              ...prev,
              city: place.city,
              state: place.state,
              country: place.country,
              address: place.fullAddress,
            }));
          })
          .catch(err => {
            console.log('Reverse Geocode Error:', err);
          });
      },
      error => {
        console.error('Location error:', error);

        if (error.code === 3 && retryCount < 2) {
          console.log(`Retrying location fetch (${retryCount + 1}/2)`);
          getLocation(retryCount + 1);
          return;
        }

        if (error.code === 2 || error.code === 3) {
          console.log('Falling back to network-based location...');

          Geolocation.getCurrentPosition(
            async position => {
              const {latitude, longitude} = position.coords;

              const place = await getPlaceName(latitude, longitude);

              console.log('Resolved Fallback Location:', place);

              setLocation({
                latitude,
                longitude,
                city: place.city,
                state: place.state,
                country: place.country,
                address: place.fullAddress,
              });
            },

            fallbackError => {
              console.error('Fallback location error:', fallbackError);
            },

            {
              enableHighAccuracy: false,
              timeout: 10000,
              maximumAge: 300000,
            },
          );
        } else {
          Alert.alert('Error', error.message);
        }
      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      },
    );
  };

  return null;
};

export default LocationPermission;
