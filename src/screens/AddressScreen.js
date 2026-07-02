import {
  View,
  Text,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import React, {useContext, useState} from 'react';
// import {TextInput} from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Octicons from 'react-native-vector-icons/Octicons';
import {ThemeContext} from '../context/themeContext';
import { HelperText } from 'react-native-paper';
import KeyboardAvoidingContainer from '../components/KeyboardAvoided';

export default function AddressScreen({navigation}) {
  const {theme} = useContext(ThemeContext);
  const isDark = theme === 'dark';

  const [location, setLocation] = useState('');

  const [suggestedLocations, setSuggestedLocations] = useState([
    {id: 1, location: 'New York'},
    {id: 2, location: 'Los Angeles'},
    {id: 3, location: 'Chicago'},
    {id: 4, location: 'Houston'},
    {id: 5, location: 'Phoenix'},
  ]);

  const [errors, setErrors] = useState({
    location: '',
  });

  const validateInputs = () => {
    let newErrors = {location: ''};
    let valid = true;

    if (!location.trim()) {
      newErrors.location = 'Location is required.';
      valid = false;
    } else if (location.length < 6) {
      newErrors.location = 'Location must be at least 6 characters long.';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handlePress = async () => {
    setErrors({location: ''}); // Reset errors first

    if (!validateInputs()) return; // Stop execution if validation fails

    setIsLoading(true);
    try {
      // await PostReportissue(media, location);
      console.log('Success', 'Report Post successful!');
      navigation.navigate('BottomTabs');
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingContainer>
      <View
        style={[
          styles.screen,
          {backgroundColor: isDark ? '#000000' : '#FFFFFF'},
        ]}>
        <Text
          style={[
            styles.bigText,
            {left: 10, color: isDark ? '#FFFFFF' : '#000000'},
          ]}>
          Choose location
        </Text>

        <View
          style={[
            styles.inputContainer,
            {
              borderBottomcolor: isDark
                ? 'rgba(255, 255, 255, 1)'
                : 'rgba(42, 43, 43, 1)',
            },
          ]}>
          <Octicons
            name="location"
            size={25}
            color={isDark ? 'rgba(255, 255, 255, 1)' : 'rgba(42, 43, 43, 1)'}
            style={{marginLeft: 0}}
          />
          <TextInput
            value={location}
            style={[
              styles.textInput,
              {
                color: isDark ? '#FFFFFF' : '#000000',
                backgroundColor: isDark ? '#000000' : 'rgb(255, 255, 255)',
              },
            ]}
            onChangeText={Selection => setLocation(Selection)}
            placeholderTextColor={isDark ? 'rgb(184, 184, 184)' : 'black'}
            placeholder="Location"
            autoCapitalize="none"
          />
        </View>
        <HelperText
          type="error"
          style={{alignSelf: 'flex-start'}}
          visible={!!errors.location}>
          {errors.location}
        </HelperText>

        <TouchableOpacity
          onPress={() => navigation.navigate('MapAddress')}
          style={{
            alignItems: 'flex-start',
            flexDirection: 'row',
            width: '90%',
            padding: 2,
          }}>
          <Ionicons
            name="map-outline"
            size={25}
            color="rgba(0, 174, 239, 1)"
            style={{marginLeft: 8}}
          />
          <Text
            style={[
              styles.smallText,
              {
                textAlign: 'left',
                color: 'rgba(0, 174, 239, 1)',
                fontSize: 17,
                left: 6,
              },
            ]}>
            Choose on map
          </Text>
        </TouchableOpacity>

        <FlatList
          data={suggestedLocations}
          style={{marginTop: '4%'}}
          renderItem={({item}) => (
            <View
              style={{
                alignItems: 'flex-start',
                width: '90%',
                padding: 2,
                marginBottom: 5,
              }}>
              <Text
                style={[
                  styles.smallText,
                  {
                    textAlign: 'left',
                    fontSize: 17,
                    left: 8,
                    color: isDark ? '#FFFFFF' : '#000000',
                  },
                ]}>
                {item.location}
              </Text>
              <Text
                style={[
                  styles.smallText,
                  {
                    color: isDark
                      ? 'rgb(184, 184, 184)'
                      : 'rgba(99, 99, 99, 1)',
                    textAlign: 'left',
                    fontSize: 15,
                    left: 8,
                  },
                ]}>
                {item.location}
              </Text>
            </View>
          )}
          keyExtractor={item => item.id.toString()}
        />

        <TouchableOpacity
          style={styles.blueBotton}
          // onPress={handlePress}
          onPress={() => navigation.navigate('BottomTabs')}>
          <Text
            style={[
              styles.smallText,
              {color: '#fff', fontSize: 22, marginBottom: 0},
            ]}>
            Done
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingContainer>
  );
}
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'flex-start',
    alignContent: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: 'rgba(0, 0, 0, 1)',
    width: '100%',
    borderBottomWidth: 1,
    borderRadius: 8,
    margin: 10,
    marginBottom: 20,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    color: '#000',
    height: 50,
    fontSize: 22,
    width: '100%',
    padding: 10,

    margin: 4,
  },
  smallText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1D1E20',
    textAlign: 'center',
    width: 250,
    fontFamily: 'NunitoSans-VariableFont_YTLC,opsz,wdth,wght',
  },

  bigText: {
    fontSize: 23,
    color: 'black',
    textAlign: 'left',
    marginTop: 40,
    fontWeight: 'bold',
    marginBottom: 6,
    fontFamily: 'Poppins-Bold',
  },
  blueBotton: {
    backgroundColor: '#00AEEF',
    width: '90%',
    height: 56,
    borderRadius: 10,
    margin: 10,
    marginBottom: 20,
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
  }, 
});
