import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  Pressable,
  Modal,
  Linking,
} from 'react-native';
import Octicons from 'react-native-vector-icons/Octicons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import { ThemeContext } from '../context/themeContext';
import { Dimensions } from 'react-native';
const Width = Dimensions.get('window').width;
const Height = Dimensions.get('window').height;
import { ScrollView } from 'react-native-gesture-handler';
import { Slider } from '@miblanchard/react-native-slider';
import RatingButtons from '../components/RatingButtons';
import { useIsFocused } from '@react-navigation/native';
import { AuthContext } from '../context/authcontext';
import RatingTest from '../components/RatingTest';
import KeyboardAvoidingContainer from '../components/KeyboardAvoided';

export default function ShopScreen({ navigation, route }) {
  const { theme } = useContext(ThemeContext);
  const { getFilteredPosts, filteredPosts } = useContext(AuthContext);
  const isFocused = useIsFocused();

  const isDark = theme === 'dark';
  const [modalVisible, setModalVisible] = useState(false);
  const [value, setValue] = useState([0, 2]);
  const [selectedRating, setSelectedRating] = useState(null);
  const [filteredLists, setFilteredLists] = useState([]);
  const [searchText, setSearchText] = useState('');

  // Consolidated useEffect for fetching and filtering posts
  useEffect(() => {
    if (!isFocused) return;

    const selectedCategory = route?.params?.selectedcategory;

    // Fetch filtered posts
    getFilteredPosts(selectedCategory, selectedRating);

    // Filter posts based on selectedCategory
    if (Array.isArray(filteredPosts)) {
      const filteredList = filteredPosts.filter(item =>
        item.selectedCategories?.includes(selectedCategory)
      );
      setFilteredLists(filteredList);
      console.log('Filtered Posts:', filteredList, 'Selected Category:', selectedCategory);
    } else {
      console.error('filteredPosts is not an array:', filteredPosts);
    }
  }, [isFocused, filteredPosts, route?.params?.selectedcategory, selectedRating, getFilteredPosts]);

  // Search filter function
  const searchFilterFunction = text => {
    setSearchText(text);

    if (text.trim() === '') {
      // Reset to filtered list based on category
      if (Array.isArray(filteredPosts)) {
        const filteredList = filteredPosts.filter(item =>
          item.selectedCategories?.includes(route?.params?.selectedcategory)
        );
        setFilteredLists(filteredList);
      }
      return;
    }

    const lowerCaseText = text.toLowerCase();

    if (!Array.isArray(filteredPosts)) {
      console.error('filteredPosts is not an array:', filteredPosts);
      return;
    }

    const filteredResults = filteredPosts.filter(
      item =>
        item.selectedCategories?.includes(route?.params?.selectedcategory) &&
        item?.name?.toLowerCase().includes(lowerCaseText)
    );

    setFilteredLists(filteredResults);
  };

  const [recentPostList] = useState([
    { id: 1, title: 'Samsung phone', img: require('../assets/sam-phone.png') },
    { id: 2, title: 'smart watch', img: require('../assets/watch.png') },
    { id: 3, title: 'Medicine', img: require('../assets/packagedfood.png') },
    { id: 4, title: 'packaged food', img: require('../assets/clothes.png') },
    { id: 5, title: 'Groceries', img: require('../assets/groceries.png') },
    { id: 6, title: 'Furniture', img: require('../assets/furniture.png') },
    { id: 8, title: 'Food', img: require('../assets/food.png') },
    { id: 7, title: 'Shoes', img: require('../assets/shoes.png') },
    { id: 9, title: 'Home service', img: require('../assets/home-service.png') },
    { id: 10, title: 'Hospital', img: require('../assets/hospital.png') },
    { id: 11, title: 'Jwellery', img: require('../assets/jwelery.png') },
    { id: 12, title: 'See more', img: require('../assets/see-more.png') },
  ]);

  const formatDate = timestamp => {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  const render2RectangleList = ({ item, index }) => {
    return (
      <Pressable
        style={{
          justifyContent: 'center',
          marginBottom: 15,
          alignItems: 'center',
        }}
        onPress={() => navigation.navigate('shopdetails', { item })}
      >
        <View
          style={[
            styles.rectangle2,
            {
              backgroundColor: isDark ? 'rgba(39, 39, 39, 1)' : '#fff',
              overflow: 'hidden',
              flexDirection: 'row',
            },
          ]}
        >
          <Image
            source={{ uri: item.profile?.[0] }}
            style={{
              width: '30%',
              height: '90%',
              alignSelf: 'center',
              overflow: 'hidden',
              borderRadius: 10,
              margin: 8,
            }}
          />
          <View style={{ alignSelf: 'flex-start' }}>
            <Text
              numberOfLines={2}
              style={[
                styles.recListText,
                {
                  fontWeight: 'bold',
                  color: isDark ? '#fff' : '#000',
                  fontSize: 14,
                  margin: 5,
                  marginTop: 10,
                  marginLeft: 0,
                  width: Width * 0.56,
                },
              ]}
            >
              {item?.shopName || item?.name}
            </Text>
            <View style={{ flexDirection: 'row', marginTop: 2 }}>
              <Text
                numberOfLines={1}
                style={[
                  styles.recListText,
                  {
                    fontWeight: 'bold',
                    marginTop: 0,
                    paddingRight: 5,
                    fontSize: 13,
                    color: isDark ? '#fff' : '#000',
                  },
                ]}
              >
                {item.averageRating}
              </Text>
              <RatingTest fixedRating={item.averageRating} />
            </View>
            <View
              style={{
                flexDirection: 'row',
                marginBottom: 5,
                alignItems: 'center',
                marginTop: 4,
              }}
            >
              <Text
                numberOfLines={2}
                style={[
                  styles.recListText,
                  {
                    marginTop: 0,
                    color: isDark ? '#fff' : 'rgba(29, 30, 32, 1)',
                    fontWeight: 'bold',
                    fontSize: 10,
                  },
                ]}
              >
                Open :
              </Text>
              <Text
                numberOfLines={1}
                style={[
                  styles.recListText,
                  {
                    marginTop: 0,
                    color: isDark ? '#fff' : 'rgba(29, 30, 32, 1)',
                    fontWeight: '500',
                    fontSize: 10,
                    width: 95,
                    left: 5,
                  },
                ]}
              >
                {item.openTime}-{item.closeTime}
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                marginBottom: 5,
                alignItems: 'center',
                marginTop: 2,
              }}
            >
              <Image
                source={
                  isDark
                    ? require('../assets/locatin-dark.png')
                    : require('../assets/location.png')
                }
                style={{
                  width: 12,
                  height: 15,
                  marginLeft: 2,
                }}
              />
              <Text
                numberOfLines={2}
                style={[
                  styles.recListText,
                  {
                    marginTop: 0,
                    color: isDark ? '#fff' : 'rgba(29, 30, 32, 1)',
                    fontWeight: '500',
                    fontSize: 10,
                    width: Width * 0.5,
                    left: 5,
                  },
                ]}
              >
                {item.businessAddress}
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                marginBottom: 5,
                alignItems: 'center',
                alignSelf: 'flex-end',
                marginRight: 8,
                marginTop: 5,
              }}
            >
              <Pressable
                style={{
                  marginRight: 5,
                  borderRadius: 5,
                  borderWidth: 1,
                  padding: 2,
                  width: 30,
                  borderColor: 'rgb(155, 155, 155)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={() => Linking.openURL(`tel:${item.phone}`)}
              >
                <Ionicons name={'call'} size={16} color="rgba(7, 201, 29, 1)" />
              </Pressable>
              <Pressable
                style={{
                  borderRadius: 5,
                  borderWidth: 1,
                  padding: 2,
                  width: 30,
                  borderColor: 'rgb(155, 155, 155)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={() => navigation.navigate('messages', { item: null })}
              >
                <Ionicons
                  name={'chatbubble-ellipses-outline'}
                  size={16}
                  color="rgba(15, 92, 246, 1)"
                />
              </Pressable>
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  const DEFAULT_VALUE = 0;

  const SliderContainer = props => {
    const { sliderValue, trackMarks } = props;
    const [value, setValue] = React.useState(sliderValue || DEFAULT_VALUE);
    let renderTrackMarkComponent;

    if (trackMarks?.length && (!Array.isArray(value) || value?.length === 1)) {
      renderTrackMarkComponent = index => {
        const currentMarkValue = trackMarks[index];
        const currentSliderValue = value || (Array.isArray(value) && value[0]) || 0;
        const style = currentMarkValue > Math.max(currentSliderValue);
        return <View style={style} />;
      };
    }

    const renderChildren = () => {
      const childrenArray = React.Children.toArray(props.children);
      return React.Children.map(childrenArray, (child, index) => {
        if (child && child.type === Slider) {
          return React.cloneElement(child, {
            onValueChange: setValue,
            renderTrackMarkComponent,
            trackMarks,
            value,
          });
        }
        return child;
      });
    };

    return (
      <View style={styles.sliderContainer}>
        <View style={{ marginTop: 20 }}>
          <Text style={{ color: isDark ? '#fff' : '#000', fontWeight: 'bold' }}>
            {Array.isArray(value) ? value.join(' km - ') : value} km
          </Text>
        </View>
        {renderChildren()}
      </View>
    );
  };

  return (
    <KeyboardAvoidingContainer>
      <View style={[styles.screen, { backgroundColor: isDark ? '#000' : '#fff' }]}>
        <View
          style={{
            alignItems: 'center',
            width: Width,
            flexDirection: 'row',
            height: Height * 0.1,
            justifyContent: 'flex-start',
          }}
        >
          <Entypo
            onPress={() => navigation.goBack()}
            name="chevron-thin-left"
            size={20}
            color={isDark ? 'rgba(255, 255, 255, 1)' : 'rgba(94, 95, 96, 1)'}
            style={{ marginLeft: 20, padding: 5 }}
          />
          <Text
            style={[
              styles.bigText,
              {
                fontSize: 20,
                color: isDark ? 'rgba(255, 255, 255, 1)' : 'rgba(0, 0, 0, 1)',
                fontWeight: 'bold',
                alignSelf: 'center',
                width: Width * 0.72,
                textAlign: 'center',
              },
            ]}
          >
            Shop
          </Text>
        </View>
        <View
          style={{
            width: Width,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 15,
            }}
          >
            <View
              style={[
                styles.inputContainer,
                { backgroundColor: isDark ? 'rgb(0, 0, 0)' : '#fff' },
              ]}
            >
              <Image
                source={require('../assets/search-icon.png')}
                style={{
                  width: 20,
                  height: 20,
                  alignSelf: 'center',
                  left: 10,
                }}
                resizeMode="contain"
              />
              <TextInput
                style={[
                  styles.searchInput,
                  {
                    color: isDark ? 'rgba(255, 255, 255, 1)' : 'rgba(94, 95, 96, 1)',
                  },
                ]}
                placeholderTextColor={isDark ? 'rgba(255, 255, 255, 1)' : 'rgba(94, 95, 96, 1)'}
                placeholder="Search here"
                onChangeText={searchFilterFunction}
                autoCorrect={false}
                value={searchText}
                autoCapitalize="none"
              />
            </View>
            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              style={{
                backgroundColor: isDark ? 'rgb(0, 0, 0)' : 'white',
                height: 50,
                width: '13%',
                alignSelf: 'center',
                borderRadius: 10,
                borderColor: isDark ? 'rgba(255, 255, 255, 0.31)' : 'rgb(0, 0, 0)',
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 1,
                marginLeft: 10,
              }}
            >
              <Image
                source={require('../assets/category-icon.png')}
                style={{
                  width: 24,
                  height: 24,
                  alignSelf: 'center',
                }}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ height: Height * 0.8, flexGrow: 1, width: Width }}
          >
            {filteredLists.map((item, index) => (
              <View key={item.id ?? `post-${index}`}>
                {render2RectangleList({ item, index })}
              </View>
            ))}
          </ScrollView>
        </View>
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <Pressable
            style={[styles.modalContainer]}
            onPress={() => setModalVisible(false)}
          >
            <View
              style={[
                styles.modalContent,
                {
                  backgroundColor: isDark ? 'rgb(0, 0, 0)' : 'rgb(255, 255, 255)',
                },
              ]}
            >
              <Pressable
                style={{
                  height: 5,
                  backgroundColor: 'lightgrey',
                  width: 60,
                  position: 'absolute',
                  alignSelf: 'center',
                  borderRadius: 10,
                  top: 10,
                }}
                onPress={() => setModalVisible(false)}
              />
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: '5%',
                  alignSelf: 'flex-start',
                }}
              >
                <Text
                  style={[
                    styles.bigText,
                    {
                      fontSize: 17,
                      fontWeight: 'bold',
                      width: Width * 0.76,
                      color: isDark ? 'rgba(255, 255, 255, 1)' : 'rgba(0, 0, 0, 1)',
                    },
                  ]}
                >
                  Quick sort
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setValue([0, 2]);
                    setSelectedRating(null);
                    setModalVisible(false);
                    getFilteredPosts(route?.params?.selectedcategory, null);
                  }}
                >
                  <Text
                    style={[
                      styles.bigText,
                      {
                        color: isDark ? 'rgba(255, 255, 255, 1)' : 'rgba(0, 0, 0, 1)',
                        fontSize: 17,
                        fontWeight: 'bold',
                      },
                    ]}
                  >
                    Reset
                  </Text>
                </TouchableOpacity>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: '5%',
                  alignSelf: 'flex-start',
                }}
              >
                <TouchableOpacity
                  style={{
                    borderRadius: 15,
                    borderWidth: 1,
                    padding: 10,
                    flexDirection: 'row',
                    borderColor: 'rgba(228, 228, 228, 1)',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    marginRight: '10%',
                  }}
                  onPress={() => {
                    setSelectedRating('top_rated');
                    setModalVisible(false);
                    getFilteredPosts(route?.params?.selectedcategory, 'top_rated');
                  }}
                >
                  <Octicons
                    name={'star-fill'}
                    size={22}
                    color={isDark ? 'rgba(255, 255, 255, 1)' : 'rgba(94, 95, 96, 1)'}
                  />
                  <Text
                    style={[
                      styles.bigText,
                      {
                        fontSize: 16,
                        fontWeight: 'bold',
                        marginLeft: 6,
                        color: isDark ? 'rgba(255, 255, 255, 1)' : 'rgb(0, 0, 0)',
                      },
                    ]}
                  >
                    Top Rated
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    borderRadius: 15,
                    borderWidth: 1,
                    padding: 10,
                    flexDirection: 'row',
                    borderColor: 'rgba(228, 228, 228, 1)',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                  }}
                  onPress={() => {
                    setSelectedRating('quick_response');
                    setModalVisible(false);
                    getFilteredPosts(route?.params?.selectedcategory, 'quick_response');
                  }}
                >
                  <Octicons
                    name={'star-fill'}
                    size={22}
                    color={isDark ? 'rgba(255, 255, 255, 1)' : 'rgba(94, 95, 96, 1)'}
                  />
                  <Text
                    style={[
                      styles.bigText,
                      {
                        fontSize: 16,
                        fontWeight: 'bold',
                        marginLeft: 6,
                        color: isDark ? 'rgba(255, 255, 255, 1)' : 'rgb(0, 0, 0)',
                      },
                    ]}
                  >
                    Quick Response
                  </Text>
                </TouchableOpacity>
              </View>
              <View
                style={{
                  height: 1,
                  backgroundColor: 'lightgrey',
                  width: Width * 0.9,
                  alignSelf: 'center',
                  borderRadius: 10,
                  margin: 18,
                  marginTop: 18,
                }}
              />
              <Text
                style={[
                  styles.bigText,
                  {
                    fontSize: 17,
                    fontWeight: 'bold',
                    alignSelf: 'flex-start',
                    color: isDark ? 'rgba(255, 255, 255, 1)' : 'rgb(0, 0, 0)',
                  },
                ]}
              >
                Rating
              </Text>
              <RatingButtons
                onSelectRating={rating => {
                  setSelectedRating(rating);
                  getFilteredPosts(route?.params?.selectedcategory, rating);
                }}
              />
              <View
                style={{
                  height: 1,
                  backgroundColor: 'lightgrey',
                  width: Width * 0.9,
                  alignSelf: 'center',
                  borderRadius: 10,
                  margin: 15,
                }}
              />
              <Text
                style={[
                  styles.bigText,
                  {
                    fontSize: 17,
                    fontWeight: 'bold',
                    alignSelf: 'flex-start',
                    color: isDark ? 'rgba(255, 255, 255, 1)' : 'rgb(0, 0, 0)',
                  },
                ]}
              >
                Distance to me
              </Text>
              <SliderContainer sliderValue={value}>
                <Slider
                  animateTransitions
                  trackStyle={{
                    width: Width * 0.9,
                    backgroundColor: 'rgba(228, 228, 228, 1)',
                  }}
                  thumbStyle={{
                    backgroundColor: 'white',
                    borderWidth: 5,
                    borderColor: '#00AEEF',
                  }}
                  minimumTrackStyle={{ backgroundColor: '#00AEEF' }}
                  minimumValue={0}
                  maximumValue={5}
                  step={1}
                  thumbTintColor="#00AEEF"
                  onValueChange={setValue}
                />
              </SliderContainer>
              <TouchableOpacity
                style={styles.blueBotton}
                onPress={() => {
                  setModalVisible(false);
                  getFilteredPosts(route?.params?.selectedcategory, selectedRating, value);
                }}
              >
                <Text
                  style={[
                    styles.smallText,
                    { color: '#fff', fontSize: 22, marginBottom: 0 },
                  ]}
                >
                  Apply
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Modal>
      </View>
    </KeyboardAvoidingContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    width: Width,
    height: Height,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  thumb: {
    backgroundColor: '#31a4db',
    borderRadius: 10 / 2,
    height: 10,
    shadowColor: '#31a4db',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 1,
    shadowRadius: 2,
    width: 10,
  },
  track: {
    backgroundColor: '#303030',
    height: 2,
  },
  blueBotton: {
    backgroundColor: '#00AEEF',
    width: '100%',
    height: 56,
    borderRadius: 10,
    margin: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContainer: {
    width: Width,
    height: Height,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  modalContent: {
    borderRadius: 60,
    padding: 20,
    width: Width,
    height: Height * 0.65,
    borderBottomEndRadius: 0,
    borderBottomLeftRadius: 0,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  rectangle2: {
    backgroundColor: 'rgb(255, 255, 255)',
    width: Width * 0.9,
    height: 150,
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderRadius: 10,
    elevation: 5,
  },
  inputContainer: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    width: Width * 0.74,
    borderColor: 'rgba(94, 95, 96, 1)',
    borderWidth: 1,
    borderRadius: 14,
    height: 50,
    padding: 1,
  },
  searchInput: {
    width: '68%',
    alignSelf: 'center',
    fontSize: 17,
    fontWeight: '500',
    height: 45,
    left: 16,
  },
  bigText: {
    fontSize: 16,
    fontWeight: '500',
  },
  smallText: {
    fontSize: 14,
    fontWeight: '400',
  },
  recListText: {
    fontSize: 12,
    fontWeight: '400',
  },
  sliderContainer: {
    width: Width * 0.9,
    alignItems: 'center',
  },
});