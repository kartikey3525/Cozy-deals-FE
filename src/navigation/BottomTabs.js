import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import React, {useContext} from 'react';
import {ThemeContext} from '../context/themeContext';

import {Dimensions, Image} from 'react-native';
import FloatingButton from '../components/FloatingButton';
import {AuthContext} from '../context/authcontext';
import CategoryScreen from '../screens/CategoryScreen';
import HomeScreen from '../screens/HomeScreen';
import NotificationScreen from '../screens/NotificationScreen';
import PostHistory from '../screens/PostHistory';
import Preferences from '../screens/Preferences';
import ProfileScreen from '../screens/ProfileScreen';
const Width = Dimensions.get('window').width;
const Height = Dimensions.get('window').height;
const Tab = createBottomTabNavigator();

const BottomTabs = () => {
  const EmptyComponent = () => null;

  const {theme} = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const {userRole} = useContext(AuthContext);
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          // marginBottom: 5,
        },
        tabBarStyle: {
          position: 'absolute',
          height: '7%',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          backgroundColor: isDark ? '#000' : '#ffffff',
          elevation: 5,
        },
        tabBarIconStyle: {
          marginTop: 5,
        },
        tabBarActiveTintColor: 'rgba(0, 174, 239, 1)', // Active label color
        tabBarInactiveTintColor: 'gray', // Inactive label color
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({focused, size}) => (
            <Image
              source={
                focused
                  ? require('../assets/Home-active.png')
                  : require('../assets/Home.png')
              }
              style={{width: 23, height: 23}}
            />
          ),
        }}
      />
      {userRole === 'buyer' ? (
        <Tab.Screen
          name="Categories"
          component={CategoryScreen}
          options={{
            tabBarIcon: ({focused, size}) => (
              <Image
                source={
                  focused
                    ? require('../assets/category-active.png')
                    : require('../assets/category.png')
                }
                style={{width: 24, height: 24}}
              />
            ),
          }}
        />
      ) : (
        <Tab.Screen
          name="Posts"
          component={Preferences}
          options={{
            tabBarIcon: ({focused, size}) => (
              <Image
                source={
                  focused
                    ? require('../assets/posts1.png')
                    : require('../assets/posts.png')
                }
                style={{width: 24, height: 24}}
              />
            ),
          }}
        />
      )}

      <Tab.Screen
        name="AddButton"
        component={EmptyComponent} // ✅ No inline function
        options={{
          tabBarStyle: {
            backgroundColor: 'transparent',
          },
          tabBarButton: () => <FloatingButton />, // ✅ Custom tab button remains
        }}
      />

      {userRole === 'buyer' ? (
        <Tab.Screen
          name="History"
          component={PostHistory}
          options={{
            tabBarIcon: ({focused, size}) => (
              <Image
                source={
                  focused
                    ? require('../assets/history-active.png')
                    : require('../assets/history.png')
                }
                style={{width: 23, height: 22}}
              />
            ),
          }}
        />
      ) : (
        <Tab.Screen
          name="Notification"
          component={NotificationScreen}
          options={{
            tabBarStyle: {display: 'none'}, // Hides the bottom tab bar
            tabBarIcon: ({focused, size}) => (
              <Image
                source={
                  focused
                    ? require('../assets/notification.png')
                    : require('../assets/notification-bottom.png')
                }
                style={{width: 22, height: 25}}
              />
            ),
          }}
        />
      )}
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={({route}) => ({
          tabBarStyle: {display: 'none'}, // Hides the bottom tab bar
          tabBarIcon: ({focused, size}) => (
            <Image
              source={
                focused
                  ? require('../assets/profile-active.png')
                  : require('../assets/profile.png')
              }
              style={{width: 24.5, height: 24}}
            />
          ),
        })}
      />
    </Tab.Navigator>
  );
};

export default BottomTabs;
