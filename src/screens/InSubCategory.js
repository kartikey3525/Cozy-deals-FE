import React, {useContext, useState} from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Pressable,
} from 'react-native';
import Entypo from 'react-native-vector-icons/Entypo';
import {Dimensions} from 'react-native';
const Width = Dimensions.get('window').width;
const Height = Dimensions.get('window').height;
import {ThemeContext} from '../context/themeContext';

import {ScrollView} from 'react-native-gesture-handler';
import SearchBar from '../components/SearchBar';
import Header from '../components/Header';

export default function InSubCategory({navigation, route}) {
  const {theme} = useContext(ThemeContext);
  const isDark = theme === 'dark';
const [filteredLists, setFilteredLists] = useState(route.params.item);

  const [categoryIcons, setcategoryIcons] = useState([
    {id: 1, title: 'shirt', img: require('../assets/phone.png')},
    {id: 2, title: 'pent', img: require('../assets/Laptop.png')},
    {id: 3, title: 'coat', img: require('../assets/medicine.png')},
  ]);

  const rendersquareList = ({item, index}) => {
    return (
      <TouchableOpacity
        style={{
          marginBottom: 15,
          alignItems: 'center',
          width: Width * 0.9,
          backgroundColor: isDark
            ? 'rgba(26, 26, 26, 1)'
            : 'rgba(249, 249, 249, 1)',
          flexDirection: 'row',
          alignSelf: 'center',
          borderRadius: 10,
          height: Height * 0.08,
          justifyContent: 'flex-start',
        }}
        onPress={() =>
          item.subCategories === null
            ? navigation.navigate('Subcategory', {
                item: item.subCategories,
                isposting: route?.params?.isposting,
                selectedcategory: route?.params?.selectedcategory,
              })
            : route?.params?.isposting
            ? navigation.navigate('postdetails', {
                item: item,
                selectedcategory: route?.params?.selectedcategory,
              })
            : navigation.navigate('shopScreen', {
                item: item,
              })
        }>
        <Text
          style={{
            fontSize: 17,
            marginLeft: 20,
            fontWeight: '600',
            width: Width * 0.74,
            color: isDark ? 'rgba(255, 255, 255, 1)' : 'rgba(0, 0, 0, 1)',
          }}>
          {/* {item.name} */}
          {item.title}
        </Text>
        <Entypo
          name="chevron-thin-right"
          size={22}
          color={isDark ? 'rgba(255, 255, 255, 1)' : 'rgba(94, 95, 96, 1)'}
          style={{marginRight: 5}}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.screen, {backgroundColor: isDark ? '#000' : '#fff'}]}>
      <Header header={'Sub Categories'} />

      <View
        style={{
          width: Width,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
         <SearchBar
          placeholder={'Search Categories'}
          lists={route.params.item}  
          setFilteredLists={setFilteredLists} 
          searchKey="name"
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{height: Height * 0.74, flexGrow: 1}}>
          {filteredLists.map((item, index) => (
            <View key={item.id}>{rendersquareList({item, index})}</View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  screen: {
    width: Width,
    height: Height,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  inputContainer: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    width: Width * 0.9,
    borderColor: 'rgb(0, 0, 0)',
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
});
