import React, {useState} from 'react';
import messaging from '@react-native-firebase/messaging';
import {useNavigation} from '@react-navigation/native';

export default function useNotification(setInitialRoute) {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [notificationMessage, setNotificationMessage] = useState([]);

  React.useEffect(() => {
    messaging().onNotificationOpenedApp(remoteMessage => {
      setNotificationMessage(remoteMessage);
      navigation.navigate('Notification');
    });

    // Check whether an initial notification is available
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          setNotificationMessage(remoteMessage);

          setInitialRoute(remoteMessage.data?.type);
          navigation.navigate('Notification');
        }
        setLoading(false);
      });
    messaging().onMessage(async remoteMessage => {
      setNotificationMessage(remoteMessage);
    });
  }, []);
  return {
    loading,
    notificationMessage,
  };
}
