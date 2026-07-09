import notifee, {AndroidImportance, EventType} from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import messaging from '@react-native-firebase/messaging';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import axios from 'axios';
import {createContext, useEffect, useState} from 'react';
import {
  Alert,
  AppState,
  Linking,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import io from 'socket.io-client';
const API_URL = 'http://10.0.2.2:8080';
// const API_URL = 'https://cozy-deals-be-production.up.railway.app';

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
  const [singleShop, setSingleShop] = useState([]);
  const [buyerList, setbuyerList] = useState([]);
  const [shopRating, setShopRating] = useState([]);
  const [imageUrl, setimageUrl] = useState([]);
  const [PostsHistory, setPostsHistory] = useState([]);
  const [notificationList, setnotificationList] = useState([]);
  const [RatingLiked, setRatingLiked] = useState([]);
  const [FAQs, setFAQs] = useState([]);
  const [userRole, setUserRole] = useState('buyer');
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
      } else if (nextAppState.match(/inactive|background/) && socket) {
        socket.disconnect();
        setSocket(null);
      }
      setAppState(nextAppState);
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );
    return () => {
      subscription.remove();
      if (socket) socket.disconnect();
    };
  }, [appState, socket]);

  // Initialize Google Sign-In, Notifications, and Check Login
  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        '607680481080-oiu9qspqr54vf8cqg5maogt2f4vorf72.apps.googleusercontent.com',
      offlineAccess: true,
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

      if (socket) socket.disconnect();

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
        initializeChat(newSocket);
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
      navigation.navigate('AddressScreen');
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
      navigation.navigate('AddressScreen');
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

  // Password Reset Functions
  const handleForgetPassword = async email => {
    try {
      const response = await apiClient.post('/api/user/sendForgotPasswordOTP', {
        email,
      });
      Alert.alert('OTP Sent', response.data.msg);
      navigation.navigate('OTPScreen', {emailPhone: email});
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

  const handleNewPassword = async (email, newPassword) => {
    try {
      await apiClient.post('/api/user/resetPassword', {email, newPassword});
      navigation.navigate('Login');
    } catch (error) {
      handleApiError(error, 'Failed to reset password.');
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
      setposts(response.data.data);
    } catch (error) {
      handleApiError(error, 'Failed to load posts.');
    }
  };

  const getRecentPosts = async () => {
    try {
      const response = await apiClient.get('/api/buyer/post/recentPosts', {
        headers: getAuthHeaders(userdata?.token),
      });
      setrecentPosts(response.data.data);
    } catch (error) {
      handleApiError(error, 'Failed to load recent posts.');
    }
  };

  const getNearbyPosts = async () => {
    try {
      const payload = {
        startDistance: '',
        endDistance: '33',
        latitude: '40.758896',
        longitude: '-73.985130',
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
      setnearbyPosts(response.data.data);
    } catch (error) {
      handleApiError(error, 'Failed to load nearby posts.');
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
      const posts = response.data.data;
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
        location: 'New York, NY',
        latitude: location.latitude,
        longitude: location.longitude,
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
    setSingleShop([]);
    try {
      const response = await apiClient.get('/api/user/getAllProfile', {
        headers: getAuthHeaders(userdata?.token),
      });
      const shop = response.data.data.find(s => s._id === userId);
      if (shop) setSingleShop(shop);
      else console.log('No shop found with the given userId');
    } catch (error) {
      handleApiError(error, 'Failed to load shop data.');
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
      const response = await apiClient.get('/api/user/getAllProfileBuyer', {
        headers: getAuthHeaders(userdata?.token),
      });
      setbuyerList(response.data.data);
    } catch (error) {
      handleApiError(error, 'Failed to load buyers list.');
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
      const [[, rememberMe], [, token]] = await AsyncStorage.multiGet([
        'rememberMe',
        'userToken',
      ]);

      if (!token) {
        return;
      }

      // Validate token with backend
      const response = await apiClient.get('/api/user/getProfile', {
        headers: getAuthHeaders(token),
      });

      const latestUser = response.data.data;

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

  const initializeChat = () => {
    // Placeholder for chat initialization logic
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
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export {AuthContext, AuthProvider};
