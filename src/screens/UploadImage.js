import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator, 
} from 'react-native';
import React, {useContext, useEffect} from 'react';
import {HelperText} from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import {useState} from 'react';
import {AuthContext} from '../context/authcontext';
import {Dimensions} from 'react-native'; 
const Width = Dimensions.get('window').width;
const Height = Dimensions.get('window').height;
import {ThemeContext} from '../context/themeContext'; 
import Header from '../components/Header';
import useImagePicker from '../hooks/useImagePicker';
import { useIsFocused } from '@react-navigation/native';

export default function UploadImage({navigation, route}) {
  const {theme} = useContext(ThemeContext);
  const isDark = theme === 'dark';

  const [isLoading, setIsLoading] = useState(false);
  const post = route?.params?.item || null; 
  const isEditMode = !!post;
  const isFocused = useIsFocused();

  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });

    useEffect(() => { 
      if (isEditMode) {
        // Populate fields with existing post data
        console.log('post', post);
        setMedia(post.images || '');
        
      }
    }, [isFocused, ]);
  
  const {handleRegister, handleLogin, createPost} = useContext(AuthContext);
  const {media, selectMedia, requestCameraPermission, setMedia,isUploading} =
    useImagePicker();

  {isUploading && <ActivityIndicator size="large" color="#0000ff" />}

  const validateInputs = () => {
    if (media.length === 0) {
      setErrors(prevState => ({
        ...prevState,
        media: 'Please select at least one image.',
      }));
      return false;
    }
    return true;
  };

  const handlePress = async () => {
    setErrors({media: ''});
    if (!validateInputs()) return;
    console.log('media',    route.params.postData,);
    try {
      await createPost(
        route.params.postData.name,
        route.params.postData.selectedCategories,
        route.params.postData.description,
        route.params.postData.phone,
        route.params.postData.email,
        route.params.postData.location,
        media,
      );
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        styles.screen,
        {backgroundColor: isDark ? '#000' : '#FFFFFF'},
      ]}>
      <Header header={'Upload photos'} />

      <Text
        style={[
          styles.title,
          {color: isDark ? '#E0E0E0' : 'rgba(33, 33, 33, 1)'},
        ]}>
        Choose and Upload Your Picture
      </Text>

      {/* Image Selector */}
      <View>
        <View>
          {media.length > 0 && media[0] ? (
            <>
              <Image
                source={{uri: media[0]}}
                style={[styles.mediaSelector, {borderWidth: 0}]}
              />
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setMedia(media.slice(1))}>
                <Entypo name="cross" size={25} color={'black'} />
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity onPress={selectMedia}>
              <View
                style={[
                  styles.mediaSelector,
                  {
                    backgroundColor: isDark
                      ? '#1E1E1E'
                      : 'rgba(250, 250, 250, 1)',
                  },
                ]}>
                <MaterialIcons name="image" size={45} color="grey" />
                <Text
                  style={{
                    color: isDark ? '#BBB' : 'rgba(158, 158, 158, 1)',
                    fontWeight: 'bold',
                  }}>
                  Select Media
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>
      <HelperText type="error" visible={!!errors.media} style={{color: 'red'}}>
        {errors.media}
      </HelperText>

      {/* Camera Option */}
      <TouchableOpacity
        style={[
          styles.whiteBotton,
          {
            backgroundColor: isDark ? '#1E1E1E' : 'rgba(250, 250, 250, 1)',
            borderColor: isDark ? '#333' : '#A3A3A3',
          },
        ]}
        // onPress={() => navigation.navigate('BottomTabs')}
        onPress={() => requestCameraPermission()}>
        <Entypo name="camera" size={25} color="rgba(6, 196, 217, 1)" />
        <Text
          style={{
            color: 'rgba(6, 196, 217, 1)',
            fontSize: 18,
            fontWeight: '600',
            marginLeft: 10,
          }}>
          Open Camera & Take Photo
        </Text>
      </TouchableOpacity>

      {/* Uploaded Images */}
      {media.length > 0 && (
        <>
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
            Post images
          </Text>

          <View style={[styles.imageContainer, {flexWrap: 'wrap'}]}>
            {media.slice(1, 8).map((item, index) => (
              <View key={index} style={styles.mediaItem}>
                {/* {item.type.startsWith('image') ? ( */}
                <>
                  <Image source={{uri: item}} style={styles.mediaPreview} />
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => {
                      setMedia(media.filter((_, i) => i !== index));
                    }}>
                    <Entypo name="cross" size={18} color={'black'} />
                  </TouchableOpacity>
                </>
                {/* ) : null} */}
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
        </>
      )}

      {/* Post Button */}
     {!isEditMode&&( <TouchableOpacity
        style={[styles.blueButton, {margin: media.length > 0 ? '25%' : '60%'}]}
        onPress={() => handlePress()}>
        <Text style={[styles.buttonText, {color: '#fff'}]}>Post</Text>
      </TouchableOpacity>)}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
    height: 200,
    borderWidth: 3,
    backgroundColor: 'rgba(250, 250, 250, 1)',
    borderRadius: 30,
    borderColor: 'rgba(6, 196, 217, 1)',
    marginBottom: 10,
  },
  mediaItem: {
    width: '20%', // Slight margin for spacing
    margin: '2%',
    aspectRatio: 1, // Keeps items square
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
  screen: {
    width: Width,
    height: Height,
    alignItems: 'center',
  },
  whiteBotton: {
    backgroundColor: 'rgba(250, 250, 250, 1)',
    width: '90%',
    height: 56,
    borderRadius: 50,
    margin: 10,
    flexDirection: 'row',
    borderColor: '#A3A3A3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    width: Width,
    flexDirection: 'row',
    height: Height * 0.1,
    justifyContent: 'flex-start',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginLeft: '21%',
  },
  title: {
    fontSize: 22,
    fontWeight: '500',
    alignSelf: 'center',
    marginBottom: 20,
  },

  imageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 10,
  },
  blueButton: {
    backgroundColor: '#00AEEF',
    width: '90%',
    height: 56,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 22,
  },
});
