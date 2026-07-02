import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  Dimensions,
  ScrollView,
} from 'react-native';
import React, {useState} from 'react';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {AuthContext} from '../context/authcontext';
import {useContext} from 'react';
import {HelperText} from 'react-native-paper';
import {OtpInput} from 'react-native-otp-entry';
import {useEffect} from 'react';
import {ThemeContext} from '../context/themeContext';

const Width = Dimensions.get('window').width;
const Height = Dimensions.get('window').height;
export default function OTPScreen({navigation, route}) {
  const {theme} = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(600); // 10 minutes in seconds
  const [resendDisabled, setResendDisabled] = useState(false);

  const [otp, setotp] = useState('');

  const [errors, setErrors] = useState({
    otp: '',
  });
  const {VerifyOTP, handleRegister, handleVerifyPasswordOtp,handleForgetPassword} =
    useContext(AuthContext);

  useEffect(() => {
    let intervalId = setInterval(() => {
      if (countdown > 0) {
        setCountdown(countdown - 1);
      } else {
        setResendDisabled(false);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [countdown]);

  const handlePress = async () => {
    setErrors({otp: ''});
    if (!validateInputs()) return;

    setIsLoading(true);
    try {
      await route?.params?.password?VerifyOTP(route?.params?.emailPhone, otp) : handleVerifyPasswordOtp(route?.params?.emailPhone, otp);
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsLoading(true);
    try {
      await route?.params?.password? handleRegister(
        route?.params?.emailPhone,
        route?.params?.password,
        route?.params?.name,
      ):handleForgetPassword(route?.params?.emailPhone,);
      setCountdown(600);
      setResendDisabled(true);
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const validateInputs = () => {
    if (!otp) {
      setErrors(prevState => ({
        ...prevState,
        otp: 'OTP is required.',
      }));
      return false;
    }

    if (otp.length < 4) {
      setErrors(prevState => ({
        ...prevState,
        otp: 'otp must be at least 4 characters long.',
      }));
      return false;
    }
    setErrors({otp: ''});
    return true;
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        styles.screen,
        {backgroundColor: isDark ? '#000' : '#fff'},
      ]}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            position: 'absolute',
            // top: 50,
            right: '50%',
          }}>
          <AntDesign name="left" size={25} color={isDark ? '#fff' : '#000'} />
        </TouchableOpacity>

        <Image
          source={require('../assets/logo.png')}
          style={{width: 100, height: 100, alignSelf: 'center', top: 20}}
          resizeMode="contain"
        />
      </View>

      <Text style={[styles.bigText, {color: isDark ? '#fff' : '#000'}]}>
        Enter OTP
      </Text>
      <Text
        style={[
          styles.smallText,
          {fontSize: 16, color: isDark ? '#fff' : '#1D1E20'},
        ]}>
        A verification codes has been sent to {route?.params?.emailPhone}
      </Text>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <OtpInput
          numberOfDigits={4}
          focusColor="#00AEEF"
          autoFocus={true}
          hideStick={false}
          blurOnFilled={true}
          disabled={false}
          pinCodeTextStyle={{
            color: isDark ? '#fff' : '#000', // Ensure text color follows dark mode
          }}
          type="numeric"
          secureTextEntry={false}
          focusStickBlinkingDuration={400}
          // onFilled={() => handlePress()}
          onTextChange={text => setotp(text)}
          textInputProps={{
            accessibilityLabel: 'One-Time Password',
          }}
          theme={{
            containerStyle: styles.pincontainer,
            pinCodeContainerStyle: styles.pinCodeContainer,
            pinCodeTextStyle: {
              ...styles.pinCodeText,
              color: isDark ? '#fff' : '#000', // Ensure text color adapts to theme
            },
            focusStickStyle: styles.focusStick,
            focusedPinCodeContainerStyle: styles.activePinCodeContainer,
            placeholderTextStyle: {
              ...styles.placeholderText,
              color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)', // Ensure placeholder adapts
            },
            filledPinCodeContainerStyle: styles.filledPinCodeContainer,
            disabledPinCodeContainerStyle: styles.disabledPinCodeContainer,
          }}
        />
      </View>

      <HelperText
        type="error"
        style={{alignSelf: 'flex-start', marginLeft: '6%'}}
        visible={!!errors.otp}>
        {errors.otp}
      </HelperText>

      <View
        style={{
          alignItems: 'center',
          justifyContent: 'flex-end',
          flexDirection: 'row',
          padding: 2,
          marginBottom: '50%',
          alignSelf: 'flex-end',
        }}>
        <Text
          disabled={resendDisabled}
          onPress={handleResend}
          style={[
            styles.smallText,
            {
              color: isDark ? '#ccc' : '#000',
              width: 100,
              textDecorationLine: 'underline', // Add underline here
            },
          ]}>
          Resend code
        </Text>
        <Text
          style={[
            styles.smallText,
            {
              color: '#06C4D9',
              width: 60,
              alignSelf: 'flex-end',
            },
          ]}>
          <Text>
            {countdown > 0
              ? `${Math.floor(countdown / 60)}:${countdown % 60}`
              : '00:00'}
          </Text>
        </Text>
      </View>

      <TouchableOpacity
        style={styles.blueBotton}
        // onPress={() => setModalVisible(true)}
        // onPress={() => navigation.navigate('AddressScreen')}
        onPress={() => handlePress()}>
        <Text
          style={[
            styles.smallText,
            {color: '#fff', fontSize: 22, marginBottom: 0},
          ]}>
          Verify
        </Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        onRequestClose={() => setModalVisible(false)}>
        <TouchableOpacity
          style={styles.modalContainer}
          onPress={() => setModalVisible(false)}>
          <View style={styles.modalContent}>
            <Image
              source={
                isDark
                  ? require('../assets/error-popup-dark.png')
                  : require('../assets/error-popup.png')
              }
              style={{width: 380, height: 400, borderRadius: 10}}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  pincontainer: {
    width: '85%',
  },
  pinCodeContainer: {
    width: 70,
    height: 70,
  },
  activePinCodeContainer: {
    color: '#00AEEF',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },

  modalContent: {
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#A3A3A3',
    width: '20%',
    height: 80,
    borderWidth: 1.5,
    borderRadius: 8,
    margin: 10,
    marginBottom: 20,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    color: '#000',
    height: 50,
    padding: 10,
    alignSelf: 'center',
    alignItems: 'center',
    margin: 4,
    fontSize: 22,
  },
  smallText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1D1E20',
    textAlign: 'center',
    width: 250,
    marginBottom: 30,
    fontFamily: 'NunitoSans-VariableFont_YTLC,opsz,wdth,wght',
  },

  bigText: {
    fontSize: 30,
    color: 'black',
    textAlign: 'center',
    marginTop: 40,
    fontWeight: 'bold',
    marginBottom: 6,
    fontFamily: 'Poppins-Bold',
  },
  blueBotton: {
    backgroundColor: '#00AEEF',
    width: '90%',
    height: 56,
    borderRadius: 10,
    margin: 10,
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  whiteBotton: {
    backgroundColor: '#fff',
    width: '90%',
    height: 56,
    borderRadius: 10,
    margin: 10,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#A3A3A3',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
