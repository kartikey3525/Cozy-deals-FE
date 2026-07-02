import React, {useContext, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Modal,
  TouchableOpacity,
} from 'react-native';
import Entypo from 'react-native-vector-icons/Entypo';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {ThemeContext} from '../context/themeContext';
import Header from '../components/Header';
import { AuthContext } from '../context/authcontext';
import { useIsFocused } from '@react-navigation/native';

const Width = Dimensions.get('window').width;
const Height = Dimensions.get('window').height;

export default function PrivacyandSecurity({navigation}) {
  const {theme} = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const [modalVisible, setModalVisible] = useState(false);

  
  const {getPostsHistory, deleteAccount, deletePost} = useContext(AuthContext);

  useEffect(() => { 
    // console.log('get PostsHistory', PostsHistory[0]);
  }, [useIsFocused()]);

  const handleDelete = () => {
    deleteAccount(); 
    setModalVisible(false);
  };
  return (
    <View style={[styles.screen, {backgroundColor: isDark ? '#000' : '#fff'}]}>
      <Header header={'Privacy and Security'} />

      <TouchableOpacity
        onPress={() => [setModalVisible(true),]}
        style={{
          width: Width * 0.9,
          alignSelf: 'center',
          borderRadius: 10,
          flexDirection: 'row',
          margin: 10,
          height: '10%',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: isDark
            ? 'rgba(50, 50, 50, 0.7)'
            : 'rgba(223, 223, 223, 0.36)',
        }}>
        <Text
          style={[
            styles.headerText,
            {
              marginLeft: 20,
              fontWeight: '500',
              color: isDark ? '#fff' : '#000',
            },
          ]}>
          Delete Account
        </Text>

        <AntDesign
          onPress={() => navigation.goBack()}
          name="right"
          size={20}
          color={isDark ? 'rgb(255, 255, 255)' : 'rgb(0, 0, 0)'}
          style={{right: 10}}
        />
      </TouchableOpacity>

      <Modal transparent={true} visible={modalVisible} animationType="slide">
        <View
          style={[
            styles.modalContainer,
            {
              backgroundColor: isDark
                ? 'rgba(255, 255, 255, 0.3)'
                : 'rgba(0, 0, 0, 0.3)',
            },
          ]}>
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: isDark ? 'rgb(0, 0, 0)' : 'rgb(255, 255, 255)',
              },
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
              Delete Account
            </Text>
            <Text style={[styles.modalText, {color: isDark ? '#fff' : '#000'}]}>
              Are you sure you want to delete your account ?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                }}
                style={[
                  styles.cancelButton,
                  {
                    backgroundColor: isDark
                      ? 'rgba(51, 51, 51, 1)'
                      : 'rgba(217, 217, 217, 1)',
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
                onPress={handleDelete}
                style={styles.deleteButton}>
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
  },
  sectionHeader: {
    fontWeight: 'bold',
    fontSize: 14,
    margin: 5,
    marginLeft: 20,
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
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  modalContent: {
    width: Width * 0.9,
    height: Height * 0.25,
    backgroundColor: '#fff',
    borderRadius: 30,
    justifyContent: 'center',
    padding: 20,
    marginBottom: '50%',
    alignItems: 'center',
    elevation: 10,
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
