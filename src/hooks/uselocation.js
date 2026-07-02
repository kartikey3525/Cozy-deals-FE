import React, { useEffect } from 'react';
import {PermissionsAndroid, Alert, Platform, Linking} from 'react-native';
import Geolocation from '@react-native-community/geolocation';

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
      position => {
        const {latitude, longitude} = position.coords;
        setLocation({latitude, longitude});
        console.log('User location:', latitude, longitude);
      },
      error => {
        console.error('Location error:', error);

        if (error.code === 3 && retryCount < 2) {
          console.log(`Retrying location fetch (${retryCount + 1}/2)`);
          getLocation(retryCount + 1);
          return;
        }

        // Fallback to network-based location
        if (error.code === 2 || error.code === 3) {
          console.log('Falling back to network-based location...');
          Geolocation.getCurrentPosition(
            position => {
              const {latitude, longitude} = position.coords;
              setLocation({latitude, longitude});
              console.log(
                'User location (network-based):',
                latitude,
                longitude,
              );
            },
            fallbackError => {
              console.error('Fallback location error:', fallbackError);
              // Alert.alert('Error', 'Unable to fetch location.');
            },
            {
              enableHighAccuracy: false, // Use network-based location
              timeout: 10000,
              maximumAge: 0,
            },
          );
        } else {
          Alert.alert('Error', error.message);
        }
      },
      {
        enableHighAccuracy: true, // Try GPS first
        timeout: 10000,
        maximumAge: 0,
      },
    );
  };

  return null;
};

export default LocationPermission;