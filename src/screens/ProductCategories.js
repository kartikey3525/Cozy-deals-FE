import React, {useContext, useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import Entypo from 'react-native-vector-icons/Entypo';
import {useIsFocused} from '@react-navigation/native';

import {Dimensions} from 'react-native';
import {AuthContext} from '../context/authcontext';
const Width = Dimensions.get('window').width;
const Height = Dimensions.get('window').height;
import {TabView, SceneMap, TabBar} from 'react-native-tab-view';
import {ThemeContext} from '../context/themeContext';

export default function ProductCategories({navigation,route}) {
  const [numColumns, setNumColumns] = useState(4);
  const isFocused = useIsFocused(); 
  const {theme} = useContext(ThemeContext);
  const isDark = theme === 'dark';

  const {VerifyOTP, handleLogin, getCategories, userdata, categorydata} =
    useContext(AuthContext);

  useEffect(() => {
    // getCategories();
    // console.log('route data', route.params.item)
  }, [isFocused]);

  const [categories, setCategories] = useState([]);
  const [filteredData, setFilteredData] = useState({});
  const [index, setIndex] = useState(0);
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    if (route?.params?.item) {
      const allItems = route.params.item;

      // Extract unique categories
      const categorySet = new Set();
      allItems.forEach(item => {
        item.categories.forEach(category => categorySet.add(category));
      });

      const uniqueCategories = Array.from(categorySet);

      // Create routes for TabView
      const categoryRoutes = uniqueCategories.map(category => ({
        key: category.toLowerCase(),
        title: category,
      }));

      setCategories(uniqueCategories);
      setRoutes(categoryRoutes);

      // Organize items by category
      const categorizedData = {};
      uniqueCategories.forEach(category => {
        categorizedData[category] = allItems.filter(item =>
          item.categories.includes(category)
        );
      });

      setFilteredData(categorizedData);
    }
  }, [isFocused]);

 
  useEffect(() => {
    if (route?.params?.item) {
      const allItems = route.params.item;

      // Extract unique categories
      const categorySet = new Set();
      allItems.forEach(item => {
        item.categories.forEach(category => categorySet.add(category));
      });

      const uniqueCategories = Array.from(categorySet);

      // Create routes for TabView
      const categoryRoutes = uniqueCategories.map(category => ({
        key: category.toLowerCase(),
        title: category,
      }));

      setCategories(uniqueCategories);
      setRoutes(categoryRoutes);

      // Organize items by category
      const categorizedData = {};
      uniqueCategories.forEach(category => {
        categorizedData[category] = allItems.filter(item =>
          item.categories.includes(category)
        );
      });

      setFilteredData(categorizedData);
    }
  }, [isFocused]);

  const renderRectangleList = (items) => {
    return (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', padding: 5 }}>
        {items.map((item) => (
          <TouchableOpacity
            key={item._id}
            style={{
              width: Width * 0.295, // 3 items per row
              margin: 5, // Added margin for spacing
              justifyContent: 'center',
              alignItems: 'center',
            }}
            // onPress={() => navigation.navigate('sellerProductDetail', { item })}
            onPress={() => navigation.navigate('AddProducts', { 
              productData: item,
              isShowMode: true 
            })}

            
          >
            <View
              style={{
                width: '100%',
                height: 130,
                backgroundColor: isDark ? '#121212' : 'rgba(248, 247, 247, 1)',
                borderRadius: 10,
                overflow: 'hidden',
              }}
            >
              <Image source={{ uri: item.images[0] }} style={{ width: '100%', height: '100%' }} />
            </View>
            <Text
              numberOfLines={1}
              style={{ color: isDark ? '#fff' : '#000', marginTop: 5 ,width: Width * 0.26,}}
            >
              {item.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderScene = routes.reduce((scenes, route) => {
    scenes[route.key] = () => (
      <ScrollView>
        {filteredData[route.title] ? renderRectangleList(filteredData[route.title]) : null}
      </ScrollView>
    );
    return scenes;
  }, {});

  
  const getTabHeight = () => {
    switch (index) {
      case 0:
        return 550; // Height for Tab 1
      case 1:
        return 550; // Height for Tab 2
      case 2:
        return 550; // Height for Tab 3
      case 3:
        return 550; // Height for Tab 3
      default:
        return 550;
    }
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
          <View
            style={{
              alignItems: 'center',
              width: Width,
              flexDirection: 'row',
              height: 60,
              justifyContent: 'flex-start',
            }}>
            <Entypo
              onPress={() => navigation.goBack()}
              name="chevron-thin-left"
              size={20}
              color={isDark ? '#fff' : 'rgba(94, 95, 96, 1)'}
              style={{marginLeft: 20, padding: 5}}
            />
            <Text
              style={[
                {
                  fontSize: 20,
                  fontWeight: 'bold',
                  alignSelf: 'center',
                  marginLeft: '25%',
                  width: Width * 0.5,
                  color: isDark ? '#fff' : '#000',
                },
              ]}>
              Categories
            </Text>
            {/* <Image
              source={
                isDark
                  ? require('../assets/search-icon-dark.png')
                  : require('../assets/search-icon.png')
              }
              style={{
                width: 20,
                height: 20,
                alignSelf: 'center',
                left: 10,
              }}
              resizeMode="contain"
            /> */}
          </View>

          <View style={[styles.tabContainer, {height: getTabHeight()}]}>
            {routes.length > 0 && (
              <TabView
                swipeEnabled={false}
                navigationState={{index, routes}}
                renderScene={SceneMap(renderScene)}
                onIndexChange={setIndex}
                initialLayout={{width: Width}}
                renderTabBar={props => (
                  <TabBar
                    {...props}
                    indicatorStyle={{
                      backgroundColor: isDark ? 'white' : 'black',
                    }}
                    style={{
                      backgroundColor: isDark ? 'black' : 'white',
                      borderBottomWidth: 1,
                      borderColor: isDark ? 'grey' : 'rgba(0, 0, 0, 0.1)',
                    }}
                    labelStyle={{
                      fontWeight: 'bold',
                      // fontSize: 16,
                      color: isDark ? 'white' : 'black',
                    }}
                    activeColor={isDark ? 'white' : 'black'}
                    inactiveColor="grey"
                    scrollEnabled={true} // Enables horizontal scrolling for tabs
                    tabStyle={{width: 'auto'}} // Prevents tabs from breaking ont
                  />
                )}
              />
            )}
          </View>
        </View>
      </ScrollView>
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
    marginRight: 10,
    height: 130,
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
});
