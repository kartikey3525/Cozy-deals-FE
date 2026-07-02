import DateTimePicker from '@react-native-community/datetimepicker'; // Added DateTimePicker
import {useIsFocused} from '@react-navigation/native';
import React, {useContext, useEffect, useRef, useState} from 'react'; // Added useState and useEffect
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'react-native-image-crop-picker';
import {HelperText} from 'react-native-paper';
import PhoneInput from 'react-native-phone-number-input';
import Entypo from 'react-native-vector-icons/Entypo';
import Feather from 'react-native-vector-icons/Feather';
import Dropdown from '../components/Dropdown';
import KeyboardAvoidingContainer from '../components/KeyboardAvoided';
import {AuthContext} from '../context/authcontext';
import {ThemeContext} from '../context/themeContext';
import useImagePicker from '../hooks/useImagePicker';

const Width = Dimensions.get('window').width;
const Height = Dimensions.get('window').height;

export default function SellerProfile({navigation, route}) {
  const {theme} = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const [description, setDescription] = useState('');
  const [socialMedia, setSocialMedia] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [shopName, setShopName] = useState('');
  const [openAt, setOpenAt] = useState('');
  const [closeAt, setCloseAt] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedScale, setSelectedScale] = useState('');
  const [selectedAvailability, setSelectedAvailability] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const phoneInput = useRef(null);
  const isFocused = useIsFocused();
  const [establishmentYear, setEstablishmentYear] = useState('');
  const [gstin, setGstin] = useState('');
  const [shopData, setShopData] = useState('');

  // Added states for time picker modal
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [timeType, setTimeType] = useState(null); // 'open' or 'close'
  const [tempTime, setTempTime] = useState(new Date()); // Temporary time for picker

  const {media, selectMedia, uploadImage, setMedia, isUploading} =
    useImagePicker();
  {
    isUploading && <ActivityIndicator size="large" color="#0000ff" />;
  }

  const handleCategoryChange = value => {
    setSelectedCategories(value);
  };

  const handleAvailabilityChange = value => {
    setSelectedAvailability(value);
  };

  const handleScaleChange = value => {
    setSelectedScale(value);
  };

  const {
    fullCategorydata,
    Userfulldata,
    userdata,
    getSingleShop,
    singleShop,
    location,
    createSellerProfile,
  } = useContext(AuthContext);

  useEffect(() => {
    if (userdata?._id && Userfulldata) {
      setShopData(Userfulldata);
    }
  }, [userdata?._id, Userfulldata]);

  useEffect(() => {
    if (shopData) {
      setDescription(shopData.description || '');
      setSocialMedia(shopData.socialMedia || '');
      setEstablishmentYear(
        shopData?.establishmentYear ? String(shopData.establishmentYear) : '',
      );
      setGstin(shopData.gstin || '');
      setOpenAt(shopData.openTime || '');
      setCloseAt(shopData.closeTime || '');
      setBusinessAddress(shopData.businessAddress || '');
      setOwnerName(shopData.ownerName || '');
      setShopName(shopData.shopName || '');
      setPhone(shopData.phone || '');
      setMedia(Array.isArray(shopData.profile) ? shopData.profile : []);
      setSelectedScale(shopData.businessScale || '');
      setSelectedCategories(shopData.selectedCategories || []);
      setSelectedAvailability(
        typeof shopData?.isDeliveryAvailable === 'boolean'
          ? shopData.isDeliveryAvailable
          : false,
      );
    }
  }, [shopData]);

  const [errors, setErrors] = useState({
    description: '',
    phone: '',
    location: '',
    media: '',
    selectedCategories: '',
    businessAddress: '',
    socialMedia: '',
    establishmentYear: '',
    gstin: '',
    ownerName: '',
    shopName: '',
    openAt: '',
    closeAt: '',
    selectedScale: '',
    selectedAvailability: '',
  });

  const validateInputs = () => {
    let valid = true;
    const newErrors = {
      description: '',
      phone: '',
      location: '',
      media: '',
      selectedCategories: '',
      businessAddress: '',
      socialMedia: '',
      establishmentYear: '',
      gstin: '',
      ownerName: '',
      shopName: '',
      openAt: '',
      closeAt: '',
      selectedScale: '',
      selectedAvailability: '',
    };

    if (!description.trim()) {
      newErrors.description = 'Description is required';
      valid = false;
    } else if (description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
      valid = false;
    }

    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
      valid = false;
    } else if (!phoneInput.current?.isValidNumber(phone)) {
      newErrors.phone = 'Please enter a valid phone number';
      valid = false;
    }

    if (!location) {
      newErrors.location = 'Location is required';
      valid = false;
    }

    if (media.length === 0) {
      newErrors.media = 'At least one image is required';
      valid = false;
    }

    if (selectedCategories.length === 0) {
      newErrors.selectedCategories = 'At least one category is required';
      valid = false;
    }

    if (!businessAddress.trim()) {
      newErrors.businessAddress = 'Business address is required';
      valid = false;
    } else if (businessAddress.length < 10) {
      newErrors.businessAddress = 'Address must be at least 10 characters';
      valid = false;
    }

    if (!socialMedia.trim()) {
      newErrors.socialMedia = 'Social media link is required';
      valid = false;
    } else if (!socialMedia.includes('http') && !socialMedia.includes('www')) {
      newErrors.socialMedia = 'Please enter a valid URL';
      valid = false;
    }

    if (!establishmentYear.trim()) {
      newErrors.establishmentYear = 'Establishment year is required';
      valid = false;
    } else if (isNaN(establishmentYear) || establishmentYear.length !== 4) {
      newErrors.establishmentYear = 'Please enter a valid year (YYYY)';
      valid = false;
    }

    if (!gstin.trim()) {
      newErrors.gstin = 'GSTIN is required';
      valid = false;
    } else if (gstin.length < 15) {
      newErrors.gstin = 'GSTIN must be 15 characters';
      valid = false;
    }

    if (!ownerName.trim()) {
      newErrors.ownerName = 'Owner name is required';
      valid = false;
    } else if (ownerName.length < 3) {
      newErrors.ownerName = 'Name must be at least 3 characters';
      valid = false;
    }

    if (!shopName.trim()) {
      newErrors.shopName = 'Shop name is required';
      valid = false;
    } else if (shopName.length < 3) {
      newErrors.shopName = 'Shop name must be at least 3 characters';
      valid = false;
    }

    if (!openAt.trim()) {
      newErrors.openAt = 'Opening time is required';
      valid = false;
    }
    if (!closeAt.trim()) {
      newErrors.closeAt = 'Closing time is required';
      valid = false;
    }

    if (selectedScale.length === 0) {
      newErrors.selectedScale = 'Business scale is required';
      valid = false;
    }

    if (typeof selectedAvailability !== 'boolean') {
      newErrors.selectedAvailability = 'Delivery availability is required';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handlePress = async () => {
    if (!validateInputs()) {
      return;
    }

    setIsLoading(true);
    try {
      console.log(
        'Response 787:',
        description,
        phone,
        location,
        media,
        selectedCategories,
        businessAddress,
        socialMedia,
        establishmentYear,
        gstin,
        ownerName,
        shopName,
        openAt,
        closeAt,
        selectedScale,
        selectedAvailability,
      );
      await createSellerProfile(
        description,
        phone,
        location,
        media,
        selectedCategories,
        businessAddress,
        socialMedia,
        establishmentYear,
        gstin,
        ownerName,
        shopName,
        openAt,
        closeAt,
        selectedScale,
        selectedAvailability,
      );
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileImageSelect = async () => {
    const uploadImage = async uri => {
      try {
        const uploadedUrl = await new Promise(resolve =>
          setTimeout(() => resolve(uri), 2000),
        );
        return uploadedUrl;
      } catch (error) {
        console.error('Upload error:', error);
        Alert.alert('Upload Failed', 'Failed to upload image');
        return null;
      }
    };

    try {
      const image = await ImagePicker.openPicker({
        mediaType: 'photo',
        cropping: true,
        cropperCircleOverlay: false,
        compressImageQuality: 0.8,
        multiple: false,
        forceJpg: true,
      });

      if (image) {
        const newImageUri = image.path;
        const uploadedUrl = await uploadImage(newImageUri);

        if (uploadedUrl) {
          setMedia(prevMedia => {
            return [uploadedUrl, ...prevMedia.slice(1)];
          });
        }
      }
    } catch (error) {
      if (error.message !== 'User cancelled image selection') {
        console.error('Error updating profile image:', error);
        Alert.alert('Error', 'Failed to select or crop image');
      }
    }
  };

  // Time picker handlers
  const showTimePickerModal = type => {
    setTimeType(type);
    setShowTimePicker(true);
    // Set initial time based on existing value or default to current time
    const currentTime = new Date();
    if (type === 'open' && openAt) {
      const [hours, minutes] = openAt.split(':');
      currentTime.setHours(parseInt(hours), parseInt(minutes.split(' ')[0]));
    } else if (type === 'close' && closeAt) {
      const [hours, minutes] = closeAt.split(':');
      currentTime.setHours(parseInt(hours), parseInt(minutes.split(' ')[0]));
    }
    setTempTime(currentTime);
  };

  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const formattedTime = selectedTime.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      if (timeType === 'open') {
        setOpenAt(formattedTime);
      } else if (timeType === 'close') {
        setCloseAt(formattedTime);
      }
    }
    setTimeType(null);
  };

  return (
    <KeyboardAvoidingContainer>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.screen,
          {
            backgroundColor: isDark ? '#000' : '#fff',
          },
        ]}>
        <View
          style={{
            alignItems: 'center',
            width: Width,
            flexDirection: 'row',
            height: Height * 0.1,
            justifyContent: 'flex-start',
            marginBottom: 20,
          }}>
          <Entypo
            onPress={() => navigation.goBack()}
            name="chevron-thin-left"
            size={20}
            color={isDark ? 'rgba(255, 255, 255, 1)' : 'rgba(94, 95, 96, 1)'}
            style={{marginLeft: 20, padding: 5}}
          />
          <Text
            style={[
              {
                fontSize: 20,
                fontWeight: 'bold',
                alignSelf: 'center',
                textAlign: 'center',
                color: isDark ? 'rgba(255, 255, 255, 1)' : 'rgb(0, 0, 0)',
                width: Width * 0.75,
              },
            ]}>
            Profile
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Profilescreen')}>
            <Feather
              name="settings"
              size={20}
              color={isDark ? 'rgba(255, 255, 255, 1)' : 'rgba(94, 95, 96, 1)'}
              style={{padding: 5}}
            />
          </TouchableOpacity>
        </View>

        <View style={[styles.rectangle2, {marginBottom: 35}]}>
          {media.length > 0 && media[0] ? (
            <Image
              source={{uri: media[0]}}
              style={{
                width: 120,
                height: 120,
                alignSelf: 'center',
                overflow: 'hidden',
                borderRadius: 100,
                borderWidth: 5,
                borderColor: isDark
                  ? 'rgba(255, 255, 255, 1)'
                  : 'rgba(231, 231, 231, 1)',
              }}
            />
          ) : (
            <Image
              source={require('../assets/User-image.png')}
              style={{
                width: 120,
                height: 120,
                alignSelf: 'center',
                overflow: 'hidden',
                borderRadius: 100,
                borderWidth: 5,
                borderColor: 'rgba(0, 0, 0, 0.14)',
              }}
            />
          )}

          <Pressable onPress={handleProfileImageSelect}>
            <Image
              source={require('../assets/edit.png')}
              style={{
                width: 40,
                height: 30,
                right: 5,
                bottom: 0,
                position: 'absolute',
              }}
              resizeMode="contain"
            />
          </Pressable>

          {media && media.length > 0 && media[0] && (
            <TouchableOpacity
              style={[
                styles.closeButton,
                {
                  right: 10,
                  top: 5,
                  backgroundColor: isDark ? 'rgba(36, 36, 36, 1)' : 'lightgrey',
                },
              ]}
              onPress={() => setMedia(media.slice(1))}>
              <Entypo
                name="cross"
                size={22}
                color={!isDark ? 'black' : 'white'}
              />
            </TouchableOpacity>
          )}
        </View>

        <View
          style={{
            alignSelf: 'flex-start',
            marginLeft: 25,
            flexDirection: 'row',
          }}>
          <Text
            style={[
              {
                color: '#000',
                fontWeight: '600',
                fontSize: 15,
                color: isDark ? 'rgba(255, 255, 255, 1)' : 'rgb(0, 0, 0)',
                marginBottom: 5,
                alignSelf: 'flex-start',
              },
            ]}>
            Delivery available
          </Text>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            alignSelf: 'center',
            width: Width,
            justifyContent: 'space-evenly',
          }}>
          <Dropdown
            item={[
              {label: 'Yes', value: true},
              {label: 'No', value: false},
            ]}
            placeholder={
              selectedAvailability === true
                ? 'Yes'
                : selectedAvailability === false
                ? 'No'
                : 'Select Delivery Availability'
            }
            single={true}
            selectedValues={selectedAvailability}
            onChangeValue={handleAvailabilityChange}
          />
        </View>
        <HelperText
          type="error"
          style={{alignSelf: 'flex-start', marginLeft: 14}}
          visible={!!errors.selectedAvailability}>
          {errors.selectedAvailability}
        </HelperText>

        <View
          style={{
            alignSelf: 'flex-start',
            marginLeft: 25,
            flexDirection: 'row',
          }}>
          <Text
            style={[
              {
                color: '#000',
                fontWeight: '600',
                fontSize: 15,
                color: isDark ? 'rgba(255, 255, 255, 1)' : 'rgb(0, 0, 0)',
                marginBottom: 5,
                alignSelf: 'flex-start',
                width: Width * 0.5,
              },
            ]}>
            Contact number
          </Text>
        </View>

        <PhoneInput
          ref={phoneInput}
          defaultValue={phone}
          placeholder={
            shopData?.phone?.length > 0 ? shopData?.phone : 'Enter phone number'
          }
          containerStyle={{
            width: Width * 0.9,
            height: 60,
            borderWidth: 1,
            borderColor: errors.phone ? 'red' : 'rgba(0, 0, 0, 0.43)',
            marginBottom: 5,
            borderRadius: 10,
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
          defaultCode="IN"
          layout="second"
          onChangeText={text => setPhone(text)}
          onChangeFormattedText={text => setPhone(text)}
        />
        <HelperText
          type="error"
          visible={!!errors.phone}
          style={{alignSelf: 'flex-start', marginLeft: 10}}>
          {errors.phone}
        </HelperText>

        <View
          style={{
            alignSelf: 'flex-start',
            marginLeft: 25,
            flexDirection: 'row',
          }}>
          <Text
            style={[
              {
                color: '#000',
                fontWeight: '600',
                fontSize: 15,
                color: isDark ? 'rgba(255, 255, 255, 1)' : 'rgb(0, 0, 0)',
                marginBottom: 5,
                alignSelf: 'flex-start',
                width: Width * 0.48,
              },
            ]}>
            Open At
          </Text>

          <Text
            style={[
              {
                fontWeight: '600',
                fontSize: 15,
                color: isDark ? 'rgba(255, 255, 255, 1)' : 'rgb(0, 0, 0)',
                marginBottom: 5,
                alignSelf: 'flex-start',
              },
            ]}>
            Close At
          </Text>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            alignSelf: 'center',
            width: Width,
            justifyContent: 'space-evenly',
          }}>
          <TouchableOpacity
            style={[
              styles.inputContainer,
              {
                width: '42%',
                borderColor: errors.openAt
                  ? 'red'
                  : isDark
                  ? 'rgba(109, 109, 109, 0.43)'
                  : 'rgba(0, 0, 0, 1)',
              },
            ]}
            onPress={() => showTimePickerModal('open')}>
            <TextInput
              value={openAt}
              style={[
                styles.textInput,
                {
                  backgroundColor: isDark ? '#000' : 'rgb(255, 255, 255)',
                  color: isDark ? '#fff' : '#000',
                },
              ]}
              placeholder="09:00 AM"
              mode="outlined"
              placeholderTextColor={'grey'}
              editable={false} // Disable manual input
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.inputContainer,
              {
                width: '42%',
                borderColor: errors.closeAt
                  ? 'red'
                  : isDark
                  ? 'rgba(109, 109, 109, 0.43)'
                  : 'rgba(0, 0, 0, 1)',
              },
            ]}
            onPress={() => showTimePickerModal('close')}>
            <TextInput
              value={closeAt}
              style={[
                styles.textInput,
                {
                  backgroundColor: isDark ? '#000' : 'rgb(255, 255, 255)',
                  color: isDark ? '#fff' : '#000',
                },
              ]}
              placeholder="10:00 PM"
              mode="outlined"
              placeholderTextColor={'grey'}
              editable={false} // Disable manual input
            />
          </TouchableOpacity>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            alignSelf: 'center',
            width: Width * 0.9,
            justifyContent: 'space-between',
          }}>
          <HelperText
            type="error"
            style={{alignSelf: 'flex-start', marginLeft: 14}}
            visible={!!errors.openAt}>
            {errors.openAt}
          </HelperText>

          <HelperText
            type="error"
            style={{alignSelf: 'flex-start', marginLeft: 0}}
            visible={!!errors.closeAt}>
            {errors.closeAt}
          </HelperText>
        </View>

        {/* Time Picker Modal */}
        {showTimePicker && (
          <DateTimePicker
            value={tempTime}
            mode="time"
            is24Hour={false}
            display="default"
            onChange={onTimeChange}
          />
        )}

        <View
          style={{
            alignSelf: 'flex-start',
            marginLeft: 25,
            flexDirection: 'row',
          }}>
          <Text
            style={[
              {
                color: isDark ? '#fff' : '#000',
                fontWeight: '600',
                fontSize: 15,
                marginBottom: 5,
                alignSelf: 'flex-start',
                width: '50%',
              },
            ]}>
            Location
          </Text>
        </View>

        <Dropdown
          style={styles.inputContainer}
          placeholder={
            location ? 'Selected current location' : 'Select Location'
          }
        />
        <HelperText
          type="error"
          visible={!!errors.location}
          style={{height: 10}}>
          {errors.location}
        </HelperText>

        <Text
          style={[
            {
              color: isDark ? '#fff' : '#000',
              fontWeight: '600',
              fontSize: 18,
              marginBottom: 15,
              marginTop: 5,
              left: 25,
              alignSelf: 'flex-start',
            },
          ]}>
          Business statutory details
        </Text>

        <View
          style={{
            alignSelf: 'flex-start',
            marginLeft: 25,
            flexDirection: 'row',
          }}>
          <Text
            style={[
              {
                color: '#000',
                fontWeight: '600',
                fontSize: 15,
                color: isDark ? 'rgba(255, 255, 255, 1)' : 'rgb(0, 0, 0)',
                marginBottom: 5,
                alignSelf: 'flex-start',
                width: Width * 0.48,
              },
            ]}>
            Shop name
          </Text>

          <Text
            style={[
              {
                fontWeight: '600',
                fontSize: 15,
                color: isDark ? 'rgba(255, 255, 255, 1)' : 'rgb(0, 0, 0)',
                marginBottom: 5,
                alignSelf: 'flex-start',
              },
            ]}>
            Owner name
          </Text>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            alignSelf: 'center',
            width: Width,
            justifyContent: 'space-evenly',
          }}>
          <View
            style={[
              styles.inputContainer,
              {
                width: '42%',
                borderColor: errors.shopName
                  ? 'red'
                  : isDark
                  ? 'rgba(109, 109, 109, 0.43)'
                  : 'rgba(0, 0, 0, 1)',
              },
            ]}>
            <TextInput
              value={shopName}
              style={[
                styles.textInput,
                {
                  backgroundColor: isDark ? '#000' : 'rgb(255, 255, 255)',
                  color: isDark ? '#fff' : '#000',
                },
              ]}
              onChangeText={setShopName}
              placeholder="Shop name"
              mode="outlined"
              placeholderTextColor={'grey'}
            />
          </View>

          <View
            style={[
              styles.inputContainer,
              {
                width: '42%',
                borderColor: errors.ownerName
                  ? 'red'
                  : isDark
                  ? 'rgba(109, 109, 109, 0.43)'
                  : 'rgba(0, 0, 0, 1)',
              },
            ]}>
            <TextInput
              value={ownerName}
              style={[
                styles.textInput,
                {
                  backgroundColor: isDark ? '#000' : 'rgb(255, 255, 255)',
                  color: isDark ? '#fff' : '#000',
                },
              ]}
              onChangeText={setOwnerName}
              placeholder="Owner name"
              mode="outlined"
              placeholderTextColor={'grey'}
            />
          </View>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            alignSelf: 'flex-start',
            width: Width * 0.9,
            justifyContent: 'space-between',
          }}>
          <HelperText
            type="error"
            style={{alignSelf: 'flex-start', marginLeft: 14}}
            visible={!!errors.shopName}>
            {errors.shopName}
          </HelperText>

          <HelperText
            type="error"
            style={{alignSelf: 'flex-start', marginLeft: 0}}
            visible={!!errors.ownerName}>
            {errors.ownerName}
          </HelperText>
        </View>

        <View
          style={{
            alignSelf: 'flex-start',
            marginLeft: 25,
            flexDirection: 'row',
          }}>
          <Text
            style={[
              {
                color: isDark ? '#fff' : '#000',
                fontWeight: '600',
                fontSize: 15,
                marginBottom: 5,
                alignSelf: 'flex-start',
                width: '50%',
              },
            ]}>
            Year of establishment
          </Text>
        </View>

        <View
          style={[
            styles.inputContainer,
            {
              borderColor: errors.establishmentYear
                ? 'red'
                : isDark
                ? 'rgba(109, 109, 109, 0.43)'
                : 'rgba(0, 0, 0, 1)',
            },
          ]}>
          <TextInput
            value={establishmentYear}
            style={[
              styles.textInput,
              {
                backgroundColor: isDark ? '#000' : 'rgb(255, 255, 255)',
                color: isDark ? '#fff' : '#000',
              },
            ]}
            onChangeText={setEstablishmentYear}
            placeholder="Year of establishment"
            mode="outlined"
            placeholderTextColor={'grey'}
            keyboardType="numeric"
            maxLength={4}
          />
        </View>
        <HelperText
          type="error"
          style={{alignSelf: 'flex-start', marginLeft: 14}}
          visible={!!errors.establishmentYear}>
          {errors.establishmentYear}
        </HelperText>

        <View
          style={{
            alignSelf: 'flex-start',
            marginLeft: 25,
            flexDirection: 'row',
          }}>
          <Text
            style={[
              {
                color: isDark ? '#fff' : '#000',
                fontWeight: '600',
                fontSize: 15,
                marginBottom: 5,
                alignSelf: 'flex-start',
                width: '50%',
              },
            ]}>
            Business address
          </Text>
        </View>

        <View
          style={[
            styles.inputContainer,
            {
              borderColor: errors.businessAddress
                ? 'red'
                : isDark
                ? 'rgba(109, 109, 109, 0.43)'
                : 'rgba(0, 0, 0, 1)',
            },
          ]}>
          <TextInput
            value={businessAddress}
            style={[
              styles.textInput,
              {
                backgroundColor: isDark ? '#000' : 'rgb(255, 255, 255)',
                color: isDark ? '#fff' : '#000',
              },
            ]}
            onChangeText={setBusinessAddress}
            placeholder="Business Address"
            mode="outlined"
            placeholderTextColor={isDark ? '#ccc' : 'black'}
            multiline={true}
            numberOfLines={3}
          />
        </View>
        <HelperText
          type="error"
          style={{alignSelf: 'flex-start', marginLeft: 14}}
          visible={!!errors.businessAddress}>
          {errors.businessAddress}
        </HelperText>

        <View
          style={{
            alignSelf: 'flex-start',
            marginLeft: 25,
            flexDirection: 'row',
          }}>
          <Text
            style={[
              {
                color: '#000',
                fontWeight: '600',
                fontSize: 15,
                color: isDark ? 'rgba(255, 255, 255, 1)' : 'rgb(0, 0, 0)',
                marginBottom: 5,
                alignSelf: 'flex-start',
                width: '50%',
              },
            ]}>
            Business scale
          </Text>
        </View>

        <Dropdown
          item={[
            {
              label: 'Small Business (Local)',
              value: 'small',
            },
            {
              label: 'Medium Business (City-wide)',
              value: 'medium',
            },
            {
              label: 'Large Business (Multiple Cities/State-wide)',
              value: 'large',
            },
          ]}
          placeholder={
            selectedScale.length > 0 ? selectedScale : 'Select Scale'
          }
          half={false}
          single={true}
          selectedValues={selectedScale}
          onChangeValue={handleScaleChange}
        />

        <HelperText
          type="error"
          visible={!!errors.selectedScale}
          style={{alignSelf: 'flex-start', marginLeft: 10}}>
          {errors.selectedScale}
        </HelperText>

        <View
          style={{
            alignSelf: 'flex-start',
            marginLeft: 25,
            flexDirection: 'row',
          }}>
          <Text
            style={[
              {
                color: isDark ? '#fff' : '#000',
                fontWeight: '600',
                fontSize: 15,
                marginBottom: 5,
                alignSelf: 'flex-start',
                width: '50%',
              },
            ]}>
            Social media
          </Text>
        </View>

        <View
          style={[
            styles.inputContainer,
            {
              borderColor: errors.socialMedia
                ? 'red'
                : isDark
                ? 'rgba(109, 109, 109, 0.43)'
                : 'rgba(0, 0, 0, 1)',
            },
          ]}>
          <TextInput
            value={socialMedia}
            style={[
              styles.textInput,
              {
                backgroundColor: isDark ? '#000' : 'rgb(255, 255, 255)',
                color: isDark ? '#fff' : '#000',
              },
            ]}
            onChangeText={setSocialMedia}
            placeholder="Social media link"
            mode="outlined"
            placeholderTextColor={'grey'}
          />
        </View>
        <HelperText
          type="error"
          style={{alignSelf: 'flex-start', marginLeft: 14}}
          visible={!!errors.socialMedia}>
          {errors.socialMedia}
        </HelperText>

        <View
          style={{
            alignSelf: 'flex-start',
            marginLeft: 25,
            flexDirection: 'row',
          }}>
          <Text
            style={[
              {
                color: isDark ? '#fff' : '#000',
                fontWeight: '600',
                fontSize: 15,
                marginBottom: 5,
                alignSelf: 'flex-start',
                width: '50%',
              },
            ]}>
            GSTIN
          </Text>
        </View>

        <View
          style={[
            styles.inputContainer,
            {
              borderColor: errors.gstin
                ? 'red'
                : isDark
                ? 'rgba(109, 109, 109, 0.43)'
                : 'rgba(0, 0, 0, 1)',
            },
          ]}>
          <TextInput
            value={gstin}
            style={[
              styles.textInput,
              {
                backgroundColor: isDark ? '#000' : 'rgb(255, 255, 255)',
                color: isDark ? '#fff' : '#000',
              },
            ]}
            onChangeText={setGstin}
            placeholder="GST number"
            mode="outlined"
            placeholderTextColor={'grey'}
            maxLength={15}
          />
        </View>
        <HelperText
          type="error"
          style={{alignSelf: 'flex-start', marginLeft: 14}}
          visible={!!errors.gstin}>
          {errors.gstin}
        </HelperText>

        <View
          style={{
            alignSelf: 'flex-start',
            marginLeft: 25,
            flexDirection: 'row',
          }}>
          <Text
            style={[
              {
                color: isDark ? '#fff' : '#000',
                fontWeight: '600',
                fontSize: 15,
                marginBottom: 5,
                alignSelf: 'flex-start',
                width: '50%',
              },
            ]}>
            Description
          </Text>
        </View>

        <View
          style={[
            styles.inputContainer,
            {
              height: 100,
              alignItems: 'flex-start',
              borderColor: errors.description
                ? 'red'
                : isDark
                ? 'rgba(109, 109, 109, 0.43)'
                : 'rgba(0, 0, 0, 1)',
            },
          ]}>
          <TextInput
            value={description}
            style={[
              styles.textInput,
              {
                height: 93,
                color: isDark ? '#fff' : '#000',
                backgroundColor: isDark ? '#000' : 'rgb(255, 255, 255)',
              },
            ]}
            onChangeText={setDescription}
            numberOfLines={5}
            multiline={true}
            placeholder="Add a short description about your business, products, or services..."
            mode="outlined"
            placeholderTextColor={'grey'}
          />
        </View>
        <HelperText
          type="error"
          style={{alignSelf: 'flex-start', marginLeft: 14}}
          visible={!!errors.description}>
          {errors.description}
        </HelperText>

        <View
          style={{
            alignSelf: 'flex-start',
            marginLeft: 25,
            flexDirection: 'row',
          }}>
          <Text
            style={[
              {
                color: isDark ? '#fff' : '#000',
                fontWeight: '600',
                fontSize: 15,
                marginBottom: 5,
                alignSelf: 'flex-start',
                width: '50%',
              },
            ]}>
            Category
          </Text>
        </View>

        <Dropdown
          item={
            fullCategorydata?.map(category => ({
              label: category.name || 'Unnamed',
              value: category.name || '',
            })) || []
          }
          placeholder={
            selectedCategories.length > 0
              ? selectedCategories.join(', ')
              : 'Select Categories'
          }
          selectedValues={selectedCategories}
          onChangeValue={handleCategoryChange}
        />

        <HelperText
          type="error"
          visible={!!errors.selectedCategories}
          style={{alignSelf: 'flex-start', marginLeft: 10}}>
          {errors.selectedCategories}
        </HelperText>

        <Text
          style={[
            {
              color: isDark ? '#fff' : 'rgb(0, 0, 0)',
              fontSize: 18,
              textAlign: 'left',
              marginBottom: 10,
              fontWeight: '600',
              alignSelf: 'flex-start',
              marginLeft: '7%',
              marginTop: '5%',
            },
          ]}>
          Shop images
        </Text>

        <View style={[styles.imageContainer, {flexWrap: 'wrap'}]}>
          {media.slice(1, 8).map((item, index) => (
            <View key={index} style={styles.mediaItem}>
              <Image source={{uri: item}} style={styles.mediaPreview} />
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setMedia(media.filter((_, i) => i !== index + 1));
                }}>
                <Entypo name="cross" size={18} color={'black'} />
              </TouchableOpacity>
            </View>
          ))}

          {media.length < 8 && (
            <TouchableOpacity
              onPress={selectMedia}
              style={[
                styles.mediaItem,
                {
                  backgroundColor: isDark ? '#1E1E1E' : 'rgb(255, 255, 255)',
                  borderWidth: 1,
                  borderColor: 'rgba(176, 176, 176, 1)',
                  borderStyle: 'dashed',
                },
              ]}>
              <Entypo
                name="squared-plus"
                size={25}
                color="rgba(176, 176, 176, 1)"
              />
            </TouchableOpacity>
          )}
        </View>

        <HelperText
          type="error"
          visible={!!errors.media}
          style={{alignSelf: 'flex-start', marginLeft: 14}}>
          {errors.media}
        </HelperText>

        <TouchableOpacity
          style={styles.blueBotton}
          onPress={handlePress}
          disabled={isLoading}>
          <Text
            style={[
              styles.smallText,
              {color: '#fff', fontSize: 22, marginBottom: 0},
            ]}>
            {isLoading
              ? !shopData?.ownerName
                ? 'Submitting...'
                : 'Updating...'
              : !shopData?.ownerName
              ? 'Submit'
              : 'Update'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  modalContent: {
    width: Width,
    height: Height * 0.28,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
  },
  closeButton2: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 15,
    padding: 1,
    left: '40%',
    top: '10%',
  },
  closeButton: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: 'rgb(255, 255, 255)',
    borderRadius: 15,
    padding: 1,
  },
  mediaSelector: {
    justifyContent: 'center',
    alignItems: 'center',
    width: Width * 0.85,
    height: 150,
    borderWidth: 3,
    backgroundColor: 'rgba(250, 250, 250, 1)',
    borderRadius: 30,
    borderColor: 'rgba(6, 196, 217, 1)',
    marginBottom: 10,
  },
  mediaItem: {
    width: '20%',
    margin: '2%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  mediaPreview: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    resizeMode: 'cover',
  },
  imageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '95%',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  phoneInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderColor: '#A3A3A3',
    width: '90%',
    borderWidth: 1,
    borderRadius: 8,
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
    marginTop: 10,
    marginBottom: 20,
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
