import React, {useContext, useEffect, useState} from 'react';
import {View, StyleSheet, Text, TouchableOpacity, Image} from 'react-native';
import Entypo from 'react-native-vector-icons/Entypo';
import {Dimensions} from 'react-native';
const Width = Dimensions.get('window').width;
const Height = Dimensions.get('window').height;

import {ScrollView} from 'react-native-gesture-handler';
import {useIsFocused} from '@react-navigation/native';
import {AuthContext} from '../context/authcontext';
import {ThemeContext} from '../context/themeContext';
import SearchBar from '../components/SearchBar';
import Header from '../components/Header';

export default function CategoryScreen({navigation, route}) {
  const isFocused = useIsFocused();
  const {theme} = useContext(ThemeContext);
  const isDark = theme === 'dark';

  const {getCategories, fullCategorydata, userRole, isposting} =
    useContext(AuthContext);

  // State for the filtered list (search results)
  const [filteredLists, setFilteredLists] = useState(fullCategorydata);

  const rendersquareList = ({item, index}) => {
    return (
      <TouchableOpacity
        style={{
          marginBottom: 15,
          alignItems: 'center',
          width: Width * 0.9,
          borderWidth: 1,
          flexDirection: 'row',
          alignSelf: 'center',
          backgroundColor: isDark
            ? 'rgba(29, 30, 32, 1)'
            : 'rgba(255, 255, 255, 1)',
          borderRadius: 10,
          borderColor: isDark
            ? 'rgba(109, 109, 109, 0.43)'
            : 'rgba(0, 0, 0, 1)',
          height: Height * 0.08,
          justifyContent: 'flex-start',
        }}
        onPress={() =>
          navigation.navigate('Subcategory', {
            item: item.subCategories,
            isposting: isposting,
            selectedcategory: item.name,
          })
        }>
        <View style={styles.square}>
          <Image
            source={{uri: item.image}}
            style={{
              width: item.id === 12 ? 30 : 50,
              height: 35,
              marginLeft: 10,
            }}
            resizeMode="contain"
          />
        </View>
        <Text
          style={{
            marginLeft: 10,
            fontWeight: 'bold',
            width: Width * 0.64,
            color: isDark ? 'rgba(255, 255, 255, 1)' : 'rgba(0, 0, 0, 1)',
          }}>
          {item.name || 'Unnamed Category'}
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
    <View
      style={[
        styles.screen,
        {
          backgroundColor: isDark ? 'rgb(0, 0, 0)' : 'rgba(255, 255, 255, 1)',
        },
      ]}>
      <Header header={'Categories'} />
      <View
        style={{
          width: Width,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <SearchBar
          placeholder={'Search Categories'}
          lists={fullCategorydata || []} // Ensure lists is always an array
          setFilteredLists={setFilteredLists}
          searchKey="name"
        />
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{height: Height * 0.73, flexGrow: 1}}>
          {filteredLists.length > 0 ? (
            filteredLists.map((item, index) => (
              <View key={item.id || index}>
                {rendersquareList({item, index})}
              </View>
            ))
          ) : (
            <View
              style={{justifyContent: 'center', alignItems: 'center', flex: 1}}>
              <Text style={{color: isDark ? '#fff' : '#000'}}>
                No categories found
              </Text>
            </View>
          )}
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
  square: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
