import {useIsFocused} from '@react-navigation/native';
import React, {useContext, useEffect, useState} from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Entypo from 'react-native-vector-icons/Entypo';
import Feather from 'react-native-vector-icons/Feather';
import {AuthContext} from '../context/authcontext';
import {ThemeContext} from '../context/themeContext';

const Width = Dimensions.get('window').width;
const Height = Dimensions.get('window').height;

const PRIVACY_POLICY_URL = 'https://crosydeal.com/privacy.html';
const TERMS_URL = 'https://crosydeal.com/terms.html';

// ---- Reusable pieces -------------------------------------------------

function MenuItem({isDark, icon, iconSize, label, onPress, isLast}) {
  return (
    <Pressable
      style={[
        styles.menuRow,
        {
          backgroundColor: isDark ? 'rgb(0, 0, 0)' : 'white',
          borderColor: isDark
            ? 'rgba(255, 255, 255, 0.1)'
            : 'rgba(0, 0, 0, 0.1)',
        },
        isLast && styles.menuRowLast,
      ]}
      onPress={onPress}>
      <View
        style={[
          styles.menuRowInner,
          {backgroundColor: isDark ? 'rgb(0, 0, 0)' : 'white'},
        ]}>
        <Image
          source={icon}
          style={[styles.menuIcon, iconSize]}
          resizeMode="contain"
        />
        <Text
          style={[
            styles.recListText,
            styles.menuLabel,
            {color: isDark ? 'white' : 'black'},
          ]}>
          {label}
        </Text>
        <AntDesign
          name="right"
          size={16}
          color={isDark ? 'white' : 'rgba(0, 0, 0, 0.34)'}
          style={{padding: 5}}
        />
      </View>
    </Pressable>
  );
}

function RadioRow({isDark, label, selected, onPress}) {
  return (
    <Pressable onPress={onPress} style={styles.radioRow}>
      <View
        style={[
          styles.radioOuter,
          selected
            ? {backgroundColor: isDark ? 'rgb(255, 255, 255)' : 'rgb(0, 0, 0)'}
            : {
                borderWidth: 2.3,
                borderColor: isDark ? 'rgb(255, 255, 255)' : 'rgb(0, 0, 0)',
                backgroundColor: isDark ? 'rgb(0, 0, 0)' : 'rgb(255, 255, 255)',
              },
        ]}>
        {selected && (
          <View
            style={[
              styles.radioInner,
              {
                borderColor: isDark ? 'black' : 'white',
                backgroundColor: isDark ? 'rgb(255, 255, 255)' : 'rgb(0, 0, 0)',
              },
            ]}
          />
        )}
      </View>
      <Text
        style={[
          styles.modalText,
          styles.radioLabel,
          {color: isDark ? 'white' : 'black'},
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}

// ---- Main screen -------------------------------------------------------

export default function ProfileScreen({navigation}) {
  const {theme, changeTheme} = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const isFocused = useIsFocused();

  const {userRole, handleLogout, getUserData, Userfulldata} =
    useContext(AuthContext);

  const [selectedtheme, setSelectedtheme] = useState('SystemDefault');
  const [modalVisible, setModalVisible] = useState(false); // theme modal
  const [modalVisible2, setModalVisible2] = useState(false); // logout modal

  useEffect(() => {
    if (isFocused) getUserData();
  }, [isFocused]);

  const handlelogout = () => {
    handleLogout();
    setModalVisible2(false);
  };

  const openLink = async url => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Unable to open the page.');
    }
  };

  const isBuyer = userRole === 'buyer';
  const isSeller = userRole === 'seller';

  // Data-driven menu list — order/content matches the original screen exactly.
  const menuItems = [
    {
      key: 'settings',
      icon: require('../assets/profile-2.png'),
      iconSize: {width: 25, height: 20},
      label: 'Profile Settings',
      onPress: () => navigation.navigate('profilesettings'),
    },
    isSeller && {
      key: 'products',
      icon: require('../assets/product-img.png'),
      iconSize: {width: 25, height: 20},
      label: 'Products',
      onPress: () => navigation.navigate('ProductsList'),
    },
    {
      key: 'help',
      icon: require('../assets/help.png'),
      iconSize: {width: 22, height: 18},
      label: 'Help and Support',
      onPress: () => navigation.navigate('helpscreen'),
    },
    {
      key: 'privacy-security',
      icon: require('../assets/privacy.png'),
      iconSize: {width: 22, height: 18},
      label: 'Privacy and Security',
      onPress: () => navigation.navigate('privacyandsecurity'),
    },
    isBuyer && {
      key: 'refer',
      icon: require('../assets/refer.png'),
      iconSize: {width: 25, height: 25},
      label: 'Refer and Earn',
      onPress: () => navigation.navigate('referandearn'),
    },
    {
      key: 'privacy-policy',
      icon: require('../assets/legal.png'),
      iconSize: {width: 25, height: 20},
      label: 'Privacy Policies',
      onPress: () => openLink(PRIVACY_POLICY_URL),
    },
    {
      key: 'terms',
      icon: require('../assets/legal.png'),
      iconSize: {width: 25, height: 20},
      label: 'Terms & Conditions',
      onPress: () => openLink(TERMS_URL),
    },
    isBuyer && {
      key: 'preferences',
      icon: require('../assets/prefernce.png'),
      iconSize: {width: 22, height: 23},
      label: 'Prefernces',
      onPress: () => navigation.navigate('preferences'),
    },
    {
      key: 'theme',
      icon: require('../assets/theme.png'),
      iconSize: {width: 25, height: 20},
      label: 'Theme',
      onPress: () => setModalVisible(true),
    },
    {
      key: 'logout',
      icon: require('../assets/logout.png'),
      iconSize: {width: 25, height: 20},
      label: 'Logout',
      onPress: () => setModalVisible2(true),
    },
  ].filter(Boolean);

  const themeOptions = [
    {
      key: 'SystemDefault',
      label: 'System Default',
      apply: () => changeTheme('SystemDefault'),
    },
    {key: 'Dark', label: 'Dark', apply: () => changeTheme('dark')},
    {key: 'Light', label: 'Light', apply: () => changeTheme('light')},
  ];

  return (
    <View
      style={[styles.container, {backgroundColor: isDark ? '#000' : '#fff'}]}>
      <View style={styles.overlay}>
        <View
          style={[
            styles.modalContainer,
            {
              backgroundColor: isDark
                ? 'rgba(0, 0, 0, 0.8)'
                : 'rgba(255, 255, 255, 0.79)',
            },
          ]}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <TouchableOpacity
                onPress={() =>
                  navigation.reset({index: 0, routes: [{name: 'BottomTabs'}]})
                }>
                <Entypo
                  name="chevron-thin-left"
                  size={20}
                  color={
                    isDark ? 'rgba(255, 255, 255, 1)' : 'rgba(94, 95, 96, 1)'
                  }
                />
              </TouchableOpacity>
              <Text
                style={[
                  styles.recListText,
                  styles.headerTitle,
                  {color: isDark ? 'white' : 'black'},
                ]}>
                Profile
              </Text>
            </View>

            {/* Profile card */}
            <View
              style={[
                styles.profileCard,
                {
                  backgroundColor: isDark ? 'rgb(0, 0, 0)' : 'white',
                  shadowColor: isDark ? 'rgb(255, 255, 255)' : 'rgb(0, 0, 0)',
                },
              ]}>
              <TouchableOpacity
                onPress={() => navigation.navigate('profilesettings')}>
                <Image
                  source={
                    Userfulldata?.profile?.length > 0 &&
                    Userfulldata?.profile[0]
                      ? {uri: Userfulldata.profile[0]}
                      : require('../assets/User-image.png')
                  }
                  style={styles.avatar}
                  resizeMode="cover"
                />
              </TouchableOpacity>

              <View>
                <Text
                  style={[
                    styles.recListText,
                    styles.profileName,
                    {color: isDark ? 'white' : 'black'},
                  ]}>
                  {Userfulldata?.name || 'fetching name...'}
                </Text>
                <Text
                  style={[
                    styles.recListText,
                    styles.profileEmail,
                    {
                      color: isDark
                        ? 'rgba(253, 253, 253, 0.59)'
                        : 'rgba(23, 23, 23, 0.59)',
                    },
                  ]}>
                  {Userfulldata?.email || 'fetching email...'}
                </Text>
              </View>

              <Feather
                onPress={() =>
                  navigation.navigate(isBuyer ? 'editProfile' : 'Sellerprofile')
                }
                name="edit"
                size={24}
                color={isDark ? 'white' : 'rgba(0, 0, 0, 0.34)'}
                style={{marginLeft: 20, padding: 5}}
              />
            </View>

            {/* Menu list */}
            <View
              style={[
                styles.menuCard,
                {
                  height: Height * (isBuyer ? 0.56 : 0.49),
                  backgroundColor: isDark
                    ? 'rgb(0, 0, 0)'
                    : 'rgb(255, 255, 255)',
                  shadowColor: isDark ? 'rgb(255, 255, 255)' : 'rgb(0, 0, 0)',
                },
              ]}>
              {menuItems.map((item, index) => (
                <MenuItem
                  key={item.key}
                  isDark={isDark}
                  icon={item.icon}
                  iconSize={item.iconSize}
                  label={item.label}
                  onPress={item.onPress}
                  isLast={index === menuItems.length - 1}
                />
              ))}
            </View>
          </View>
        </View>
      </View>

      {/* Theme modal */}
      <Modal
        transparent={modalVisible}
        visible={modalVisible}
        animationType="slide">
        <Pressable
          style={[
            styles.modalContainer2,
            {
              backgroundColor: isDark
                ? 'rgba(255, 255, 255, 0.35)'
                : 'rgba(0, 0, 0, 0.3)',
            },
          ]}
          onPress={() => setModalVisible(false)}>
          <View
            style={[
              styles.modalContent2,
              {backgroundColor: isDark ? '#000' : '#fff'},
            ]}>
            <Text
              style={[
                styles.modalText,
                styles.themeTitle,
                {color: isDark ? 'white' : 'black'},
              ]}>
              Choose theme
            </Text>

            <View
              style={{
                flexDirection: 'row',
                backgroundColor: isDark
                  ? 'rgba(25, 25, 25, 1)'
                  : 'rgba(243, 243, 243, 1)',
                width: '100%',
                height: 5,
              }}
            />

            {themeOptions.map(option => (
              <RadioRow
                key={option.key}
                isDark={isDark}
                label={option.label}
                selected={selectedtheme === option.key}
                onPress={() => {
                  setSelectedtheme(option.key);
                  option.apply();
                }}
              />
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* Logout confirmation modal */}
      <Modal
        transparent={modalVisible2}
        visible={modalVisible2}
        animationType="slide">
        <Pressable
          style={[
            styles.modalContainer3,
            {
              backgroundColor: isDark
                ? 'rgba(255, 255, 255, 0.35)'
                : 'rgba(0, 0, 0, 0.3)',
            },
          ]}
          onPress={() => setModalVisible2(false)}>
          <View
            style={[
              styles.modalContent3,
              {backgroundColor: isDark ? '#000' : '#fff'},
            ]}>
            <Text
              style={[
                styles.modalText,
                {
                  fontWeight: 'bold',
                  marginBottom: 10,
                  fontSize: 20,
                  color: isDark ? '#fff' : '#000',
                },
              ]}>
              Log out ?
            </Text>
            <Text style={[styles.modalText, {color: isDark ? '#fff' : '#000'}]}>
              Are you sure you want to log out your account ?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setModalVisible2(false)}
                style={[
                  styles.cancelButton,
                  {
                    backgroundColor: isDark ? '#121212' : '#fff',
                    borderColor: isDark ? null : '#000',
                    borderWidth: 1,
                  },
                ]}>
                <Text
                  style={[
                    styles.buttonText,
                    {color: isDark ? '#fff' : 'black'},
                  ]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handlelogout}
                style={styles.deleteButton}>
                <Text style={styles.buttonText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: Width,
    height: Height,
    backgroundColor: 'white',
  },
  overlay: {position: 'absolute', top: 0, left: 0, right: 0, bottom: 0},
  modalContainer: {
    width: Width,
    height: Height,
    backgroundColor: 'rgba(255, 255, 255, 0.79)',
  },
  modalContent: {
    borderRadius: 10,
    padding: 20,
  },
  headerTitle: {
    fontSize: 24,
    alignSelf: 'flex-start',
    width: '100%',
    margin: 10,
    marginLeft: 20,
  },
  profileCard: {
    flexDirection: 'row',
    width: Width * 0.9,
    height: Height * 0.12,
    alignSelf: 'center',
    alignItems: 'center',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 10,
    borderRadius: 5,
  },
  avatar: {
    width: Width * 0.15,
    height: Height * 0.07,
    marginLeft: 10,
    marginRight: 10,
    borderRadius: 100,
  },
  profileName: {
    fontSize: 14,
    width: Width * 0.5,
    marginLeft: 2,
  },
  profileEmail: {
    marginLeft: 2,
  },
  menuCard: {
    width: Width * 0.9,
    marginTop: 14,
    borderRadius: 5,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuRow: {
    width: Width * 0.9,
    height: Height * 0.062,
    justifyContent: 'center',
    borderBottomWidth: 1,
  },
  menuRowLast: {
    borderEndEndRadius: 5,
    borderBottomLeftRadius: 5,
  },
  menuRowInner: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    borderRadius: 5,
  },
  menuIcon: {
    marginLeft: 15,
  },
  menuLabel: {
    fontSize: 15,
    width: Width * 0.66,
    marginLeft: 15,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  recListText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
  },
  modalContainer2: {
    width: Width,
    height: Height,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalContent2: {
    width: Width * 0.9,
    height: Height * 0.25,
    borderRadius: 30,
    justifyContent: 'center',
    marginBottom: '80%',
    alignItems: 'flex-start',
    elevation: 10,
  },
  themeTitle: {
    fontWeight: '600',
    marginBottom: 10,
    fontSize: 25,
    marginLeft: 30,
    textAlign: 'left',
  },
  radioRow: {
    flexDirection: 'row',
    marginLeft: 30,
    marginTop: 15,
    alignItems: 'center',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 15,
    height: 15,
    borderWidth: 2,
    borderRadius: 10,
  },
  radioLabel: {
    fontWeight: '400',
    marginLeft: 20,
    marginBottom: 0,
    fontSize: 19,
    textAlign: 'left',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
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
  modalContainer3: {
    width: Width,
    height: Height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent3: {
    width: Width * 0.9,
    height: Height * 0.25,
    borderRadius: 30,
    justifyContent: 'center',
    padding: 20,
    alignItems: 'center',
    elevation: 10,
  },
});
