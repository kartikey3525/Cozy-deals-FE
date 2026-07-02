import React, {useContext} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Entypo from 'react-native-vector-icons/Entypo';
import {ThemeContext} from '../context/themeContext';
import Header from '../components/Header';

const Width = Dimensions.get('window').width;
const Height = Dimensions.get('window').height;

export default function HelpScreen({navigation}) {
  const {theme} = useContext(ThemeContext);
  const isDark = theme === 'dark';

  return (
    <View style={[styles.screen, {backgroundColor: isDark ? '#000' : '#fff'}]}>
      <Header header={'Help and Support'} />

      {/** Navigation Buttons with Correct Screen Names */}
      <TouchableOpacity
        onPress={() => navigation.navigate('faqscreen')}
        style={[
          styles.button,
          {
            backgroundColor: isDark
              ? 'rgba(50, 50, 50, 0.7)'
              : 'rgba(223, 223, 223, 0.36)',
          },
        ]}>
        <Text style={[styles.buttonText, {color: isDark ? '#fff' : '#000'}]}>
          FAQs
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate('chatsupport')}
        style={[
          styles.button,
          {
            backgroundColor: isDark
              ? 'rgba(50, 50, 50, 0.7)'
              : 'rgba(223, 223, 223, 0.36)',
          },
        ]}>
        <Text style={[styles.buttonText, {color: isDark ? '#fff' : '#000'}]}>
          Chat Support
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate('reportissue')}
        style={[
          styles.button,
          {
            backgroundColor: isDark
              ? 'rgba(50, 50, 50, 0.7)'
              : 'rgba(223, 223, 223, 0.36)',
          },
        ]}>
        <Text style={[styles.buttonText, {color: isDark ? '#fff' : '#000'}]}>
          Report an Issue
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: Height * 0.1,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: '24%',
  },
  button: {
    width: Width * 0.9,
    alignSelf: 'center',
    borderRadius: 10,
    height: '10%',
    margin: 10,
    justifyContent: 'center',
  },
  buttonText: {
    marginLeft: 20,
    fontWeight: '500',
    fontSize: 18,
  },
});
