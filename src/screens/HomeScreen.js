import AsyncStorage from '@react-native-async-storage/async-storage';
import {useIsFocused} from '@react-navigation/native';
import React, {memo, useContext, useEffect, useState} from 'react';
import {
  BackHandler,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import SearchBar from '../components/SearchBar';
import {AuthContext} from '../context/authcontext';
import {ThemeContext} from '../context/themeContext';
import LocationPermission from '../hooks/uselocation';

const Width = Dimensions.get('window').width;
const Height = Dimensions.get('window').height;

// Centralized dark mode styles, now accepting notificationList as a parameter
const getStyles = (isDark, notificationList) => ({
  container: {backgroundColor: isDark ? '#000' : '#fff'},
  square: {backgroundColor: isDark ? '#121212' : 'rgba(248, 247, 247, 1)'},
  rectangle: {backgroundColor: isDark ? '#121212' : 'rgba(248, 247, 247, 1)'},
  rectangle2: {backgroundColor: isDark ? '#121212' : 'rgba(248, 247, 247, 1)'},
  text: {color: isDark ? '#fff' : '#000'},
  buttonBg: {
    backgroundColor:
      isDark && (!notificationList || notificationList.length === 0)
        ? 'transparent'
        : isDark
        ? '#000'
        : 'rgba(177, 177, 177, 0.14)',
  },
  borderColor: {
    borderColor: isDark ? 'rgb(149, 149, 149)' : 'rgb(255, 255, 255)',
  },
  locationIcon: isDark
    ? require('../assets/locatin-dark.png')
    : require('../assets/location.png'),
  notificationIcon: isDark
    ? require('../assets/notification-dark.png')
    : require('../assets/notification.png'),
  chatIcon: isDark
    ? require('../assets/chat-icon-dark.png')
    : require('../assets/chat-icon.png'),
});

// Reusable Components (unchanged)
const CategoryItem = memo(({item, onPress, isDark}) => (
  <TouchableOpacity
    style={{marginBottom: 15, alignItems: 'center'}}
    onPress={onPress}>
    <View style={[styles.square, getStyles(isDark).square]}>
      <Image
        source={{uri: item.image}}
        style={{width: item.id === 12 ? 30 : 50, height: 50}}
        resizeMode="contain"
      />
    </View>
    <Text style={[styles.newsDescription, getStyles(isDark).text]}>
      {item.name || 'Unnamed Category'}
    </Text>
  </TouchableOpacity>
));

const ProductItemHorizontal = memo(({item, onPress, isDark}) => (
  <TouchableOpacity
    style={{
      justifyContent: 'center',
      paddingLeft: 4,
      // marginBottom: 10,
      alignItems: 'center',
    }}
    onPress={onPress}>
    <View
      style={[
        styles.rectangle,
        {overflow: 'hidden'},
        getStyles(isDark).rectangle,
      ]}>
      <Image
        source={{uri: item.images?.[0]}}
        style={{width: '100%', height: '100%'}}
      />
    </View>
    <Text
      numberOfLines={1}
      style={[styles.recListText, getStyles(isDark).text]}>
      {item.title || 'Untitled'}
    </Text>
  </TouchableOpacity>
));

const ProductItemVertical = memo(({item, onPress, isDark}) => (
  <Pressable
    style={{
      justifyContent: 'center',
      marginBottom: 30,
      marginLeft: 10,
      alignItems: 'center',
    }}
    onPress={onPress}>
    <View
      style={[
        styles.rectangle2,
        {overflow: 'hidden'},
        getStyles(isDark).rectangle2,
      ]}>
      <View
        style={{
          width: '90%',
          height: '60%',
          overflow: 'hidden',
          borderRadius: 10,
          margin: 8,
          marginBottom: 0,
        }}>
        <Image
          source={{uri: item.images?.[0]}}
          style={{width: '100%', height: '100%'}}
        />
      </View>
      <Text
        numberOfLines={1}
        style={[
          styles.recListText,
          {fontWeight: 'bold', marginTop: 5, fontSize: 12, marginLeft: 10},
          getStyles(isDark).text,
        ]}>
        {item.title || 'Untitled'}
      </Text>
      <View
        style={{
          flexDirection: 'row',
          marginBottom: 5,
          alignItems: 'center',
          marginTop: 5,
        }}>
        <Image
          source={getStyles(isDark).locationIcon}
          style={{width: 12, height: 15, marginLeft: 5}}
        />
        <Text
          numberOfLines={2}
          style={[
            styles.recListText,
            {marginTop: 0, fontWeight: '500', fontSize: 10, width: 95, left: 5},
            getStyles(isDark).text,
          ]}>
          {item.userData?.businessAddress || 'Unknown Location'}
        </Text>
      </View>
    </View>
  </Pressable>
));

const SellerProductItem = memo(({item, onPress, isDark}) => (
  <TouchableOpacity
    style={{
      justifyContent: 'flex-start',
      marginBottom: 30,
      alignItems: 'center',
      width: Width * 0.5,
    }}
    onPress={onPress}>
    <View style={[styles.rectangle1, {overflow: 'hidden'}]}>
      <Image
        source={{uri: item.images?.[0]}}
        style={{width: '100%', height: '100%'}}
      />
    </View>
    <Text
      numberOfLines={1}
      style={[
        styles.recListText,
        {fontSize: 15, width: 160},
        getStyles(isDark).text,
      ]}>
      {item.productName || 'No Name'}
    </Text>
  </TouchableOpacity>
));

export default function HomeScreen({navigation}) {
  const {theme} = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const {
    getNearbyPosts,
    recentPosts,
    getCategories,
    getRecentPosts,
    categorydata,
    fullCategorydata,
    nearbyPosts,
    userRole,
    getSellerCategories,
    getPosts,
    posts,
    location,
    notificationList, // Ensure this is provided by AuthContext
    setLocation,
    unreadCount,
    getNotification,
    markNotificationsAsRead,
    getUserData,
  } = useContext(AuthContext);

  const darkModeStyles = getStyles(isDark, notificationList); // Pass notificationList here

  const isFocused = useIsFocused(); 
  const [filteredLists, setFilteredLists] = useState(
    userRole === 'buyer' ? [recentPosts ?? [], nearbyPosts ?? []] : posts ?? [],
  );
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    getCategories();

    getNotification();

    getUserData();

    if (userRole === 'buyer') {
      // Doesn't need GPS
      getRecentPosts();
    } else {
      getSellerCategories();
      getPosts();
    }
  }, [isFocused, userRole]);

  useEffect(() => {
    if (!location) return;

    if (userRole === 'buyer') {
      // Needs GPS
      getNearbyPosts();
    }
  }, [location]);

  useEffect(() => {
    setFilteredLists(
      userRole === 'buyer'
        ? [recentPosts ?? [], nearbyPosts ?? []]
        : posts ?? [],
    );
  }, [userRole, recentPosts, nearbyPosts, posts]);

  // Debug log for notificationList
  useEffect(() => {
    if (isFocused) {
      // console.log('length:', notificationList);
    }
  }, [isFocused]);

  const flatListKey = `flat-list-4`;

  const checkLoginStatus = async () => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      return userToken !== null;
    } catch (e) {
      console.error('Error fetching user token:', e);
      return false;
    }
  };

  const handleBackPress = async () => {
    const isLoggedIn = await checkLoginStatus();
    if (isLoggedIn && isFocused) {
      BackHandler.exitApp();
      return true;
    }
    return false;
  };

  useEffect(() => {
    if (isFocused) {
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        handleBackPress,
      );
      return () => backHandler.remove();
    }
  }, [isFocused]);

  const renderCategoryItem = ({item}) => (
    <CategoryItem
      item={item}
      isDark={isDark}
      onPress={() =>
        userRole === 'buyer'
          ? item.id === 12
            ? navigation.navigate('Categories', {
                item,
                selectedcategory: item.name,
              })
            : navigation.navigate('Subcategory', {
                item: item.subCategories,
                selectedcategory: item.name,
              })
          : navigation.navigate('preferences', {item, category: item.name})
      }
    />
  );

  const renderProductItem = ({item}) => (
    <ProductItemHorizontal
      item={item}
      isDark={isDark}
      onPress={() => navigation.navigate('shopdetails', {item})}
    />
  );

  const renderNearbyProductItem = ({item}) => (
    <ProductItemVertical
      item={item}
      isDark={isDark}
      onPress={() => navigation.navigate('shopdetails', {item})}
    />
  );

  const renderSellerProductItem = ({item}) => (
    <SellerProductItem
      item={item}
      isDark={isDark}
      onPress={() => navigation.navigate('sellerProductDetail', {item})}
    />
  );

  return (
    <View style={[styles.container, darkModeStyles.container]}>
      <LocationPermission setLocation={setLocation} />
      <View
        style={{
          flex: 1,
          width: '100%',
          justifyContent: 'flex-start',
          alignItems: 'center',
          paddingTop: 10,
        }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-start',
            marginBottom: 5,
          }}>
          <Pressable onPress={() => navigation.navigate('Profilescreen')}>
            <Image
              source={require('../assets/logo.png')}
              style={{width: 60, height: 60}}
              resizeMode="contain"
            />
          </Pressable>
          <View
            style={[
              styles.inputContainer,
              {
                borderWidth: 0,
                backgroundColor: darkModeStyles.container.backgroundColor,
                width: userRole === 'buyer' ? Width * 0.55 : Width * 0.6,
              },
            ]}>
            <View
              style={[
                styles.searchInput,
                {left: 1, color: darkModeStyles.text.color},
              ]}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: 'bold',
                  color: darkModeStyles.text.color,
                  marginTop: 2,
                }}>
                {errorMessage || 'Your Location'}
              </Text>
              {location ? (
                <Text
                  numberOfLines={1}
                  style={{
                    fontSize: 12,
                    fontWeight: '600',
                    width: Width * 0.53,
                    marginTop: 6,
                    color: isDark ? 'rgba(94,95,96,1)' : '#000',
                  }}>
                  📍 {location?.city}
                  {location?.state ? `, ${location.state}` : ''}
                </Text>
              ) : (
                <Text
                  numberOfLines={1}
                  style={{
                    fontSize: 13,
                    fontWeight: '500',
                    marginTop: 0,
                    width: Width * 0.53,
                    color: isDark
                      ? 'rgba(252, 252, 252, 0.4)'
                      : 'rgba(0, 0, 0, 0.4)',
                  }}>
                  {errorMessage || 'Fetching current location...'}
                </Text>
              )}
            </View>
          </View>
          {userRole === 'buyer' && (
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('Notification');
                markNotificationsAsRead(); // Call this when navigating to notifications
              }}
              style={[
                {
                  height: 40,
                  width: '11%',
                  alignSelf: 'center',
                  borderRadius: 10,
                  borderWidth: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 6,
                },
                darkModeStyles.buttonBg,
                darkModeStyles.borderColor,
              ]}>
              <Image
                source={darkModeStyles.notificationIcon}
                style={{width: 28, height: 26, alignSelf: 'center'}}
                resizeMode="contain"
              />
              {unreadCount > 0 ? (
                <View
                  style={{
                    position: 'absolute',
                    top: 5,
                    right: 5,
                    backgroundColor: 'red',
                    height: unreadCount > 9 ? 18 : 16,
                    width: unreadCount > 9 ? 18 : 16,
                    borderRadius: 9,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: isDark ? '#000' : '#fff',
                  }}>
                  <Text
                    style={{
                      color: 'white',
                      fontSize: 10,
                      fontWeight: 'bold',
                    }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Text>
                </View>
              ) : null}
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => navigation.navigate('messages')}
            style={[
              {
                height: 40,
                width: '11%',
                alignSelf: 'center',
                borderRadius: 10,
                borderWidth: 1,
                justifyContent: 'center',
                alignItems: 'center',
              },
              darkModeStyles.buttonBg,
              darkModeStyles.borderColor,
            ]}>
            <Image
              source={darkModeStyles.chatIcon}
              style={{width: 24, height: 22, alignSelf: 'center'}}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
        <SearchBar
          placeholder={'Search posts'}
          lists={
            userRole === 'buyer'
              ? [recentPosts ?? [], nearbyPosts ?? []]
              : posts ?? []
          }
          setFilteredLists={setFilteredLists}
          searchKey={userRole === 'buyer' ? 'title' : 'description'}
        />
        {userRole === 'buyer' ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{paddingBottom: 35}}
            style={{width: '100%', flex: 1}}>
            <FlatList
              style={{width: Width, left: '2%', alignSelf: 'center'}}
              key={flatListKey}
              horizontal={false}
              scrollEnabled={false}
              numColumns={4}
              showsHorizontalScrollIndicator={false}
              data={categorydata ?? []}
              keyExtractor={item =>
                item.id?.toString() || Math.random().toString()
              }
              renderItem={renderCategoryItem}
            />
            <Text
              style={[
                styles.bigText,
                {
                  alignSelf: 'flex-start',
                  fontSize: 16,
                  left: 25,
                  marginTop: 5,
                  marginBottom: 0,
                  color: darkModeStyles.text.color,
                },
              ]}>
              Recent posts
            </Text>
            <View style={{width: Width * 0.97, marginLeft: 14}}>
              <FlatList
                style={{marginTop: 8}}
                contentContainerStyle={{
                  paddingBottom: 10,
                  paddingRight: 10,
                }}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                data={filteredLists[0] ?? []}
                keyExtractor={item => item._id || Math.random().toString()}
                renderItem={renderProductItem}
              />
            </View>
            <Text
              style={[
                styles.bigText,
                {
                  alignSelf: 'flex-start',
                  fontSize: 16,
                  left: 25,
                  marginTop: 5,
                  marginBottom: 0,
                  color: darkModeStyles.text.color,
                },
              ]}>
              Nearby products
            </Text>
            <View style={{width: Width * 0.97, marginLeft: 14}}>
              <FlatList
                style={{marginTop: 8}}
                contentContainerStyle={{
                  paddingBottom: 10,
                  paddingRight: 10,
                }}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                data={filteredLists[1] ?? []}
                keyExtractor={item => item._id || Math.random().toString()}
                renderItem={renderNearbyProductItem}
              />
            </View>
          </ScrollView>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{paddingBottom: 35}}
            style={{width: '100%', flex: 1}}>
            <FlatList
              style={{width: Width, left: '2.5%', alignSelf: 'center'}}
              key={flatListKey}
              horizontal={false}
              scrollEnabled={false}
              numColumns={4}
              showsHorizontalScrollIndicator={false}
              data={fullCategorydata ?? []}
              keyExtractor={item =>
                item.id?.toString() || Math.random().toString()
              }
              renderItem={renderCategoryItem}
            />
            <Text
              style={[
                styles.bigText,
                {
                  alignSelf: 'flex-start',
                  fontSize: 16,
                  left: 25,
                  marginTop: 5,
                  marginBottom: 0,
                  color: darkModeStyles.text.color,
                },
              ]}>
              Recent posts
            </Text>
            <View style={{width: Width * 0.97, marginLeft: 0}}>
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  marginTop: '2%',
                }}>
                {filteredLists?.length > 0 ? (
                  filteredLists.map(item => (
                    <View
                      key={item._id || Math.random().toString()}
                      style={{width: '48%', margin: '1%'}}>
                      {renderSellerProductItem({item})}
                    </View>
                  ))
                ) : (
                  <Text style={darkModeStyles.text}>No items found</Text>
                )}
              </View>
            </View>
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: 'white'},
  square: {
    backgroundColor: 'rgba(248, 247, 247, 1)',
    width: Width * 0.21,
    marginRight: '3%',
    height: 78,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  rectangle1: {
    backgroundColor: 'rgba(248, 247, 247, 1)',
    width: 170,
    height: 170,
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderRadius: 10,
  },
  rectangle: {
    backgroundColor: 'rgba(248, 247, 247, 1)',
    width: 120,
    marginRight: 10,
    height: 130,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  rectangle2: {
    backgroundColor: 'rgb(255, 255, 255)',
    width: 125,
    marginRight: 2,
    height: 180,
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderRadius: 10,
    elevation: 5,
  },
  newsDescription: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000',
    right: 6,
    marginTop: 4,
  },
  recListText: {
    fontSize: 12,
    fontWeight: '500',
    width: 110,
    color: '#000',
    marginTop: 4,
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
    marginTop: 30,
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
    marginTop: '60%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContainer: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: 'rgb(0, 0, 0)',
    borderWidth: 1,
    borderRadius: 14,
    height: 45,
    padding: 1,
  },
  searchInput: {
    width: Width * 0.85,
    alignSelf: 'center',
    fontSize: 17,
    fontWeight: '500',
    color: 'black',
    height: 45,
    left: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
});
