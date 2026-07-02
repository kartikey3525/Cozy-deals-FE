import React, {useContext, useState} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import {HelperText} from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {AuthContext} from '../context/authcontext';
import {Dimensions} from 'react-native';
import {ThemeContext} from '../context/themeContext';
import Header from '../components/Header';

const Width = Dimensions.get('window').width;
const Height = Dimensions.get('window').height;

export default function NewPassword({navigation,route}) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const {handleNewPassword} = useContext(AuthContext);
  const {theme} = useContext(ThemeContext);
  const isDark = theme === 'dark';

  // Utility functions for input validation
  const containsEmojis = (text) => {
    const emojiRegex = /[\u{1F600}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
    return emojiRegex.test(text);
  };

  const validatePassword = (password) => {
    const errors = [];
    
    if (password.length < 8) {
      errors.push('Minimum 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('At least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('At least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('At least one number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('At least one special character');
    }
    if (password.includes(' ')) {
      errors.push('No spaces allowed');
    }
    if (containsEmojis(password)) {
      errors.push('No emojis allowed');
    }
    
    return errors;
  };

  const handlePasswordChange = (text, field) => {
    if (field === 'newPassword') {
      setNewPassword(text);
      setErrors(prev => ({...prev, newPassword: ''}));
    } else {
      setConfirmPassword(text);
      setErrors(prev => ({...prev, confirmPassword: ''}));
    }
  };

  const validateInputs = () => {
    let isValid = true;
    const newErrors = {newPassword: '', confirmPassword: ''};

    // Validate new password
    const passwordErrors = validatePassword(newPassword);
    if (passwordErrors.length > 0) {
      newErrors.newPassword = passwordErrors.join(', ');
      isValid = false;
    }

    // Validate password match
    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateInputs()) return;

    try {
      await handleNewPassword(route?.params?.email,newPassword);
    //   Alert.alert('Success', 'Password changed successfully!');
    navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to change password');
    }
  };

  return (
    <View
      showsVerticalScrollIndicator={false}
      style={[
        styles.screen,
        {backgroundColor: isDark ? 'black' : 'white'},
      ]}>
      <Header header={''} />
      
      <Text style={[
        styles.modalText,
        {
          fontWeight: 'bold',
          marginBottom: 30,
          fontSize: 30,
          color: isDark ? '#fff' : 'rgb(0, 0, 0)',
        },
      ]}>
        Enter new password
      </Text>
      
      {/* New Password Input */}
      <View style={styles.inputContainer}>
        <TextInput
          value={newPassword}
          style={[
            styles.textInput,
            {
              backgroundColor: isDark ? '#000' : '#fff',
              color: isDark ? '#fff' : '#000',
            },
          ]}
          onChangeText={(text) => handlePasswordChange(text, 'newPassword')}
          placeholder="New Password"
          mode="outlined"
          secureTextEntry={!showPassword}
          placeholderTextColor={isDark ? 'white' : 'black'}
          autoCapitalize="none"
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Ionicons
            name={showPassword ? 'eye-off' : 'eye'}
            size={24}
            color={isDark ? 'white' : 'black'}
            style={{marginRight: 10}}
          />
        </TouchableOpacity>
      </View>
      <HelperText
        type="error"
        style={{alignSelf: 'flex-start', marginLeft: 14}}
        visible={!!errors.newPassword}>
        {errors.newPassword}
      </HelperText>

      {/* Confirm Password Input */}
      <View style={styles.inputContainer}>
        <TextInput
          value={confirmPassword}
          style={[
            styles.textInput,
            {
              backgroundColor: isDark ? '#000' : '#fff',
              color: isDark ? '#fff' : '#000',
            },
          ]}
          onChangeText={(text) => handlePasswordChange(text, 'confirmPassword')}
          placeholder="Confirm Password"
          mode="outlined"
          secureTextEntry={!showPassword}
          placeholderTextColor={isDark ? 'white' : 'black'}
          autoCapitalize="none"
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Ionicons
            name={showPassword ? 'eye-off' : 'eye'}
            size={24}
            color={isDark ? 'white' : 'black'}
            style={{marginRight: 10}}
          />
        </TouchableOpacity>
      </View>
      <HelperText
        type="error"
        style={{alignSelf: 'flex-start', marginLeft: 14}}
        visible={!!errors.confirmPassword}>
        {errors.confirmPassword}
      </HelperText>

      {/* Password Requirements */}
      <View style={{alignSelf: 'flex-start', marginLeft: 20, marginTop: 10}}>
        <Text style={{color: isDark ? '#fff' : '#000', fontWeight: 'bold'}}>
          Password must contain:
        </Text>
        <Text style={{color: isDark ? '#aaa' : '#555'}}>• Minimum 8 characters</Text>
        <Text style={{color: isDark ? '#aaa' : '#555'}}>• At least one uppercase letter</Text>
        <Text style={{color: isDark ? '#aaa' : '#555'}}>• At least one lowercase letter</Text>
        <Text style={{color: isDark ? '#aaa' : '#555'}}>• At least one number</Text>
        <Text style={{color: isDark ? '#aaa' : '#555'}}>• At least one special character</Text>
        <Text style={{color: isDark ? '#aaa' : '#555'}}>• No spaces or emojis</Text>
      </View>

      <TouchableOpacity
        style={[styles.blueBotton, {marginTop: '60%'}]}
        onPress={handleSubmit}>
        <Text style={[
          styles.smallText,
          {color: '#fff', fontSize: 22, marginBottom: 0},
        ]}>
          Submit
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    height: Height,
    width: Width,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderColor: '#A3A3A3',
    width: '100%',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 5,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    color: '#000',
    width: '86%',
    height: Height * 0.06,
    padding: 10,
  },
  smallText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1D1E20',
    textAlign: 'center',
    width: 250,
    marginBottom: 10,
    fontFamily: 'NunitoSans-VariableFont_YTLC,opsz,wdth,wght',
  },
  blueBotton: {
    backgroundColor: '#00AEEF',
    width: '100%',
    height: Height * 0.06,
    borderRadius: 10,
    margin: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});