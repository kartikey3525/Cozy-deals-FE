import React, {useContext, useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Pressable,
  Linking,
  Alert,
} from 'react-native';
import Octicons from 'react-native-vector-icons/Octicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useIsFocused} from '@react-navigation/native';
import {ThemeContext} from '../context/themeContext';
import Entypo from 'react-native-vector-icons/Entypo';

import {Dimensions} from 'react-native';
import {AuthContext} from '../context/authcontext';
const Width = Dimensions.get('window').width;
const Height = Dimensions.get('window').height;
import {TabView, SceneMap, TabBar} from 'react-native-tab-view';
import {BarChart, YAxis, Grid} from 'react-native-svg-charts';
import {G, Rect} from 'react-native-svg';
import * as scale from 'd3-scale';
import HorizontalRatingButtons from '../components/HorizontalRating';
import Header from '../components/Header';
import RatingTest from '../components/RatingTest';
export default function ShopDetails({navigation, route}) {
  const {theme} = useContext(ThemeContext);
  const isDark = theme === 'dark';

  const [Data, setData] = useState([]);
  const isFocused = useIsFocused();
  const {
    shopRating,
    singleShop,
    getSingleShop,
    getShopRating,
    PostReviewLikes,
    Userfulldata,
  } = useContext(AuthContext);

  const userId =
    route?.params?.item?.categoriesPost?.length > 0
      ? route?.params?.item?._id
      : route?.params?.item?.userId;

  const shareShopDeepLink = async () => {
    try {
      const shopId = Data._id || Data.id;
      const shopName = Data.name || 'This shop';
      const deepLink = `https://yourdomain.com/shop/${shopId}`;
      const playStoreLink =
        'https://play.google.com/store/apps/details?id=com.yourpackage';
      const message =
        `Check out ${shopName} on our app!\n\n` +
        `⭐ Rating: ${Data.averageRating || 'Not rated yet'}\n` +
        `📍 Location: ${Data.businessAddress || ''}\n` +
        `🕒 Hours: ${Data.openTime}-${Data.closeTime}\n\n` +
        `${deepLink}\n\n` +
        `Download our app: ${playStoreLink}`;
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `whatsapp://send?text=${encodedMessage}`;
      const supported = await Linking.canOpenURL(whatsappUrl);
      if (supported) {
        await Linking.openURL(whatsappUrl);
      } else {
        const webUrl = `https://wa.me/?text=${encodedMessage}`;
        await Linking.openURL(webUrl);
      }
    } catch (error) {
      console.error('Error sharing shop:', error);
      let errorMessage = 'Could not share shop';
      if (error.message.includes('No activity found to handle intent')) {
        errorMessage = 'WhatsApp is not installed';
      }
      Alert.alert('Error', errorMessage);
    }
  };

  useEffect(() => {
    if (userId) {
      if (
        !route?.params?.item?.categoriesPost ||
        route?.params?.item?.categoriesPost.length === 0
      ) {
        getSingleShop(userId);
      }
      getShopRating(userId);
    }
  }, [isFocused]);

  useEffect(() => {
    if (route?.params?.item?.categoriesPost?.length > 0) {
      setData(route.params.item);
    } else if (singleShop && Object.keys(singleShop).length > 0) {
      setData(singleShop);
    }
  }, [singleShop]);

  const handleLike = postId => {
    // console.log('postId,userId', postId,userId);
    PostReviewLikes(postId, userId, 'liketrue');
    if (userId) {
      if (
        !route?.params?.item?.categoriesPost ||
        route?.params?.item?.categoriesPost.length === 0
      ) {
        getSingleShop(userId);
      }
      getShopRating(userId);
    }
  };

  const handleDislike = postId => {
    PostReviewLikes(postId, userId, 'disliketrue');
    if (userId) {
      if (
        !route?.params?.item?.categoriesPost ||
        route?.params?.item?.categoriesPost.length === 0
      ) {
        getSingleShop(userId);
      }
      getShopRating(userId);
    }
  };

  const sortedRatings = shopRating?.rating?.length
    ? [...shopRating.rating]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map(review => ({
          likeCount: review.likeCount,
          dislikeCount: review.disLikeCount,
          id: review._id,
          name: review.name,
          rate: review.rate,
          date: review.date,
          feedback: review.feedback,
          profile: review.profile,
          timeAgo: review.timeAgo,
        }))
    : [];

  const data = shopRating?.result?.map(item => ({
    value: item.count,
    label: `${item.rate}`,
  }));

  const maxValue = Math.max(
    ...(shopRating?.result?.map(item => item.count) || [1]),
  );

  const [recentPostList, setrecentPostList] = useState([
    {id: 1, title: 'Samsung phone', img: require('../assets/sam-phone.png')},
    {id: 2, title: 'smart watch', img: require('../assets/watch.png')},
    {id: 3, title: 'Medicine', img: require('../assets/packagedfood.png')},
    {id: 4, title: 'packaged food', img: require('../assets/clothes.png')},
    {id: 5, title: 'Groceries', img: require('../assets/groceries.png')},
    {id: 6, title: 'Furniture', img: require('../assets/furniture.png')},
  ]);

  const dynamicRatings = sortedRatings?.map(item => ({
    value: item.rate,
    label: `${item.rate}`,
  }));

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    {key: 'overview', title: 'Overview'},
    {key: 'category', title: 'Category'},
    {key: 'review', title: 'Review'},
    {key: 'photos', title: 'Photos'},
  ]);

  const BusinessDetails = ({isDark, Data}) => {
    const Title = ({children, style}) => (
      <Text style={[styles.title, {color: isDark ? 'white' : 'black'}, style]}>
        {children}
      </Text>
    );
    const Subtitle = ({children, numberOfLines = 3}) => (
      <Text style={styles.subtitle} numberOfLines={numberOfLines}>
        {children}
      </Text>
    );
    const sections = [
      {title: 'Address', value: Data?.businessAddress},
      {title: 'Contact', value: Data?.phone},
      {title: 'Email', value: Data?.email},
      {
        title: 'Business Statutory Details',
        isHeader: true,
        style: {marginTop: 10, marginBottom: 5, fontSize: 18},
      },
      {title: 'Owner name', value: Data?.ownerName},
      {title: 'Year of Establishment', value: Data?.establishmentYear},
      {
        title: 'Delivery Available',
        value: Data?.isDeliveryAvailable === 'true' ? 'Yes' : 'No',
      },
      {title: 'Open at', value: Data?.openTime},
      {title: 'Close at', value: Data?.closeTime},
      {title: 'Social Media', value: Data?.socialMedia},
      {title: 'Business Scale', value: Data?.businessScale},
      {title: 'GSTIN', value: Data?.gstin},
      {
        title: 'Selected categories',
        value: Array.isArray(Data?.selectedCategories)
          ? Data.selectedCategories.join(', ')
          : Data?.selectedCategories || 'N/A',
      },
    ];
    return (
      <View style={styles.detailsContainer}>
        {sections.map((section, index) => (
          <View key={index}>
            <Title style={section.isHeader ? section.style : null}>
              {section.title}
            </Title>
            {!section.isHeader && <Subtitle>{section.value || 'N/A'}</Subtitle>}
          </View>
        ))}
      </View>
    );
  };

  const [showDetails, setShowDetails] = useState(true);
  const toggleDetails = () => {
    setShowDetails(prev => !prev);
  };

  // Calculate dynamic heights for each tab
  const getDynamicTabHeight = () => {
    const categories =
      route?.params?.item?.categoriesPost?.length > 0
        ? route.params.item.categoriesPost
        : singleShop?.categoriesPost || [];
    const ratings = sortedRatings || [];
    const photos =
      route?.params?.item?.profile?.length > 0
        ? route.params.item.profile
        : singleShop?.profile || [];

    switch (index) {
      case 0: // Overview
        let overviewHeight = 320; // Reduced base height for static elements
        if (showDetails) {
          overviewHeight += 250; // Reduced height for BusinessDetails
        }
        overviewHeight += categories.length * 130; // Categories (120px height + 10px margin)
        overviewHeight += ratings.length * 100; // Ratings (100px height + 0px margin)
        overviewHeight += Math.min(Math.ceil(photos.length / 3) * 130, 300); // Photos capped at 300px
        return overviewHeight;
      case 1: // Category
        return 150 + categories.length * 30; // Reduced base height + categories
      case 2: // Review
        return 400 + ratings.length * 100; // Reduced base height + ratings
      case 3: // Photos
        return 150 + Math.min(Math.ceil(photos.length / 3) * 140, 400); // Base height + capped photos
      default:
        return 400; // Reduced fallback
    }
  };

  const Overview = () => (
    <View>
      <View style={{height: '100%', flexGrow: 1}}>
        <TouchableOpacity
          onPress={toggleDetails}
          style={{flexDirection: 'row', alignItems: 'center'}}>
          <Text
            style={[
              styles.title,
              {
                color: isDark ? 'white' : 'black',
                fontSize: 18,
              },
            ]}>
            Quick information
          </Text>
          <Entypo
            name={showDetails ? 'chevron-thin-up' : 'chevron-thin-down'}
            size={13}
            color={isDark ? 'rgb(255, 255, 255)' : 'rgba(94, 95, 96, 1)'}
            style={{marginLeft: 35, marginTop: 10}}
          />
        </TouchableOpacity>
        {showDetails && <BusinessDetails isDark={isDark} Data={Data} />}
        <Text
          style={[
            {
              alignSelf: 'flex-start',
              fontSize: 18,
              color: isDark ? 'white' : 'black',
              left: 25,
              fontWeight: 'bold',
              marginTop: 5,
              marginBottom: 0,
            },
          ]}>
          Product categories
        </Text>
        <View style={{width: '95%', marginLeft: 14}}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{marginTop: '2%', padding: 5}}>
            {route?.params?.item?.categoriesPost?.length > 0 ? (
              route.params.item.categoriesPost.map((item, index) => (
                <View key={item.id ?? `category-${index}`}>
                  {renderRectangleList(item, index)}
                </View>
              ))
            ) : Array.isArray(singleShop?.categoriesPost) &&
              singleShop.categoriesPost.length > 0 ? (
              singleShop.categoriesPost.map((item, index) => (
                <View key={item.id ?? `category-${index}`}>
                  {renderRectangleList(item, index)}
                </View>
              ))
            ) : (
              <Text>No categories available</Text>
            )}
          </ScrollView>
        </View>
        <TouchableOpacity
          style={styles.blueBotton}
          onPress={() =>
            navigation.navigate('productcategories', {
              item:
                route?.params?.item?.categoriesPost?.length > 0
                  ? route?.params?.item?.categoriesPost
                  : singleShop?.categoriesPost,
            })
          }>
          <Text
            style={[
              styles.smallText,
              {color: '#fff', fontSize: 20, marginBottom: 0},
            ]}>
            Categories
          </Text>
        </TouchableOpacity>
        <Text
          style={[
            styles.bigText,
            {
              alignSelf: 'flex-start',
              fontSize: 18,
              left: 25,
              color: isDark ? 'white' : 'black',
              marginTop: 5,
              marginBottom: 0,
            },
          ]}>
          Rating review
        </Text>
        <View style={{flexDirection: 'row', marginLeft: 25}}>
          {shopRating?.result?.length > 0 ? (
            <View
              style={{
                flexDirection: 'row',
                height: 200,
                alignSelf: 'flex-start',
                width: Width * 0.7,
              }}>
              <YAxis
                data={data}
                yAccessor={({index}) => index}
                scale={scale.scaleLinear} // Use scaleLinear instead of scaleBand
                contentInset={{top: 10, bottom: 13}}
                numberOfTicks={data.length} // Match number of bars
                formatLabel={(_, index) => data[index]?.label || ''} // Display rating labels
                svg={{
                  fill: isDark ? 'white' : 'black',
                  fontSize: 14,
                  fontWeight: 'bold',
                }}
              />
              <BarChart
                style={{flex: 1, marginLeft: 8}}
                data={data}
                horizontal={true}
                svg={{fill: 'rgba(255, 180, 0, 1)'}}
                contentInset={{top: 10, bottom: 13}}
                spacingInner={0.2} // Adjust spacing between bars
                spacingOuter={0.1}
                gridMin={0}>
                <Grid direction={Grid.Direction.VERTICAL} />
                <G>
                  {data.map((item, index) => {
                    // Calculate and validate width
                    const barWidth =
                      Number.isFinite(item.value) && maxValue > 0
                        ? Math.max(0, (item.value / maxValue) * 100)
                        : 0;
                    // Constrain rx and ry
                    const barHeight = 10;
                    const rx = Math.min(4, barWidth / 2);
                    const ry = Math.min(4, barHeight / 2);

                    return (
                      <Rect
                        key={index}
                        x={0}
                        y={(index * (200 - 20)) / data.length + 10} // Dynamic Y positioning
                        width={barWidth}
                        height={barHeight}
                        rx={rx}
                        ry={ry}
                        fill="rgba(255, 180, 0, 1)"
                      />
                    );
                  })}
                </G>
              </BarChart>
            </View>
          ) : (
            <Text
              style={[
                styles.smallText,
                {color: isDark ? 'white' : 'black', alignSelf: 'center'},
              ]}>
              No enough data to show Ratings Graph
            </Text>
          )}
          <View style={{marginTop: '10%'}}>
            <View style={{flexDirection: 'row'}}>
              <Text
                style={[
                  styles.bigText,
                  {
                    alignSelf: 'flex-start',
                    fontSize: 14,
                    color: isDark ? 'white' : 'black',
                    marginTop: 5,
                    marginBottom: 0,
                  },
                ]}>
                {Data.averageRating}
              </Text>
              <Octicons
                name="star-fill"
                size={15}
                color={'rgba(255, 219, 17, 1)'}
                style={{marginTop: 8, marginLeft: 5, alignSelf: 'center'}}
              />
            </View>
            <Text
              numberOfLines={1}
              style={[
                styles.bigText,
                {
                  alignSelf: 'flex-start',
                  fontSize: 12,
                  color: 'grey',
                  marginTop: 10,
                  marginBottom: 0,
                },
              ]}>
              {sortedRatings?.length} Reviews
            </Text>
            <Text
              numberOfLines={1}
              style={[
                styles.bigText,
                {
                  alignSelf: 'flex-start',
                  fontSize: 12,
                  color: 'grey',
                  marginTop: 10,
                  marginBottom: 0,
                },
              ]}>
              {Data.averageRating <= 4 ? 'Average' : 'Recommended'}
            </Text>
          </View>
        </View>
        <Text
          style={[
            styles.bigText,
            {
              alignSelf: 'flex-start',
              fontSize: 14,
              marginTop: 10,
              marginLeft: 25,
              marginBottom: 0,
              color: isDark ? 'white' : 'black',
            },
          ]}>
          Recent rating review
        </Text>
        <HorizontalRatingButtons ratings={dynamicRatings} />
        <TouchableOpacity
          style={styles.blueBotton}
          onPress={() =>
            navigation.navigate('ratedscreen', {
              item:
                route?.params?.item?.profile?.length > 0
                  ? route?.params?.item
                  : singleShop,
            })
          }>
          <Text
            style={[
              styles.smallText,
              {color: '#fff', fontSize: 20, marginBottom: 0},
            ]}>
            Write a review
          </Text>
        </TouchableOpacity>
        {sortedRatings?.length > 0 ? (
          <View style={[styles.ratingsContainer, {marginTop: '2%'}]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {sortedRatings?.length > 0 ? (
                sortedRatings.map((item, index) => (
                  <View key={item?.id || index}>
                    {render2RectangleList(item, index)}
                  </View>
                ))
              ) : (
                <Text
                  style={[
                    styles.smallText,
                    {
                      color: isDark ? 'white' : 'black',
                      alignSelf: 'center',
                      paddingVertical: 20,
                    },
                  ]}>
                  No Ratings Available
                </Text>
              )}
            </ScrollView>
          </View>
        ) : (
          <Text
            style={[
              styles.smallText,
              {color: isDark ? 'white' : 'black', alignSelf: 'center'},
            ]}>
            No Ratings Available
          </Text>
        )}
        <Text
          style={[
            styles.bigText,
            {
              alignSelf: 'flex-start',
              fontSize: 18,
              color: isDark ? 'white' : 'black',
              left: 25,
              marginTop: 5,
              marginBottom: 0,
            },
          ]}>
          Photos
        </Text>
        <View style={{width: '95%', marginLeft: 10}}>
          <View style={{marginTop: '2%', padding: 5}}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
              style={{
                maxHeight: 300,
              }}>
              {Array.from(
                {
                  length: Math.ceil(
                    (route?.params?.item?.profile?.length > 0
                      ? route?.params?.item?.profile
                      : singleShop?.profile || []
                    ).length / 3,
                  ),
                },
                (_, rowIndex) => (
                  <View
                    key={rowIndex}
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    {(route?.params?.item?.profile?.length > 0
                      ? route?.params?.item?.profile
                      : singleShop?.profile || []
                    )
                      .slice(rowIndex * 3, rowIndex * 3 + 3)
                      .map((item, index) => (
                        <View
                          key={item.id || `photo-${index}`}
                          style={{flex: 1, margin: 5}}>
                          {renderPhotosList(item, index)}
                        </View>
                      ))}
                  </View>
                ),
              )}
            </ScrollView>
          </View>
        </View>
      </View>
    </View>
  );

  const Category = () => (
    <View>
      <View style={{}}>
        <Text
          style={[
            styles.bigText,
            {
              alignSelf: 'flex-start',
              fontSize: 18,
              left: 25,
              marginTop: 5,
              marginBottom: 0,
              color: isDark ? 'white' : 'black',
            },
          ]}>
          Product categories
        </Text>
        <View style={{width: '95%', marginLeft: 14}}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{marginTop: '2%', padding: 5}}>
            {(route?.params?.item?.categoriesPost?.length > 0
              ? route.params.item.categoriesPost
              : singleShop?.categoriesPost ?? []
            ).map((item, index) => (
              <View
                key={item?.id ?? `category-${index}`}
                style={{marginRight: 10}}>
                {renderRectangleList(item, index)}
              </View>
            ))}
          </ScrollView>
        </View>
        <TouchableOpacity
          style={styles.blueBotton}
          onPress={() =>
            navigation.navigate('productcategories', {
              item:
                route?.params?.item?.categoriesPost?.length > 0
                  ? route?.params?.item?.categoriesPost
                  : singleShop?.categoriesPost,
            })
          }>
          <Text
            style={[
              styles.smallText,
              {color: '#fff', fontSize: 20, marginBottom: 0},
            ]}>
            Categories
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const Review = () => (
    <View>
      <View style={{height: '75%', flexGrow: 1}}>
        <Text
          style={[
            styles.bigText,
            {
              alignSelf: 'flex-start',
              fontSize: 18,
              left: 25,
              color: isDark ? 'white' : 'black',
              marginTop: 5,
              marginBottom: 0,
            },
          ]}>
          Rating review
        </Text>
        <View style={{flexDirection: 'row', marginLeft: 25}}>
          {shopRating?.result?.length > 0 ? (
            <View
              style={{
                flexDirection: 'row',
                height: 200,
                alignSelf: 'flex-start',
                width: Width * 0.7,
              }}>
              <YAxis
                data={data}
                yAccessor={({index}) => index}
                scale={scale.scaleLinear} // Use scaleLinear instead of scaleBand
                contentInset={{top: 10, bottom: 13}}
                numberOfTicks={data.length} // Match number of bars
                formatLabel={(_, index) => data[index]?.label || ''} // Display rating labels
                svg={{
                  fill: isDark ? 'white' : 'black',
                  fontSize: 14,
                  fontWeight: 'bold',
                }}
              />
              <BarChart
                style={{flex: 1, marginLeft: 8}}
                data={data}
                horizontal={true}
                svg={{fill: 'rgba(255, 180, 0, 1)'}}
                contentInset={{top: 10, bottom: 13}}
                spacingInner={0.2} // Adjust spacing between bars
                spacingOuter={0.1}
                gridMin={0}>
                <Grid direction={Grid.Direction.VERTICAL} />
                <G>
                  {data.map((item, index) => {
                    // Calculate and validate width
                    const barWidth =
                      Number.isFinite(item.value) && maxValue > 0
                        ? Math.max(0, (item.value / maxValue) * 100)
                        : 0;
                    // Constrain rx and ry
                    const barHeight = 10;
                    const rx = Math.min(4, barWidth / 2);
                    const ry = Math.min(4, barHeight / 2);

                    return (
                      <Rect
                        key={index}
                        x={0}
                        y={(index * (200 - 20)) / data.length + 10} // Dynamic Y positioning
                        width={barWidth}
                        height={barHeight}
                        rx={rx}
                        ry={ry}
                        fill="rgba(255, 180, 0, 1)"
                      />
                    );
                  })}
                </G>
              </BarChart>
            </View>
          ) : (
            <Text
              style={[
                styles.smallText,
                {color: isDark ? 'white' : 'black', alignSelf: 'center'},
              ]}>
              No enough data to show Ratings Graph
            </Text>
          )}
          <View style={{marginTop: '10%'}}>
            <View style={{flexDirection: 'row'}}>
              <Text
                style={[
                  styles.bigText,
                  {
                    alignSelf: 'flex-start',
                    fontSize: 14,
                    color: isDark ? 'white' : 'black',
                    marginTop: 5,
                    marginBottom: 0,
                  },
                ]}>
                {Data.averageRating}
              </Text>
              <Octicons
                name="star-fill"
                size={15}
                color={'rgba(255, 219, 17, 1)'}
                style={{marginTop: 8, marginLeft: 5, alignSelf: 'center'}}
              />
            </View>
            <Text
              numberOfLines={1}
              style={[
                styles.bigText,
                {
                  alignSelf: 'flex-start',
                  fontSize: 12,
                  color: 'grey',
                  marginTop: 10,
                  marginBottom: 0,
                },
              ]}>
              {sortedRatings?.length} Reviews
            </Text>
            <Text
              numberOfLines={1}
              style={[
                styles.bigText,
                {
                  alignSelf: 'flex-start',
                  fontSize: 12,
                  color: 'grey',
                  marginTop: 10,
                  marginBottom: 0,
                },
              ]}>
              {Data.averageRating <= 4 ? 'Average' : 'Recommended'}
            </Text>
          </View>
        </View>
        <Text
          style={[
            styles.bigText,
            {
              alignSelf: 'flex-start',
              fontSize: 14,
              color: isDark ? 'white' : 'black',
              marginTop: 10,
              marginLeft: 25,
              marginBottom: 0,
            },
          ]}>
          Recent rating review
        </Text>
        <HorizontalRatingButtons ratings={dynamicRatings} />
        <TouchableOpacity
          style={styles.blueBotton}
          onPress={() =>
            navigation.navigate('ratedscreen', {
              item:
                route?.params?.item?.profile?.length > 0
                  ? route?.params?.item
                  : singleShop,
            })
          }>
          <Text
            style={[
              styles.smallText,
              {color: '#fff', fontSize: 20, marginBottom: 0},
            ]}>
            Write a review
          </Text>
        </TouchableOpacity>
        <View style={[styles.ratingsContainer, {marginTop: '2%'}]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {sortedRatings?.length > 0 ? (
              sortedRatings.map((item, index) => (
                <View key={item?.id || index}>
                  {render2RectangleList(item, index)}
                </View>
              ))
            ) : (
              <Text
                style={[
                  styles.smallText,
                  {
                    color: isDark ? 'white' : 'black',
                    alignSelf: 'center',
                    paddingVertical: 20,
                  },
                ]}>
                No Ratings Available
              </Text>
            )}
          </ScrollView>
        </View>
      </View>
    </View>
  );

  const Photos = () => (
    <View>
      <Text
        style={[
          styles.bigText,
          {
            alignSelf: 'flex-start',
            fontSize: 18,
            color: isDark ? 'white' : 'black',
            left: 25,
            marginTop: 5,
            marginBottom: 0,
          },
        ]}>
        Photos
      </Text>
      <View style={{width: '95%', marginLeft: 10}}>
        <View style={{marginTop: '2%', padding: 5}}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
            style={{
              maxHeight: 300,
            }}>
            {Array.from(
              {
                length: Math.ceil(
                  (route?.params?.item?.profile?.length > 0
                    ? route?.params?.item?.profile
                    : singleShop?.profile || []
                  ).length / 3,
                ),
              },
              (_, rowIndex) => (
                <View
                  key={rowIndex}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}>
                  {(route?.params?.item?.profile?.length > 0
                    ? route?.params?.item?.profile
                    : singleShop?.profile || []
                  )
                    .slice(rowIndex * 3, rowIndex * 3 + 3)
                    .map((item, index) => (
                      <View
                        key={item.id || `photo-${index}`}
                        style={{flex: 1, margin: 5}}>
                        {renderPhotosList(item, index)}
                      </View>
                    ))}
                </View>
              ),
            )}
          </ScrollView>
        </View>
      </View>
    </View>
  );

  const renderScene = SceneMap({
    overview: Overview,
    category: Category,
    review: Review,
    photos: Photos,
  });

  const renderRectangleList = (item, index) => {
    return (
      <TouchableOpacity
        style={{
          justifyContent: 'center',
          marginBottom: 15,
          alignItems: 'center',
        }}
        onPress={() =>
          navigation.navigate('productcategories', {
            item:
              route?.params?.item?.categoriesPost?.length > 0
                ? route?.params?.item?.categoriesPost
                : singleShop?.categoriesPost,
          })
        }>
        <View
          style={[
            styles.rectangle,
            {
              overflow: 'hidden',
              backgroundColor: isDark
                ? 'rgb(0, 0, 0)'
                : 'rgba(248, 247, 247, 1)',
            },
          ]}>
          <Image
            source={{uri: item.images[0]}}
            style={{width: '100%', height: '100%'}}
          />
        </View>
        <Text
          numberOfLines={1}
          style={[styles.recListText, {color: isDark ? '#fff' : '#000'}]}>
          {item.title}
        </Text>
      </TouchableOpacity>
    );
  };

  const render2RectangleList = (item, index) => {
    return (
      <Pressable
        style={{
          backgroundColor: isDark ? '#000' : '#fff',
          borderBottomWidth: 1,
          borderBottomColor: isDark ? '#ccc' : 'rgba(0, 0, 0, 0.1)',
        }}
        onPress={() => navigation.navigate('ratedscreen', {item: item})}>
        <View
          style={[
            styles.rectangle2,
            {
              overflow: 'hidden',
              flexDirection: 'row',
              backgroundColor: isDark ? '#000' : 'rgb(255, 255, 255)',
            },
          ]}>
          <View
            style={{
              width: 70,
              height: 70,
              overflow: 'hidden',
              borderRadius: 50,
              marginLeft: 25,
              margin: 8,
              marginBottom: 0,
            }}>
            <Image
              source={{uri: item.profile[0]}}
              style={{width: '100%', height: '100%'}}
            />
          </View>
          <View>
            <Text
              numberOfLines={1}
              style={[
                styles.recListText,
                {
                  fontWeight: 'bold',
                  fontSize: 14,
                  color: isDark ? '#fff' : '#000',
                },
              ]}>
              {item.name}
            </Text>
            <View
              style={{
                flexDirection: 'row',
                marginBottom: 5,
                alignItems: 'center',
                marginTop: -2,
              }}>
              <Text
                numberOfLines={2}
                style={[
                  {
                    marginTop: 0,
                    color: isDark ? '#fff' : 'rgba(29, 30, 32, 1)',
                    fontWeight: '500',
                    fontSize: 12,
                    left: 2,
                    width: '80%',
                  },
                ]}>
                {item.feedback}
              </Text>
            </View>
            <View style={{flexDirection: 'row'}}>
              <RatingTest fixedRating={item.rate} />
            </View>
          </View>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            alignSelf: 'center',
            marginRight: 5,
            marginTop: 5,
            marginBottom: 5,
          }}>
          <Text
            style={[
              {
                marginTop: 0,
                color: isDark ? '#fff' : 'rgba(94, 95, 96, 1)',
                fontWeight: '500',
                fontSize: 12,
                marginRight: 20,
              },
            ]}>
            {item.timeAgo}
          </Text>
          <Pressable
            style={{
              marginRight: 15,
              borderRadius: 5,
              borderWidth: 1,
              padding: 5,
              flexDirection: 'row',
              borderColor: 'rgba(228, 228, 228, 1)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={() => handleLike(item.id)}>
            <AntDesign
              name={'like1'}
              size={16}
              color={isDark ? '#fff' : 'rgba(94, 95, 96, 1)'}
            />
            <Text
              style={[
                {
                  marginLeft: 5,
                  color: isDark ? '#fff' : 'rgba(94, 95, 96, 1)',
                  fontWeight: '500',
                  fontSize: 12,
                },
              ]}>
              {item.likeCount}
            </Text>
          </Pressable>
          <Pressable
            style={{
              marginRight: 15,
              borderRadius: 5,
              borderWidth: 1,
              padding: 5,
              flexDirection: 'row',
              borderColor: 'rgba(228, 228, 228, 1)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={() => handleDislike(item.id)}>
            <AntDesign
              name={'dislike1'}
              size={16}
              color={isDark ? '#fff' : 'rgba(94, 95, 96, 1)'}
            />
            <Text
              style={[
                {
                  marginLeft: 5,
                  color: isDark ? '#fff' : 'rgba(94, 95, 96, 1)',
                  fontWeight: '500',
                  fontSize: 12,
                },
              ]}>
              {item.dislikeCount}
            </Text>
          </Pressable>
        </View>
      </Pressable>
    );
  };

  const renderPhotosList = (item, index) => {
    return (
      <View
        style={{
          justifyContent: 'center',
          marginBottom: 10,
          alignItems: 'center',
        }}>
        <View style={[styles.rectangle, {overflow: 'hidden'}]}>
          <Image source={{uri: item}} style={{width: '100%', height: '100%'}} />
        </View>
      </View>
    );
  };

  return (
    <View style={{flex: 1}}>
      <ScrollView
        style={[styles.container, {backgroundColor: isDark ? '#000' : '#fff'}]}
        showsVerticalScrollIndicator={false}>
        <View
          style={{ 
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Header header={'Shop Details'} />
          {route?.params?.item?.profile?.length > 0 ? (
            <Image
              source={{uri: route?.params?.item?.profile[0]}}
              style={{
                width: Width * 0.9,
                height: Height * 0.2,
              }}
              resizeMode="contain"
            />
          ) : (
            <Image
              source={
                singleShop?.profile?.[0]
                  ? {uri: singleShop.profile[0]}
                  : require('../assets/shop-pic.png')
              }
              style={{
                width: Width * 0.9,
                height: Height * 0.2,
              }}
              resizeMode="contain"
            />
          )}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: isDark ? '#000' : 'white',
              justifyContent: 'flex-start',
              bottom: 40,
              right: 40,
              elevation: 1,
            }}>
            <View
              style={[
                styles.inputContainer,
                {
                  borderWidth: 0,
                  backgroundColor: isDark ? '#000' : 'rgba(255, 255, 255, 1)',
                },
              ]}>
              <View
                style={[
                  styles.searchInput,
                  {
                    width: '65%',
                    left: 1,
                    color: isDark ? 'rgba(255, 255, 255, 1)' : 'rgb(0, 0, 0)',
                  },
                ]}>
                <Text
                  numberOfLines={2}
                  style={{
                    fontSize: 16,
                    fontWeight: 'bold',
                    marginTop: 2,
                    color: isDark ? 'rgba(255, 255, 255, 1)' : 'rgb(0, 0, 0)',
                  }}>
                  {Data?.shopName?.length > 0 ? Data?.shopName : Data?.name}
                </Text>
              </View>
            </View>
          </View>
          <View
            style={{
              alignSelf: 'flex-start',
              marginLeft: '8%',
              bottom: 35,
            }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <Text
                numberOfLines={1}
                style={[
                  {
                    fontWeight: 'bold',
                    marginTop: 0,
                    fontSize: 14,
                    paddingRight: 8,
                    color: isDark ? 'rgba(255, 255, 255, 1)' : 'rgb(0, 0, 0)',
                  },
                ]}>
                {Data.averageRating}
              </Text>
              <RatingTest fixedRating={Data.averageRating} />
            </View>
            <View
              style={[
                styles.inputContainer,
                {
                  borderWidth: 0,
                  backgroundColor: isDark ? '#000' : 'rgba(255, 255, 255, 1)',
                },
              ]}>
              <View
                style={[
                  styles.searchInput,
                  {
                    width: '65%',
                    left: 0,
                    backgroundColor: isDark ? '#000' : 'rgba(255, 255, 255, 1)',
                  },
                ]}>
                <View style={{flexDirection: 'row'}}>
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: '500',
                      marginTop: 2,
                      color: isDark ? 'rgba(255, 255, 255, 1)' : 'rgb(0, 0, 0)',
                    }}>
                    Open :
                  </Text>
                  <Text
                    style={{
                      fontSize: 15,
                      color: 'grey',
                      fontWeight: '500',
                      marginTop: 2,
                      left: 2,
                      color: isDark ? 'rgba(255, 255, 255, 1)' : 'rgb(0, 0, 0)',
                    }}>
                    {Data.openTime}-{Data.closeTime}
                  </Text>
                </View>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: '500',
                      color: isDark ? 'rgba(255, 255, 255, 1)' : 'rgb(0, 0, 0)',
                      marginTop: 2,
                    }}>
                    About :
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={{
                      fontSize: 14,
                      fontWeight: '500',
                      marginTop: 3,
                      left: 2,
                      alignSelf: 'center',
                      color: isDark
                        ? 'rgba(255, 255, 255, 1)'
                        : 'rgba(0, 0, 0, 0.86)',
                    }}>
                    {Data?.description}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignSelf: 'flex-start',
              marginLeft: '7%',
            }}>
            <Pressable style={styles.iconStyle}>
              <Ionicons
                onPress={() => Linking.openURL(`tel:${Data?.phone}`)}
                name="call"
                size={26}
                color="rgba(255, 255, 255, 1)"
              />
            </Pressable>
            <Pressable
              style={[
                styles.iconStyle,
                {backgroundColor: 'rgba(15, 92, 246, 1)'},
              ]}>
              <Ionicons
                onPress={() =>
                  navigation.navigate('Chatscreen', {
                    item: Data,
                    userId: Userfulldata._id,
                  })
                }
                name="chatbubble-ellipses-outline"
                size={26}
                color="rgba(255, 255, 255, 1)"
              />
            </Pressable>
            <Pressable
              style={[
                styles.iconStyle,
                {backgroundColor: 'rgba(255, 219, 17, 1)'},
              ]}
              onPress={() =>
                navigation.navigate('ratedscreen', {
                  item:
                    route?.params?.item?.profile?.length > 0
                      ? route?.params?.item
                      : singleShop,
                })
              }>
              <Octicons
                name="star-fill"
                size={26}
                color="rgba(255, 255, 255, 1)"
              />
            </Pressable>
            <Pressable
              style={[
                styles.iconStyle,
                {backgroundColor: 'rgba(33, 150, 243, 1)'},
              ]}
              onPress={() => shareShopDeepLink()}>
              <FontAwesome
                name="share"
                size={26}
                color="rgba(255, 255, 255, 1)"
              />
            </Pressable>
          </View>
          <View style={[styles.tabContainer, {height: getDynamicTabHeight()}]}>
            <TabView
              swipeEnabled={false}
              navigationState={{index, routes}}
              renderScene={renderScene}
              onIndexChange={setIndex}
              initialLayout={{width: Width}}
              renderTabBar={props => (
                <TabBar
                  {...props}
                  indicatorStyle={{backgroundColor: isDark ? 'white' : 'black'}}
                  style={{
                    backgroundColor: isDark ? 'black' : 'white',
                    borderTopWidth: 1,
                    borderBottomWidth: 1,
                    borderColor: isDark
                      ? 'rgba(0, 0, 0, 0.1)'
                      : 'rgba(0, 0, 0, 0.1)',
                  }}
                  labelStyle={{
                    fontWeight: 'bold',
                    color: isDark ? 'white' : 'black',
                    textTransform: 'none',
                  }}
                  activeColor={isDark ? 'white' : 'black'}
                  inactiveColor="grey"
                  pressColor={
                    isDark ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                  }
                />
              )}
            />
          </View>
        </View>
      </ScrollView>
      <View
        style={{
          backgroundColor: isDark ? 'black' : 'rgba(255, 255, 255, 1)',
          flexDirection: 'row',
          borderTopWidth: 1,
          borderColor: 'rgba(0, 0, 0, 0.1)',
          position: 'absolute',
          bottom: 0,
          justifyContent: 'center',
          alignItems: 'center',
          width: Width,
          height: 90,
          justifyContent: 'space-evenly',
        }}>
        <TouchableOpacity
          style={[
            styles.smallblueBotton,
            {
              backgroundColor: isDark ? 'black' : 'rgb(255, 255, 255)',
              borderWidth: 1,
              borderColor: isDark
                ? 'rgba(255, 255, 255, 1)'
                : 'rgba(15, 92, 246, 1)',
            },
          ]}
          onPress={() =>
            navigation.navigate('Chatscreen', {
              item: Data,
              userId: Userfulldata._id,
            })
          }>
          <Text
            style={[
              styles.smallText,
              {
                color: isDark
                  ? 'rgba(255, 255, 255, 1)'
                  : 'rgba(15, 92, 246, 1)',
                fontSize: 20,
                fontWeight: 'bold',
                marginBottom: 0,
              },
            ]}>
            Chat
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.smallblueBotton}
          onPress={() => Linking.openURL(`tel:${Data?.phone}`)}>
          <Text
            style={[
              styles.smallText,
              {
                color: '#fff',
                fontSize: 20,
                fontWeight: 'bold',
                marginBottom: 0,
              },
            ]}>
            Call
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalContent: {
    borderRadius: 5,
    width: 120,
    backgroundColor: 'white',
    elevation: 2,
  },
  tabContainer: {
    marginTop: 20,
    marginBottom: 10,
    width: '100%',
  },
  tabContent: {
    flex: 1,
    padding: 20,
  },
  tabText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
  iconStyle: {
    width: Width * 0.13,
    height: 50,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '7%',
    backgroundColor: 'rgba(7, 201, 29, 1)',
  },
  square: {
    backgroundColor: 'rgba(248, 247, 247, 1)',
    width: Width * 0.21,
    marginRight: '2%',
    height: 86,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  rectangle: {
    backgroundColor: 'rgba(248, 247, 247, 1)',
    width: Width * 0.295,
    marginRight: 6,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  rectangle2: {
    backgroundColor: 'rgb(255, 255, 255)',
    width: Width,
    marginRight: 10,
    height: 100,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  newsDescription: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000',
    right: 6,
    marginTop: 4,
  },
  recListText: {
    fontSize: 12,
    fontWeight: '500',
    width: 110,
    left: 2,
    color: '#000',
    marginTop: 4,
  },
  smallText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1D1E20',
    textAlign: 'center',
    width: 250,
    fontFamily: 'NunitoSans-VariableFont_YTLC,opsz,wdth,wght',
  },
  bigText: {
    fontSize: 30,
    color: 'black',
    textAlign: 'left',
    marginTop: 30,
    fontWeight: 'bold',
    marginBottom: 6,
    fontFamily: 'Poppins-Bold',
  },
  smallblueBotton: {
    backgroundColor: 'rgba(7, 201, 29, 1)',
    width: '30%',
    height: 56,
    borderRadius: 10,
    margin: 10,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  blueBotton: {
    backgroundColor: '#00AEEF',
    width: '88%',
    height: 56,
    borderRadius: 10,
    margin: 10,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContainer: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: 'rgb(0, 0, 0)',
    borderWidth: 1,
    borderRadius: 14,
    height: 45,
    padding: 1,
  },
  searchInput: {
    width: '68%',
    alignSelf: 'center',
    fontSize: 17,
    fontWeight: '500',
    color: 'black',
    height: 45,
    left: 16,
  },
  title: {
    alignSelf: 'flex-start',
    fontSize: 14,
    fontWeight: 'bold',
    left: 25,
    marginTop: 5,
    marginBottom: 0,
  },
  subtitle: {
    alignSelf: 'flex-start',
    fontSize: 12,
    color: 'grey',
    left: 25,
    width: '95%',
    marginTop: 5,
    marginBottom: 0,
  },
});