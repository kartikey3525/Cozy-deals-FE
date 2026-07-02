import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
} from 'react-native';
import React, {useContext} from 'react';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {Dimensions} from 'react-native';
import {ThemeContext} from '../context/themeContext';

const Width = Dimensions.get('window').width;
const Height = Dimensions.get('window').height;

export default function WelcomeScreen2({navigation}) {
  const {theme} = useContext(ThemeContext);

  const isDarkMode = theme === 'dark'; // Check if dark mode is enabled

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        styles.screen,
        {backgroundColor: isDarkMode ? '#000' : '#fff'},
      ]}>
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
        source={require('../assets/recieving-image-dark.png')}
        style={{width: 353, height: Height * 0.38, alignSelf: 'center'}}
        resizeMode="contain"
      />

      <View style={{justifyContent: 'center'}}>
        <Image
          source={
            isDarkMode
              ? require('../assets/welcome-rectangle-dark.png') // Dark mode image
              : require('../assets/welcome-rectangle.png') // Light mode image
          }
          style={{width: Width * 0.99, height: Height * 0.47, marginTop: -20}}
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
                backgroundColor: isDarkMode ? '#FFFFFF80' : '#9DA49E1A',
                width: 10,
                height: 10,
                borderRadius: 100,
                margin: 2,
              }}
            />
            <View
              style={{
                backgroundColor: isDarkMode ? '#00AEEF' : '#00AEEF',
                width: 10,
                height: 10,
                borderRadius: 100,
                margin: 2,
              }}
            />
          </View>

          <Text
            style={[styles.bigText, {color: isDarkMode ? 'white' : 'black'}]}>
            "Gear Up for the Future!"
          </Text>
          <Text
            style={[
              styles.smallText,
              {color: isDarkMode ? '#CCCCCC' : '#1D1E20'},
            ]}>
            Explore top gadgets, unbeatable prices, and the latest tech
            innovations.
          </Text>

          <TouchableOpacity
            style={[
              styles.blueBotton,
              {backgroundColor:  '#00AEEF'},
            ]}
            onPress={() => navigation.navigate('commonscreen')}>
            <AntDesign name="arrowright" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
  },
  smallText: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    width: 280,
    fontFamily: 'NunitoSans-VariableFont_YTLC,opsz,wdth,wght',
  },
  bigText: {
    fontSize: 26,
    textAlign: 'center',
    marginTop: 40,
    fontWeight: 'bold',
    marginBottom: 20,
    width: Width * 0.98,
    fontFamily: 'Poppins-Bold',
  },
  blueBotton: {
    width: 56,
    height: 56,
    borderRadius: 100,
    margin: 10,
    marginTop: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
