import React, {useContext, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet, 
  Dimensions, 
} from 'react-native'; 
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import {ThemeContext} from '../context/themeContext';
import SearchBar from '../components/SearchBar';
import Header from '../components/Header';
import { useIsFocused } from '@react-navigation/native';
import { AuthContext } from '../context/authcontext';

const Width = Dimensions.get('window').width;
const Height = Dimensions.get('window').height;

export default function FAQScreen({navigation}) {
  const {theme} = useContext(ThemeContext);
  const isDark = theme === 'dark';

  const isFocused = useIsFocused();

  const {getFAQs, FAQs} = useContext(AuthContext);
  const [filteredLists, setFilteredLists] = useState(FAQs);

  useEffect(() => {
    getFAQs();
  }, [isFocused]); // ✅ Trigger API call when screen is focused

  useEffect(() => {
    setFilteredLists(FAQs); // ✅ Update filtered list when FAQs change
  }, [FAQs]); // ✅ Re-run when FAQs update

  const [selectedItemId, setSelectedItemId] = useState(null);

  const [recentPostList, setRecentPostList] = useState([
    {
      id: 1,
      title: 'Lindsey Culhane requested ?',
      img: require('../assets/User-image.png'),
      description:
        'To manage notifications, go to  Settings,  select Notification Settings,  and customize your preferences.',
    },
    {
      id: 2,
      title: 'Lindsey Culhane requested a payment of $780.1',
      img: require('../assets/User-image.png'),
      description: '9:00 am',
    },
    {
      id: 3,
      title: 'Lindsey Culhane requested a payment of $780.1',
      img: require('../assets/User-image.png'),
      description: '9:00 am',
    },
  ]);

  const toggleDescription = itemId => {
    setSelectedItemId(prevItemId => (prevItemId === itemId ? null : itemId));
  };

  const render2RectangleList = (item, index) => (
    <View
      key={index}
      style={{
        justifyContent: 'flex-start',
        marginBottom: 10,
        alignItems: 'center',
        borderRadius: 10,
        alignSelf: 'center',
        padding: 4,
        backgroundColor: isDark ? '#121212' : '#fff',
        flexDirection: 'row',
      }}>
      <View style={{}}>
        <View
          style={[
            styles.rectangle2,
            {
              flexDirection: 'row',
              backgroundColor: isDark ? '#121212' : '#fff',
            },
          ]}>
          <Text
            onPress={() => toggleDescription(item._id)}
            numberOfLines={1}
            style={[
              styles.recListText,
              {
                fontWeight: 'bold',
                fontSize: 18,
                textAlign: 'left',
                color: isDark ? '#fff' : 'rgba(0, 0, 0, 0.67)',
              },
            ]}>
            {item.question}
          </Text>

          <FontAwesome5
            onPress={() => toggleDescription(item._id)}
            name={selectedItemId === item._id ? 'angle-up' : 'angle-down'}
            size={18}
            color={isDark ? 'rgb(255, 255, 255)' : 'rgb(0, 0, 0)'}
            style={{padding: 5}}
          />
        </View>

        {selectedItemId === item._id && (
          <Text
            numberOfLines={3}
            style={[
              styles.recListText,
              {
                fontWeight: '400',
                fontSize: 13,
                width: Width * 0.8,
                marginLeft: '4%',
                textAlign: 'left',
                color: isDark ? 'rgb(176, 176, 176)' : 'rgba(94, 95, 96, 1)',
              },
            ]}>
            {item.answer}
          </Text>
        )}
      </View>
    </View>
  );

  return (
    <View style={[styles.screen, {backgroundColor: isDark ? '#000' : '#fff'}]}>
      <Header header={'FAQs'} />

      <SearchBar
        placeholder={'Search for help'}
        lists={FAQs}
        setFilteredLists={setFilteredLists}
        searchKey="question"
      />
      {filteredLists.map((item, index) => render2RectangleList(item, index))}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    padding: 10,
    flex: 1,
    backgroundColor: '#fff',
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
    width: Width * 0.8,
    alignSelf: 'center',
    fontSize: 17,
    fontWeight: '500',
    height: 45,
    left: 16,
  },
  sectionHeader: {
    fontWeight: 'bold',
    fontSize: 14,
    margin: 5,
    marginLeft: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: Height * 0.1,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    width: Width * 0.8,
    textAlign: 'center',
  },
  rectangle2: {
    backgroundColor: '#fff',
    width: Width * 0.89,
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderRadius: 10,
    padding: 5,
  },
  recListText: {
    color: '#1d1e20',
  },
});
