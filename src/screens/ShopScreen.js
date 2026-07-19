import {Slider} from '@miblanchard/react-native-slider';
import {useIsFocused} from '@react-navigation/native';
import React, {useContext, useEffect, useMemo, useState} from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Linking,
  Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Entypo from 'react-native-vector-icons/Entypo';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Octicons from 'react-native-vector-icons/Octicons';
import KeyboardAvoidingContainer from '../components/KeyboardAvoided';
import RatingButtons from '../components/RatingButtons';
import RatingTest from '../components/RatingTest';
import {AuthContext} from '../context/authcontext';
import {ThemeContext} from '../context/themeContext';
const Width = Dimensions.get('window').width;
const Height = Dimensions.get('window').height;

export default function ShopScreen({navigation, route}) {
  const {theme} = useContext(ThemeContext);
  const {
    getFilteredShops,
    filteredShops,
    applyShopFilters,
    location,
    calculateDistance,
  } = useContext(AuthContext);
  const isFocused = useIsFocused();

  const isDark = theme === 'dark';
  const [modalVisible, setModalVisible] = useState(false);
  const [distance, setDistance] = useState(25);
  const [selectedRating, setSelectedRating] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [allShops, setAllShops] = useState([]);
  // const [visibleShops, setVisibleShops] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);

  // Fetch shops when screen focuses or category changes
  useEffect(() => {
    if (!isFocused) return;
    getFilteredShops(route?.params?.selectedcategory);
  }, [isFocused, route?.params?.selectedcategory]);

  // Seed local allShops from context ONLY — no writing back to context here
  useEffect(() => {
    if (!Array.isArray(filteredShops)) return;
    setAllShops(filteredShops);
  }, [filteredShops]);

  const shopsWithDistance = useMemo(() => {
    return allShops.map(shop => {
      const lat = shop.latitude ?? shop.location?.latitude;
      const lng = shop.longitude ?? shop.location?.longitude;

      const distance =
        location && lat && lng
          ? calculateDistance(
              Number(location.latitude),
              Number(location.longitude),
              Number(lat),
              Number(lng),
            )
          : null;

      return {...shop, distance};
    });
  }, [allShops, location, calculateDistance]);

  const availableLocations = useMemo(() => {
    const locations = shopsWithDistance
      .map(shop => {
        if (shop.location?.city) return shop.location.city;
        if (shop.businessAddress) {
          const parts = shop.businessAddress.split(',').map(p => p.trim());
          return parts[0] || null;
        }
        return null;
      })
      .filter(Boolean);

    return [...new Set(locations)];
  }, [shopsWithDistance]);

  const toggleLocation = loc => {
    setSelectedLocations(prev =>
      prev.includes(loc) ? prev.filter(l => l !== loc) : [...prev, loc],
    );
  };

  const visibleShops = useMemo(() => {
    if (!Array.isArray(shopsWithDistance)) return [];

    const filtered = applyShopFilters(
      shopsWithDistance,
      route?.params?.selectedcategory,
      selectedRating,
      distance,
      distance !== null ? 'distance' : 'rating',
      selectedLocations,
    );

    if (!searchText.trim()) return filtered;

    const keyword = searchText.toLowerCase();
    return filtered.filter(item => {
      const searchable = [
        item.shopName,
        item.ownerName,
        item.name,
        item.businessAddress,
        item.contactNumber,
        item.contactEmail,
        item.location?.city,
        item.location?.state,
        item.location?.pincode,
        ...(item.selectedCategories || []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchable.includes(keyword);
    });
  }, [
    shopsWithDistance,
    route?.params?.selectedcategory,
    selectedRating,
    distance,
    selectedLocations,
    searchText,
    applyShopFilters,
  ]);

  const searchFilterFunction = text => {
    setSearchText(text);
  };

  const render2RectangleList = ({item, index}) => {
    return (
      <Pressable
        style={{
          justifyContent: 'center',
          marginBottom: 15,
          alignItems: 'center',
        }}
        onPress={() => navigation.navigate('shopdetails', {item})}>
        <View
          style={[
            styles.rectangle2,
            {
              backgroundColor: isDark ? 'rgba(39, 39, 39, 1)' : '#fff',
              overflow: 'hidden',
              flexDirection: 'row',
            },
          ]}>
          <Image
            source={
              item.profile?.[0]
                ? {uri: item.profile[0]}
                : require('../assets/shop-pic.png')
            }
            style={{
              width: '30%',
              height: '90%',
              alignSelf: 'center',
              overflow: 'hidden',
              borderRadius: 10,
              margin: 8,
            }}
          />
          <View style={{alignSelf: 'flex-start'}}>
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
              ]}>
              {item?.shopName || item?.name}
            </Text>
            <View style={{flexDirection: 'row', marginTop: 2}}>
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
                ]}>
                {Number(item.averageRating || 0).toFixed(1)}
              </Text>
              <RatingTest fixedRating={Number(item.averageRating || 0)} />
            </View>
            <View
              style={{
                flexDirection: 'row',
                marginBottom: 5,
                alignItems: 'center',
                marginTop: 4,
              }}>
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
                ]}>
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
                ]}>
                {item.openTime}-{item.closeTime}
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                marginBottom: 5,
                alignItems: 'center',
                marginTop: 2,
              }}>
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
                ]}>
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
              }}>
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
                onPress={() =>
                  Linking.openURL(`tel:${item.contactNumber || item.phone}`)
                }>
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
                onPress={() => navigation.navigate('messages', {item: item})}>
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

  const onRefresh = async () => {
    setRefreshing(true);

    await getFilteredShops(
      route?.params?.selectedcategory,
      selectedRating,
      distance,
    );

    setRefreshing(false);
  };

  return (
    <KeyboardAvoidingContainer>
      <View
        style={[styles.screen, {backgroundColor: isDark ? '#000' : '#fff'}]}>
        <View
          style={{
            alignItems: 'center',
            width: Width,
            flexDirection: 'row',
            height: Height * 0.1,
            justifyContent: 'flex-start',
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
              styles.bigText,
              {
                fontSize: 20,
                color: isDark ? 'rgba(255, 255, 255, 1)' : 'rgba(0, 0, 0, 1)',
                fontWeight: 'bold',
                alignSelf: 'center',
                width: Width * 0.72,
                textAlign: 'center',
              },
            ]}>
            Shop
          </Text>
        </View>
        <View
          style={{
            width: Width,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 15,
            }}>
            <View
              style={[
                styles.inputContainer,
                {backgroundColor: isDark ? 'rgb(0, 0, 0)' : '#fff'},
              ]}>
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
                    color: isDark
                      ? 'rgba(255, 255, 255, 1)'
                      : 'rgba(94, 95, 96, 1)',
                  },
                ]}
                placeholderTextColor={
                  isDark ? 'rgba(255, 255, 255, 1)' : 'rgba(94, 95, 96, 1)'
                }
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
                borderColor: isDark
                  ? 'rgba(255, 255, 255, 0.31)'
                  : 'rgb(0, 0, 0)',
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 1,
                marginLeft: 10,
              }}>
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
          <FlatList
            data={visibleShops}
            keyExtractor={(item, index) =>
              item._id || item.id?.toString() || index.toString()
            }
            renderItem={({item, index}) => render2RectangleList({item, index})}
            contentContainerStyle={{
              paddingBottom: 30,
              paddingHorizontal: 10,
            }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListEmptyComponent={() => (
              <View
                style={{
                  marginTop: 100,
                  alignItems: 'center',
                }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: isDark ? '#fff' : '#666',
                  }}>
                  No shops found
                </Text>
              </View>
            )}
          />
        </View>

        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}>
          <Pressable
            style={styles.modalContainer}
            onPress={() => setModalVisible(false)}>
            <Pressable
              style={[
                styles.modalContent,
                {backgroundColor: isDark ? '#0d0d0d' : '#fff'},
              ]}
              onPress={e => e.stopPropagation()}>
              <View style={styles.modalHandle} />

              {/* Header */}
              <View style={styles.modalHeader}>
                <Text
                  style={[
                    styles.modalTitle,
                    {color: isDark ? '#fff' : '#111'},
                  ]}>
                  Filters
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setDistance(25);
                    setSelectedRating(null);
                    setSelectedLocations([]);
                    getFilteredShops(route?.params?.selectedcategory, null, 25);
                    setSearchText('');
                    setModalVisible(false);
                  }}>
                  <Text style={styles.resetText}>Reset</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.modalScroll}>
                {/* Quick sort */}
                <Text
                  style={[
                    styles.sectionLabel,
                    {color: isDark ? '#8a8a8a' : '#8a8a8a'},
                  ]}>
                  QUICK SORT
                </Text>
                <View style={styles.chipRow}>
                  <TouchableOpacity
                    style={[
                      styles.chip,
                      selectedRating === 4.5 && styles.chipActive,
                      {borderColor: isDark ? '#333' : '#e5e5e5'},
                    ]}
                    onPress={() => {
                      setSelectedRating(4.5);
                      setModalVisible(false);
                      getFilteredShops(
                        route?.params?.selectedcategory,
                        4.5,
                        distance,
                      );
                    }}>
                    <Octicons
                      name="star-fill"
                      size={14}
                      color={
                        selectedRating === 4.5
                          ? '#00AEEF'
                          : isDark
                          ? '#ccc'
                          : '#555'
                      }
                    />
                    <Text
                      style={[
                        styles.chipText,
                        {color: isDark ? '#fff' : '#222'},
                        selectedRating === 4.5 && styles.chipTextActive,
                      ]}>
                      Top Rated
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.chip,
                      selectedRating === 4 && styles.chipActive,
                      {borderColor: isDark ? '#333' : '#e5e5e5'},
                    ]}
                    onPress={() => {
                      setSelectedRating(4);
                      getFilteredShops(
                        route?.params?.selectedcategory,
                        4,
                        distance,
                      );
                    }}>
                    <Octicons
                      name="star-fill"
                      size={14}
                      color={
                        selectedRating === 4
                          ? '#00AEEF'
                          : isDark
                          ? '#ccc'
                          : '#555'
                      }
                    />
                    <Text
                      style={[
                        styles.chipText,
                        {color: isDark ? '#fff' : '#222'},
                        selectedRating === 4 && styles.chipTextActive,
                      ]}>
                      Quick Response
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Rating */}
                <Text
                  style={[
                    styles.sectionLabel,
                    {color: '#8a8a8a', marginTop: 24},
                  ]}>
                  RATING
                </Text>
                <RatingButtons
                  selectedRating={selectedRating}
                  onSelectRating={rating => {
                    setSelectedRating(rating);
                  }}
                />

                {/* Distance */}
                <View style={styles.sectionRowBetween}>
                  <Text
                    style={[
                      styles.sectionLabel,
                      {color: '#8a8a8a', marginTop: 24},
                    ]}>
                    DISTANCE
                  </Text>
                  <Text
                    style={[
                      styles.distanceValue,
                      {color: isDark ? '#fff' : '#111', marginTop: 24},
                    ]}>
                    {distance} km
                  </Text>
                </View>
                <Slider
                  minimumValue={1}
                  maximumValue={100}
                  step={1}
                  value={distance}
                  onSlidingComplete={setDistance}
                  trackStyle={{height: 4, borderRadius: 4}}
                  minimumTrackStyle={{backgroundColor: '#00AEEF'}}
                  maximumTrackStyle={{
                    backgroundColor: isDark ? '#2a2a2a' : '#eee',
                  }}
                  thumbStyle={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    backgroundColor: '#00AEEF',
                  }}
                />

                {/* Location */}
                <Text
                  style={[
                    styles.sectionLabel,
                    {color: '#8a8a8a', marginTop: 24},
                  ]}>
                  LOCATION
                </Text>
                <View style={styles.chipRow}>
                  {availableLocations.length === 0 ? (
                    <Text
                      style={{color: isDark ? '#777' : '#999', fontSize: 13}}>
                      No locations available yet
                    </Text>
                  ) : (
                    availableLocations.map(loc => {
                      const isSelected = selectedLocations.includes(loc);
                      return (
                        <TouchableOpacity
                          key={loc}
                          onPress={() => toggleLocation(loc)}
                          style={[
                            styles.locationChip,
                            {
                              borderColor: isSelected
                                ? '#00AEEF'
                                : isDark
                                ? '#333'
                                : '#e5e5e5',
                              backgroundColor: isSelected
                                ? 'rgba(0, 174, 239, 0.12)'
                                : 'transparent',
                            },
                          ]}>
                          <Text
                            style={[
                              styles.chipText,
                              {
                                color: isSelected
                                  ? '#00AEEF'
                                  : isDark
                                  ? '#ddd'
                                  : '#333',
                              },
                            ]}>
                            {loc}
                          </Text>
                        </TouchableOpacity>
                      );
                    })
                  )}
                </View>
              </View>

              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => {
                  setModalVisible(false);
                  getFilteredShops(
                    route?.params?.selectedcategory,
                    selectedRating,
                    distance,
                  );
                }}>
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </Pressable>
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
  modalContainer: {
    width: Width,
    height: Height,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 24,
    width: Width,
    maxHeight: Height * 0.82,
  },
  modalHandle: {
    height: 4,
    width: 40,
    backgroundColor: '#d0d0d0',
    borderRadius: 4,
    alignSelf: 'center',
    marginBottom: 18,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  resetText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00AEEF',
  },
  modalScroll: {
    width: '100%',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  sectionRowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  distanceValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 9,
    paddingHorizontal: 14,
    marginRight: 8,
    marginBottom: 8,
  },
  chipActive: {
    borderColor: '#00AEEF',
    backgroundColor: 'rgba(0, 174, 239, 0.12)',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  chipTextActive: {
    color: '#00AEEF',
  },
  locationChip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 9,
    paddingHorizontal: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  applyButton: {
    backgroundColor: '#00AEEF',
    width: '100%',
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
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
});
