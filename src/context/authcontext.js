import notifee, {AndroidImportance, EventType} from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import messaging from '@react-native-firebase/messaging';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import axios from 'axios';
import {getDistance} from 'geolib';
import {createContext, useEffect, useState} from 'react';
import {
  Alert,
  AppState,
  Linking,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import io from 'socket.io-client';
// const API_URL = 'http://10.0.2.2:8080';
const API_URL = 'https://cozy-deals-be-production.up.railway.app';

const AuthContext = createContext();

// Centralized axios instance with default headers
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

let logoutHandler = null;

export const registerLogoutHandler = handler => {
  logoutHandler = handler;
};

apiClient.interceptors.response.use(
  response => response,
  async error => {
    const status = error.response?.status;

    if ((status === 401 || status === 403) && logoutHandler) {
      await logoutHandler();
    }

    return Promise.reject(error);
  },
);
// Helper to get auth headers
const getAuthHeaders = token => ({
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
});

// Helper for consistent error handling
const handleApiError = (
  error,
  defaultMessage = 'An unexpected error occurred',
) => {
  if (axios.isAxiosError(error)) {
    const message =
      error.response?.data?.body ||
      error.response?.data?.message ||
      defaultMessage;
    console.error('API Error:', message);
    Alert.alert('Error', message);
    return message;
  }
  console.error('Unexpected Error:', error);
  Alert.alert('Error', defaultMessage);
  return defaultMessage;
};

const AuthProvider = ({children}) => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  // State Management
  const [user, setUser] = useState(null);
  const [userdata, setUserdata] = useState(null);
  const [Userfulldata, setUserfulldata] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState({
    register: false,
    login: false,
    google: false,
    newPassword: false,
  });
  const [fcmToken, setFcmToken] = useState(null);
  const [socket, setSocket] = useState(null);
  const [appState, setAppState] = useState(AppState.currentState);
  const [handleRemenberme, sethandleRemenberme] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastVisitedNotification, setLastVisitedNotification] = useState(null);

  // Data States
  const [categorydata, setcategorydata] = useState([]);
  const [fullCategorydata, setFullCategorydata] = useState([]);
  const [posts, setposts] = useState([]);
  const [recentPosts, setrecentPosts] = useState([]);
  const [nearbyPosts, setnearbyPosts] = useState([]);
  const [filteredPosts, setfilteredPosts] = useState([]);
  const [filteredShops, setfilteredShops] = useState([]);
  const [allShops, setAllShops] = useState([]);

  const [singleShop, setSingleShop] = useState([]);
  const [singleProfile, setSingleProfile] = useState([]);
  const [buyerList, setbuyerList] = useState([]);
  const [shopRating, setShopRating] = useState([]);
  const [imageUrl, setimageUrl] = useState([]);
  const [PostsHistory, setPostsHistory] = useState([]);
  const [notificationList, setnotificationList] = useState([]);
  const [RatingLiked, setRatingLiked] = useState([]);
  const [FAQs, setFAQs] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [location, setLocation] = useState(null);
  const [isposting, setisposting] = useState(false);

  // Deep Linking
  useEffect(() => {
    const handleDeepLink = url => {
      if (!url || typeof url !== 'string') return;
      const productId = url.match(/\/product\/([^?]+)/)?.[1];
      const shopId = url.match(/\/shop\/([^?]+)/)?.[1];
      if (productId) {
        navigation.navigate('ProductDetails', {productId});
      } else if (shopId) {
        navigation.navigate('ShopDetails', {shopId});
      } else {
        console.log('Unhandled deep link:', url);
      }
    };

    Linking.getInitialURL()
      .then(handleDeepLink)
      .catch(err => console.error('Initial URL error:', err));
    const subscription = Linking.addEventListener('url', ({url}) =>
      handleDeepLink(url),
    );
    return () => subscription.remove();
  }, [navigation]);

  // App State and Socket Management
  useEffect(() => {
    const handleAppStateChange = nextAppState => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        initializeSocket();
      }

      setAppState(nextAppState);
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );

    return () => {
      subscription.remove();
    };
  }, [appState]);
  // Initialize Google Sign-In, Notifications, and Check Login
  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        '945009550802-tngsfs4c21vkp09ifircs4vk8mfa810h.apps.googleusercontent.com',
      offlineAccess: true,
      forceCodeForRefreshToken: true,
    });
    getDeviceToken();
    checkLoginStatus();
    setupNotifications();
    loadLastVisitedTime();
  }, []);

  // Socket Initialization
  const initializeSocket = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      // if (socket) socket.disconnect();

      const newSocket = io(`${API_URL}/chat`, {
        transports: ['websocket'],
        extraHeaders: {token},
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 3000,
      });

      newSocket.on('connect', () => {
        console.log('✅ Socket connected!');

        setSocket(newSocket);
      });

      newSocket.on('connect_error', error =>
        console.error('🚨 Socket connection error:', error.message),
      );
      newSocket.on('disconnect', () => console.log('🔌 Socket disconnected'));
    } catch (error) {
      console.error('Socket initialization error:', error);
    }
  };

  // Notification Setup
  const setupNotifications = async () => {
    try {
      // 1. Register device for remote messages (required for iOS)
      await messaging().registerDeviceForRemoteMessages();

      // 2. Request permissions (handles platform differences)
      if (Platform.OS === 'ios') {
        await messaging().requestPermission({
          alert: true,
          badge: true,
          sound: true,
        });
      }
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );

        console.log('Notification Permission:', granted);
      }
      // 3. Create notification channel (Android only)
      await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
        importance: AndroidImportance.HIGH,
      });

      // 4. Handle initial notification (app closed)
      const initialNotification = await messaging().getInitialNotification();
      if (initialNotification) {
        navigation.navigate('Notification', {
          notificationData: initialNotification.data,
        });
      }

      // 5. Handle notification opened from background
      const unsubscribeOnOpen = messaging().onNotificationOpenedApp(
        remoteMessage => {
          navigation.navigate('Notification', {
            notificationData: remoteMessage.data,
          });
        },
      );

      // 6. Handle incoming foreground messages
      const unsubscribeOnMessage = messaging().onMessage(
        async remoteMessage => {
          await notifee.displayNotification({
            title: remoteMessage.notification?.title || 'New Notification',
            body: remoteMessage.notification?.body || 'You have a new message',
            android: {
              channelId: 'default',
              pressAction: {id: 'default'},
            },
            ios: {
              foregroundPresentationOptions: {
                badge: true,
                sound: true,
                banner: true,
                list: true,
              },
            },
            data: remoteMessage.data || {},
          });
        },
      );

      // 7. Handle notification press (via notifee)
      const unsubscribeNotifee = notifee.onForegroundEvent(({type, detail}) => {
        if (type === EventType.PRESS) {
          navigation.navigate('Notification', {
            notificationData: detail.notification?.data,
          });
        }
      });

      return () => {
        unsubscribeOnOpen();
        unsubscribeOnMessage();
        unsubscribeNotifee();
      };
    } catch (error) {
      console.error('Notification setup error:', error);
    }
  };

  // Authentication Functions
  /**
   * Registers a new user and sends OTP
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @param {string} name - User's name
   * @param {boolean} rememberMe - Remember me option
   */
  const handleRegister = async (email, password, name, rememberMe) => {
    setIsLoading(prev => ({...prev, register: true}));
    try {
      await apiClient.post('/api/user/sendOTP', {
        emailPhone: email,
        password,
        userName: name,
        isAcceptTermConditions: true,
        roleId: userRole === 'buyer' ? 0 : 1,
        fcmToken,
      });
      await AsyncStorage.setItem('rememberMe', rememberMe ? 'true' : 'false');
      navigation.navigate('OTPScreen', {emailPhone: email, password});
    } catch (error) {
      handleApiError(error, 'Email already exists.');
    } finally {
      setIsLoading(prev => ({...prev, register: false}));
    }
  };

  /**
   * Logs in a user
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @param {boolean} rememberMe - Remember me option
   */
  const handleLogin = async (email, password, rememberMe) => {
    setIsLoading(prev => ({...prev, login: true}));
    try {
      const response = await apiClient.post('/api/user/login', {
        emailPhone: email,
        password,
        isAcceptTermConditions: true,
        roleId: userRole === 'buyer' ? 0 : 1,
        fcmToken,
      });
      const loginResponse = response.data;

      const profileResponse = await apiClient.get('/api/user/getProfile', {
        headers: getAuthHeaders(loginResponse.token),
      });

      const latestUser = {
        token: loginResponse.token,
        ...profileResponse.data.data,
      };

      setUserdata(latestUser);
      setUserfulldata(profileResponse.data.data);
      setIsLoggedIn(true);
      await AsyncStorage.multiSet([
        ['userToken', latestUser.token],
        ['userData', JSON.stringify(latestUser)],
        ['selectedUserRole', userRole],
        ['rememberMe', rememberMe ? 'true' : 'false'],
      ]);

      navigation.reset({
        index: 0,
        routes: [{name: 'BottomTabs'}],
      });
    } catch (error) {
      console.log(
        'LOGIN ERROR:',
        JSON.stringify(error.response?.data, null, 2),
      );
      console.log('STATUS:', error.response?.status);

      handleApiError(error, 'Invalid credentials.');
    } finally {
      setIsLoading(prev => ({...prev, login: false}));
    }
  };

  /**
   * Handles Google Sign-In
   */
  const signInWithGoogle = async () => {
    setIsLoading(prev => ({...prev, google: true}));
    try {
      await GoogleSignin.signOut().catch(() => {});
      await GoogleSignin.revokeAccess().catch(() => {});

      await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});
      const signInResult = await GoogleSignin.signIn();
      const idToken = signInResult.data?.idToken || signInResult.user?.idToken;
      if (!idToken) throw new Error('No ID token received from Google');

      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      const userCredential = await auth().signInWithCredential(
        googleCredential,
      );
      if (!userCredential?.user?.email)
        throw new Error('Could not retrieve user information from Firebase');

      const storedUserData = JSON.parse(
        (await AsyncStorage.getItem('userData')) || '{}',
      );
      const profileImage =
        userCredential.user.photoURL || storedUserData?.profile || null;

      const response = await apiClient.post(
        '/api/user/googleLogin',
        {
          email: userCredential.user.email,
          name: userCredential.user.displayName,
          profile: profileImage,
          roleId: userRole === 'buyer' ? 0 : 1,
          fcmToken,
          idToken,
        },
        {headers: getAuthHeaders(idToken)},
      );

      const mergedUserData = {
        ...storedUserData,
        ...response.data,
        profile: profileImage || response.data.profile,
        token: response.data.token,
      };

      setUserdata(mergedUserData);
      await AsyncStorage.multiSet([
        ['userToken', mergedUserData.token],
        ['userData', JSON.stringify(mergedUserData)],
        ['selectedUserRole', userRole],
        ['rememberMe', 'true'],
      ]);
      navigation.navigate('BottomTabs');
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      await GoogleSignin.signOut();
      Alert.alert('Sign-in Failed', error.message || 'Google sign-in failed.');
    } finally {
      setIsLoading(prev => ({...prev, google: false}));
    }
  };

  /**
   * Verifies OTP for registration
   * @param {string} email - User's email
   * @param {string} otp - OTP code
   */
  const VerifyOTP = async (email, otp) => {
    try {
      const response = await apiClient.post('/api/user/verifyOTP', {
        emailPhone: email,
        roleId: userRole === 'buyer' ? 0 : 1,
        otp,
        fcmToken,
      });
      const user = response.data;
      setUserdata(user);
      await AsyncStorage.multiSet([
        ['userToken', user.token],
        ['userData', JSON.stringify(user)],
        ['selectedUserRole', userRole],
      ]);
      // navigation.navigate('AddressScreen');
      navigation.navigate('BottomTabs');
    } catch (error) {
      handleApiError(error, 'Invalid OTP or password.');
    }
  };

  /**
   * Logs out the user
   */
  const handleLogout = async () => {
    try {
      await GoogleSignin.signOut();

      await clearSession();

      navigation.reset({
        index: 0,
        routes: [{name: 'commonscreen'}],
      });
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleForgetPassword = async email => {
    try {
      const response = await apiClient.post('/api/user/sendForgotPasswordOTP', {
        emailPhone: email,
      });
      navigation.navigate('OTPScreen', {emailPhone: email});
      // Alert.alert('OTP Sent Check your Email', response.data.msg);
    } catch (error) {
      handleApiError(error, 'Failed to send OTP.');
    }
  };

  const handleVerifyPasswordOtp = async (email, otp) => {
    try {
      await apiClient.post('/api/user/verifyForgotPasswordOTP', {email, otp});
      navigation.navigate('NewPassword', {email});
    } catch (error) {
      handleApiError(error, 'Invalid OTP.');
    }
  };

  const handleNewPassword = async (emailPhone, otp, newPassword) => {
    setIsLoading(prev => ({...prev, newPassword: true}));
    try {
      await apiClient.post('/api/user/resetPassword', {
        emailPhone,
        otp,
        newPassword,
      });
      Alert.alert('Success', 'Password reset successfully.');
      navigation.navigate('Login');
    } catch (error) {
      handleApiError(error, 'Failed to reset password.');
    } finally {
      setIsLoading(prev => ({...prev, newPassword: false}));
    }
  };

  // Device Token
  const getDeviceToken = async () => {
    try {
      // 1. Register device first (iOS requirement)
      await messaging().registerDeviceForRemoteMessages();

      // 2. Request permissions (iOS)
      if (Platform.OS === 'ios') {
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (!enabled) {
          Alert.alert(
            'Permission Denied',
            'Enable push notifications to receive updates.',
          );
          return;
        }
      }

      // 3. Get token
      const token = await messaging().getToken();
      if (token) {
        setFcmToken(token);
        console.log('fcmToken', token);

        // Send token to your backend here
      }
    } catch (error) {
      console.error('Error fetching device token:', error);
    }
  };

  // Category Functions
  const getCategories = async () => {
    try {
      const response = await apiClient.get('/api/requirementPost/getCategory', {
        headers: getAuthHeaders(userdata?.token),
      });
      const categories = response.data.data;
      setFullCategorydata(categories);
      const filteredData = categories.slice(0, 11);
      setcategorydata([
        ...filteredData,
        {
          id: 12,
          name: 'See more',
          image: 'https://i.postimg.cc/W1bRGDRM/see-more.png',
        },
      ]);
    } catch (error) {
      handleApiError(error, 'Failed to load categories.');
    }
  };

  const getSellerCategories = async () => {
    try {
      const response = await apiClient.get('/api/seller/category/getCategory', {
        headers: getAuthHeaders(userdata?.token),
      });
      setFullCategorydata(response.data.data);
    } catch (error) {
      handleApiError(error, 'Failed to load seller categories.');
    }
  };

  const isWithinRadius = (itemLatitude, itemLongitude) => {
    if (!location) return true;

    const distance = getDistance(
      {
        latitude: Number(location.latitude),
        longitude: Number(location.longitude),
      },
      {
        latitude: Number(itemLatitude),
        longitude: Number(itemLongitude),
      },
    );

    return distance <= 50000;
  };

  // Post Functions
  const getPosts = async (category = null) => {
    try {
      const url = category
        ? `/api/requirementPost/getRequirement?category=${encodeURIComponent(
            category.trim(),
          )}`
        : '/api/requirementPost/getRequirement';
      const response = await apiClient.get(url, {
        headers: getAuthHeaders(userdata?.token),
      });
      // setposts(response.data.data);
      console.log('setposts', response.data.data);
      const filtered = response.data.data.filter(post =>
        isWithinRadius(post.location?.latitude, post.location?.longitude),
      );
      setposts(filtered);
    } catch (error) {
      handleApiError(error, 'Failed to load posts.');
    }
  };

  const getRecentPosts = async () => {
    try {
      const response = await apiClient.get('/api/buyer/post/recentPosts', {
        headers: getAuthHeaders(userdata?.token),
      });
      // setrecentPosts(response.data.data);
      console.log('setrecentPosts', response.data.data);

      if (!location) {
        setrecentPosts(response.data.data);
        return;
      }

      const filtered = response.data.data.filter(post =>
        isWithinRadius(post.latitude, post.longitude),
      );
      setrecentPosts(filtered);
    } catch (error) {
      handleApiError(error, 'Failed to load recent posts.');
    }
  };

  const getNearbyPosts = async () => {
    try {
      const payload = {
        startDistance: '',
        endDistance: '',
        latitude: location?.latitude,
        longitude: location?.longitude,
        rating: 2,
        topRated: true,
        key: '',
        categories: [],
        myPost: false,
        userId: '',
      };
      const response = await apiClient.post(
        '/api/buyer/post/allPosts',
        payload,
        {
          headers: getAuthHeaders(userdata?.token),
        },
      );
      // setnearbyPosts(response.data.data);
      console.log('setnearbyPosts', response.data.data);

      if (!location) {
        setnearbyPosts(response.data.data);
        return;
      }

      const filtered = response.data.data.filter(post =>
        isWithinRadius(post.latitude, post.longitude),
      );

      setnearbyPosts(filtered);
    } catch (error) {
      handleApiError(error, 'Failed to load nearby posts.');
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = value => (value * Math.PI) / 180;

    const R = 6371;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  };

  const applyShopFilters = (
    shops,
    categories,
    rating,
    distance,
    sortBy = 'rating',
    selectedLocations = [], // NEW
  ) => {
    let filtered = [...shops];

    // Category filter
    const selectedCategories = Array.isArray(categories)
      ? categories
      : categories
      ? [categories]
      : [];

    if (selectedCategories.length > 0) {
      filtered = filtered.filter(shop => {
        const sellerCategories = (shop.selectedCategories || []).map(c =>
          c.toLowerCase(),
        );

        return sellerCategories.some(category =>
          selectedCategories.map(c => c.toLowerCase()).includes(category),
        );
      });
    }

    // Rating filter
    if (rating !== null && typeof rating === 'number') {
      filtered = filtered.filter(
        shop => Number(shop.averageRating || 0) >= rating,
      );
    }

    // Distance filter
    if (distance !== null) {
      filtered = filtered.filter(shop => {
        if (shop.distance == null) {
          return true;
        }

        return shop.distance <= distance;
      });
    }

    // NEW: Multi-location filter (matches on city, falls back gracefully)
    if (Array.isArray(selectedLocations) && selectedLocations.length > 0) {
      const normalizedLocations = selectedLocations.map(l => l.toLowerCase());
      filtered = filtered.filter(shop => {
        let city = shop.location?.city;
        if (!city && shop.businessAddress) {
          const parts = shop.businessAddress.split(',').map(p => p.trim());
          city = parts[0];
        }
        return city && normalizedLocations.includes(city.toLowerCase());
      });
    }

    switch (sortBy) {
      case 'distance':
        filtered.sort(
          (a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity),
        );
        break;

      case 'rating':
      default:
        filtered.sort((a, b) => b.averageRating - a.averageRating);
    }

    return filtered;
  };

  const getFilteredShops = async (
    categories = [],
    ratingFilter = null,
    distanceFilter = null,
  ) => {
    try {
      const response = await apiClient.get('/api/user/getAllProfile', {
        headers: getAuthHeaders(userdata?.token),
      });

      let shops = (response.data.data || [])
        .filter(user => {
          return (
            (user.roleId === 1 || user.role === 'seller') &&
            user._id !== userdata?._id &&
            !user.isDeleted &&
            !user.isDeactivated
          );
        })
        .map(shop => ({
          ...shop,
          averageRating: Number(shop.averageRating || 0),

          distance:
            location && shop.latitude && shop.longitude
              ? calculateDistance(
                  Number(location.latitude),
                  Number(location.longitude),
                  Number(shop.latitude),
                  Number(shop.longitude),
                )
              : null,

          isOpen: true,
          isFavorite: false,
        }));

      const filtered = applyShopFilters(
        shops,
        categories,
        ratingFilter,
        distanceFilter,
      );

      setAllShops(shops);
      setfilteredShops(filtered);
      console.log('filteredShops', filtered);
    } catch (error) {
      handleApiError(error, 'Failed to load filtered Shops.');
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredPosts = async (
    categories = [],
    ratingFilter = null,
    distanceFilter = null,
  ) => {
    try {
      const response = await apiClient.get('/api/user/getAllProfile', {
        headers: getAuthHeaders(userdata?.token),
      });
      const posts = (response.data.data || []).filter(user => {
        return (
          (user.role === 'seller' || user.roleId === 1) &&
          user._id !== userdata?._id
        );
      });
      if (distanceFilter === null && ratingFilter === null) {
        setfilteredPosts(posts);
        return;
      }
      const filteredPosts = posts.filter(post => {
        const withinDistance =
          distanceFilter !== null ? post.distance <= distanceFilter : true;
        const matchesRating =
          ratingFilter !== null ? post.rating >= ratingFilter : true;
        return withinDistance && matchesRating;
      });
      setfilteredPosts(filteredPosts);
      setIsLoading(false);
    } catch (error) {
      handleApiError(error, 'Failed to load filtered posts.');
    }
  };

  const createPost = async (
    name,
    selectedCategories,
    description,
    phone,
    email,
    location,
    media,
  ) => {
    try {
      const payload = {
        productName: name,
        categories: selectedCategories,
        images: media,
        description,
        contactNumber: phone,
        contactEmail: email,
        location: location,
        latitude: location?.latitude,
        longitude: location?.longitude,
        locationUrl: 'https://maps.google.com/?q=New+York',
      };
      await apiClient.post('/api/requirementPost/postRequirement', payload, {
        headers: getAuthHeaders(userdata?.token),
      });
      Alert.alert('Success', 'Post created successfully!');
      navigation.navigate('BottomTabs');
    } catch (error) {
      handleApiError(error, 'Failed to create post.');
    }
  };

  const deletePost = async id => {
    try {
      await apiClient.delete(
        `/api/requirementPost/deleteRequirement?id=${id}`,
        {
          headers: getAuthHeaders(userdata?.token),
        },
      );
      setPostsHistory(prev => prev.filter(post => post._id !== id));
      await getPostsHistory();
    } catch (error) {
      handleApiError(error, 'Failed to delete post.');
    }
  };

  const getPostsHistory = async (categories = []) => {
    try {
      const response = await apiClient.get(
        `/api/requirementPost/getRequirement`,
        {
          headers: {
            Authorization: `Bearer ${userdata.token}`,
          },
        },
      );

      const allPosts = response.data.data;

      // Filtering posts to only include those matching the current user's token
      const filteredPosts = allPosts.filter(
        post => post.userId === userdata._id,
      );

      setPostsHistory(filteredPosts);
      // console.log('Filtered Posts:', filteredPosts);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Error:', error.response?.data || 'No error response');
      } else {
        console.error('Error:', 'Failed to load categories');
      }
    }
  };

  // Shop and Rating Functions
  const getSingleShop = async userId => {
    setSingleShop({});
    try {
      const response = await apiClient.get('/api/user/getAllProfile?roleId=1', {
        headers: getAuthHeaders(userdata?.token),
      });
      const shop = response.data.data.find(s => s._id === userId);
      if (shop) setSingleShop(shop);
      else console.log('No shop found with the given userId');
    } catch (error) {
      handleApiError(error, 'Failed to load shop data.');
    }
  };
  const getProfile = async () => {
    try {
      const response = await apiClient.get('/api/user/getProfile', {
        headers: getAuthHeaders(userdata?.token),
      });
      console.log('getProfile =', response.data.data);
      setSingleProfile(response.data.data);
    } catch (error) {
      handleApiError(error, 'Failed to load Profile data.');
    }
  };

  const getShopRating = async shopId => {
    try {
      const response = await apiClient.get(
        `/api/rate/getRating?postId=${shopId}`,
        {
          headers: getAuthHeaders(userdata?.token),
        },
      );
      setShopRating(response.data);
    } catch (error) {
      handleApiError(error, 'Failed to load shop rating.');
    }
  };

  /**
   * Likes or unlikes a review for a post
   * @param {string} postId - ID of the post being rated
   * @param {string} userId - ID of the user performing the action
   * @param {boolean} like - True to like, false to unlike
   * @returns {Promise<object>} The API response data
   */
  const PostReviewLikes = async (userId, postId, like) => {
    try {
      // Validate inputs
      if (!postId || !userId || like === undefined) {
        throw new Error('Missing required parameters: postId, userId, or like');
      }

      // Ensure token exists
      if (!userdata?.token) {
        throw new Error('Authentication token is missing');
      }

      const status = like;
      const queryParams = `postId=${encodeURIComponent(
        postId,
      )}&userId=${encodeURIComponent(userId)}&status=${encodeURIComponent(
        status,
      )}`;
      const url = `/api/rate/likeRating?${queryParams}`;

      // console.log('Making API call to:', `${API_URL}${url}`);
      // console.log('Headers:', getAuthHeaders(userdata.token));

      const response = await apiClient.post(
        url,
        {},
        {headers: getAuthHeaders(userdata.token)},
      );

      console.log('API Response:', response.data);

      setRatingLiked(response.data);
      return response.data;
    } catch (error) {
      console.error('PostReviewLikes Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      handleApiError(error, 'Failed to process like action.');
      throw error; // Re-throw to allow calling code to handle
    }
  };

  const PostRatingUpdate = async (postId, rating, media, description) => {
    try {
      await apiClient.post(
        `/api/rate/updateRating?postId=${postId}`,
        {rate: rating, feedback: description, images: media[0]},
        {headers: getAuthHeaders(userdata?.token)},
      );
      navigation.goBack();
    } catch (error) {
      handleApiError(error, 'Failed to post rating.');
    }
  };
  const PostRating = async (postId, rating, media, description) => {
    try {
      await apiClient.post(
        `/api/rate/rating?postId=${postId}`,
        {rate: rating, feedback: description, images: media[0]},
        {headers: getAuthHeaders(userdata?.token)},
      );
      navigation.goBack();
    } catch (error) {
      handleApiError(error, 'Failed to post rating.');
    }
  };

  // Profile Functions
  const createSellerProfile = async (
    description,
    phone,
    location,
    profile,
    selectedCategories,
    businessAddress,
    Socialmedia,
    establishmentYear,
    gstin,
    ownerName,
    shopName,
    openAt,
    closeAt,
    selectedScale,
    selectedAvailabity,
  ) => {
    try {
      const payload = {
        description,
        phone,
        location,
        profile,
        selectedCategories,
        businessAddress,
        socialMedia: Socialmedia,
        establishmentYear,
        gstin,
        ownerName,
        name: ownerName,
        shopName,
        businessScale: selectedScale,
        isDeliveryAvailable: selectedAvailabity,
        openTime: openAt,
        closeTime: closeAt,
        fcmToken,
        latitude: location?.latitude,
        longitude: location?.longitude,
      };
      await apiClient.put('/api/user/updateProfile', payload, {
        headers: getAuthHeaders(userdata?.token),
      });
      await getUserData();
      navigation.navigate('BottomTabs');
      Alert.alert('Success', 'Profile created/updated successfully!');
    } catch (error) {
      handleApiError(error, 'Failed to create/update profile.');
    }
  };

  const createSellerProducts = async products => {
    try {
      await apiClient.put(
        '/api/user/updateProfile',
        {categoriesPost: products},
        {
          headers: getAuthHeaders(userdata?.token),
        },
      );
      Alert.alert('Success', 'Product created successfully!');
      navigation.navigate('BottomTabs');
    } catch (error) {
      handleApiError(error, 'Failed to create product.');
    }
  };

  const updatebuyerProfile = async (name, date, value, gender, imageUrl) => {
    try {
      const payload = {
        name,
        dob: date,
        phone: value,
        gender,
        profile: imageUrl,
        fcmToken,
      };
      await apiClient.put('/api/user/updateProfile', payload, {
        headers: getAuthHeaders(userdata?.token),
      });
      await getUserData();
      Alert.alert('Success', 'Profile updated successfully!');
      navigation.navigate('profilesettings');
    } catch (error) {
      handleApiError(error, 'Failed to update profile.');
    }
  };

  const getUserData = async () => {
    try {
      const response = await apiClient.get('/api/user/getProfile', {
        headers: getAuthHeaders(userdata?.token),
      });
      const latest = response.data.data;

      setUserfulldata(latest);

      setUserdata(prev => ({
        ...prev,
        ...latest,
      }));

      const updatedUser = {
        ...(userdata || {}),
        ...latest,
      };

      setUserdata(updatedUser);

      await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
    } catch (error) {
      handleApiError(error, 'Failed to load user data.');
    }
  };

  const uploadImage = async image => {
    try {
      const formData = new FormData();
      formData.append('image', {
        uri: image[0].uri,
        name: image[0].fileName || `photo_${Date.now()}.jpg`,
        type: image[0].type || 'image/jpeg',
      });
      const response = await apiClient.post('/api/user/uploadImage', formData, {
        headers: {
          ...getAuthHeaders(userdata?.token),
          'Content-Type': 'multipart/form-data',
        },
      });
      const fileUrl = response.data?.data[0];
      setimageUrl(fileUrl);
      return fileUrl;
    } catch (error) {
      handleApiError(error, 'Failed to upload image.');
    }
  };

  // Notification Functions
  const getNotification = async () => {
    try {
      const response = await apiClient.get(
        '/api/notifications/myNotifications',
        {
          headers: getAuthHeaders(userdata?.token),
        },
      );
      const notifications = response.data.data;
      setnotificationList(notifications);
      const unread = lastVisitedNotification
        ? notifications.filter(
            notif =>
              new Date(notif.createdAt) > new Date(lastVisitedNotification),
          )
        : notifications;
      setUnreadCount(unread.length);
    } catch (error) {
      // handleApiError(error, 'Failed to load notifications.');
    }
  };

  const markNotificationsAsRead = async () => {
    const now = new Date();
    setLastVisitedNotification(now);
    setUnreadCount(0);
    await AsyncStorage.setItem('lastVisitedNotification', now.toISOString());
  };

  const loadLastVisitedTime = async () => {
    try {
      const lastVisited = await AsyncStorage.getItem('lastVisitedNotification');
      if (lastVisited) setLastVisitedNotification(new Date(lastVisited));
    } catch (error) {
      console.error('Error loading last visited time:', error);
    }
  };

  const deleteNotification = async id => {
    try {
      await apiClient.delete(
        `/api/notifications/deleteNotifications?id=${id}`,
        {
          headers: getAuthHeaders(userdata?.token),
        },
      );
      console.log('Notification deleted');
    } catch (error) {
      handleApiError(error, 'Failed to delete notification.');
    }
  };

  // Miscellaneous Functions
  const getFAQs = async () => {
    try {
      const response = await apiClient.get('/api/faq/getFaqs', {
        headers: getAuthHeaders(userdata?.token),
      });
      setFAQs(response.data);
    } catch (error) {
      handleApiError(error, 'Failed to load FAQs.');
    }
  };

  const PostReportissue = async (media, description) => {
    try {
      const formattedMedia = Array.isArray(media)
        ? media.map(item => item.uri || item)
        : [];
      await apiClient.post(
        '/api/issues/reportIssue',
        {images: formattedMedia, description},
        {
          headers: getAuthHeaders(userdata?.token),
        },
      );
      Alert.alert('Success', 'Report submitted successfully!');
      navigation.navigate('BottomTabs');
    } catch (error) {
      handleApiError(error, 'Failed to report issue.');
    }
  };

  const getBuyersList = async () => {
    try {
      const response = await apiClient.get('/api/user/getAllProfile?roleId=0', {
        headers: getAuthHeaders(userdata?.token),
      });
      const allUsers = response.data?.data || [];

      // Logged in user role
      const myRole =
        userdata?.role?.toLowerCase() ??
        (userdata?.roleId === 0 ? 'buyer' : 'seller');

      const filteredUsers = allUsers.filter(user => {
        // Skip myself
        if (user._id === userdata?._id) return false;

        const userRole =
          user.role?.toLowerCase() ?? (user.roleId === 0 ? 'buyer' : 'seller');

        // Seller should only see buyers
        if (myRole === 'seller') {
          return userRole === 'buyer';
        }

        // Buyer should only see sellers
        if (myRole === 'buyer') {
          return userRole === 'seller';
        }

        return false;
      });

      // Remove duplicates
      const uniqueUsers = [
        ...new Map(filteredUsers.map(item => [item._id, item])).values(),
      ];

      setbuyerList(uniqueUsers);
    } catch (error) {
      handleApiError(error, 'Failed to load users list.');
    }
  };

  const deleteAccount = async () => {
    try {
      await apiClient.delete('/api/user/deleteProfile', {
        headers: getAuthHeaders(userdata?.token),
      });
      await clearSession();
      setUserdata(null);
      setIsLoggedIn(false);
      navigation.reset({index: 0, routes: [{name: 'commonscreen'}]});
    } catch (error) {
      handleApiError(error, 'Failed to delete account.');
    }
  };

  const deleteProduct = async id => {
    try {
      await apiClient.delete(`/api/post/deletes?id=${id}`, {
        headers: getAuthHeaders(userdata?.token),
      });
      console.log('Product deleted');
    } catch (error) {
      handleApiError(error, 'Failed to delete product.');
    }
  };

  const updateProduct = async (data, title, images, categories) => {
    try {
      await apiClient.put(
        `/api/post/update?id=${data._id}`,
        {title, categories, images, fcmToken},
        {headers: getAuthHeaders(userdata?.token)},
      );
      Alert.alert('Success', 'Product updated successfully!');
      navigation.navigate('BottomTabs');
    } catch (error) {
      handleApiError(error, 'Failed to update product.');
    }
  };

  const clearSession = async () => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }

    await AsyncStorage.multiRemove([
      'userToken',
      'userData',
      'selectedUserRole',
      'rememberMe',
    ]);

    setUserdata(null);
    setUserfulldata(null);
    setIsLoggedIn(false);
  };

  useEffect(() => {
    registerLogoutHandler(async () => {
      await clearSession();

      navigation.reset({
        index: 0,
        routes: [{name: 'commonscreen'}],
      });
    });
  }, []);

  const checkLoginStatus = async () => {
    try {
      const values = await AsyncStorage.multiGet([
        'rememberMe',
        'userToken',
        'selectedUserRole',
      ]);

      const rememberMe = values[0][1];
      const token = values[1][1];
      const savedRole = values[2][1];

      if (savedRole) {
        setUserRole(savedRole);
      }

      if (!token) {
        return;
      }

      // Validate token with backend
      const response = await apiClient.get('/api/user/getProfile', {
        headers: getAuthHeaders(token),
      });

      const latestUser = response.data.data;

      const role =
        latestUser.role === 'seller' || latestUser.roleId === 1
          ? 'seller'
          : 'buyer';

      setUserRole(role);

      await AsyncStorage.setItem('selectedUserRole', role);

      setUserfulldata(latestUser);

      setUserdata({
        token,
        ...latestUser,
      });
      setIsLoggedIn(true);
      await AsyncStorage.setItem(
        'userData',
        JSON.stringify({
          token,
          ...latestUser,
        }),
      );

      initializeSocket();

      navigation.reset({
        index: 0,
        routes: [{name: 'BottomTabs'}],
      });
    } catch (error) {
      console.log('Session expired');

      await clearSession();

      navigation.reset({
        index: 0,
        routes: [{name: 'commonscreen'}],
      });
    }
  };

  const requestAndroidPermissions = async () => {
    try {
      const permissions = [PermissionsAndroid.PERMISSIONS.CAMERA];
      if (Platform.Version >= 33) {
        permissions.push(PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES);
      } else {
        permissions.push(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
      }
      const granted = await PermissionsAndroid.requestMultiple(permissions);
      const cameraGranted =
        granted[PermissionsAndroid.PERMISSIONS.CAMERA] ===
        PermissionsAndroid.RESULTS.GRANTED;
      const storageGranted =
        Platform.Version >= 33
          ? granted[PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES] ===
            PermissionsAndroid.RESULTS.GRANTED
          : granted[PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE] ===
            PermissionsAndroid.RESULTS.GRANTED;
      return cameraGranted && storageGranted;
    } catch (err) {
      console.warn('Permission error:', err);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userdata,
        isLoggedIn,
        setIsLoggedIn,
        handleRegister,
        handleLogin,
        handleLogout,
        handleForgetPassword,
        VerifyOTP,
        getCategories,
        categorydata,
        getRecentPosts,
        recentPosts,
        getNearbyPosts,
        nearbyPosts,
        fullCategorydata,
        createPost,
        getPosts,
        userRole,
        setUserRole,
        getSellerCategories,
        posts,
        setisposting,
        isposting,
        getFilteredPosts,
        filteredPosts,
        getFilteredShops,
        filteredShops,
        getPostsHistory,
        PostsHistory,
        PostReportissue,
        fcmToken,
        signInWithGoogle,
        PostRating,
        createSellerProfile,
        getFAQs,
        FAQs,
        deletePost,
        getSingleShop,
        singleShop,
        getShopRating,
        shopRating,
        PostReviewLikes,
        RatingLiked,
        getUserData,
        Userfulldata,
        updatebuyerProfile,
        uploadImage,
        imageUrl,
        apiURL: API_URL,
        getNotification,
        notificationList,
        deleteNotification,
        deleteAccount,
        location,
        setLocation,
        getBuyersList,
        buyerList,
        createSellerProducts,
        updateProduct,
        deleteProduct,
        handleRemenberme,
        sethandleRemenberme,
        unreadCount,
        markNotificationsAsRead,
        initializeSocket,
        handleVerifyPasswordOtp,
        handleNewPassword,
        socket,
        requestAndroidPermissions,
        PostRatingUpdate,
        getFilteredShops,
        applyShopFilters,
        setfilteredShops,
        calculateDistance,
        getProfile,
        singleProfile,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export {AuthContext, AuthProvider};
