import React, {useContext, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import Entypo from 'react-native-vector-icons/Entypo';
import {ThemeContext} from '../context/themeContext';
import Header from '../components/Header';

const Width = Dimensions.get('window').width;
const Height = Dimensions.get('window').height;

export default function Payments({navigation}) {
  const {theme} = useContext(ThemeContext);
  const isDark = theme === 'dark';

  const [selectedPaymentId, setSelectedPaymentId] = useState(1);

  const paymentMethods = [
    {
      id: 1,
      name: 'PhonePe',
      number: '4532 6532 7654 7521',
      img: require('../assets/phonepay.png'),
    },
    {
      id: 2,
      name: 'Bank',
      number: '4532 6532 7654 7521',
      img: require('../assets/banklogo1.png'),
    },
    {
      id: 3,
      name: 'Paypal',
      number: 'Paypal',
      img: require('../assets/paypal.png'),
    },
  ];

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        styles.screen,
        {backgroundColor: isDark ? '#000' : '#fff'},
      ]}>
      <Header header={'Payments'} />

      {paymentMethods.map(method => (
        <Pressable
          key={method.id}
          onPress={() => setSelectedPaymentId(method.id)}
          style={{
            justifyContent: 'center',
            marginBottom: 10,
            alignItems: 'center',
          }}>
          <View
            style={[
              styles.rectangle2,
              {
                flexDirection: 'row',
                backgroundColor: isDark ? '#121212' : '#fff',
              },
            ]}>
            <Image
              source={method.img}
              style={styles.logo}
              resizeMode="contain"
            />
            <View style={{width: Width * 0.6}}>
              <Text
                numberOfLines={1}
                style={[
                  styles.recListText,
                  {
                    fontWeight: '500',
                    fontSize: 18,
                    color: isDark ? '#fff' : '#000',
                  },
                ]}>
                {method.number}
              </Text>
            </View>
            <View
              style={[
                styles.radioButton,
                selectedPaymentId === method.id && styles.radioButtonSelected,
              ]}>
              {selectedPaymentId === method.id && (
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(6, 196, 217, 1)',
                  }}>
                  <View
                    style={{
                      width: 15,
                      height: 15,
                      borderWidth: 2,
                      borderColor: isDark ? '#000' : 'white',
                      borderRadius: 10,
                      backgroundColor: 'rgba(6, 196, 217, 1)',
                    }}></View>
                </View>
              )}
            </View>
          </View>
        </Pressable>
      ))}

      <TouchableOpacity
        style={[styles.blueButton, {marginTop: Height * 0.3}]}
        onPress={() => navigation.navigate('paymentsuccess')}>
        <Text
          style={[
            styles.smallText,
            {color: '#fff', fontSize: 22, marginBottom: 0},
          ]}>
          Continue
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff',
  },
  blueButton: {
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
  logo: {
    width: 60,
    height: 60,
    marginRight: 15,
  },
  recListText: {
    color: '#1d1e20',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.3,
    borderColor: 'rgb(90, 90, 90)',
  },
  radioButtonSelected: {
    backgroundColor: 'rgba(6, 196, 217, 1)',
  },
  radioButtonInner: {
    width: 15,
    height: 15,
    borderRadius: 10,
    backgroundColor: 'white',
  },
});
