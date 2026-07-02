import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import BottomTabs from './BottomTabs';

// Import your screens
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import NotificationScreen from '../screens/NotificationScreen';
import CategoryScreen from '../screens/CategoryScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import WelcomeScreen2 from '../screens/WelcomeScreen2';
import Login from '../screens/Login';
import OTPScreen from '../screens/OTPScreen';
import AddressScreen from '../screens/AddressScreen';
import MapAddress from '../screens/MapAddress';
import SubCategory from '../screens/SubCategory';
import InSubCategory from '../screens/InSubCategory';
import ShopScreen from '../screens/ShopScreen';
import PostDetails from '../screens/PostDetails';
import UploadImage from '../screens/UploadImage';
import ShopDetails from '../screens/ShopDetails';
import ProductCategories from '../screens/ProductCategories';
import RatedScreen from '../screens/RatedScreen';
import EditProfile from '../screens/EditProfile';
import HelpScreen from '../screens/HelpScreen';
import FAQScreen from '../screens/FAQScreen';
import ChatSupport from '../screens/ChatSupport';
import ReportIssue from '../screens/ReportIssue';
import PrivacyandPolicy from '../screens/PrivacyandSecurity';
import PrivacyandSecurity from '../screens/PrivacyandSecurity';
import Payments from '../screens/Payments';
import PaymentSuccess from '../screens/PaymentSuccess';
import ReferandEarn from '../screens/ReferandEarn';
import LegalPolicies from '../screens/LegalPolicies';
import Preferences from '../screens/Preferences';
import PreferenceDetails from '../screens/PreferenceDetails';
import Messages from '../screens/Messages';
import ForgetPassword from '../screens/ForgetPassword';
import CommonScreen from '../screens/CommonScreen';
import PostHistory from '../screens/PostHistory';
import SellerProductDetails from '../screens/SellerProductDetails';
import SellerProfile from '../screens/SellerProfile';
import ChatScreen from '../screens/ChatScreen';
import ProfileSettings from '../screens/ProfileSettings';
import AddProducts from '../screens/AddProducts';
import ProductsList from '../screens/ProductsList';
import NewPassword from '../screens/NewPassword';

const Stack = createStackNavigator();

const MainScreens = () => {
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      //  initialRouteName="Profile"
    >
      {/* < screens for new user /> */}
      <Stack.Screen
        name="Welcome"
        component={WelcomeScreen}
        options={{title: 'Welcome', headerShown: false}}
      />
      <Stack.Screen
        name="Welcome2"
        component={WelcomeScreen2}
        options={{title: 'Welcome', headerShown: false}}
      />
      <Stack.Screen
        name="commonscreen"
        component={CommonScreen}
        options={{title: 'commonscreen', headerShown: false}}
      />
      <Stack.Screen
        name="Login"
        component={Login}
        options={{title: 'Login', headerShown: false}}
      />
      <Stack.Screen
        name="OTPScreen"
        component={OTPScreen}
        options={{title: 'OTPScreen', headerShown: false}}
      />
      <Stack.Screen
        name="AddressScreen"
        component={AddressScreen}
        options={{title: 'AddressScreen', headerShown: false}}
      />
      <Stack.Screen
        name="MapAddress"
        component={MapAddress}
        options={{title: 'MapAddress', headerShown: false}}
      />
      {/* <BottomTabs /> */}
      <Stack.Screen
        name="BottomTabs"
        component={BottomTabs}
        options={{headerShown: false}}
      />
      {/* Add other screens */}
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{title: 'Home', headerShown: false}}
      />
      <Stack.Screen
        name="Profilescreen"
        component={ProfileScreen}
        options={{title: 'Profile', headerShown: false}}
      />
      <Stack.Screen
        name="Notification"
        component={NotificationScreen}
        options={{title: 'Notification', headerShown: false}}
      />
      <Stack.Screen
        name="category"
        component={CategoryScreen}
        options={{title: 'Category', headerShown: false}}
      />
      <Stack.Screen
        name="Subcategory"
        component={SubCategory}
        options={{title: 'Subcategory', headerShown: false}}
      />
      <Stack.Screen
        name="Insubcategory"
        component={InSubCategory}
        options={{title: 'Insubcategory', headerShown: false}}
      />
      <Stack.Screen
        name="shopScreen"
        component={ShopScreen}
        options={{title: 'shopScreen', headerShown: false}}
      />
      <Stack.Screen
        name="postdetails"
        component={PostDetails}
        options={{title: 'PostDetails', headerShown: false}}
      />
      <Stack.Screen
        name="uploadimage"
        component={UploadImage}
        options={{title: 'uploadimage', headerShown: false}}
      />
      <Stack.Screen
        name="shopdetails"
        component={ShopDetails}
        options={{title: 'shopdetails', headerShown: false}}
      />
      <Stack.Screen
        name="productcategories"
        component={ProductCategories}
        options={{title: 'productcategories', headerShown: false}}
      />
      <Stack.Screen
        name="ratedscreen"
        component={RatedScreen}
        options={{title: 'ratedscreen', headerShown: false}}
      />
      <Stack.Screen
        name="editProfile"
        component={EditProfile}
        options={{title: 'editprofile', headerShown: false}}
      />
      <Stack.Screen
        name="helpscreen"
        component={HelpScreen}
        options={{title: 'helpscreen', headerShown: false}}
      />
      <Stack.Screen
        name="faqscreen"
        component={FAQScreen}
        options={{title: 'faqscreen', headerShown: false}}
      />
      <Stack.Screen
        name="chatsupport"
        component={ChatSupport}
        options={{title: 'chatsupport', headerShown: false}}
      />
      <Stack.Screen
        name="reportissue"
        component={ReportIssue}
        options={{title: 'reportissue', headerShown: false}}
      />
      <Stack.Screen
        name="privacyandsecurity"
        component={PrivacyandSecurity}
        options={{title: 'privacyandsecurity', headerShown: false}}
      />
      <Stack.Screen
        name="payments"
        component={Payments}
        options={{title: 'payments', headerShown: false}}
      />
      <Stack.Screen
        name="paymentsuccess"
        component={PaymentSuccess}
        options={{title: 'paymentsuccess', headerShown: false}}
      />
      <Stack.Screen
        name="referandearn"
        component={ReferandEarn}
        options={{title: 'referandearn', headerShown: false}}
      />

      <Stack.Screen
        name="legalpolicies"
        component={LegalPolicies}
        options={{title: 'legalpolicies', headerShown: false}}
      />
      <Stack.Screen
        name="preferences"
        component={Preferences}
        options={{title: 'preferences', headerShown: false}}
      />
      <Stack.Screen
        name="preferencedetails"
        component={PreferenceDetails}
        options={{title: 'preferencedetails', headerShown: false}}
      />
      <Stack.Screen
        name="messages"
        component={Messages}
        options={{title: 'messages', headerShown: false}}
      />
      <Stack.Screen
        name="forgetpassword"
        component={ForgetPassword}
        options={{title: 'forgetpassword', headerShown: false}}
      />
      <Stack.Screen
        name="Posthistory"
        component={PostHistory}
        options={{title: 'Posthistory', headerShown: false}}
      />

      <Stack.Screen
        name="sellerProductDetail"
        component={SellerProductDetails}
        options={{title: 'sellerProductDetail', headerShown: false}}
      />
      <Stack.Screen
        name="Sellerprofile"
        component={SellerProfile}
        options={{title: 'Sellerprofile', headerShown: false}}
      />
      <Stack.Screen
        name="Chatscreen"
        component={ChatScreen}
        options={{title: 'Chatscreen', headerShown: false}}
      />
      <Stack.Screen
        name="profilesettings"
        component={ProfileSettings}
        options={{title: 'profilesettings', headerShown: false}}
      />
      <Stack.Screen
        name="AddProducts"
        component={AddProducts}
        options={{title: 'AddProducts', headerShown: false}}
      />
       <Stack.Screen
        name="ProductsList"
        component={ProductsList}
        options={{title: 'ProductsList', headerShown: false}}
      />
       <Stack.Screen
        name="NewPassword"
        component={NewPassword}
        options={{title: 'NewPassword', headerShown: false}}
      />
    </Stack.Navigator>
  );
};

export default MainScreens;
