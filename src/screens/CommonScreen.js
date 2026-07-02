import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import React, {useContext} from 'react';
import Entypo from 'react-native-vector-icons/Entypo';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import {Dimensions} from 'react-native';
import {AuthContext} from '../context/authcontext';
import {ThemeContext} from '../context/themeContext';

const Width = Dimensions.get('window').width;
const Height = Dimensions.get('window').height;

export default function CommonScreen({navigation}) {
  const {userRole, setUserRole} = useContext(AuthContext);
  const {theme} = useContext(ThemeContext);
  const isDark = theme === 'dark';
  return (
    <View
      showsVerticalScrollIndicator={false}
      style={[styles.screen, {backgroundColor: isDark ? '#000' : '#fff'}]}>
      <View
        style={{
          position: 'absolute',
          alignItems: 'center',
          alignSelf: 'center',
          width: 300,
        }}>
        <Text style={[styles.bigText, {color: isDark ? '#FFFFFF' : '#000000'}]}>
          Choose your role in the trade
        </Text>
        <Text
          style={[
            styles.smallText,
            {color: isDark ? '#CCCCCC' : 'rgba(0, 0, 0, 1)'},
          ]}>
          Filling your invoice details and getting finance for it, is just a few
          steps away.
        </Text>

        <TouchableOpacity
          style={[
            styles.recitem,
            {
              marginTop: 40,
              backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
              borderColor:
                userRole === 'buyer'
                  ? '#06C4D9'
                  : isDark
                  ? '#333333'
                  : 'rgba(220, 220, 220, 1)',
            },
          ]}
          onPress={() => setUserRole('buyer')}>
          <View style={[styles.iconContainer, {backgroundColor: '#06C4D9'}]}>
            <FontAwesome5 name="shopping-bag" size={22} color="#FFFFFF" />
          </View>
          <View style={{marginLeft: 20, width: Width * 0.6}}>
            <Text
              style={[
                styles.roleText,
                {color: isDark ? '#FFFFFF' : '#000000'},
              ]}>
              BUYER
            </Text>
            <Text
              style={[
                styles.roleDescription,
                {color: isDark ? '#CCCCCC' : '#000000'},
              ]}>
              I want to request a product.
            </Text>
          </View>
          <Entypo
            name="chevron-thin-right"
            size={16}
            color={isDark ? '#CCCCCC' : '#5E5F60'}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.recitem,
            {
              backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
              borderColor:
                userRole === 'seller'
                  ? '#06C4D9'
                  : isDark
                  ? '#333333'
                  : 'rgba(220, 220, 220, 1)',
            },
          ]}
          onPress={() => setUserRole('seller')}>
          <View style={[styles.iconContainer, {backgroundColor: '#06C4D9'}]}>
            <FontAwesome5
              name="tag"
              size={22}
              color="#FFFFFF"
              style={{marginLeft: 2}}
            />
          </View>
          <View style={{marginLeft: 20, width: Width * 0.6}}>
            <Text
              style={[
                styles.roleText,
                {color: isDark ? '#FFFFFF' : '#000000'},
              ]}>
              SELLER
            </Text>
            <Text
              style={[
                styles.roleDescription,
                {color: isDark ? '#CCCCCC' : '#000000'},
              ]}>
              I have products to sell.
            </Text>
          </View>
          <Entypo
            name="chevron-thin-right"
            size={16}
            color={isDark ? '#CCCCCC' : '#5E5F60'}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.blueBotton,
            {backgroundColor: isDark ? '#0077B6' : '#00AEEF'},
          ]}
          onPress={() => navigation.navigate('Login')}>
          <Text style={{color: '#fff', fontSize: 20}}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  recitem: {
    flexDirection: 'row',
    width: Width * 0.9,
    height: Height * 0.1,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
    borderWidth: 2,
  },
  iconContainer: {
    width: Width * 0.12,
    marginLeft: 20,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  smallText: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'left',
    width: Width * 0.88,
    fontFamily: 'NunitoSans-VariableFont_YTLC,opsz,wdth,wght',
  },
  bigText: {
    fontSize: 24,
    textAlign: 'center',
    marginTop: Height * 0.1,
    fontWeight: 'bold',
    marginBottom: 2,
    width: Width * 0.9,
    marginRight: 5,
    fontFamily: 'Poppins-Bold',
  },
  roleText: {
    fontWeight: 'bold',
  },
  roleDescription: {
    fontSize: 13,
  },
  blueBotton: {
    width: Width * 0.9,
    height: Height * 0.07,
    borderRadius: 10,
    margin: 10,
    marginTop: Height * 0.36,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
