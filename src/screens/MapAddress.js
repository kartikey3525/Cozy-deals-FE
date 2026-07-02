import React, {useContext, useState} from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  FlatList,
  TouchableOpacity,
} from 'react-native';
// import MapView, {Marker} from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import Octicons from 'react-native-vector-icons/Octicons';
import Entypo from 'react-native-vector-icons/Entypo';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {ThemeContext} from '../context/themeContext';
// import MapView, {UrlTile} from 'react-native-maps';
import KeyboardAvoidingContainer from '../components/KeyboardAvoided';

export default function MapAddress({navigation}) {
  const {theme} = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [marker, setMarker] = useState(null);

  const handleSearch = async address => {
    try {
      const response = await Geolocation.geocodeAddress(address);
      const {lat, lng} = response[0];
      setRegion({
        ...region,
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
      setMarker({
        latitude: lat,
        longitude: lng,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const [suggestedLocations, setSuggestedLocations] = useState([
    {id: 1, location: 'New York'},
    {id: 2, location: 'Los Angeles'},
    {id: 3, location: 'Chicago'},
    {id: 4, location: 'Houston'},
    {id: 5, location: 'Phoenix'},
  ]);

  return (
    <KeyboardAvoidingContainer>
      <View style={[styles.container]}>
        {/* <MapView style={styles.map} region={region} onRegionChange={setRegion}>
          {marker && <Marker coordinate={marker} title="Searched Location" />}
        </MapView> */}
        {/* <MapView
        style={styles.map}
        initialRegion={{
          latitude: 37.7749, // San Francisco
          longitude: -122.4194,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
        provider={null} // Disable Google Maps
        // showsUserLocation={true} // Show user location
      >
        <UrlTile
          // urlTemplate="https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"
          urlTemplate="https://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
          maximumZ={19} // Adjust zoom level
          flipY={false}
        />
      </MapView> */}

        <View
          style={{
            position: 'absolute',
            marginTop: 50,
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <View
              style={[
                styles.inputContainer,
                {backgroundColor: isDark ? '#000000' : '#FFFFFF'},
              ]}>
              <Octicons
                name="location"
                size={22}
                color={isDark ? '#FFFFFF' : 'rgba(94, 95, 96, 1)'}
                style={{marginRight: 5}}
              />
              <TextInput
                // value={'text'}
                style={[
                  styles.searchInput,
                  {color: isDark ? '#FFFFFF' : '#000000'},
                ]}
                // onChangeText={setText}
                placeholderTextColor={
                  isDark ? '#FFFFFF' : 'rgba(94, 95, 96, 1)'
                }
                placeholder="Search Location"
                autoCapitalize="none"
                onSubmitEditing={event => handleSearch(event.nativeEvent.text)}
              />
            </View>

            <View
              style={{
                backgroundColor: isDark ? '#000000' : 'white',
                height: 45,
                width: '12%',
                alignSelf: 'center',
                borderRadius: 10,
                borderColor: isDark
                  ? 'rgba(233, 233, 233, 1)'
                  : 'rgba(233, 233, 233, 1)',
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 1.5,
                marginLeft: 10,
              }}>
              <Entypo
                name="cross"
                size={28}
                color={isDark ? '#FFFFFF' : 'black'}
              />
            </View>
          </View>

          <View
            style={{
              width: '86%',
              alignSelf: 'center',
              backgroundColor: isDark ? '#000000' : 'white',
              borderRadius: 10,
              marginTop: 10,
            }}>
            <FlatList
              data={suggestedLocations}
              renderItem={({item}) => (
                <View
                  style={{
                    alignSelf: 'flex-start',
                    width: '88%',
                    padding: 2,
                    margin: 10,
                    marginRight: 0,
                    backgroundColor: isDark ? '#000000' : 'white',
                  }}>
                  <Text
                    style={[
                      styles.smallText,
                      {
                        textAlign: 'left',
                        color: isDark ? '#FFFFFF' : '#000000',
                        fontSize: 20,
                        left: 8,
                      },
                    ]}>
                    {item.location}
                  </Text>
                  <Text
                    style={[
                      styles.smallText,
                      {
                        color: isDark ? '#FFFFFF' : 'rgba(99, 99, 99, 1)',
                        textAlign: 'left',
                        fontSize: 17,
                        left: 8,
                      },
                    ]}>
                    {item.location}
                  </Text>
                </View>
              )}
              keyExtractor={item => item.id.toString()}
            />
          </View>

          <MaterialIcons
            name="my-location"
            size={22}
            color="white"
            style={{
              alignSelf: 'center',
              position: 'absolute',
              bottom: 100,
              backgroundColor: 'rgba(0, 0, 0, 0.51)',
              padding: 7,
              borderRadius: 50,
              right: 30,
            }}
          />

          <TouchableOpacity
            style={styles.blueBotton}
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
      </View>
    </KeyboardAvoidingContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
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
    fontSize: 30,
    color: 'black',
    textAlign: 'left',
    marginTop: 40,
    fontWeight: 'bold',
    marginBottom: 6,
    fontFamily: 'Poppins-Bold',
  },
  blueBotton: {
    backgroundColor: '#00AEEF',
    width: '88%',
    height: 56,
    borderRadius: 10,
    margin: 10,
    marginBottom: 20,
    marginTop: '40%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContainer: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: 'rgba(233, 233, 233, 1)',
    borderWidth: 1.5,
    borderRadius: 10,
    height: 45,
    padding: 10,
  },
  searchInput: {
    width: '65%',
    alignSelf: 'center',
    height: 45,
  },
});
