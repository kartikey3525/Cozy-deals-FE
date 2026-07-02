import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Dimensions,
  Modal,
  TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ThemeContext } from '../context/themeContext';
import Header from '../components/Header';
import { AuthContext } from '../context/authcontext';
import { useIsFocused } from '@react-navigation/native';
import moment from 'moment';

const Width = Dimensions.get('window').width;
const Height = Dimensions.get('window').height;

export default function NotificationScreen({ navigation ,route}) {
  const { theme } = useContext(ThemeContext);
  const { deleteNotification, getNotification, notificationList, markNotificationsAsRead ,userRole} =
    useContext(AuthContext);
  const isDark = theme === 'dark';
  const isFocused = useIsFocused();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    if (isFocused) {
      // console.log('Fetching notifications...');
      getNotification();
      markNotificationsAsRead();
    }
    console.log('Notification List:', notificationList[0]);
  }, [isFocused]); // Removed notificationList from deps to avoid infinite loop

  const handleLongPress = (item) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const handleDelete = async () => {
    if (selectedItem && selectedItem._id) {
      try {
        await deleteNotification(selectedItem._id);
        getNotification(); // Refresh notifications after delete
        setModalVisible(false);
        setSelectedItem(null);
      } catch (error) {
        console.error('Error deleting notification:', error);
      }
    } else {
      console.error('Error: selectedItem or selectedItem._id is undefined');
    }
  };

  const extractTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };
  // navigation.navigate('sellerProductDetail', {item})
  const render2RectangleList = (item, index) => (
    <Pressable
      key={index}
      style={{
        justifyContent: 'center',
        marginBottom: 10,
        alignItems: 'center',
        borderColor: isDark ? '#ccc' : '#fff',
        borderBottomWidth: 1,
      }}
      onPress={() => {
        if (!item?.dataPayload) return; // Don't navigate if dataPayload is null/undefined
        
        if (userRole === 'buyer') {
          navigation.navigate('shopdetails', {item: item.dataPayload});
        } else {
          navigation.navigate('sellerProductDetail', {item: item.dataPayload});
        }
      }}
      onLongPress={() => handleLongPress(item)}>
      <View
        style={[
          styles.rectangle2,
          {
            flexDirection: 'row',
            backgroundColor: isDark ? '#000' : '#fff',
          },
        ]}>
        <Image
          // source={require('../assets/User-image.png')} // Replace with dynamic image if available
          source={
            item?.dataPayload?.image 
              ? { uri: item.dataPayload.image } 
              : item?.dataPayload?.images?.[0]
                ? { uri: item.dataPayload.images[0] } 
                : require('../assets/User-image.png')
          }
          style={{
            width: 66,
            height: 66,
            marginRight: 20,
            borderRadius: 80,
          }}
          resizeMode="contain"
        />
        <View style={{ flex: 1 }}>
          <Text
            numberOfLines={2}
            style={[
              styles.recListText,
              {
                fontWeight: 'bold',
                fontSize: 14,
                // width: 180,
                color: isDark ? '#fff' : '#000',
              },
            ]}>
            {item.message}
          </Text>
          <Text
            numberOfLines={2}
            style={[
              styles.recListText,
              {
                fontWeight: '500',
                fontSize: 14,
                width: 180,
                marginTop: 5,
                color: isDark ? '#fff' : 'grey',
              },
            ]}>
            {extractTime(item.date)}
          </Text>
        </View>
        {item.selected && (
          <Ionicons
            name="checkmark-circle"
            size={24}
            color="rgba(6, 196, 217, 1)"
            style={{ marginRight: 10 }}
          />
        )}
      </View>
    </Pressable>
  );

  return (
    <View
      style={[styles.screen, { backgroundColor: isDark ? '#000' : '#fff' }]}>
      <Header header={'Notifications'} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ height: Height * 0.8, flexGrow: 1 }}>
        {/* No Notifications Message */}
        {notificationList.length === 0 && (
          <View style={styles.noNotificationsContainer}>
            <Text
              style={[
                styles.noNotificationsText,
                { color: isDark ? '#fff' : '#000' },
              ]}>
              No notifications to show.
            </Text>
          </View>
        )}

        {/* Today */}
        {notificationList.filter((item) => moment(item.date).isSame(moment(), 'day')).length > 0 && (
          <>
            <Text style={[styles.sectionHeader, { color: isDark ? '#fff' : '#000' }]}>
              Today
            </Text>
            {notificationList
              .filter((item) => moment(item.date).isSame(moment(), 'day'))
              .map((item, index) => render2RectangleList(item, index))}
          </>
        )}

        {/* Yesterday */}
        {notificationList.filter((item) =>
          moment(item.date).isSame(moment().subtract(1, 'days'), 'day')
        ).length > 0 && (
          <>
            <Text style={[styles.sectionHeader, { color: isDark ? '#fff' : '#000' }]}>
              Yesterday
            </Text>
            {notificationList
              .filter((item) => moment(item.date).isSame(moment().subtract(1, 'days'), 'day'))
              .map((item, index) => render2RectangleList(item, index))}
          </>
        )}

        {/* This Week */}
        {notificationList.filter(
          (item) =>
            moment(item.date).isAfter(moment().subtract(7, 'days')) &&
            !moment(item.date).isSame(moment(), 'day') &&
            !moment(item.date).isSame(moment().subtract(1, 'days'), 'day')
        ).length > 0 && (
          <>
            <Text style={[styles.sectionHeader, { color: isDark ? '#fff' : '#000' }]}>
              This Week
            </Text>
            {notificationList
              .filter(
                (item) =>
                  moment(item.date).isAfter(moment().subtract(7, 'days')) &&
                  !moment(item.date).isSame(moment(), 'day') &&
                  !moment(item.date).isSame(moment().subtract(1, 'days'), 'day')
              )
              .map((item, index) => render2RectangleList(item, index))}
          </>
        )}

        {/* Older Notifications */}
        {notificationList.filter(
          (item) => moment(item.date).isBefore(moment().subtract(7, 'days'))
        ).length > 0 && (
          <>
            <Text style={[styles.sectionHeader, { color: isDark ? '#fff' : '#000' }]}>
              Older
            </Text>
            {notificationList
              .filter((item) => moment(item.date).isBefore(moment().subtract(7, 'days')))
              .map((item, index) => render2RectangleList(item, index))}
          </>
        )}
      </ScrollView>

      {/* Confirmation Modal */}
      <Modal transparent={true} visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: isDark ? '#121212' : '#fff' },
            ]}>
            <Text
              style={[
                styles.modalText,
                { fontWeight: 'bold', marginBottom: 10, color: isDark ? '#fff' : '#000' },
              ]}>
              Delete?
            </Text>
            <Text style={[styles.modalText, { color: isDark ? '#fff' : '#000' }]}>
              Are you sure you want to delete?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={[
                  styles.cancelButton,
                  {
                    backgroundColor: isDark ? 'rgba(51, 51, 51, 1)' : 'rgba(217, 217, 217, 1)',
                  },
                ]}>
                <Text style={[styles.buttonText, { color: isDark ? '#fff' : 'black' }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 10,
  },
  sectionHeader: {
    fontWeight: '400',
    fontSize: 14,
    margin: 5,
    marginLeft: 20,
  },
  rectangle2: {
    backgroundColor: '#fff',
    width: Width * 0.95,
    height: 80,
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
  noNotificationsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Height * 0.3,
  },
  noNotificationsText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
});