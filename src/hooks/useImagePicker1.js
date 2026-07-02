import {useState, useContext} from 'react';
import {Platform, PermissionsAndroid, Alert} from 'react-native';
import axios from 'axios';
import {AuthContext} from '../context/authcontext';
import * as ImagePicker from 'react-native-image-crop-picker';

export default function useImagePicker1() {
  const {userdata, apiURL} = useContext(AuthContext);
  const [media, setMedia] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  let loadingAlert = null;


  const showLoadingAlert = () => {
    // Dismiss any existing alert first
    if (loadingAlert) {
      Alert.alert('', '', [], { cancelable: true });
    }
    loadingAlert = Alert.alert(
      'Uploading Image',
      'Please wait while we process your image...',
      [],
      { cancelable: false }
    );
  };

  const dismissLoadingAlert = () => {
    if (loadingAlert) {
      Alert.alert('', '', [], { cancelable: true });
      loadingAlert = null;
    }
  };

  const uploadImage = async (uri, mimeType = 'image/jpeg') => {
    setIsLoading(true);
    showLoadingAlert();
    
    try {
      if (!userdata.token) {
        Alert.alert('Authentication Error', 'No valid token found.');
        return null;
      }

      const formData = new FormData();
      formData.append('image', {
        uri: uri,
        name: `photo_${Date.now()}.${mimeType.split('/')[1] || 'jpg'}`,
        type: mimeType,
      });

      const headers = {
        Authorization: `Bearer ${userdata.token}`,
        'Content-Type': 'multipart/form-data',
      };

      const response = await axios.post(
        `${apiURL}/api/user/uploadImage`,
        formData,
        {headers},
      );

      if (response.status === 200 && response.data?.data) {
        return response.data.data[0];
      } else {
        Alert.alert('Upload Failed', 'Please try again later.');
        return null;
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert(
        'Upload Failed',
        error.response?.data?.message || 'Failed to upload image',
      );
      return null;
    } finally {
      setIsLoading(false);
      dismissLoadingAlert();
    }
  };

  const selectMedia = async () => {
    try {
      // const hasPermission = await requestPermission();
      // if (!hasPermission) {
      //   Alert.alert(
      //     'Permission Required',
      //     'We need storage and camera permissions to select images',
      //   );
      //   return;
      // }

      const image = await ImagePicker.openPicker({
        // width: 300,
        // height: 400,
        cropping: true,
        cropperCircleOverlay: false,
        compressImageQuality: 0.8,
        mediaType: 'photo',
        multiple: false,
        forceJpg: true,
      });

      if (image) {
        const uploadedUrl = await uploadImage(image.path, image.mime);
        if (uploadedUrl) {
          setMedia(uploadedUrl);
          console.log('Image uploadedUrl:', uploadedUrl);
          Alert.alert('Success', 'Image uploaded successfully!');
        }
      }
    } catch (error) {
      dismissLoadingAlert();
      setIsLoading(false);
      
      if (error.message !== 'User cancelled image selection') {
        console.error('Image picker error:', error);
        Alert.alert('Error', 'Failed to select image');
      }
    }
  };

  return {
    media,
    selectMedia,
    setMedia,
    isLoading
  };
}