import {
  View,
  Text,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import React, {useContext, useEffect} from 'react';
import {HelperText} from 'react-native-paper';
import Entypo from 'react-native-vector-icons/Entypo';
import {Rating} from '@kolking/react-native-rating';

import {useState} from 'react';
import {AuthContext} from '../context/authcontext';

import {Dimensions} from 'react-native';
const Width = Dimensions.get('window').width;
const Height = Dimensions.get('window').height;
import {ThemeContext} from '../context/themeContext';
import Header from '../components/Header';
import useImagePicker from '../hooks/useImagePicker';
import {useIsFocused} from '@react-navigation/native';
import KeyboardAvoidingContainer from '../components/KeyboardAvoided';

export default function RatedScreen({navigation, route}) {
  const [isLoading, setIsLoading] = useState(false);
  // const [media, setMedia] = useState([]);
  const [description, setdescription] = useState(route?.params?.item?.feedback);
  const [rating, setrating] = useState(route?.params?.item?.rate);
  const postId = route?.params?.item?._id;
  const {theme} = useContext(ThemeContext);
  const isDark = theme === 'dark';

  const [errors, setErrors] = useState({
    rating: '',
    description: '',
    media: '',
  });
  const {handleRegister, handleLogin, PostRating} = useContext(AuthContext);

  const {media, selectMedia, isUploading, setMedia} =
  useImagePicker();
  {isUploading && <ActivityIndicator size="large" color="#0000ff" />}

  useEffect(() => {
    // console.log('route?.params?.item', route?.params?.item);
    // setMedia(route?.params?.item?.profile);
  }, [useIsFocused()]);

  const validateInputs = () => {
    let valid = true;
    let newErrors = {rating: '', description: '', media: ''};

    if (!rating) {
      newErrors.rating = 'Rating is required.';
      valid = false;
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required.';
      valid = false;
    } else if (description.length < 6) {
      newErrors.description = 'Description must be at least 6 characters long.';
      valid = false;
    }

    if (media.length === 0) {
      newErrors.media = 'Please select at least one image.';
      valid = false;
    }

    setErrors(newErrors); // Set all errors in one go

    return valid;
  };

  const handlePress = async () => {
    setErrors({rating: '', description: '', media: ''});
    // console.log('rating, media, description', rating, media, description);
    if (!validateInputs()) return;

    try {
      setIsLoading(true);
      await PostRating(postId, rating, media, description);
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingContainer>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.screen,
          {backgroundColor: isDark ? '#000' : '#fff'},
        ]}>
        <Header header={'Rated review'} />

        <View
          style={[
            styles.rectangle2,
            {
              overflow: 'hidden',
              flexDirection: 'row',
              height: 100,
              backgroundColor: isDark ? '#000' : 'rgb(255, 255, 255)',
            },
          ]}>
          <Image
            // source={require('../assets/shop-pic.png')}
            source={
              route?.params?.item?.profile?.[0]
                ? {uri: route.params.item.profile[0]}
                : require('../assets/shop-pic.png')
            }
            style={{
              width: '30%',
              height: '80%',
              alignSelf: 'flex-start',
              overflow: 'hidden',
              borderRadius: 10,
              margin: 8,
            }}
          />

          <View style={{alignSelf: 'flex-start'}}>
            <Text
              numberOfLines={3}
              style={[
                styles.recListText,
                {
                  fontWeight: '400',
                  fontSize: 20,
                  margin: 5,
                  color: isDark ? 'rgba(255, 255, 255, 1)' : '#000',
                  marginTop: 10,
                  marginLeft: 0,
                  width: Width * 0.57,
                },
              ]}>
              {route?.params?.item?.name}
            </Text>
          </View>
        </View>

        <Text
          style={[
            styles.recListText,
            {
              fontWeight: 'bold',
              fontSize: 18,
              alignSelf: 'flex-start',
              color: isDark ? 'rgba(255, 255, 255, 1)' : '#000',
              marginLeft: 30,
              marginTop: 10,
              marginBottom: 10,
            },
          ]}>
          You have Rated
        </Text>

        <View
          style={{
            flexDirection: 'row',
            alignSelf: 'flex-start',
            marginLeft: 30,
            marginBottom: 10,
          }}>
          <Rating
            size={32}
            rating={rating}
            onChange={value => {
              // console.log('User rating:', value);
              setrating(value); // Update state
            }}
            starColor="#FFD700"
            baseColor={isDark ? '#48484A' : '#D1D1D6'}
          />
        </View>
        <HelperText type="error" visible={errors.rating !== ''}>
          {errors.rating}
        </HelperText>

        <Text
          style={[
            styles.recListText,
            {
              fontWeight: 'bold',
              fontSize: 18,
              alignSelf: 'flex-start',
              marginLeft: 30,
              color: isDark ? 'rgba(255, 255, 255, 1)' : '#000',
              marginTop: 10,
              marginBottom: 10,
            },
          ]}>
          Post your review
        </Text>

        <View
          style={[
            styles.inputContainer,
            {
              height: 130,
              alignItems: 'flex-start',
              backgroundColor: isDark ? '#121212' : 'rgb(255, 255, 255)',
            },
          ]}>
          <TextInput
            value={description}
            style={[
              styles.textInput,
              {
                height: 93,
                backgroundColor: isDark ? '#121212' : '#fff',
                color: isDark ? '#fff' : '#000',
              },
            ]}
            onChangeText={setdescription}
            numberOfLines={5}
            multiline={true}
            placeholder="Have any feedback you’d like to give about this product"
            mode="outlined"
            placeholderTextColor={'rgba(158, 158, 158, 1)'}
            autoCapitalize="none"
          />
        </View>
        <HelperText type="error" visible={errors.description !== ''}>
          {errors.description}
        </HelperText>

        <Text
          style={[
            styles.recListText,
            {
              fontWeight: 'bold',
              fontSize: 18,
              alignSelf: 'flex-start',
              marginLeft: 30,
              color: isDark ? 'rgba(255, 255, 255, 1)' : '#000',
              marginBottom: 10,
            },
          ]}>
          Add photo & Video
        </Text>

        <View>
          <View style={{
            
                  marginBottom: route.params.item.feedback ? '30%' : 0,


          }}>
            {media.length > 0 && media[0] ? (
              <>
                <Image
                  source={{uri: media[0]}}
                  style={[
                    styles.mediaSelector,
                    {borderWidth: 0, backgroundColor: 'rgba(248, 247, 247, 1)'},
                  ]}
                />
                <TouchableOpacity
                  style={[
                    styles.closeButton,
                    {
                      backgroundColor: isDark
                        ? 'rgb(0, 0, 0)'
                        : 'rgb(255, 255, 255)',
                    },
                  ]}
                  onPress={() => {
                    setMedia(media.slice(1));
                  }}>
                  <Entypo
                    name="cross"
                    size={25}
                    color={isDark ? 'white' : 'black'}
                  />
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity onPress={selectMedia}>
                <View
                  style={[
                    styles.mediaSelector,
                    {
                      backgroundColor: isDark
                        ? '#121212'
                        : 'rgba(248, 247, 247, 1)',
                    },
                  ]}>
                  <Entypo name="upload-to-cloud" size={45} color="grey" />
                  <Text
                    style={{
                      color: 'rgba(158, 158, 158, 1)',
                      fontWeight: 'bold',
                    }}>
                    Upload Media
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <HelperText type="error" visible={errors.media !== ''}>
          {errors.media}
        </HelperText>
        {media.length > 0 && (
          <>
            <Text
              style={[
                {
                  color: isDark ? 'rgba(255, 255, 255, 1)' : 'rgb(0, 0, 0)',
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

            <View
              style={[
                styles.imageContainer,
                {
                  flexWrap: 'wrap',
                  backgroundColor: isDark ? '#000' : 'rgb(255, 255, 255)',
                },
              ]}>
              {media.slice(1, 8).map((item, index) => (
                <View key={index} style={styles.mediaItem}>
                  {/* {item.type.startsWith('image') ? ( */}
                  <>
                    <Image source={{uri: item}} style={styles.mediaPreview} />
                    <TouchableOpacity
                      style={[
                        styles.closeButton,
                        {
                          backgroundColor: isDark
                            ? '#000'
                            : 'rgba(248, 247, 247, 1)',
                        },
                      ]}
                      onPress={() => {
                        // Remove the image from media array
                        setMedia(media.filter((mediaItem, i) => i !== index));
                      }}>
                      <Entypo
                        name="cross"
                        size={18}
                        color={isDark ? 'white' : 'black'}
                      />
                    </TouchableOpacity>
                  </>
                  {/* ) : item.type.startsWith('video') ? null : (
                  <Text>{item.fileName}</Text>
                )} */}
                </View>
              ))}

              {/* Add Selector Button */}
              {media.length < 8 && (
                <TouchableOpacity
                  onPress={selectMedia}
                  style={[
                    styles.mediaItem,
                    {
                      backgroundColor: isDark ? '#000' : 'rgb(255, 255, 255)',
                      borderWidth: 1,
                      borderRadius: 10,
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

       {!route.params.item.feedback ?( <TouchableOpacity
          style={[styles.blueBotton, {margin: '15%', marginBottom: '20%'}]}
          // onPress={() => navigation.navigate('shopdetails')}
          onPress={() => handlePress()}>
          <Text
            style={[
              styles.smallText,
              {
                color: '#fff',
                fontSize: 22,
                marginBottom: 0,
              },
            ]}>
            Submit review
          </Text>
        </TouchableOpacity>):null}
      </ScrollView>
    </KeyboardAvoidingContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    width: '100%',
  },
  addSelector: {
    width: '20%',
  },
  imageWrapper: {
    position: 'relative',
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
    width: Width * 0.9,
    height: 150,
    borderWidth: 1,
    backgroundColor: 'rgb(255, 255, 255)',
    borderRadius: 10,
    borderStyle: 'dashed',
    borderColor: 'rgba(130, 130, 130, 0.44)',
    marginBottom: 10,
  },
  imageContainer: {
    flexDirection: 'row',
    marginLeft: '6%',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 10,
  },
  mediaItem: {
    width: '20%', // Slight margin for spacing
    margin: '2%',
    aspectRatio: 1, // Keeps items square
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaPreview: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    resizeMode: 'cover',
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
    margin: '30%',
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
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
});
