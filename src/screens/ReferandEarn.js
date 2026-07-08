import React, {useContext, useState} from 'react';
import {
  Dimensions,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Header from '../components/Header';
import {ThemeContext} from '../context/themeContext';
// import RNShare from 'react-native-share';
import Share from 'react-native-share';
const Width = Dimensions.get('window').width;
const Height = Dimensions.get('window').height;

export default function ReferandEarn({navigation}) {
  const [recentPostList, setRecentPostList] = useState([
    {
      id: 1,
      title: 'Lindsey Culhane  ',
      img: require('../assets/User-image.png'),
      time: 'facebook',
      status: 'Invite',
    },
    {
      id: 2,
      title: 'Lindsey Culhane  ',
      img: require('../assets/User-image.png'),
      time: 'whatsapp',
      status: 'Invite',
    },
    {
      id: 3,
      title: 'Lindsey Culhane ',
      img: require('../assets/User-image.png'),
      time: 'instagram',
      status: 'Accepted',
    },
    {
      id: 4,
      title: 'Lindsey Culhane  ',
      img: require('../assets/User-image.png'),
      time: 'whatsapp',
      status: 'Invite',
    },
    {
      id: 5,
      title: 'Lindsey Culhane ',
      img: require('../assets/User-image.png'),
      time: 'instagram',
      status: 'Invite',
    },
    {
      id: 6,
      title: 'Lindsey Culhane  ',
      img: require('../assets/User-image.png'),
      time: 'whatsapp',
      status: 'Invite',
    },
    {
      id: 7,
      title: 'Lindsey Culhane ',
      img: require('../assets/User-image.png'),
      time: 'instagram',
      status: 'Invite',
    },
  ]);
  const {theme} = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const APP_LINK = 'https://play.google.com/store/apps/details?id=com.yourapp';

  const SHARE_MESSAGE = `🚀 Check out this amazing app!

Download now:

${APP_LINK}`;

  const shareOnWhatsApp = async () => {
    try {
      await Share.shareSingle({
        social: Share.Social.WHATSAPP,
        message: SHARE_MESSAGE,
      });
    } catch (e) {
      console.log(e);
    }
  };

  const shareOnFacebook = async () => {
    shareMore();
  };

  const shareOnInstagram = async () => {
    shareMore();
  };

  const shareMore = async () => {
    try {
      await Share.open({
        title: 'Invite Friends',
        message: SHARE_MESSAGE,
        url: APP_LINK,
      });
    } catch (e) {
      console.log(e);
    }
  };

  const render2RectangleList = (item, index) => (
    <Pressable
      key={index}
      style={{
        justifyContent: 'center',
        marginBottom: 5,
        alignItems: 'center',
      }}>
      <View
        style={[
          styles.rectangle2,
          {
            flexDirection: 'row',
            backgroundColor: isDark ? '#000' : '#fff',
          },
        ]}>
        <Image
          source={item.img}
          style={{
            width: 50,
            height: 50,
            marginRight: 20,
          }}
          resizeMode="contain"
        />
        <View style={{flex: 1}}>
          <Text
            numberOfLines={1}
            style={[
              styles.recListText,
              {
                fontWeight: 'bold',
                fontSize: 16,
                letterSpacing: 1,
                width: 180,
                color: isDark ? '#fff' : 'rgba(0, 0, 0, 0.67)',
              },
            ]}>
            {item.title}
          </Text>
          <Text
            numberOfLines={2}
            style={[
              styles.recListText,
              {
                fontWeight: '400',
                fontSize: 16,
                width: 180,
                marginTop: 0,
                color: isDark ? 'rgb(187, 187, 187)' : 'rgba(94, 95, 96, 1)',
              },
            ]}>
            {item.time}
          </Text>
        </View>
        <View
          style={{
            justifyContent: 'center',
            height: 36,
            backgroundColor: 'rgba(241, 0, 134, 0.1)',
            borderRadius: 10,
          }}>
          <Text
            numberOfLines={2}
            style={[
              styles.recListText,
              {
                fontWeight: '500',
                fontSize: 16,
                marginTop: 0,
                paddingHorizontal: 10,
                color: isDark ? 'rgb(187, 187, 187)' : 'rgba(94, 95, 96, 1)',
              },
            ]}>
            {item.status}
          </Text>
        </View>
      </View>
    </Pressable>
  );

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        styles.screen,
        {backgroundColor: isDark ? '#000' : '#fff'},
      ]}>
      <Header header={'Refer and Earn'} />

      <Image
        source={require('../assets/referandearn.png')}
        style={{
          width: Width,
          height: Height * 0.25,
          alignSelf: 'center',
          marginBottom: 20,
        }}
        resizeMode="contain"
      />

      <Text
        style={[
          styles.headerText,
          {fontSize: 26, color: isDark ? '#fff' : '#000'},
        ]}>
        Earn Money by Refer{' '}
      </Text>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-evenly',
          marginTop: 20,
          alignSelf: 'center',
        }}>
        <Pressable
          style={[
            styles.iconStyle,
            {backgroundColor: isDark ? '#121212' : '#fff'},
          ]}
          onPress={shareOnWhatsApp}>
          <Image
            source={require('../assets/whatsapp.png')}
            style={{
              width: 35,
              height: 35,
            }}
            resizeMode="contain"
          />
        </Pressable>

        <Pressable
          style={[
            styles.iconStyle,
            {backgroundColor: isDark ? '#121212' : '#fff'},
          ]}
          onPress={shareOnFacebook}>
          <Image
            source={require('../assets/fb.png')}
            style={{
              width: 35,
              height: 35,
            }}
            resizeMode="contain"
          />
        </Pressable>

        <Pressable
          style={[
            styles.iconStyle,
            {backgroundColor: isDark ? '#121212' : '#fff'},
          ]}
          onPress={shareOnInstagram}>
          <Image
            source={require('../assets/Instagram.png')}
            style={{
              width: 35,
              height: 35,
            }}
            resizeMode="contain"
          />
        </Pressable>

        <Pressable
          style={[
            styles.iconStyle,
            {backgroundColor: isDark ? '#121212' : '#fff'},
          ]}
          onPress={shareMore}>
          <Image
            source={
              isDark
                ? require('../assets/more-dark.png')
                : require('../assets/more.png')
            }
            style={{
              width: 30,
              height: 30,
            }}
            resizeMode="contain"
          />
        </Pressable>
      </View>

      <View
        style={{
          borderTopRightRadius: 40,
          borderTopLeftRadius: 40,
          elevation: 5,
          shadowColor: isDark ? '#fff' : '#000',
          marginTop: 30,
          padding: 20,
          paddingBottom: 0,
          flex: 1,
        }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <Text
            style={[styles.sectionHeader, {color: isDark ? '#fff' : '#000'}]}>
            Invite a friend
          </Text>
          <Ionicons
            name="search"
            size={26}
            color={isDark ? 'rgb(255, 255, 255)' : 'rgb(0, 0, 0)'}
            style={{marginRight: 16, marginTop: 10}}
          />
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            backgroundColor: isDark ? '#000' : '#fff',
          }}
          style={{
            flex: 1, // Allows the ScrollView to expand within the parent
          }}>
          {recentPostList.map((item, index) =>
            render2RectangleList(item, index),
          )}
        </ScrollView>
      </View>

      {/* Confirmation Modal */}
      <Modal transparent={true} visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text
              style={[
                styles.modalText,
                {fontWeight: 'bold', marginBottom: 10},
              ]}>
              Delete ?
            </Text>
            <Text style={styles.modalText}>Are you sure want Delete?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                }}
                style={styles.cancelButton}>
                <Text style={[styles.buttonText, {color: 'black'}]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteButton}>
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff',
  },
  iconStyle: {
    width: Width * 0.15,
    height: 60,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2, // Shadow for Android
    margin: 10,
    backgroundColor: 'rgb(255, 255, 255)',
    shadowColor: '#000', // Black shadow color
    shadowOffset: {
      width: 4, // Offset to the right
      height: -4, // Offset upwards
    },
    shadowOpacity: 0.3, // Opacity of the shadow
    shadowRadius: 4, // Blur radius
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
    fontSize: 25,
    margin: 10,
    marginLeft: 5,
    marginTop: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: Height * 0.1,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    width: Width * 0.8,
    textAlign: 'center',
    alignSelf: 'center',
  },
  rectangle2: {
    backgroundColor: '#fff',
    width: Width * 0.95,
    height: 70,
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderRadius: 10,
    padding: 10,
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
