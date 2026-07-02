import React, {useContext, useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator, // Add this import
} from 'react-native';
import Entypo from 'react-native-vector-icons/Entypo';
import {useIsFocused} from '@react-navigation/native';
import {Dimensions} from 'react-native';
import {AuthContext} from '../context/authcontext';
const Width = Dimensions.get('window').width;
const Height = Dimensions.get('window').height;
import {ThemeContext} from '../context/themeContext';

export default function Preferences({navigation, route}) {
  const [numColumns, setNumColumns] = useState(4);
  const isFocused = useIsFocused();
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const {userRole, getPosts, fullCategorydata, posts, isposting} =
    useContext(AuthContext);

  useEffect(() => {
    if (isFocused) {
      setIsLoading(true); // Set loading to true when starting to fetch
      getPosts(route.params?.category)
        .finally(() => {
          setIsLoading(false); // Set loading to false when done
        });
    }
  }, [isFocused, route.params?.category]);

  const {theme} = useContext(ThemeContext);
  const isDark = theme === 'dark';

  const renderRectangleList = ({item}) => {
    return (
      <TouchableOpacity
        style={{
          justifyContent: 'flex-start',
          marginBottom: 15,
          alignItems: 'center',
          width: Width * 0.5, // Take half the screen width for two columns
        }}
        onPress={() =>
          navigation.navigate('preferencedetails', {
            item: item.subCategories,
            selectedcategory: [item.name],
          })
        }>
        <View
          style={[
            styles.rectangle,
            {
              overflow: 'hidden',
              backgroundColor: isDark ? '#121212' : 'rgba(248, 247, 247, 1)',
            },
          ]}>
          <Image
            source={{uri: item.image}}
            style={{width: '100%', height: '100%'}}
          />
        </View>
        <Text
          numberOfLines={1}
          style={[styles.recListText, {color: isDark ? '#fff' : '#000'}]}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderSellerRectangleList = ({item}) => {
    return (
      <TouchableOpacity
        style={{
          justifyContent: 'flex-start',
          marginBottom: 15,
          alignItems: 'center',
          width: Width * 0.5,
        }}
        onPress={() =>
          navigation.navigate('sellerProductDetail', {item:item})
        }>
        <View
          style={[
            styles.rectangle1,
            {
              overflow: 'hidden',
              backgroundColor: isDark ? '#121212' : 'rgba(248, 247, 247, 1)',
            },
          ]}>
          <Image
            source={{uri: item.images[0]}}
            // source={item.img}
            style={{width: '100%', height: '100%'}}
          />
        </View>
        <Text
          numberOfLines={1}
          style={[
            styles.recListText2,
            {fontSize: 15, color: isDark ? '#fff' : '#000'},
          ]}>
          {item.productName || 'No Name'}
        </Text>
        {/* <Text
          numberOfLines={2}
          style={[styles.recListText2, {color: isDark ? '#fff' : '#000'}]}>
          {item.description}
        </Text> */}
      </TouchableOpacity>
    );
  };
  
  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, {backgroundColor: isDark ? '#000' : '#fff'}]}>
        <ActivityIndicator 
          size="large" 
          color={isDark ? '#fff' : '#000'} 
        />
        <Text style={{color: isDark ? '#fff' : '#000', marginTop: 10}}>
          Loading...
        </Text>
      </View>
    );
  }

  return (
    <View style={{flex: 1}}>
      <View
        style={[styles.container, {backgroundColor: isDark ? '#000' : '#fff'}]}
        showsVerticalScrollIndicator={false}>
        <View
          style={{ 
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <View
            style={{
              alignItems: 'center',
              width: Width,
              flexDirection: 'row',
              height: 60,
              marginTop: 10,
              justifyContent: 'flex-start',
            }}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Entypo
                name="chevron-thin-left"
                size={20}
                color={isDark ? '#fff' : 'rgba(94, 95, 96, 1)'}
                style={{marginLeft: 20, padding: 5}}
              />
            </TouchableOpacity>
            <Text
              style={[
                {
                  fontSize: 20,
                  fontWeight: 'bold',
                  alignSelf: 'center',
                  marginLeft: '25%',
                  color: isDark ? '#fff' : '#000',
                  width: Width * 0.5,
                },
              ]}>
              {userRole === 'buyer' ? 'Preferences' : 'Recent Posts'}
            </Text>
          </View>

          {userRole === 'buyer' && fullCategorydata.length === 0 ? (
            <View style={styles.noDataContainer}>
              <Text style={{color: isDark ? '#fff' : '#000'}}>
                No categories found
              </Text>
            </View>
          ) : userRole !== 'buyer' && posts.length === 0 ? (
            <View style={styles.noDataContainer}>
              <Text style={{color: isDark ? '#fff' : '#000'}}>
                No posts found
              </Text>
            </View>
          ) : (
            <FlatList
              style={{
                marginTop: '2%',
                height: Height * 0.9,
              }}
              // key={flatListKey}
              horizontal={false}
              numColumns={2}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              data={userRole === 'buyer' ? fullCategorydata : posts}
              keyExtractor={item => (userRole === 'buyer' ? item.id : item._id)}
              renderItem={
                userRole === 'buyer'
                  ? renderRectangleList
                  : renderSellerRectangleList
              }
              ListEmptyComponent={
                <View style={styles.noDataContainer}>
                  <Text style={{color: isDark ? '#fff' : '#000'}}>
                    No data available
                  </Text>
                </View>
              }
            />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  tabContainer: {
    height: Height * 1.8,
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
  rectangle1: {
    backgroundColor: 'rgba(248, 247, 247, 1)',
    width: 170,
    height: 170,
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderRadius: 10,
  },
  rectangle: {
    backgroundColor: 'rgba(248, 247, 247, 1)',
    width: Width * 0.44,
    height: 160,
    justifyContent: 'flex-start',
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
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'left',
    color: '#000',
    marginTop: 4,
  },
  recListText2: {
    fontSize: 12,
    fontWeight: '500',
    width: 150,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: Height * 0.7,
  },
});
