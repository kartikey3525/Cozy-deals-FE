import React, {useContext, useRef, useState} from 'react';
import {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import {ThemeContext} from '../context/themeContext';

const Width = Dimensions.get('window').width;
const Height = Dimensions.get('window').height;

export default function PaymentSuccess({navigation}) {
  const {theme} = useContext(ThemeContext);
  const isDark = theme === 'dark';

  const [recentPostList, setRecentPostList] = useState([
    {
      id: 1,
      title: ' Lindsey Culhane requested a payment of $780.1',
      img: require('../assets/User-image.png'),
      time: '9:00 am',
    },
    {
      id: 2,
      title: ' Lindsey Culhane requested a payment of $780.1',
      img: require('../assets/User-image.png'),
      time: '9:00 am',
    },
    {
      id: 3,
      title: ' Lindsey Culhane requested a payment of $780.1',
      img: require('../assets/User-image.png'),
      time: '9:00 am',
    },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const scaleValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(scaleValue, {
      toValue: 1.5, // Scale to 1.5 times the original size
      duration: 1000, // 1 second
      useNativeDriver: true, // Use native driver for better performance
    }).start(() => {
      // Callback after animation completes
      navigation.navigate('BottomTabs');
    });
  }, []);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.screen}>
      <View
        style={{
          borderRadius: 10,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Animated.Image
          source={
            isDark
              ? require('../assets/paymentsuccess-dark.png')
              : require('../assets/paymentsuccess.png')
          }
          style={[
            styles.image,
            {
              transform: [{scale: scaleValue}], // Apply scale transformation
            },
          ]}
          resizeMode="contain"
        />
        <Text
          numberOfLines={2}
          style={[
            styles.recListText,
            {
              fontWeight: '500',
              fontSize: 22,
              color: isDark ? '#000' : '#fff',
              width: Width * 0.8,

              textAlign: 'center',
            },
          ]}>
          Payment Successful! Thank you for your transaction.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(6, 196, 217, 1)',
  },
  image: {
    width: 80,
    height: 80,
    marginRight: 15,
    marginBottom: 40,
  },
  blueBotton: {
    backgroundColor: '#00AEEF',
    width: '88%',
    height: 56,
    borderRadius: 10,
    alignSelf: 'center',
    margin: 10,
    marginBottom: 20,

    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: {
    fontWeight: 'bold',
    fontSize: 14,
    margin: 5,
    marginLeft: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: Height * 0.1,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: '26%',
  },
  rectangle2: {
    backgroundColor: '#fff',
    width: Width * 0.95,
    height: 80,
    marginBottom: 15,
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderRadius: 10,
    padding: 10,
    elevation: 2,
  },
  recListText: {
    color: '#1d1e20',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.36)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: '12%',
    alignItems: 'center',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    backgroundColor: 'rgba(217, 217, 217, 1)',
    padding: 10,
    borderRadius: 10,
    flex: 1,
    marginRight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    height: 46,
  },
  deleteButton: {
    backgroundColor: 'rgba(6, 196, 217, 1)',
    padding: 10,
    borderRadius: 10,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
    height: 46,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 18,
  },
});
