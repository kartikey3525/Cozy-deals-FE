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
  ActivityIndicator,
} from 'react-native';
import { HelperText } from 'react-native-paper';
import Entypo from 'react-native-vector-icons/Entypo';
import { useEffect, useState, useContext, useRef } from 'react';
import { AuthContext } from '../context/authcontext';
import Dropdown from '../components/Dropdown';
import { Dimensions } from 'react-native';
const Width = Dimensions.get('window').width;
import PhoneInput from 'react-native-phone-number-input';
import DatePicker from 'react-native-date-picker';
import { ThemeContext } from '../context/themeContext';
import Header from '../components/Header';
import useImagePicker1 from '../hooks/useImagePicker1';
import { useIsFocused } from '@react-navigation/native';
import KeyboardAvoidingContainer from '../components/KeyboardAvoided';

export default function EditProfile({ navigation }) {
  const [name, setName] = useState('');
  const [gender, setgender] = useState([]);
  const [date, setDate] = useState(new Date());
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  // const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState('');
  const phoneInput = useRef(null);
  const [value, setValue] = useState('');

  const [errors, setErrors] = useState({
    value: '',
    name: '',
    phone: '',
    gender: '',
  });

  const { media, selectMedia, setMedia ,isLoading} = useImagePicker1();
  {isLoading && <ActivityIndicator size="large" color="#0000ff" />}
  const {
    getCategories,
    uploadImage,
    getUserData,
    Userfulldata,
    updatebuyerProfile,
    imageUrl,
  } = useContext(AuthContext);

  useEffect(() => {
    getCategories();
    // getUserData();
    if (Userfulldata) {
      setName(Userfulldata.name || ''); // Prefill name if available
      setValue(Userfulldata.phone || ''); // Prefill phone number if available
      setgender(Userfulldata.gender ? Userfulldata.gender : []); // Prefill gender as array if available
      setDate(Userfulldata.dob ? new Date(Userfulldata.dob) : new Date()); // Prefill date or default to today
      setMedia(Userfulldata.profile?.length > 0 ? Userfulldata.profile[0] : null); // Prefill media if available
    }

    // console.log('Userfulldata',Userfulldata.gender,gender)
  }, [useIsFocused()]);

  const validateInputs = () => {
    const phoneRegex = /^\d{10}$/;
    let newErrors = { phone: '', name: '', gender: '' };
    let isValid = true;

    if (!name.trim()) {
      newErrors.name = 'Name is required.';
      isValid = false;
    } else if (name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters long.';
      isValid = false;
    }

    if (!value.trim()) {
      newErrors.phone = 'Phone number is required.';
      isValid = false;
    } else if (phoneInput.current && !phoneInput.current.isValidNumber(value)) {
      newErrors.phone = 'Enter a valid phone number.';
      isValid = false;
    }

    if (gender.length === 0) {
      newErrors.gender = 'Please select at least one category.';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handlePress = async () => {
    setErrors({ phone: '', name: '', gender: '' });
    if (!validateInputs()) return;
    try {
      await updatebuyerProfile(name, date, value, gender, media); 
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      // setIsLoading(false);
    }
  };

  // const handleProfileUpdate = async () => {
  //   try {
  //     console.log('Uploading image...');
  //     await uploadImage(media); 
  //     setTimeout(async () => {
  //       console.log('Image uploaded. Updating profile...');
  //       await updatebuyerProfile(name, date, value, gender, media); // Use updated media
  //     }, 2000); 
  //   } catch (error) {
  //     console.log('❌ Error updating profile:', error);
  //   }
  // };

  const formatDate = date => {
    return `${date.getDate().toString().padStart(2, '0')}/${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}/${date.getFullYear()}`;
  };

  const handleCategoryChange = value => {
    setgender(value); // Update selected categories
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        styles.screen,
        { backgroundColor: isDark ? 'black' : 'white' },
      ]}
    >
      <Header header={'Edit profile '} />

      <View
        style={[
          styles.rectangle2,
          {
            overflow: 'hidden',
            marginBottom: 30,
          },
        ]}
      >
        {media ? (
          <>
            <Image
              source={{ uri: media }}
              style={{
                width: 120,
                height: 120,
                alignSelf: 'center',
                overflow: 'hidden',
                borderRadius: 100,
                top: 10,
                borderWidth: 5,
                borderColor: isDark
                  ? 'rgba(255, 255, 255, 1)'
                  : 'rgba(231, 231, 231, 1)',
              }}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setMedia(null)} 
            >
              <Entypo name="cross" size={20} color="black" />
            </TouchableOpacity>
          </>
        ) : (
          <Image
            source={require('../assets/User-image.png')} 
            style={{
              width: 120,
              height: 120,
              alignSelf: 'center',
              overflow: 'hidden',
              borderRadius: 100,
              top: 10,
              borderWidth: 5,
              borderColor: 'rgba(0, 0, 0, 0.14)',
            }}
          />
        )}

        <Pressable onPress={selectMedia}>
          <Image
            source={require('../assets/edit.png')}
            style={{
              width: 40,
              height: 30,
              right: 5,
              bottom: 20,
              alignSelf: 'flex-end',
            }}
            resizeMode="contain"
          />
        </Pressable>
      </View>

      <View
        style={[
          styles.inputContainer,
          {
            borderColor: isDark
              ? 'rgba(37, 37, 37, 1)'
              : 'rgba(231, 231, 231, 1)',
          },
        ]}
      >
        <Image
          source={require('../assets/profile-edit.png')}
          style={{
            width: 25,
            height: 18,
            marginLeft: 15,
          }}
          resizeMode="contain"
        />
        <TextInput
          value={name}
          style={[
            styles.textInput,
            {
              backgroundColor: isDark ? 'black' : 'white',
              color: isDark ? 'white' : 'black',
            },
          ]}
          onChangeText={setName}
          placeholder="Name"
          mode="outlined"
          placeholderTextColor={isDark ? 'white' : 'black'}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>
      <HelperText
        type="error"
        style={{ alignSelf: 'flex-start', marginLeft: 14 }}
        visible={!!errors.name}
      >
        {errors.name}
      </HelperText>

      <Pressable
        onPress={() => setOpen(true)}
        style={[
          styles.inputContainer,
          {
            borderColor: isDark
              ? 'rgba(37, 37, 37, 1)'
              : 'rgba(231, 231, 231, 1)',
          },
        ]}
      >
        <TouchableOpacity onPress={() => setOpen(true)}>
          <Image
            source={require('../assets/calendar.png')}
            style={{
              width: 25,
              height: 20,
              marginLeft: 15,
            }}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <TextInput
          editable={false}
          placeholder={
            new Date(date).toDateString() === new Date().toDateString()
              ? 'DOB'
              : formatDate(date)
          }
          mode="outlined"
          style={[
            styles.textInput,
            {
              backgroundColor: isDark ? 'black' : 'white',
              color: isDark ? 'white' : 'black',
            },
          ]}
          placeholderTextColor={isDark ? 'white' : 'black'}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </Pressable>
      <HelperText
        type="error"
        style={{ alignSelf: 'flex-start', marginLeft: 14 }}
        visible={!!errors.date}
      >
        {errors.date}
      </HelperText>

      <PhoneInput
        ref={phoneInput}
        value={value === '' ? Userfulldata.phone : value}
        containerStyle={{
          width: Width * 0.9,
          height: 60,
          borderWidth: 1,
          borderColor: isDark
            ? 'rgba(37, 37, 37, 1)'
            : 'rgba(231, 231, 231, 1)',
          marginBottom: 0,
          borderRadius: 10,
        }}
        countryPickerProps={{
          withAlphaFilter: true,
          withFlag: true,
          withCallingCode: true,
        }}
        textContainerStyle={{
          backgroundColor: isDark ? '#000' : '#fff',
        }}
        textInputStyle={{
          height: 50,
          backgroundColor: isDark ? '#000' : '#fff',
          color: isDark ? '#fff' : '#000',
          fontSize: 16,
        }}
        codeTextStyle={{
          color: isDark ? '#fff' : '#000',
        }}
        flagButtonStyle={{
          backgroundColor: isDark ? '#000' : '#fff',
          borderTopLeftRadius: 10,
          borderBottomLeftRadius: 10,
        }}
        textInputProps={{
          selectionColor: isDark ? '#fff' : '#000',
        }}
        placeholderTextColor={isDark ? '#fff' : '#000'}
        defaultCode="IN"
        style={{}}
        layout="second"
        onChangeText={text => {
          setValue(text);
        }}
      />
      <HelperText
        type="error"
        style={{ alignSelf: 'flex-start', marginLeft: 14 }}
        visible={!!errors.phone}
      >
        {errors.phone}
      </HelperText>
      <Dropdown
        item={[
          { label: 'Male', value: 'male' },
          { label: 'Female', value: 'female' },
          { label: 'Others', value: 'others' },
        ]}
        selectedValues={gender}
        placeholder={gender ? gender :'Select Gender'}

        onChangeValue={handleCategoryChange}
        single={true}
      />
      <HelperText
        type="error"
        style={{ alignSelf: 'flex-start', marginLeft: 14 }}
        visible={!!errors.gender}
      >
        {errors.gender}
      </HelperText>

      <TouchableOpacity
        style={[styles.blueBotton, { margin: '10%' }]}
        onPress={handlePress}
      >
        <Text
          style={[
            styles.smallText,
            {
              color: '#fff',
              fontSize: 22,
              marginBottom: 0,
            },
          ]}
        >
          Update profile
        </Text>
      </TouchableOpacity>

      <DatePicker
        modal
        theme={isDark ? 'dark' : 'light'}
        open={open}
        date={date}
        mode="date"
        textColor={isDark ? '#fff' : '#000'}
        androidVariant="iosClone"
        minimumDate={new Date('1900-01-01')}
        onConfirm={date => {
          setOpen(false);
          setDate(date);
        }}
        onCancel={() => {
          setOpen(false);
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  closeButton: {
    position: 'absolute',
    top: 14,
    right: 10,
    backgroundColor: 'rgb(255, 255, 255)',
    borderRadius: 15,
    padding: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderColor: 'rgba(231, 231, 231, 1)',
    width: '90%',
    borderWidth: 1,
    borderRadius: 8,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    color: '#000',
    width: '86%',
    height: 50,
    padding: 10,
    margin: 4,
  },
  blueBotton: {
    backgroundColor: '#00AEEF',
    width: '90%',
    height: 56,
    borderRadius: 10,
    margin: '30%',
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
