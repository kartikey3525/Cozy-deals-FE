import React, {useContext, useState} from 'react';
import {StyleSheet, TouchableOpacity} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {useNavigation} from '@react-navigation/native';
import {ThemeContext} from '../context/themeContext';
import {AuthContext} from '../context/authcontext';

const FloatingButton = ({}) => {
  const {theme} = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const navigation = useNavigation();
  const {userRole} = useContext(AuthContext);

  const handlePress = () => {
    // setisposting(true);
    navigation.navigate(userRole==='buyer'?'postdetails':'AddProducts');
  };

  return (
    <TouchableOpacity style={styles.floatingButton} onPress={handlePress}>
      <FontAwesome
        name="plus-square-o"
        size={25}
        color={isDark ? 'black' : 'white'}
        style={{top: 1}}
      />
    </TouchableOpacity>
  );
};

export default FloatingButton;
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  floatingButton: {
    position: 'absolute',
    bottom: '55%',
    alignSelf: 'center',
    width: 55,
    height: 55,
    borderRadius: 100,
    backgroundColor: 'rgba(0, 174, 239, 1)',
    justifyContent: 'center',
    alignItems: 'center',
    // borderWidth: 10,
    // borderColor: '#fff',
  },
});
