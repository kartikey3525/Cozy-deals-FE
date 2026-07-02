import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import React, {useContext, useEffect, useState} from 'react';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {useNavigation} from '@react-navigation/native';
import {ThemeContext} from '../context/themeContext'; // Import Theme Context
import { ActivityIndicator } from 'react-native-paper';

const Width = Dimensions.get('window').width;
const Height = Dimensions.get('window').height;

export default function WelcomeScreen() {
  const navigation = useNavigation();
  const {theme} = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const [isLoading, setIsLoading] = useState(true);
  const scaleValue = new Animated.Value(0.5); // Initial scale value

  useEffect(() => {
    if (isLoading) {
      // Start the animation when loading
      Animated.timing(scaleValue, {
        toValue: 50, // Final scale value
        duration: 1000, // Animation duration in ms
        easing: Easing.elastic(1), // Bouncy effect
        useNativeDriver: true, // Better performance
      }).start();
    }
  }, [isLoading]);
  // Simulate loading for demonstration purposes
  setTimeout(() => setIsLoading(false), 1500); // Remove this after actual loading is done

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        styles.screen,
        {backgroundColor: isDark ? '#000' : '#fff'},
      ]}>
     {isLoading ? (
  <View style={styles.centered}>
    <Animated.Image
      source={require('../assets/logo.png')}
      style={[
        styles.logo,
        {
          transform: [{ scale: scaleValue }],
        },
      ]}
      resizeMode="contain"
    />
    {/* Optional: Add loading indicator below the logo */}
    <ActivityIndicator 
      size="large" 
      color="#00AEEF" 
      style={{marginTop: 20}}
    />
  </View>
) : (
        <>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignSelf: 'flex-end',
              left: 30,
            }}
            onPress={() => navigation.navigate('commonscreen')}>
            <Text
              style={[
                styles.smallText,
                {
                  color: '#00AEEF',
                  width: 35,
                  top: 35,
                  alignSelf: 'center',
                  position: 'absolute',
                  right: 95,
                },
              ]}>
              Skip
            </Text>
            <Image
              source={require('../assets/Back-Container.png')}
              style={{
                width: 160,
                height: 100,
              }}
              resizeMode="contain"
            />
          </TouchableOpacity>

          <Image
            source={require('../assets/box-image-dark.png')} // Light theme image
            style={{
              width: 353,
              height: Height * 0.38,
              alignSelf: 'center',
            }}
            resizeMode="contain"
          />

          <View style={{justifyContent: 'center'}}>
            <Image
              source={
                isDark
                  ? require('../assets/welcome-rectangle-dark.png') // Dark theme image
                  : require('../assets/welcome-rectangle.png') // Light theme image
              }
              style={{
                width: Width * 0.99,
                height: Height * 0.5,
                marginTop: -40,
              }}
              resizeMode="contain"
            />

            <View
              style={{
                position: 'absolute',
                alignItems: 'center',
                alignSelf: 'center',
                width: 300,
              }}>
              <View style={{flexDirection: 'row'}}>
                <View
                  style={{
                    backgroundColor: '#00AEEF',
                    width: 10,
                    height: 10,
                    borderRadius: 100,
                    margin: 2,
                  }}
                />
                <View
                  style={{
                    backgroundColor: isDark ? '#444' : '#9DA49E1A',
                    width: 10,
                    height: 10,
                    borderRadius: 100,
                    margin: 2,
                  }}
                />
              </View>

              <Text style={[styles.bigText, {color: isDark ? '#fff' : '#000'}]}>
                "Style Starts Here!"
              </Text>
              <Text
                style={[
                  styles.smallText,
                  {color: isDark ? '#E0E0E0' : '#1D1E20'},
                ]}>
                Shop the latest trends, exclusive collections, and timeless
                fashion.
              </Text>

              <TouchableOpacity
                style={styles.blueBotton}
                onPress={() => navigation.navigate('Welcome2')}>
                <AntDesign name="arrowright" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    width: Width,
    height: Height,
    justifyContent: 'center',
  },centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
  },
  smallText: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    width: 250,
    fontFamily: 'NunitoSans-VariableFont_YTLC,opsz,wdth,wght',
  },
  bigText: {
    fontSize: 30,
    textAlign: 'center',
    marginTop: 40,
    fontWeight: 'bold',
    marginBottom: 20,
    fontFamily: 'Poppins-Bold',
  },
  blueBotton: {
    backgroundColor: '#00AEEF',
    width: 56,
    height: 56,
    borderRadius: 100,
    margin: 10,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // New styles for centering logo
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 140, // Adjust size as needed
    height: 140, // Adjust size as needed
  },
});
