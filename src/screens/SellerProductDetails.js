import {useIsFocused} from '@react-navigation/native';
import React, {useContext, useEffect, useState} from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Entypo from 'react-native-vector-icons/Entypo';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Header from '../components/Header';
import {AuthContext} from '../context/authcontext';
import {ThemeContext} from '../context/themeContext';
const {width, height} = Dimensions.get('window');

export default function SellerProductDetails({navigation, route}) {
  const {theme} = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const [Data, setData] = useState([]);
  const isFocused = useIsFocused();
  const {Userfulldata} = useContext(AuthContext);
  useEffect(() => {
    // console.log('data', route.params.item.images);
    setData(route?.params?.item);
  }, [isFocused]);

  const ImageCarousel = ({images}) => {
    return (
      <View style={styles.carouselContainer}>
        <FlatList
          data={images}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item, index) => index.toString()}
          snapToInterval={width * 0.9} // Snap to the width of each image
          decelerationRate="fast"
          snapToAlignment="center"
          renderItem={({item}) => (
            <View
              style={{
                width: width * 0.9, // Match snapToInterval
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Image
                source={{uri: item}}
                style={{
                  width: width * 0.85,
                  height: height * 0.4,
                  resizeMode: 'cover',
                  borderRadius: 10,
                }}
              />
            </View>
          )}
        />
      </View>
    );
  };

  const openWhatsApp = async phoneNumber => {
    try {
      // Remove all non-digit characters
      const cleanedNumber = phoneNumber.replace(/\D/g, '');

      // Check if WhatsApp is installed
      const url = `whatsapp://send?phone=${cleanedNumber}`;
      const supported = await Linking.canOpenURL(url);

      if (supported) {
        await Linking.openURL(url);
      } else {
        // If WhatsApp isn't installed, open browser version
        const webUrl = `https://wa.me/${cleanedNumber}`;
        await Linking.openURL(webUrl);
      }
    } catch (error) {
      console.error('Error opening WhatsApp:', error);
      Alert.alert('Error', 'Could not open WhatsApp');
    }
  };

  const shareProductDeepLink = async () => {
    try {
      // Replace with your actual domain and product ID
      const productId = Data._id || Data.id; // Use your product ID field
      const deepLink = `https://yourdomain.com/product/${productId}`;
      const playStoreLink =
        'https://play.google.com/store/apps/details?id=com.yourpackage';

      const message =
        `Check out this product: ${Data.productName}\n\n${deepLink}\n\n` +
        `If you don't have our app installed, get it here: ${playStoreLink}`;

      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `whatsapp://send?text=${encodedMessage}`;

      // Check if WhatsApp is installed
      const supported = await Linking.canOpenURL(whatsappUrl);

      if (supported) {
        await Linking.openURL(whatsappUrl);
      } else {
        // Fallback to web version if WhatsApp isn't installed
        const webUrl = `https://wa.me/?text=${encodedMessage}`;
        await Linking.openURL(webUrl);
      }
    } catch (error) {
      console.error('Error sharing product:', error);
      Alert.alert('Error', 'Could not share product');
    }
  };

  const openMap = async () => {
    try {
      // If latitude & longitude are available
      if (Data?.location?.latitude && Data?.location?.longitude) {
        const {latitude, longitude} = Data.location;

        const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

        await Linking.openURL(url);
        return;
      }

      // Fallback to address
      const address =
        typeof Data.location === 'string'
          ? Data.location
          : Data.location?.address || Data.businessAddress || '';

      if (!address) {
        Alert.alert('Location', 'Location not available');
        return;
      }

      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        address,
      )}`;

      await Linking.openURL(url);
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Unable to open map');
    }
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={[styles.container, {backgroundColor: isDark ? '#000' : '#fff'}]}>
      <Header header={'Product Details'} />

      {/* Image Carousel */}
      <ImageCarousel images={route.params.item.images} />

      {/* Product Details */}
      <View style={styles.detailsContainer}>
        <Text
          numberOfLines={2}
          style={[styles.title, {color: isDark ? '#fff' : '#000'}]}>
          {Data.productName}
        </Text>
        <Text
          numberOfLines={2}
          style={[
            styles.title,
            {color: isDark ? '#fff' : 'grey', fontSize: 16},
          ]}>
          {Data.description}
        </Text>
        <Text style={[styles.info, {color: isDark ? '#fff' : '#000'}]}>
          <Ionicons name="call-outline" size={16} /> {Data.contactNumber}
        </Text>
        <Text style={[styles.info, {color: isDark ? '#fff' : '#000'}]}>
          <Ionicons name="mail-outline" size={16} /> {Data.contactEmail}
        </Text>
        <TouchableOpacity
          onPress={openMap}
          activeOpacity={0.7}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginVertical: 4,
          }}>
          <Ionicons name="location-outline" size={18} color="#0F5CF6" />

          <Text
            style={[
              styles.info,
              {
                color: '#0F5CF6',
                textDecorationLine: 'underline',
                marginLeft: 5,
                flex: 1,
              },
            ]}>
            {typeof Data.location === 'string'
              ? Data.location
              : Data.location?.address ||
                Data.businessAddress ||
                'Location not available'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={() => Linking.openURL(`tel:${Data?.contactNumber}`)}
          style={[styles.button, {backgroundColor: 'rgba(7, 201, 29, 1)'}]}>
          <Ionicons name="call-outline" size={20} color="#fff" />
          <Text style={styles.buttonText}>Call</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            console.log('data', Data);
            navigation.navigate('Chatscreen', {
              item: {
                _id: Data.userId, // The seller's user ID
                name: Data.contactEmail, // You should get this from user data
                profile: Data.images, // Seller's profile image
                isOnline: false, // Get from user status
                Data,
              },
              userId: Userfulldata._id,
            });
          }}
          style={[styles.button, {backgroundColor: 'rgba(15, 92, 246, 1)'}]}>
          <Ionicons name="chatbubble-outline" size={20} color="#fff" />
          <Text style={styles.buttonText}>SMS</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={shareProductDeepLink}
          style={[styles.button, {backgroundColor: 'rgba(33, 150, 243, 1)'}]}>
          <Entypo name="share" size={20} color="#fff" />
          <Text style={styles.buttonText}>Share</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  carouselContainer: {
    width: width * 0.9,
    height: height * 0.4,
    alignSelf: 'center',
    overflow: 'hidden',
    borderRadius: 10,
    marginTop: 40,
  },
  detailsContainer: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  info: {
    fontSize: 16,
    marginVertical: 4,
    color: '#555',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginVertical: 20,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '30%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 5,
  },
});
